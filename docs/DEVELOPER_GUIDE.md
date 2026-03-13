# Developer Guide

This guide walks you through setting up, running, and working on the Flit codebase.

## Prerequisites

- **Node.js** 18 or later
- **pnpm** 10.x (`corepack enable && corepack prepare pnpm@10.24.0 --activate`)
- **PostgreSQL** 14 or later
- **Git**

Optional services (the app runs without them but some features will be limited):

- **Cloudinary** account — for image uploads
- **SendGrid** account — for email notifications
- **Google Maps** API key — for accurate route distance and duration

## Initial Setup

1. **Clone the repository and install dependencies:**

   ```bash
   git clone https://github.com/ekilie/flit.git
   cd flit
   pnpm install
   ```

2. **Configure the backend environment:**

   ```bash
   cp apps/backend/.env.example apps/backend/.env
   ```

   Edit `apps/backend/.env` and set at minimum:

   ```env
   JWT_SECRET=<a-random-string>
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=<your-password>
   DB_DATABASE=flit
   DB_SYNC=true
   ```

3. **Create the database:**

   ```bash
   createdb flit
   ```

   Or via psql:

   ```sql
   CREATE DATABASE flit;
   ```

4. **Start the backend:**

   ```bash
   pnpm dev:backend
   ```

   The server starts on `http://localhost:3001`. On first launch, the seeder creates default roles, users, vehicles, rides, and pricing configurations.

5. **Verify it works:**

   Open `http://localhost:3001/api/v1/docs` in a browser. You should see the Swagger UI with all available endpoints.

## Running the Mobile Apps

The rider and driver apps use React Native with Expo.

```bash
# Rider app
cd apps/rider-app
pnpm install
pnpm start

# Driver app
cd apps/driver-app
pnpm install
pnpm start
```

Use the Expo Go app on your phone or an emulator to run the apps.

## Running the Web Dashboard

```bash
cd apps/web
pnpm install
pnpm dev
```

## Project Structure

```
flit/
├── apps/
│   ├── backend/        # NestJS API server
│   ├── rider-app/      # React Native rider app
│   ├── driver-app/     # React Native driver app
│   └── web/            # Web admin dashboard
├── docs/               # Documentation (you are here)
├── package.json        # Root workspace config
└── pnpm-workspace.yaml # Monorepo workspace definition
```

## Backend Development

### Creating a New Module

NestJS provides a CLI to scaffold modules:

```bash
cd apps/backend
npx nest generate module modules/my-feature
npx nest generate controller modules/my-feature
npx nest generate service modules/my-feature
```

This creates the module, controller, and service files and registers them in the parent module.

### Adding an Entity

Create a new file in `modules/<feature>/entities/`:

```typescript
import { Entity, Column } from 'typeorm';
import { BasicEntity } from 'src/common/entities/base.entity';

@Entity('my_table')
export class MyEntity extends BasicEntity {
  @Column()
  name: string;
}
```

Import the entity into your module with `TypeOrmModule.forFeature([MyEntity])`.

With `DB_SYNC=true`, TypeORM will create the table automatically on startup. In production, use migrations instead.

### Adding a DTO

Create validation classes in `modules/<feature>/dto/`:

```typescript
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateMyFeatureDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
```

### Making a Route Public

By default, all routes require authentication. To make a route public:

```typescript
import { Public } from 'src/modules/auth/decorator/public.decorator';

@Public()
@Get('open-endpoint')
getPublic() {
  return 'This does not require a token';
}
```

### Restricting by Role

```typescript
import { Roles } from 'src/modules/auth/decorators/roles.decorator';

@Roles('admin')
@Delete(':id')
remove(@Param('id') id: number) {
  return this.service.remove(id);
}
```

### Emitting WebSocket Events

Inject the appropriate gateway into your service:

```typescript
constructor(
  private readonly ridesGateway: RidesGateway,
) {}

// Later in a method:
this.ridesGateway.emitRideUpdate({
  rideId: ride.id,
  status: ride.status,
});
```

## Testing

### Backend Tests

```bash
cd apps/backend

# Unit tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:cov

# End-to-end tests
pnpm test:e2e
```

### Linting and Formatting

```bash
cd apps/backend

# Lint
pnpm lint

# Format
pnpm format
```

## Test Accounts

The seeder creates these accounts (all with password `password123`):

| Email | Role |
|---|---|
| `tachera@ekilie.com` | Admin |
| `support@ekilie.com` | Manager |
| `rider1@example.com` | Rider |
| `rider2@example.com` | Rider |
| `driver1@example.com` | Driver |
| `driver2@example.com` | Driver |

## Common Tasks

### Get an auth token

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "rider1@example.com", "password": "password123"}'
```

The response includes an `accessToken`. Use it in subsequent requests:

```bash
curl http://localhost:3001/api/v1/rides \
  -H "Authorization: Bearer <token>"
```

### Create a ride

```bash
curl -X POST http://localhost:3001/api/v1/rides \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "pickupLatitude": -6.7924,
    "pickupLongitude": 39.2083,
    "pickupAddress": "Kariakoo, Dar es Salaam",
    "dropoffLatitude": -6.8722,
    "dropoffLongitude": 39.2026,
    "dropoffAddress": "Julius Nyerere Airport",
    "vehicleType": "sedan"
  }'
```

### Get a fare estimate

```bash
curl -X POST http://localhost:3001/api/v1/pricing/estimate \
  -H "Content-Type: application/json" \
  -d '{
    "pickupLatitude": -6.7924,
    "pickupLongitude": 39.2083,
    "dropoffLatitude": -6.8722,
    "dropoffLongitude": 39.2026,
    "vehicleType": "sedan"
  }'
```

## Useful Links

- **API Docs** — `http://localhost:3001/api/v1/docs` (Swagger UI)
- **Architecture** — [docs/ARCHITECTURE.md](./ARCHITECTURE.md)
- **Backend Details** — [docs/BACKEND.md](./BACKEND.md)
- **Setup Guide** — [SETUP_GUIDE.md](../SETUP_GUIDE.md)
