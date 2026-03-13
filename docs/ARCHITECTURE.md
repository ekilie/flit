# Flit Architecture

This document describes the high-level architecture of the Flit ride-sharing platform.

## Overview

Flit is a monorepo containing four applications that work together to provide a complete ride-sharing experience:

| Application | Technology | Purpose |
|---|---|---|
| **Backend** | NestJS (TypeScript) | REST API and WebSocket server |
| **Rider App** | React Native (Expo) | Mobile app for passengers |
| **Driver App** | React Native (Expo) | Mobile app for drivers |
| **Web** | React | Admin dashboard |

## System Diagram

```
                     ┌──────────────┐   ┌──────────────┐
                     │  Rider App   │   │  Driver App  │
                     │ (React Native│   │ (React Native│
                     │   + Expo)    │   │   + Expo)    │
                     └──────┬───────┘   └──────┬───────┘
                            │                  │
                            │  HTTPS / WSS     │
                            └────────┬─────────┘
                                     │
                     ┌───────────────┴───────────────┐
                     │         NestJS Backend         │
                     │                               │
                     │  ┌─────────┐   ┌───────────┐  │
                     │  │REST API │   │ Socket.IO │  │
                     │  │ /api/v1 │   │ WebSocket │  │
                     │  └────┬────┘   └─────┬─────┘  │
                     │       │              │        │
                     │  ┌────┴──────────────┴────┐   │
                     │  │    Service Modules      │   │
                     │  │                        │   │
                     │  │  Auth · Users · Rides  │   │
                     │  │  Vehicles · Payments   │   │
                     │  │  Ratings · Locations   │   │
                     │  │  Pricing · Notifications│  │
                     │  └────────────┬───────────┘   │
                     └───────────────┼───────────────┘
                                     │
                     ┌───────────────┴───────────────┐
                     │          PostgreSQL            │
                     │                               │
                     │  users · rides · vehicles     │
                     │  payments · ratings · locations│
                     │  notifications · pricing      │
                     └───────────────────────────────┘
```

## Backend Architecture

The backend follows NestJS's modular architecture. Each domain has its own module containing a controller, service, entities, and DTOs.

```
apps/backend/src/
├── main.ts                 # Bootstrap, CORS, Helmet, Swagger, Seeder
├── app.module.ts           # Root module — imports all feature modules
│
├── config/                 # Environment-based configuration (Joi validation)
├── database/               # TypeORM + PostgreSQL connection
│
├── common/                 # Shared code
│   ├── decorators/         # @IsOptionalWhen, @IsRequiredWhen, @MatchesField
│   ├── dto/                # SanitizeResponse DTO
│   ├── entities/           # BasicEntity (id, createdAt, updatedAt)
│   └── interceptors/       # Response transform, Logging, Validation
│
├── guards/                 # WsJwtGuard (WebSocket authentication)
├── gateways/               # Socket.IO gateways (rides, location, chat)
├── lib/                    # External service wrappers
│   ├── cloudinary/         # Image uploads
│   ├── email/              # SendGrid email
│   └── logger/             # Winston logger
│
└── modules/                # Feature modules
    ├── auth/               # JWT authentication, OTP, password reset
    ├── users/              # User CRUD and profiles
    ├── roles/              # Role and permission management
    ├── rides/              # Ride lifecycle and driver matching
    ├── vehicles/           # Vehicle registration
    ├── ratings/            # Bidirectional rating system
    ├── payments/           # Payment processing
    ├── pricing/            # Dynamic fare calculation and surge pricing
    ├── locations/          # GPS location tracking
    ├── notifications/      # In-app and push notifications
    ├── media/              # File uploads via Cloudinary
    └── seeder/             # Database initialization with sample data
```

## Database Schema

The application uses PostgreSQL with TypeORM. All entities extend `BasicEntity` which provides `id`, `createdAt`, and `updatedAt` fields.

### Entity Relationship Overview

```
users ──┬── roles (ManyToOne)
        ├── user_metadata (OneToOne)
        ├── expo_push_tokens (OneToMany)
        ├── vehicles (OneToMany, drivers only)
        ├── rides (OneToMany, as rider or driver)
        ├── payments (OneToMany)
        ├── ratings (OneToMany, given and received)
        ├── locations (OneToMany)
        └── notifications (OneToMany)

roles ──── permissions (ManyToMany)

rides ──┬── rider (ManyToOne → users)
        ├── driver (ManyToOne → users)
        ├── vehicle (ManyToOne → vehicles)
        ├── payments (OneToMany)
        ├── ratings (OneToMany)
        └── locations (OneToMany)

pricing_configs ── per vehicle type (sedan, suv, van, luxury, economy)
surge_zones ────── geographic surge pricing areas
```

### Core Entities

| Entity | Key Fields | Notes |
|---|---|---|
| **User** | fullName, email, phoneNumber, password | Password hashed with scrypt |
| **Role** | name | Admin, Manager, Rider, Driver |
| **Permission** | name, description | Granular access control |
| **Ride** | pickup/dropoff coords, status, fare, distance | 6 statuses: requested → accepted → arrived → in_progress → completed / cancelled |
| **Vehicle** | make, model, licensePlate, type, capacity | Types: sedan, suv, van, luxury, economy |
| **Payment** | amount, method, status, transactionId | Methods: cash, card, wallet, mobile_money |
| **Rating** | rating (1–5), review, type | Bidirectional: rider↔driver |
| **Location** | latitude, longitude, accuracy, speed | GPS tracking history |
| **Notification** | title, message, type, isRead, data | 9 notification types |
| **PricingConfig** | baseFare, perKmRate, perMinuteRate | One config per vehicle type |
| **SurgeZone** | name, coordinates, surgeMultiplier | Geographic surge areas |

## Authentication

Authentication uses JWT tokens with Passport.js. The flow:

1. Client sends credentials to `POST /api/v1/auth/login`
2. Backend validates and returns a JWT access token
3. Client includes `Authorization: Bearer <token>` on subsequent requests
4. `JwtAuthGuard` (applied globally) validates the token
5. Routes decorated with `@Public()` skip authentication
6. Routes decorated with `@Roles('admin')` require specific roles

WebSocket connections authenticate via JWT passed in the handshake, query parameters, or headers.

## Real-Time Communication

Socket.IO provides three WebSocket namespaces:

| Namespace | Purpose | Key Events |
|---|---|---|
| `/rides` | Ride lifecycle updates | `subscribe:ride`, `ride:update`, `ride:driver-accepted`, `ride:started`, `ride:completed`, `ride:cancelled` |
| `/location` | Live driver GPS tracking | `location:update`, `location:driver-update` |
| `/chat` | In-ride messaging | `chat:message`, `chat:typing` |

### Ride Request Flow

```
Rider App                    Backend                      Driver App
    │                           │                              │
    ├── POST /rides ──────────> │                              │
    │                           ├── Find nearby drivers        │
    │                           ├── ride:request ────────────> │
    │                           │                              │
    │                           │ <──── Driver accepts ────────┤
    │ <── ride:driver-accepted ─┤                              │
    │                           │                              │
    │ <── ride:driver-arrived ──┤                              │
    │ <── ride:started ─────────┤                              │
    │                           │                              │
    │ <── location:driver-update┤ <── location:update ─────────┤
    │                           │     (every 3-5 seconds)      │
    │                           │                              │
    │ <── ride:completed ───────┤                              │
    │                           │                              │
```

## API Structure

All REST endpoints are prefixed with `/api/v1`. Interactive API documentation is available at `/api/v1/docs` (Swagger UI).

### Endpoint Groups

| Prefix | Module | Auth Required | Description |
|---|---|---|---|
| `/auth` | Auth | No (public) | Login, register, OTP, password reset |
| `/users` | Users | Yes | User CRUD, profile management |
| `/roles` | Roles | Yes (admin) | Role and permission management |
| `/rides` | Rides | Yes | Create, update, and query rides |
| `/vehicles` | Vehicles | Yes | Register and manage vehicles |
| `/ratings` | Ratings | Yes | Submit and view ratings |
| `/payments` | Payments | Yes | Payment processing and history |
| `/pricing` | Pricing | Mixed | Fare estimates (public), config (admin) |
| `/locations` | Locations | Yes | Location tracking and history |
| `/notifications` | Notifications | Yes | User notification management |
| `/media` | Media | Yes | File uploads |

## External Services

| Service | Purpose | Integration |
|---|---|---|
| **Cloudinary** | Image uploads and storage | `lib/cloudinary/` |
| **SendGrid** | Transactional email (OTP, password reset) | `lib/email/` |
| **Expo Push** | Mobile push notifications | `modules/notifications/` |

## Security

- **Helmet** — HTTP security headers
- **CORS** — Cross-origin request handling
- **JWT** — Stateless authentication with configurable expiration
- **Guards** — Route-level and WebSocket-level access control
- **Validation** — DTO validation with `class-validator` and Joi schema for environment variables
- **Password Hashing** — scrypt-based password storage

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Runtime | Node.js | — |
| Framework | NestJS | 10.x |
| Language | TypeScript | 5.x |
| ORM | TypeORM | 0.3.x |
| Database | PostgreSQL | 14+ |
| Real-time | Socket.IO | 4.x |
| Auth | Passport + JWT | — |
| Docs | Swagger (OpenAPI) | — |
| Mobile | React Native + Expo | — |
| Package Manager | pnpm | 10.x |