# Backend Guide

This document explains how the Flit backend works. It covers the request lifecycle, each module's responsibilities, and the key algorithms used in the system.

## Application Startup

When the backend starts (`main.ts`), it performs the following steps in order:

1. Creates the NestJS application from `AppModule`
2. Enables CORS for all origins
3. Applies Helmet security headers
4. Sets the global API prefix to `/api/v1`
5. Configures Swagger documentation at `/api/v1/docs`
6. Runs the database seeder to insert default data
7. Listens on the configured port (default `3001`)

## Request Lifecycle

Every HTTP request goes through several layers:

```
Client Request
    │
    ▼
CORS & Helmet (middleware)
    │
    ▼
JwtAuthGuard (global guard — skipped for @Public routes)
    │
    ▼
RolesGuard (if @Roles decorator is present)
    │
    ▼
ValidationPipe (DTO validation with class-validator)
    │
    ▼
Controller method
    │
    ▼
Service (business logic + database queries)
    │
    ▼
ResponseTransformInterceptor (wraps response in standard format)
    │
    ▼
Client Response
```

## Module Reference

### Auth

Handles user registration, login, and token management.

**Key endpoints:**

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Create a new user account |
| POST | `/auth/login` | No | Authenticate and receive JWT tokens |
| POST | `/auth/logout` | Yes | Log out the current user |
| POST | `/auth/send-verification` | No | Send OTP to email for verification |
| POST | `/auth/verify` | No | Verify account with OTP code |
| POST | `/auth/forgot-password` | No | Request a password reset OTP |
| POST | `/auth/reset-password` | No | Reset password with verified OTP |
| POST | `/auth/register-expo-push-token` | Yes | Register device for push notifications |

**How authentication works:**

- On login, the service validates credentials and returns an access token (JWT, 7-day expiry) and a refresh token.
- The `JwtAuthGuard` is registered globally. Every request is checked for a valid `Authorization: Bearer <token>` header unless the route is decorated with `@Public()`.
- OTPs are 6-digit codes stored in memory with a 10-minute expiry. They are sent via SendGrid email.

### Rides

Manages the full ride lifecycle from request to completion.

**Key endpoints:**

| Method | Path | Description |
|---|---|---|
| POST | `/rides` | Create a new ride request |
| GET | `/rides` | List all rides (filterable by status) |
| GET | `/rides/:id` | Get a specific ride |
| GET | `/rides/rider/:riderId` | Get rides for a specific rider |
| GET | `/rides/driver/:driverId` | Get rides for a specific driver |
| POST | `/rides/:id/accept` | Driver accepts a ride |
| POST | `/rides/:id/reject` | Driver rejects a ride (tries next driver) |
| POST | `/rides/:id/cancel` | Cancel a ride |

**Ride status machine:**

```
requested ──→ accepted ──→ arrived ──→ in_progress ──→ completed
    │             │            │            │
    └─────────────┴────────────┴────────────┘
                       │
                       ▼
                   cancelled
```

Only valid transitions are allowed. The service sets timestamps automatically: `acceptedAt` when accepted, `startedAt` when the ride begins, and `completedAt` when it finishes.

### Driver Matching

When a ride is created, the `DriverMatchingService` finds and assigns a driver.

**Algorithm:**

1. **Search** — Find all active drivers within a 10 km radius using the Haversine formula.
2. **Score** — Rank candidates by a weighted score: 70% proximity (closer is better) and 30% rating (higher is better).
3. **Request** — Send a ride request to the top candidate via WebSocket with a push notification fallback. The driver has 15 seconds to respond.
4. **Iterate** — If the driver rejects or does not respond, move to the next candidate. Up to 5 drivers are tried.
5. **Resolve** — If a driver accepts, the ride is updated to `accepted` and other pending requests are cancelled. If no driver accepts, the ride is cancelled with a "no drivers available" message.

### Pricing

Calculates fares based on distance, time, and surge pricing.

**Fare formula:**

```
subtotal = baseFare + (distance_km × perKmRate) + (duration_min × perMinuteRate)
surge    = subtotal × (surgeMultiplier − 1)
total    = max(subtotal + surge + bookingFee, minimumFare)
```

Each vehicle type has its own `PricingConfig` with base fare, per-km rate, per-minute rate, minimum fare, booking fee, and cancellation fee.

**Surge pricing** is determined by two mechanisms:

- **Zone-based surge** — Admin-defined geographic areas with a set multiplier and optional time window.
- **Time-based surge** — Automatic multipliers: 1.3× for weekend nights (Fri–Sat, 9 PM – 3 AM), 1.2× for weekday rush hours (7–9 AM, 5–7 PM), and 1.0× otherwise.

The higher of the two multipliers is used.

**Route distance** is calculated using the Google Maps Distance Matrix API when a key is configured. Without an API key, the service falls back to Haversine distance multiplied by 1.3 to estimate road distance, assuming an average speed of 30 km/h.

### Payments

Records and tracks payments for rides.

**Key endpoints:**

| Method | Path | Description |
|---|---|---|
| POST | `/payments` | Create a payment record |
| GET | `/payments` | List all payments (filterable by status) |
| GET | `/payments/user/:userId` | Get a user's payment history |
| GET | `/payments/ride/:rideId` | Get payments for a ride |
| GET | `/payments/analytics` | Revenue analytics with date filters |
| GET | `/payments/revenue/period` | Revenue grouped by day/week/month/year |

Payment methods: `cash`, `card`, `wallet`, `mobile_money`.

Payment statuses: `pending` → `processing` → `completed` → `refunded`, with `failed` as a possible outcome from `pending` or `processing`.

### Users

CRUD operations for user accounts. Users have a role (Admin, Manager, Rider, or Driver), profile metadata, and optional Expo push tokens for notifications.

### Vehicles

Drivers register vehicles with make, model, year, license plate, color, type, and capacity. Vehicle types are `sedan`, `suv`, `van`, `luxury`, and `economy`. Statuses are `active`, `inactive`, or `maintenance`.

### Ratings

Bidirectional rating system. After a ride, riders can rate drivers and drivers can rate riders. Ratings are 1–5 with an optional text review.

### Locations

Stores GPS location history with latitude, longitude, accuracy, speed, and heading. Each record is linked to a user and optionally to a ride.

### Notifications

In-app notifications with 9 types: `ride_request`, `ride_accepted`, `ride_started`, `ride_completed`, `ride_cancelled`, `driver_arrived`, `payment_received`, `rating_received`, and `system`. Push notifications are sent via the Expo SDK.

### Pricing Configuration

Each vehicle type has a pricing configuration with:

| Field | Description |
|---|---|
| baseFare | Fixed starting charge |
| perKmRate | Charge per kilometer |
| perMinuteRate | Charge per minute |
| minimumFare | Floor price for any ride |
| bookingFee | Fixed booking surcharge |
| cancellationFee | Charge for cancelled rides |

Default pricing is in Tanzanian Shillings (TSh) and is seeded automatically.

### Roles and Permissions

Four roles are seeded: Admin, Manager, Rider, and Driver. Roles have associated permissions (e.g., `view-users`, `edit-users`). The `@Roles()` decorator restricts endpoint access by role.

## WebSocket Gateways

Three Socket.IO namespaces handle real-time communication. All require JWT authentication via the `WsJwtGuard`.

### /rides namespace

| Event | Direction | Payload | Description |
|---|---|---|---|
| `subscribe:ride` | Client → Server | `{ rideId }` | Subscribe to updates for a ride |
| `unsubscribe:ride` | Client → Server | `{ rideId }` | Unsubscribe from ride updates |
| `ride:update` | Server → Client | `RideUpdate` | General ride status change |
| `ride:request` | Server → Driver | Ride details | New ride request for driver |
| `ride:driver-accepted` | Server → Client | `{ rideId, driverId, estimatedArrival }` | Driver accepted the ride |
| `ride:driver-arrived` | Server → Client | `{ rideId }` | Driver arrived at pickup |
| `ride:started` | Server → Client | `{ rideId }` | Ride has begun |
| `ride:completed` | Server → Client | `{ rideId, fare, distance, duration }` | Ride finished |
| `ride:cancelled` | Server → Client | `{ rideId, cancelledBy, reason }` | Ride was cancelled |
| `ride:search-update` | Server → Rider | `{ status, driversFound, message }` | Driver search progress |

### /location namespace

| Event | Direction | Payload | Description |
|---|---|---|---|
| `location:update` | Driver → Server | `{ latitude, longitude, heading, speed }` | Driver sends GPS position |
| `location:driver-update` | Server → Rider | Location data | Forwarded driver position |

### /chat namespace

| Event | Direction | Payload | Description |
|---|---|---|---|
| `chat:message` | Client → Server | `{ rideId, message }` | Send a chat message |
| `chat:typing` | Client → Server | `{ rideId }` | Typing indicator |
| `chat:system-message` | Server → Client | `{ message }` | Automated notification |

## Database Seeder

On startup, `SeederService.seed()` populates the database with default data if it does not already exist:

- **4 roles**: Admin, Manager, Rider, Driver
- **6 users**: 1 admin, 1 manager, 2 riders, 2 drivers (all with password `password123`)
- **2 vehicles**: Toyota Corolla (sedan), Toyota Noah (van)
- **4 sample rides**: Various statuses with Dar es Salaam locations
- **Pricing configs**: Economy, Comfort, Premium, XL vehicle types

## Configuration

The backend reads environment variables validated by a Joi schema. See `apps/backend/.env.example` for the full list:

| Variable | Purpose | Default |
|---|---|---|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `JWT_SECRET` | JWT signing key | — |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USERNAME` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | — |
| `DB_DATABASE` | Database name | — |
| `DB_SYNC` | Auto-sync schema (dev only) | `true` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account | — |
| `CLOUDINARY_API_KEY` | Cloudinary key | — |
| `CLOUDINARY_API_SECRET` | Cloudinary secret | — |
| `SENDGRID_API_KEY` | SendGrid key | — |
| `SENDGRID_FROM_EMAIL` | Sender email address | — |
| `GOOGLE_MAPS_API_KEY` | Google Maps key (optional) | — |
