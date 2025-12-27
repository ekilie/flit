# Flit Rider App

A React Native mobile application for the Flit ride-sharing platform, built with Expo.

## Features

- **Authentication**: Complete auth flow with registration, login, OTP verification, password reset
- **User Profile**: View and update user profile information
- **Ride Management**: Request rides, view ride history, track ongoing rides, cancel rides
- **Vehicle Information**: View available vehicles and driver details
- **Real-time Updates**: Track ride status changes in real-time

## Installation

```bash
npm install --legacy-peer-deps
# or
npm install
```

## Configuration

Update the API base URL in `constants/constants.ts`:

```typescript
export const BASE_URL = 'http://your-backend-url:3000/api/v1';
```

## Running the App

```bash
# Start the development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web
npm run web
```

## API Integration

The app integrates with the backend API using the following services:

### Authentication APIs
```typescript
import Api from '@/lib/api';

// Register new user
await Api.register({ 
  name: 'John Doe', 
  email: 'john@example.com', 
  password: 'password123' 
});

// Login
const response = await Api.login({ 
  email: 'john@example.com', 
  password: 'password123' 
});

// Send verification email
await Api.sendVerificationEmail('john@example.com');

// Verify account with OTP
await Api.verifyAccount({ email: 'john@example.com', otp: '123456' });

// Forgot password
await Api.forgotPassword({ email: 'john@example.com' });

// Reset password with OTP
await Api.resetPassword({ 
  email: 'john@example.com', 
  otp: '123456', 
  new_password: 'newpassword123' 
});
```

### User APIs
```typescript
// Get current user
const user = await Api.getCurrentUser();

// Update current user
await Api.updateCurrentUser({ 
  name: 'John Updated', 
  metadata: { location: 'Dar es Salaam' } 
});
```

### Ride APIs
```typescript
import { RideStatus } from '@/lib/api/types';

// Create a new ride
const ride = await Api.createRide({
  pickupLatitude: -6.7924,
  pickupLongitude: 39.2083,
  pickupAddress: 'Kariakoo Market, Dar es Salaam',
  dropoffLatitude: -6.8160,
  dropoffLongitude: 39.2803,
  dropoffAddress: 'Julius Nyerere International Airport',
  riderId: userId,
  notes: 'Please be on time'
});

// Get all rides
const rides = await Api.getRides();

// Get rides by status
const activeRides = await Api.getRides(RideStatus.IN_PROGRESS);

// Get specific ride
const ride = await Api.getRide(rideId);

// Get rides for current rider
const myRides = await Api.getRidesByRider(userId);

// Update ride
await Api.updateRide(rideId, { 
  status: RideStatus.COMPLETED,
  fare: 25000 
});

// Cancel ride
await Api.cancelRide(rideId);
```

### Vehicle APIs
```typescript
// Get all vehicles
const vehicles = await Api.getVehicles();

// Get specific vehicle
const vehicle = await Api.getVehicle(vehicleId);

// Get vehicles by driver
const driverVehicles = await Api.getVehiclesByDriver(driverId);
```

## Type Definitions

### Ride Status
```typescript
enum RideStatus {
  REQUESTED = 'requested',
  ACCEPTED = 'accepted',
  ARRIVED = 'arrived',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}
```

### Vehicle Types
```typescript
enum VehicleType {
  SEDAN = 'sedan',
  SUV = 'suv',
  VAN = 'van',
  LUXURY = 'luxury',
  ECONOMY = 'economy',
}

enum VehicleStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
}
```

## Project Structure

```
apps/rider-app/
├── app/                      # App screens and navigation
│   ├── (auth)/              # Authentication screens
│   ├── (core)/              # Main app screens
│   └── _layout.tsx          # Root layout
├── components/              # Reusable components
├── lib/
│   └── api/                 # API integration
│       ├── config.ts        # API configuration
│       ├── index.ts         # API methods
│       └── types.ts         # TypeScript types
├── stores/                  # State management
└── constants/               # App constants
```

## Testing Credentials

Use these credentials to test the app with the seeded backend data:

**Rider 1:**
- Email: amina.juma@example.com
- Password: rider123

**Rider 2:**
- Email: hassan.mwamba@example.com
- Password: rider123

**Driver 1:**
- Email: juma.driver@example.com
- Password: driver123

**Driver 2:**
- Email: fatuma.driver@example.com
- Password: driver123

## License

This project is [MIT licensed](LICENSE).
