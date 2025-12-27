# Flit Backend API

A NestJS-based REST API for the Flit ride-sharing application.

## Description

This is the backend service for the Flit ride-sharing platform, built with [NestJS](https://github.com/nestjs/nest) framework. It provides comprehensive CRUD operations for users, rides, vehicles, and authentication.

## Features

- **Authentication & Authorization**: Complete auth flow with JWT tokens, registration, login, password reset with OTP
- **User Management**: CRUD operations for users with role-based access control
- **Ride Management**: Complete ride lifecycle management (request, accept, in-progress, complete, cancel)
- **Vehicle Management**: Vehicle registration and management for drivers
- **Automatic Seeding**: Pre-populated database with sample data for testing

## Installation

```bash
$ npm install
# or
$ pnpm install
```

## Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Common
NODE_ENV=development
PORT=3000

# App Details
APP_NAME='Flit Ride Sharing'
APP_DESCRIPTION='Flit Ride Sharing Application'

# JWT
JWT_SECRET=your-secret-key-here

# Database
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your-password
DB_DATABASE=flit
DB_LOGGING=false
DB_SYNC=true
```

## Running the app

```bash
# development
$ npm run start:dev

# production mode
$ npm run start:prod
```

The API will be available at `http://localhost:3000/api/v1`

Swagger documentation will be available at `http://localhost:3000/api/v1/docs`

## Seed Data

The application automatically seeds the database on startup with:

### Roles
- Admin
- Manager
- Rider
- Driver

### Users (Dar es Salaam, Tanzania)
**Admin:**
- Email: tachera@ekilie.com
- Password: tachera@ekilie
- Phone: +255686477074

**Manager:**
- Email: support@ekilie.com
- Password: supprt@ekilie
- Phone: +255712345678

**Riders:**
1. Amina Juma
   - Email: amina.juma@example.com
   - Password: rider123
   - Phone: +255713456789

2. Hassan Mwamba
   - Email: hassan.mwamba@example.com
   - Password: rider123
   - Phone: +255714567890

**Drivers:**
1. Juma Ramadhani
   - Email: juma.driver@example.com
   - Password: driver123
   - Phone: +255715678901

2. Fatuma Kombo
   - Email: fatuma.driver@example.com
   - Password: driver123
   - Phone: +255716789012

### Vehicles
- Toyota Corolla 2020 (White) - License: T123ABC
- Toyota Noah 2019 (Silver) - License: T456DEF

### Sample Rides
4 sample rides with real Dar es Salaam locations:
- Kariakoo Market ↔ Julius Nyerere International Airport
- Mlimani City ↔ Kariakoo Market
- Julius Nyerere Airport → Slipway Shopping Centre
- Ubungo Bus Terminal → Mlimani City

## API Endpoints

### Authentication
- `POST /api/v1/register` - Register new user
- `POST /api/v1/login` - User login
- `POST /api/v1/logout` - User logout
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/send-verification` - Send verification email
- `POST /api/v1/auth/verify` - Verify account with OTP
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/verify-reset-code` - Verify reset code
- `POST /api/v1/auth/reset-password` - Reset password with OTP

### Users
- `GET /api/v1/users/me` - Get current user
- `PUT /api/v1/users/me/edit` - Update current user
- `GET /api/v1/users` - Get all users (Admin)
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users` - Create user (Admin)
- `PATCH /api/v1/users/:id` - Update user (Admin)
- `DELETE /api/v1/users/:id` - Delete user (Admin)

### Rides
- `POST /api/v1/rides` - Create new ride
- `GET /api/v1/rides` - Get all rides (with optional status filter)
- `GET /api/v1/rides/:id` - Get ride by ID
- `GET /api/v1/rides/rider/:riderId` - Get rides by rider
- `GET /api/v1/rides/driver/:driverId` - Get rides by driver
- `PATCH /api/v1/rides/:id` - Update ride
- `POST /api/v1/rides/:id/accept` - Accept ride (driver)
- `POST /api/v1/rides/:id/cancel` - Cancel ride
- `DELETE /api/v1/rides/:id` - Delete ride

### Vehicles
- `POST /api/v1/vehicles` - Create new vehicle
- `GET /api/v1/vehicles` - Get all vehicles
- `GET /api/v1/vehicles/:id` - Get vehicle by ID
- `GET /api/v1/vehicles/driver/:driverId` - Get vehicles by driver
- `PATCH /api/v1/vehicles/:id` - Update vehicle
- `DELETE /api/v1/vehicles/:id` - Delete vehicle

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## License

This project is [MIT licensed](LICENSE).
