# Quick Start Implementation Guide

This guide provides step-by-step instructions to implement the most critical features needed to make Flit functional.

---

## 🎯 Phase 1: Real-Time Infrastructure (Week 1)

### Step 1: Install Socket.IO Dependencies

#### Backend
```bash
cd apps/backend
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
npm install -D @types/socket.io
```

#### Frontend
```bash
cd apps/rider-app
npx expo install socket.io-client
```

---

### Step 2: Create Socket.IO Gateway (Backend)

Create `apps/backend/src/gateways/rides.gateway.ts`:

```typescript
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*', // Configure properly in production
  },
  namespace: '/rides',
})
export class RidesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, Socket>();

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      const decoded = await this.jwtService.verify(token);
      
      client.data.userId = decoded.sub;
      this.connectedUsers.set(decoded.sub, client);
      
      console.log(`User ${decoded.sub} connected`);
      client.emit('connected', { userId: decoded.sub });
    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.connectedUsers.delete(userId);
      console.log(`User ${userId} disconnected`);
    }
  }

  @SubscribeMessage('request_ride')
  handleRideRequest(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    const userId = client.data.userId;
    console.log('Ride requested by user:', userId, data);
    
    // Emit to matching service
    this.server.emit('new_ride_request', {
      ...data,
      riderId: userId,
    });
    
    return { status: 'processing' };
  }

  @SubscribeMessage('update_location')
  handleLocationUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { lat: number; lng: number; rideId?: number },
  ) {
    const userId = client.data.userId;
    
    if (data.rideId) {
      // Broadcast to rider in this ride
      this.server.to(`ride_${data.rideId}`).emit('driver_location', {
        lat: data.lat,
        lng: data.lng,
        driverId: userId,
      });
    }
    
    return { status: 'received' };
  }

  // Utility method to emit to specific user
  emitToUser(userId: string, event: string, data: any) {
    const socket = this.connectedUsers.get(userId);
    if (socket) {
      socket.emit(event, data);
    }
  }

  // Utility method to join ride room
  joinRideRoom(socket: Socket, rideId: number) {
    socket.join(`ride_${rideId}`);
  }

  // Utility method to leave ride room
  leaveRideRoom(socket: Socket, rideId: number) {
    socket.leave(`ride_${rideId}`);
  }
}
```

---

### Step 3: Create Location Gateway (Backend)

Create `apps/backend/src/gateways/location.gateway.ts`:

```typescript
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/location',
})
export class LocationGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('driver_location_update')
  handleDriverLocationUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: {
      rideId: number;
      lat: number;
      lng: number;
      heading: number;
      speed: number;
    },
  ) {
    // Broadcast to all clients in this ride room
    this.server.to(`ride_${data.rideId}`).emit('location_update', data);
    
    return { status: 'broadcasted' };
  }

  @SubscribeMessage('subscribe_to_ride')
  handleSubscribeToRide(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { rideId: number },
  ) {
    client.join(`ride_${data.rideId}`);
    return { status: 'subscribed', rideId: data.rideId };
  }

  @SubscribeMessage('unsubscribe_from_ride')
  handleUnsubscribeFromRide(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { rideId: number },
  ) {
    client.leave(`ride_${data.rideId}`);
    return { status: 'unsubscribed', rideId: data.rideId };
  }
}
```

---

### Step 4: Register Gateways in App Module

Update `apps/backend/src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { RidesGateway } from './gateways/rides.gateway';
import { LocationGateway } from './gateways/location.gateway';
// ... other imports

@Module({
  imports: [
    // ... existing imports
  ],
  providers: [RidesGateway, LocationGateway],
})
export class AppModule {}
```

---

### Step 5: Create Socket Client (Frontend)

Create `apps/rider-app/lib/socket/socket-client.ts`:

```typescript
import { io, Socket } from 'socket.io-client';
import { getAuthToken } from '../api/authToken';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3000';

class SocketClient {
  private ridesSocket: Socket | null = null;
  private locationSocket: Socket | null = null;

  async connect() {
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('No auth token found');
    }

    // Connect to rides namespace
    this.ridesSocket = io(`${SOCKET_URL}/rides`, {
      auth: { token: token.access },
      transports: ['websocket'],
    });

    // Connect to location namespace
    this.locationSocket = io(`${SOCKET_URL}/location`, {
      auth: { token: token.access },
      transports: ['websocket'],
    });

    // Handle connection
    this.ridesSocket.on('connect', () => {
      console.log('Rides socket connected');
    });

    this.locationSocket.on('connect', () => {
      console.log('Location socket connected');
    });

    // Handle errors
    this.ridesSocket.on('connect_error', (error) => {
      console.error('Rides socket error:', error);
    });

    this.locationSocket.on('connect_error', (error) => {
      console.error('Location socket error:', error);
    });

    // Handle disconnection
    this.ridesSocket.on('disconnect', (reason) => {
      console.log('Rides socket disconnected:', reason);
    });

    this.locationSocket.on('disconnect', (reason) => {
      console.log('Location socket disconnected:', reason);
    });
  }

  disconnect() {
    if (this.ridesSocket) {
      this.ridesSocket.disconnect();
      this.ridesSocket = null;
    }
    if (this.locationSocket) {
      this.locationSocket.disconnect();
      this.locationSocket = null;
    }
  }

  // Rides socket methods
  requestRide(data: any) {
    if (!this.ridesSocket) throw new Error('Socket not connected');
    return this.ridesSocket.emit('request_ride', data);
  }

  onRideAccepted(callback: (data: any) => void) {
    if (!this.ridesSocket) throw new Error('Socket not connected');
    this.ridesSocket.on('ride_accepted', callback);
  }

  onRideCancelled(callback: (data: any) => void) {
    if (!this.ridesSocket) throw new Error('Socket not connected');
    this.ridesSocket.on('ride_cancelled', callback);
  }

  // Location socket methods
  subscribeToRide(rideId: number) {
    if (!this.locationSocket) throw new Error('Socket not connected');
    this.locationSocket.emit('subscribe_to_ride', { rideId });
  }

  unsubscribeFromRide(rideId: number) {
    if (!this.locationSocket) throw new Error('Socket not connected');
    this.locationSocket.emit('unsubscribe_from_ride', { rideId });
  }

  onLocationUpdate(callback: (data: any) => void) {
    if (!this.locationSocket) throw new Error('Socket not connected');
    this.locationSocket.on('location_update', callback);
  }

  // Cleanup
  removeAllListeners() {
    if (this.ridesSocket) {
      this.ridesSocket.removeAllListeners();
    }
    if (this.locationSocket) {
      this.locationSocket.removeAllListeners();
    }
  }
}

export default new SocketClient();
```

---

### Step 6: Create Socket Context (Frontend)

Create `apps/rider-app/context/SocketContext.tsx`:

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import SocketClient from '@/lib/socket/socket-client';
import { useAuth } from './ctx';

interface SocketContextType {
  isConnected: boolean;
  currentRide: any | null;
  driverLocation: { lat: number; lng: number } | null;
  requestRide: (data: any) => void;
  subscribeToRide: (rideId: number) => void;
  unsubscribeFromRide: (rideId: number) => void;
}

const SocketContext = createContext<SocketContextType>({
  isConnected: false,
  currentRide: null,
  driverLocation: null,
  requestRide: () => {},
  subscribeToRide: () => {},
  unsubscribeFromRide: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [currentRide, setCurrentRide] = useState<any | null>(null);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      // Connect socket
      SocketClient.connect()
        .then(() => {
          setIsConnected(true);

          // Set up listeners
          SocketClient.onRideAccepted((data) => {
            console.log('Ride accepted:', data);
            setCurrentRide(data);
          });

          SocketClient.onRideCancelled((data) => {
            console.log('Ride cancelled:', data);
            setCurrentRide(null);
          });

          SocketClient.onLocationUpdate((data) => {
            setDriverLocation({ lat: data.lat, lng: data.lng });
          });
        })
        .catch((error) => {
          console.error('Socket connection failed:', error);
        });

      // Cleanup
      return () => {
        SocketClient.disconnect();
        setIsConnected(false);
      };
    }
  }, [isAuthenticated]);

  const requestRide = (data: any) => {
    SocketClient.requestRide(data);
  };

  const subscribeToRide = (rideId: number) => {
    SocketClient.subscribeToRide(rideId);
  };

  const unsubscribeFromRide = (rideId: number) => {
    SocketClient.unsubscribeFromRide(rideId);
  };

  return (
    <SocketContext.Provider
      value={{
        isConnected,
        currentRide,
        driverLocation,
        requestRide,
        subscribeToRide,
        unsubscribeFromRide,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
```

---

### Step 7: Integrate Socket Provider

Update `apps/rider-app/app/_layout.tsx`:

```typescript
import { SocketProvider } from '../context/SocketContext';

export default function RootLayout() {
  return (
    <SessionProvider>
      <SocketProvider>
        {/* Rest of your app */}
      </SocketProvider>
    </SessionProvider>
  );
}
```

---

### Step 8: Use Socket in Ride Screen

Update `apps/rider-app/app/(core)/(tabs)/ride.tsx`:

```typescript
import { useSocket } from '@/context/SocketContext';

export default function RideScreen() {
  const { isConnected, requestRide, driverLocation } = useSocket();
  
  const handleBookRide = async () => {
    if (!selectedVehicle || !destination) return;
    
    // Use socket to request ride
    requestRide({
      pickupLat: pickupCoordinates.latitude,
      pickupLng: pickupCoordinates.longitude,
      pickupAddress: pickupLocation,
      dropoffLat: destinationCoordinates.latitude,
      dropoffLng: destinationCoordinates.longitude,
      dropoffAddress: destination,
      vehicleType: selectedVehicle,
    });
    
    setIsBooking(true);
  };

  // Display driver location on map
  useEffect(() => {
    if (driverLocation) {
      // Update map with driver location
      console.log('Driver location:', driverLocation);
    }
  }, [driverLocation]);

  return (
    // ... your UI
    <View>
      {isConnected && <Text>Real-time connected</Text>}
      {/* Rest of UI */}
    </View>
  );
}
```

---

## 🎯 Phase 2: Fare Calculation (Week 3)

### Step 1: Install Google Maps API Package (Backend)

```bash
cd apps/backend
npm install @googlemaps/google-maps-services-js
```

---

### Step 2: Create Pricing Module

Create `apps/backend/src/modules/pricing/pricing.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { PricingController } from './pricing.controller';

@Module({
  controllers: [PricingController],
  providers: [PricingService],
  exports: [PricingService],
})
export class PricingModule {}
```

---

### Step 3: Create Pricing Service

Create `apps/backend/src/modules/pricing/pricing.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { Client } from '@googlemaps/google-maps-services-js';

interface FareEstimate {
  estimatedFare: number;
  distance: number; // in meters
  duration: number; // in seconds
  breakdown: {
    baseFare: number;
    distanceFare: number;
    timeFare: number;
    surgeFare: number;
  };
  surgeMultiplier: number;
}

@Injectable()
export class PricingService {
  private googleMapsClient: Client;
  
  // Pricing configuration (TSh - Tanzanian Shillings)
  private readonly BASE_FARE = 3000; // Base fare
  private readonly PER_KM_RATE = 1500; // Per kilometer
  private readonly PER_MINUTE_RATE = 100; // Per minute
  private readonly MINIMUM_FARE = 5000; // Minimum fare
  
  // Vehicle type multipliers
  private readonly VEHICLE_MULTIPLIERS = {
    economy: 1.0,
    comfort: 1.5,
    premium: 2.5,
    xl: 1.8,
  };

  constructor() {
    this.googleMapsClient = new Client({});
  }

  async estimateFare(
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number,
    vehicleType: string = 'economy',
  ): Promise<FareEstimate> {
    try {
      // Get distance and duration from Google Maps
      const response = await this.googleMapsClient.distancematrix({
        params: {
          origins: [`${originLat},${originLng}`],
          destinations: [`${destLat},${destLng}`],
          key: process.env.GOOGLE_MAPS_API_KEY!,
          mode: 'driving',
          departure_time: 'now',
        },
      });

      const result = response.data.rows[0].elements[0];
      
      if (result.status !== 'OK') {
        throw new Error('Unable to calculate route');
      }

      const distanceInMeters = result.distance.value;
      const durationInSeconds = result.duration_in_traffic?.value || result.duration.value;
      const distanceInKm = distanceInMeters / 1000;
      const durationInMinutes = durationInSeconds / 60;

      // Calculate base fare components
      const baseFare = this.BASE_FARE;
      const distanceFare = distanceInKm * this.PER_KM_RATE;
      const timeFare = durationInMinutes * this.PER_MINUTE_RATE;

      // Get surge multiplier
      const surgeMultiplier = await this.getSurgeMultiplier(originLat, originLng);
      
      // Calculate surge fare
      const subtotal = baseFare + distanceFare + timeFare;
      const surgeFare = subtotal * (surgeMultiplier - 1);

      // Apply vehicle type multiplier
      const vehicleMultiplier = this.VEHICLE_MULTIPLIERS[vehicleType] || 1.0;
      
      // Calculate total fare
      let totalFare = (subtotal + surgeFare) * vehicleMultiplier;
      
      // Apply minimum fare
      if (totalFare < this.MINIMUM_FARE) {
        totalFare = this.MINIMUM_FARE;
      }

      return {
        estimatedFare: Math.round(totalFare),
        distance: distanceInMeters,
        duration: durationInSeconds,
        breakdown: {
          baseFare: Math.round(baseFare * vehicleMultiplier),
          distanceFare: Math.round(distanceFare * vehicleMultiplier),
          timeFare: Math.round(timeFare * vehicleMultiplier),
          surgeFare: Math.round(surgeFare * vehicleMultiplier),
        },
        surgeMultiplier,
      };
    } catch (error) {
      console.error('Fare estimation error:', error);
      throw error;
    }
  }

  private async getSurgeMultiplier(lat: number, lng: number): Promise<number> {
    // TODO: Implement surge pricing logic based on:
    // - Current demand
    // - Available drivers
    // - Time of day
    // - Special events
    
    // For now, return 1.0 (no surge)
    return 1.0;
  }

  async calculateFinalFare(
    rideId: number,
    actualDistanceMeters: number,
    actualDurationSeconds: number,
    vehicleType: string = 'economy',
  ): Promise<number> {
    const distanceInKm = actualDistanceMeters / 1000;
    const durationInMinutes = actualDurationSeconds / 60;

    const baseFare = this.BASE_FARE;
    const distanceFare = distanceInKm * this.PER_KM_RATE;
    const timeFare = durationInMinutes * this.PER_MINUTE_RATE;

    const vehicleMultiplier = this.VEHICLE_MULTIPLIERS[vehicleType] || 1.0;
    
    let totalFare = (baseFare + distanceFare + timeFare) * vehicleMultiplier;
    
    if (totalFare < this.MINIMUM_FARE) {
      totalFare = this.MINIMUM_FARE;
    }

    return Math.round(totalFare);
  }
}
```

---

### Step 4: Create Pricing Controller

Create `apps/backend/src/modules/pricing/pricing.controller.ts`:

```typescript
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

class EstimateFareDto {
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  vehicleType?: string;
}

@ApiTags('pricing')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Post('estimate')
  async estimateFare(@Body() dto: EstimateFareDto) {
    return await this.pricingService.estimateFare(
      dto.pickupLat,
      dto.pickupLng,
      dto.dropoffLat,
      dto.dropoffLng,
      dto.vehicleType,
    );
  }
}
```

---

### Step 5: Register Pricing Module

Update `apps/backend/src/app.module.ts`:

```typescript
import { PricingModule } from './modules/pricing/pricing.module';

@Module({
  imports: [
    // ... existing imports
    PricingModule,
  ],
})
export class AppModule {}
```

---

### Step 6: Add Environment Variable

Add to `apps/backend/.env`:

```bash
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

---

### Step 7: Use Pricing in Frontend

Update `apps/rider-app/lib/api/index.ts`:

```typescript
// Add pricing methods
static async estimateFare(
  pickupLat: number,
  pickupLng: number,
  dropoffLat: number,
  dropoffLng: number,
  vehicleType: string = 'economy'
): Promise<any> {
  try {
    const res = await api(true).post('/pricing/estimate', {
      pickupLat,
      pickupLng,
      dropoffLat,
      dropoffLng,
      vehicleType,
    });
    return res.data;
  } catch (error) {
    const err = error as {
      response?: { data?: { error?: string; message?: string } };
    };
    const message =
      err.response?.data?.error ||
      err.response?.data?.message ||
      'Failed to estimate fare';
    throw new Error(message);
  }
}
```

---

### Step 8: Integrate in Ride Screen

Update vehicle selection in `apps/rider-app/app/(core)/(tabs)/ride.tsx`:

```typescript
const [estimatedFare, setEstimatedFare] = useState<any>(null);
const [loadingFare, setLoadingFare] = useState(false);

useEffect(() => {
  if (pickupCoordinates && destinationCoordinates && selectedVehicle) {
    fetchFareEstimate();
  }
}, [pickupCoordinates, destinationCoordinates, selectedVehicle]);

const fetchFareEstimate = async () => {
  try {
    setLoadingFare(true);
    const estimate = await Api.estimateFare(
      pickupCoordinates.latitude,
      pickupCoordinates.longitude,
      destinationCoordinates.latitude,
      destinationCoordinates.longitude,
      selectedVehicle
    );
    setEstimatedFare(estimate);
  } catch (error) {
    console.error('Failed to estimate fare:', error);
    toast.error('Failed to estimate fare');
  } finally {
    setLoadingFare(false);
  }
};

// Display estimated fare in UI
{estimatedFare && (
  <View>
    <Text>Estimated Fare: TSh {estimatedFare.estimatedFare.toLocaleString()}</Text>
    <Text>Distance: {(estimatedFare.distance / 1000).toFixed(1)} km</Text>
    <Text>Duration: {Math.round(estimatedFare.duration / 60)} min</Text>
    {estimatedFare.surgeMultiplier > 1 && (
      <Text>Surge: {estimatedFare.surgeMultiplier}x</Text>
    )}
  </View>
)}
```

---

## ✅ Testing Your Implementation

### Test Real-Time Connection

1. Start backend: `cd apps/backend && npm run start:dev`
2. Start frontend: `cd apps/rider-app && npx expo start`
3. Check console for "Socket connected" message
4. Verify connection in network tab

### Test Fare Estimation

1. Enter pickup and destination in the app
2. Select vehicle type
3. Check if estimated fare appears
4. Verify fare breakdown in console

---

## 🎯 Next Steps

After completing Phase 1 and Phase 2, continue with:

1. **Driver Matching System** (Phase 3, Week 2)
2. **Payment Gateway Integration** (Phase 4, Week 4)
3. **Maps Integration Enhancement** (Phase 5, Week 5)

Refer to the main `UBER_PARITY_ROADMAP.md` for detailed implementation plans for these phases.

---

## 📞 Troubleshooting

### Socket Connection Issues
- Verify backend is running
- Check EXPO_PUBLIC_SOCKET_URL in frontend .env
- Ensure CORS is properly configured
- Check JWT token is valid

### Fare Estimation Issues
- Verify GOOGLE_MAPS_API_KEY is set
- Check API key has Distance Matrix API enabled
- Verify coordinates are valid
- Check API quotas/limits

---

**Happy Coding! 🚀**

