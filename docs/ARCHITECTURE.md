# Flit Architecture Overview

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        RIDER MOBILE APP                          │
│                    (React Native + Expo)                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐   │
│  │   Auth    │  │   Maps    │  │  Rides    │  │  Profile  │   │
│  │  Screens  │  │  Service  │  │  Service  │  │  Service  │   │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘   │
│                                                                  │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐   │
│  │  Socket   │  │   API     │  │  Context  │  │   State   │   │
│  │  Client   │  │  Client   │  │ Providers │  │ Management│   │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘   │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ HTTPS + WebSocket
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│                      API GATEWAY / LOAD BALANCER                 │
└──────────────────────┬──────────────────────────────────────────┘
                       │
       ┌───────────────┴───────────────┐
       │                               │
       ▼                               ▼
┌──────────────┐              ┌──────────────┐
│   REST API   │              │   Socket.IO  │
│    Server    │              │    Server    │
│   (NestJS)   │              │   (NestJS)   │
└──────┬───────┘              └──────┬───────┘
       │                              │
       │        ┌─────────────────────┘
       │        │
       │        │      ┌─────────────────────────────────┐
       │        │      │   CORE BACKEND SERVICES         │
       │        │      │        (NestJS)                 │
       │        │      ├─────────────────────────────────┤
       │        │      │                                 │
       │        └──────┤  ┌──────────┐  ┌──────────┐   │
       │               │  │   Auth   │  │  Users   │   │
       │               │  │  Module  │  │  Module  │   │
       │               │  └──────────┘  └──────────┘   │
       │               │                                 │
       │               │  ┌──────────┐  ┌──────────┐   │
       │               │  │  Rides   │  │ Payments │   │
       │               │  │  Module  │  │  Module  │   │
       │               │  └──────────┘  └──────────┘   │
       │               │                                 │
       │               │  ┌──────────┐  ┌──────────┐   │
       │               │  │ Vehicles │  │ Ratings  │   │
       │               │  │  Module  │  │  Module  │   │
       │               │  └──────────┘  └──────────┘   │
       │               │                                 │
       │               │  ┌──────────┐  ┌──────────┐   │
       │               │  │Locations │  │Notificat.│   │
       │               │  │  Module  │  │  Module  │   │
       │               │  └──────────┘  └──────────┘   │
       │               │                                 │
       │               │  ┌──────────┐  ┌──────────┐   │
       │               │  │ Dispatch │  │  Pricing │   │
       │               │  │  Module  │  │  Module  │   │
       │               │  └──────────┘  └──────────┘   │
       │               └─────────────────────────────────┘
       │                              │
       ├──────────────────────────────┤
       │                              │
       ▼                              ▼
┌────────────┐              ┌──────────────┐
│ PostgreSQL │              │    Redis     │
│  Database  │              │    Cache     │
│            │              │              │
│ - Users    │              │ - Sessions   │
│ - Rides    │              │ - Locations  │
│ - Payments │              │ - Queues     │
│ - Ratings  │              │ - Pub/Sub    │
└────────────┘              └──────────────┘
       │
       │
┌──────▼──────────────────────────────────────┐
│        EXTERNAL SERVICES                    │
├─────────────────────────────────────────────┤
│                                             │
│  ┌────────────┐  ┌────────────┐           │
│  │   Google   │  │   Stripe   │           │
│  │    Maps    │  │  Payment   │           │
│  └────────────┘  └────────────┘           │
│                                             │
│  ┌────────────┐  ┌────────────┐           │
│  │   M-Pesa   │  │  Firebase  │           │
│  │  Payment   │  │    (FCM)   │           │
│  └────────────┘  └────────────┘           │
│                                             │
│  ┌────────────┐  ┌────────────┐           │
│  │  Twilio    │  │  SendGrid  │           │
│  │   (SMS)    │  │   (Email)  │           │
│  └────────────┘  └────────────┘           │
│                                             │
│  ┌────────────┐  ┌────────────┐           │
│  │   Sentry   │  │    AWS     │           │
│  │  (Errors)  │  │    (S3)    │           │
│  └────────────┘  └────────────┘           │
└─────────────────────────────────────────────┘
```

---

## 🔄 Real-Time Data Flow

### Ride Request Flow

```
┌───────────┐     1. Request Ride      ┌────────────┐
│   Rider   │ ────────────────────────> │  Backend   │
│    App    │                           │   Server   │
└───────────┘                           └─────┬──────┘
                                              │
                                              │ 2. Find Nearby
                                              │    Drivers
                                              ▼
                                        ┌──────────┐
                                        │ Dispatch │
                                        │  Module  │
                                        └─────┬────┘
                                              │
                3. Send Request               │
                to Drivers                    │
                                              ▼
┌───────────┐                           ┌──────────┐
│  Driver   │ <─────────────────────────│  Socket  │
│    App    │                           │  Server  │
└─────┬─────┘                           └──────────┘
      │
      │ 4. Driver Accepts
      │
      ▼
┌───────────┐                           ┌──────────┐
│  Backend  │ ─────────────────────────>│  Rider   │
│  Server   │  5. Notify Rider          │   App    │
└───────────┘     Acceptance            └──────────┘
```

### Live Location Tracking

```
┌───────────┐                           ┌──────────┐
│  Driver   │  1. Send Location         │  Socket  │
│    App    │  ────────────────────────>│  Server  │
│           │     (Every 3-5 sec)       │          │
└───────────┘                           └────┬─────┘
                                             │
                                             │ 2. Broadcast
                                             │    to Rider
                                             │
                                             ▼
                                        ┌──────────┐
                                        │  Rider   │
                                        │   App    │
                                        └──────────┘
                                             │
                                             │ 3. Update
                                             │    Map
                                             ▼
                                        ┌──────────┐
                                        │   Map    │
                                        │   View   │
                                        └──────────┘
```

---

## 📊 Database Schema (Simplified)

### Core Tables

```sql
-- Users Table
users
├── id (PK)
├── name
├── email
├── phone_number
├── password_hash
├── is_active
├── is_online (for drivers)
├── current_location_lat
├── current_location_lng
├── last_location_update
├── created_at
└── updated_at

-- Rides Table
rides
├── id (PK)
├── rider_id (FK → users)
├── driver_id (FK → users)
├── vehicle_id (FK → vehicles)
├── pickup_latitude
├── pickup_longitude
├── pickup_address
├── dropoff_latitude
├── dropoff_longitude
├── dropoff_address
├── status (ENUM)
├── fare
├── distance
├── estimated_duration
├── actual_duration
├── scheduled_time
├── accepted_at
├── started_at
├── completed_at
├── notes
├── created_at
└── updated_at

-- Payments Table
payments
├── id (PK)
├── ride_id (FK → rides)
├── user_id (FK → users)
├── amount
├── method (ENUM)
├── status (ENUM)
├── transaction_id
├── provider_response
├── created_at
└── updated_at

-- Vehicles Table
vehicles
├── id (PK)
├── driver_id (FK → users)
├── make
├── model
├── year
├── license_plate
├── color
├── capacity
├── type (ENUM)
├── status (ENUM)
├── image_url
├── created_at
└── updated_at

-- Ratings Table
ratings
├── id (PK)
├── ride_id (FK → rides)
├── from_user_id (FK → users)
├── to_user_id (FK → users)
├── rating (1-5)
├── review
├── type (ENUM)
├── created_at
└── updated_at

-- Notifications Table
notifications
├── id (PK)
├── user_id (FK → users)
├── title
├── message
├── type (ENUM)
├── is_read
├── data (JSONB)
├── created_at
└── updated_at

-- Locations Table (tracking history)
locations
├── id (PK)
├── user_id (FK → users)
├── ride_id (FK → rides)
├── latitude
├── longitude
├── accuracy
├── speed
├── heading
├── created_at
└── updated_at
```

### New Tables Needed

```sql
-- Payment Methods
payment_methods
├── id (PK)
├── user_id (FK → users)
├── type (ENUM: card, mpesa, wallet)
├── provider
├── last_four
├── is_default
├── encrypted_token
├── created_at
└── updated_at

-- Promo Codes
promo_codes
├── id (PK)
├── code (UNIQUE)
├── discount_type (percentage/fixed)
├── discount_value
├── max_uses
├── current_uses
├── valid_from
├── valid_until
├── is_active
├── created_at
└── updated_at

-- User Promo Usage
user_promo_usage
├── id (PK)
├── user_id (FK → users)
├── promo_code_id (FK → promo_codes)
├── ride_id (FK → rides)
├── discount_amount
├── used_at
└── created_at

-- Saved Places
saved_places
├── id (PK)
├── user_id (FK → users)
├── name
├── address
├── latitude
├── longitude
├── icon
├── color
├── created_at
└── updated_at

-- Messages
messages
├── id (PK)
├── ride_id (FK → rides)
├── sender_id (FK → users)
├── recipient_id (FK → users)
├── message
├── is_read
├── created_at
└── updated_at

-- Emergency Contacts
emergency_contacts
├── id (PK)
├── user_id (FK → users)
├── name
├── phone_number
├── relationship
├── is_primary
├── created_at
└── updated_at

-- Ride Stops (for multi-stop rides)
ride_stops
├── id (PK)
├── ride_id (FK → rides)
├── sequence (order of stops)
├── latitude
├── longitude
├── address
├── arrived_at
├── departed_at
└── created_at

-- Surge Pricing Zones
surge_zones
├── id (PK)
├── name
├── geometry (PostGIS)
├── multiplier
├── is_active
├── valid_from
├── valid_until
├── created_at
└── updated_at
```

---

## 🔐 Authentication Flow

```
┌──────────┐
│  Client  │
└────┬─────┘
     │
     │ 1. Login Request
     │    (email + password)
     ▼
┌────────────┐
│  Backend   │
└────┬───────┘
     │
     │ 2. Validate Credentials
     │
     ▼
┌────────────┐
│  Database  │
└────┬───────┘
     │
     │ 3. User Found
     │
     ▼
┌────────────┐
│  Backend   │ 4. Generate JWT
└────┬───────┘    (access + refresh)
     │
     │ 5. Return Tokens
     │
     ▼
┌──────────┐
│  Client  │ 6. Store Tokens
└────┬─────┘    (Secure Storage)
     │
     │ 7. API Request
     │    (Authorization: Bearer <token>)
     ▼
┌────────────┐
│  Backend   │ 8. Validate JWT
└────┬───────┘
     │
     │ 9. Check Expiry
     │
     ├─── Valid ────> Process Request
     │
     └─── Expired ──> Return 401
                      │
                      ▼
                   ┌──────────┐
                   │  Client  │ 10. Refresh Token
                   └────┬─────┘
                        │
                        │ 11. Send Refresh Token
                        ▼
                   ┌────────────┐
                   │  Backend   │ 12. Generate New Tokens
                   └────┬───────┘
                        │
                        │ 13. Return New Tokens
                        ▼
                   ┌──────────┐
                   │  Client  │ 14. Retry Original Request
                   └──────────┘
```

---

## 🚀 API Endpoints Structure

### Authentication Endpoints
```
POST   /api/auth/register          - Create new account
POST   /api/auth/login             - Login with credentials
POST   /api/auth/logout            - Logout user
POST   /api/auth/refresh           - Refresh access token
POST   /api/auth/verify            - Verify OTP
POST   /api/auth/forgot-password   - Request password reset
POST   /api/auth/reset-password    - Reset password with OTP
POST   /api/auth/send-verification - Resend verification email
```

### User Endpoints
```
GET    /api/users/me               - Get current user
PUT    /api/users/me               - Update current user
POST   /api/users/me/avatar        - Upload avatar
GET    /api/users/:id              - Get user by ID
```

### Ride Endpoints
```
GET    /api/rides                  - Get all rides
POST   /api/rides                  - Create new ride
GET    /api/rides/:id              - Get ride details
PATCH  /api/rides/:id              - Update ride
DELETE /api/rides/:id              - Delete ride
POST   /api/rides/:id/accept       - Accept ride (driver)
POST   /api/rides/:id/cancel       - Cancel ride
GET    /api/rides/rider/:riderId   - Get rides by rider
GET    /api/rides/driver/:driverId - Get rides by driver
```

### Payment Endpoints
```
GET    /api/payments               - Get all payments
POST   /api/payments               - Create payment
GET    /api/payments/:id           - Get payment details
PATCH  /api/payments/:id           - Update payment
GET    /api/payments/user/:userId  - Get user payments
GET    /api/payments/ride/:rideId  - Get ride payments
```

### Vehicle Endpoints
```
GET    /api/vehicles               - Get all vehicles
POST   /api/vehicles               - Create vehicle
GET    /api/vehicles/:id           - Get vehicle details
PATCH  /api/vehicles/:id           - Update vehicle
DELETE /api/vehicles/:id           - Delete vehicle
GET    /api/vehicles/driver/:id    - Get driver vehicles
```

### Rating Endpoints
```
GET    /api/ratings                - Get all ratings
POST   /api/ratings                - Create rating
GET    /api/ratings/:id            - Get rating details
PATCH  /api/ratings/:id            - Update rating
GET    /api/ratings/user/:userId   - Get user ratings
GET    /api/ratings/ride/:rideId   - Get ride ratings
GET    /api/ratings/user/:id/avg   - Get average rating
```

### Notification Endpoints
```
GET    /api/notifications          - Get all notifications
POST   /api/notifications          - Create notification
GET    /api/notifications/:id      - Get notification
DELETE /api/notifications/:id      - Delete notification
GET    /api/notifications/user/:id - Get user notifications
GET    /api/notifications/user/:id/unread - Get unread
POST   /api/notifications/:id/read - Mark as read
POST   /api/notifications/user/:id/read-all - Mark all read
```

### New Endpoints Needed

#### Pricing
```
POST   /api/pricing/estimate       - Get fare estimate
GET    /api/pricing/zones          - Get surge zones
```

#### Dispatch
```
POST   /api/dispatch/request       - Request ride with matching
GET    /api/dispatch/nearby        - Get nearby drivers
POST   /api/dispatch/cancel        - Cancel dispatch request
```

#### Promotions
```
GET    /api/promotions             - Get active promotions
POST   /api/promotions/validate    - Validate promo code
POST   /api/promotions/apply       - Apply promo to ride
```

#### Saved Places
```
GET    /api/places                 - Get saved places
POST   /api/places                 - Create saved place
PATCH  /api/places/:id             - Update saved place
DELETE /api/places/:id             - Delete saved place
```

#### Messages
```
GET    /api/messages/ride/:rideId  - Get ride messages
POST   /api/messages               - Send message
PATCH  /api/messages/:id/read      - Mark message read
```

---

## 🔌 WebSocket Events

### Connection Events
```javascript
// Client → Server
socket.emit('authenticate', { token })
socket.emit('disconnect')

// Server → Client
socket.on('authenticated', (data))
socket.on('error', (error))
```

### Ride Events
```javascript
// Client → Server
socket.emit('request_ride', { pickup, dropoff, vehicleType })
socket.emit('cancel_ride', { rideId })
socket.emit('accept_ride', { rideId })
socket.emit('start_ride', { rideId })
socket.emit('complete_ride', { rideId })

// Server → Client
socket.on('ride_requested', (rideData))
socket.on('ride_accepted', (rideData))
socket.on('ride_cancelled', (rideData))
socket.on('ride_started', (rideData))
socket.on('ride_completed', (rideData))
socket.on('driver_arrived', (rideData))
```

### Location Events
```javascript
// Client → Server
socket.emit('update_location', { lat, lng, heading, speed })

// Server → Client
socket.on('driver_location_update', { lat, lng, heading, speed })
socket.on('eta_update', { eta, distance })
```

### Message Events
```javascript
// Client → Server
socket.emit('send_message', { rideId, message })
socket.emit('typing', { rideId })

// Server → Client
socket.on('message_received', (messageData))
socket.on('user_typing', (userData))
```

### Notification Events
```javascript
// Server → Client
socket.on('notification', (notificationData))
socket.on('payment_status', (paymentData))
```

---

## 🎯 State Management Structure

### Frontend State (Context API)

```typescript
// AuthContext
{
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (credentials) => Promise<void>
  signUp: (credentials) => Promise<void>
  signOut: () => Promise<void>
}

// RideContext
{
  currentRide: Ride | null
  rideHistory: Ride[]
  isSearchingDriver: boolean
  requestRide: (details) => Promise<void>
  cancelRide: (rideId) => Promise<void>
  getRideStatus: (rideId) => Promise<RideStatus>
}

// SocketContext
{
  isConnected: boolean
  driverLocation: Location | null
  messages: Message[]
  subscribe: (event, callback) => void
  unsubscribe: (event) => void
  emit: (event, data) => void
}

// LocationContext
{
  currentLocation: Location | null
  savedPlaces: SavedPlace[]
  searchAddress: (query) => Promise<Address[]>
  reverseGeocode: (lat, lng) => Promise<Address>
  getDirections: (origin, destination) => Promise<Route>
}
```

---

## 📦 Project Structure

```
flit/
├── apps/
│   ├── backend/                 # NestJS Backend
│   │   ├── src/
│   │   │   ├── common/          # Shared utilities
│   │   │   ├── config/          # Configuration
│   │   │   ├── modules/         # Feature modules
│   │   │   │   ├── auth/
│   │   │   │   ├── users/
│   │   │   │   ├── rides/
│   │   │   │   ├── payments/
│   │   │   │   ├── vehicles/
│   │   │   │   ├── ratings/
│   │   │   │   ├── locations/
│   │   │   │   ├── notifications/
│   │   │   │   ├── dispatch/    # NEW
│   │   │   │   ├── pricing/     # NEW
│   │   │   │   ├── promotions/  # NEW
│   │   │   │   └── messages/    # NEW
│   │   │   ├── gateways/        # WebSocket gateways
│   │   │   │   ├── rides.gateway.ts
│   │   │   │   ├── location.gateway.ts
│   │   │   │   └── chat.gateway.ts
│   │   │   ├── jobs/            # Background jobs
│   │   │   ├── database/        # Migrations & seeds
│   │   │   └── main.ts
│   │   ├── test/
│   │   └── package.json
│   │
│   └── rider-app/               # React Native App
│       ├── app/                 # Expo Router screens
│       │   ├── (auth)/
│       │   ├── (onboarding)/
│       │   └── (core)/
│       ├── components/          # Reusable components
│       ├── constants/           # App constants
│       ├── context/             # Context providers
│       ├── hooks/               # Custom hooks
│       ├── lib/                 # Libraries
│       │   ├── api/             # API client
│       │   ├── socket/          # Socket client
│       │   ├── maps/            # Maps service
│       │   └── utils/
│       ├── assets/
│       └── package.json
│
├── docs/                        # Documentation
├── scripts/                     # Build/deploy scripts
└── README.md
```

---

## 🔧 Technology Stack

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL 14+
- **ORM**: TypeORM
- **Cache**: Redis
- **Real-time**: Socket.IO
- **Validation**: class-validator
- **API Docs**: Swagger/OpenAPI
- **Testing**: Jest

### Frontend
- **Framework**: React Native
- **Language**: TypeScript
- **Router**: Expo Router
- **Maps**: react-native-maps
- **HTTP**: Axios
- **Real-time**: Socket.IO client
- **State**: Context API + hooks
- **Storage**: Expo SecureStore
- **Notifications**: Expo Notifications
- **Testing**: Jest + React Native Testing Library

### DevOps
- **Hosting**: AWS/DigitalOcean
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry + DataDog
- **Logging**: Winston/Pino
- **CDN**: CloudFlare
- **SSL**: Let's Encrypt

---

## 📱 App Screens Structure

```
Rider App Navigation:
├── (auth)
│   ├── login
│   ├── register
│   ├── verify
│   ├── forgot-password
│   └── reset-password
│
├── (onboarding)
│   ├── step1
│   ├── step2
│   └── step3
│
└── (core)
    ├── (tabs)
    │   ├── ride (home)
    │   └── profile
    │
    ├── ride/
    │   ├── active
    │   ├── details
    │   ├── history
    │   ├── rating
    │   ├── payment
    │   ├── saved-places
    │   ├── notifications
    │   ├── promotions
    │   └── help
    │
    ├── profile/
    │   └── edit
    │
    └── settings
```

---

## 🚨 Error Handling Strategy

### Backend Error Handling

```typescript
// Global exception filter
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Log error
    // Format response
    // Return appropriate status code
  }
}

// Custom exceptions
- NotFoundException
- BadRequestException
- UnauthorizedException
- ForbiddenException
- ConflictException
- InternalServerErrorException
```

### Frontend Error Handling

```typescript
// API error interceptor
axios.interceptors.response.use(
  response => response,
  error => {
    // Handle 401 → logout
    // Handle 403 → show forbidden
    // Handle 500 → show generic error
    // Handle network errors
    return Promise.reject(error);
  }
);

// Component error boundaries
<ErrorBoundary fallback={<ErrorScreen />}>
  <App />
</ErrorBoundary>
```

---

This architecture document provides a comprehensive overview of your current system and the target architecture needed to achieve Uber-like functionality.

