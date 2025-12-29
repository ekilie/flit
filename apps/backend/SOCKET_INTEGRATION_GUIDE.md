# Socket.IO Integration Guide

Quick guide to integrate WebSocket gateways with existing Flit services.

## 🔌 Step 1: Import Gateways in Services

### Rides Service Integration

```typescript
// apps/backend/src/modules/rides/rides.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ride } from './entities/ride.entity';
import { CreateRideDto } from './dto/create-ride.dto';
import { UpdateRideDto } from './dto/update-ride.dto';
import { RidesGateway } from '../../gateways/rides.gateway';  // Add this
import { LocationGateway } from '../../gateways/location.gateway';  // Add this
import { ChatGateway } from '../../gateways/chat.gateway';  // Add this

@Injectable()
export class RidesService {
  constructor(
    @InjectRepository(Ride)
    private ridesRepository: Repository<Ride>,
    private ridesGateway: RidesGateway,  // Add this
    private locationGateway: LocationGateway,  // Add this
    private chatGateway: ChatGateway,  // Add this
  ) {}

  async create(createRideDto: CreateRideDto): Promise<Ride> {
    const ride = this.ridesRepository.create(createRideDto);
    const savedRide = await this.ridesRepository.save(ride);
    
    // ✅ Emit real-time update
    this.ridesGateway.emitRideUpdate({
      rideId: savedRide.id,
      status: savedRide.status,
    });
    
    return savedRide;
  }

  async update(id: number, updateRideDto: UpdateRideDto): Promise<Ride> {
    await this.ridesRepository.update(id, updateRideDto);
    const updatedRide = await this.ridesRepository.findOne({ where: { id } });
    
    // ✅ Emit real-time update
    if (updatedRide) {
      this.ridesGateway.emitRideUpdate({
        rideId: updatedRide.id,
        status: updatedRide.status,
        fare: updatedRide.fare,
        distance: updatedRide.distance,
        duration: updatedRide.estimatedDuration,
      });
      
      // ✅ Send system message to chat
      if (updateRideDto.status === 'in_progress') {
        this.chatGateway.sendSystemMessage(id, 'Ride has started');
      } else if (updateRideDto.status === 'completed') {
        this.chatGateway.sendSystemMessage(id, 'Ride completed. Thank you!');
      }
    }
    
    return updatedRide;
  }

  async acceptRide(rideId: number, driverId: number, estimatedArrival: number): Promise<Ride> {
    const ride = await this.ridesRepository.findOne({ where: { id: rideId } });
    
    if (!ride) {
      throw new Error('Ride not found');
    }
    
    ride.driverId = driverId;
    ride.status = 'accepted';
    const updatedRide = await this.ridesRepository.save(ride);
    
    // ✅ Emit driver accepted event
    this.ridesGateway.emitDriverAccepted(rideId, driverId, estimatedArrival);
    
    // ✅ Send system message
    this.chatGateway.sendSystemMessage(rideId, 'Driver has accepted your ride');
    
    return updatedRide;
  }

  async markDriverArrived(rideId: number): Promise<Ride> {
    const ride = await this.ridesRepository.findOne({ where: { id: rideId } });
    
    if (!ride) {
      throw new Error('Ride not found');
    }
    
    ride.status = 'arrived';
    const updatedRide = await this.ridesRepository.save(ride);
    
    // ✅ Emit driver arrived event
    this.ridesGateway.emitDriverArrived(rideId);
    
    // ✅ Send system message
    this.chatGateway.sendSystemMessage(rideId, 'Driver has arrived at pickup location');
    
    return updatedRide;
  }

  async startRide(rideId: number): Promise<Ride> {
    const ride = await this.ridesRepository.findOne({ where: { id: rideId } });
    
    if (!ride) {
      throw new Error('Ride not found');
    }
    
    ride.status = 'in_progress';
    const updatedRide = await this.ridesRepository.save(ride);
    
    // ✅ Emit ride started event
    this.ridesGateway.emitRideStarted(rideId);
    
    // ✅ Send system message
    this.chatGateway.sendSystemMessage(rideId, 'Ride has started');
    
    return updatedRide;
  }

  async completeRide(rideId: number, fare: number, distance: number, duration: number): Promise<Ride> {
    const ride = await this.ridesRepository.findOne({ where: { id: rideId } });
    
    if (!ride) {
      throw new Error('Ride not found');
    }
    
    ride.status = 'completed';
    ride.fare = fare;
    ride.distance = distance;
    ride.estimatedDuration = duration;
    const updatedRide = await this.ridesRepository.save(ride);
    
    // ✅ Emit ride completed event
    this.ridesGateway.emitRideCompleted(rideId, fare, distance, duration);
    
    // ✅ Send system message
    this.chatGateway.sendSystemMessage(rideId, `Ride completed. Total fare: TSh ${fare}`);
    
    // ✅ Clear chat history after 1 hour
    setTimeout(() => {
      this.chatGateway.clearChatHistory(rideId);
    }, 3600000);
    
    return updatedRide;
  }

  async cancelRide(rideId: number, cancelledBy: 'rider' | 'driver', reason?: string): Promise<Ride> {
    const ride = await this.ridesRepository.findOne({ where: { id: rideId } });
    
    if (!ride) {
      throw new Error('Ride not found');
    }
    
    ride.status = 'cancelled';
    const updatedRide = await this.ridesRepository.save(ride);
    
    // ✅ Emit ride cancelled event
    this.ridesGateway.emitRideCancelled(rideId, cancelledBy, reason);
    
    // ✅ Send system message
    this.chatGateway.sendSystemMessage(
      rideId, 
      `Ride cancelled by ${cancelledBy}${reason ? `: ${reason}` : ''}`
    );
    
    return updatedRide;
  }
}
```

### Update Rides Module

```typescript
// apps/backend/src/modules/rides/rides.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RidesService } from './rides.service';
import { RidesController } from './rides.controller';
import { Ride } from './entities/ride.entity';
import { WebSocketModule } from '../../gateways/websocket.module';  // Add this

@Module({
  imports: [
    TypeOrmModule.forFeature([Ride]),
    WebSocketModule,  // Add this
  ],
  controllers: [RidesController],
  providers: [RidesService],
  exports: [RidesService],
})
export class RidesModule {}
```

## 🚗 Step 2: Driver Location Updates

Create a new endpoint or service method for drivers to update location:

```typescript
// apps/backend/src/modules/rides/rides.controller.ts
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthUser } from '../auth/decorator/auth-user.decorator';
import { User } from '../auth/interfaces/auth-user.interface';
import { LocationGateway } from '../../gateways/location.gateway';

@Controller('rides')
@UseGuards(JwtAuthGuard)
export class RidesController {
  constructor(
    private ridesService: RidesService,
    private locationGateway: LocationGateway,  // Add this
  ) {}

  // ✅ New endpoint for driver location updates (optional - can also use WebSocket directly)
  @Post(':id/location')
  async updateDriverLocation(
    @Param('id') rideId: string,
    @Body() locationData: {
      latitude: number;
      longitude: number;
      heading?: number;
      speed?: number;
      accuracy?: number;
    },
    @AuthUser() user: User,
  ) {
    // Broadcast location to all ride subscribers
    this.locationGateway.broadcastDriverLocation(
      parseInt(rideId),
      user.userId,
      {
        ...locationData,
        timestamp: Date.now(),
      }
    );

    return { success: true };
  }
}
```

## 📱 Step 3: Frontend Integration Examples

### Update Active Ride Screen

The active ride screen has already been updated with:
- `useRideUpdates()` for real-time status
- `useDriverLocation()` for live location tracking
- Automatic notifications for status changes

### Add Chat to Active Ride

```typescript
// apps/rider-app/app/(core)/ride/chat.tsx
import { useRideChat } from '@/lib/socket/socket-hooks';

export default function RideChatScreen() {
  const { rideId } = useLocalSearchParams();
  const { messages, sendMessage, setTyping, isOtherUserTyping } = useRideChat(Number(rideId));
  
  // ... implement chat UI
}
```

## 🧪 Step 4: Testing

### Test Ride Flow

1. **Create Ride**:
   ```bash
   curl -X POST http://localhost:3000/rides \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"pickupLatitude": -6.7735, "pickupLongitude": 39.2395, ...}'
   ```

2. **Accept Ride** (as driver):
   ```bash
   curl -X POST http://localhost:3000/rides/123/accept \
     -H "Authorization: Bearer DRIVER_TOKEN" \
     -d '{"estimatedArrival": 300}'
   ```

3. **Watch for real-time updates** in rider app

### Test with Socket.IO Client

```bash
npm install -g socket.io-client-cli

# Connect as rider
socket-io-client http://localhost:3000/rides \
  --auth '{"token":"RIDER_TOKEN"}'

# Subscribe to ride
> emit subscribe:ride {"rideId":123}

# Listen for updates
> on ride:update
> on ride:driver-accepted
```

## 🔍 Debugging

### Enable Logging

```typescript
// In rides.service.ts
import { Logger } from '@nestjs/common';

export class RidesService {
  private logger = new Logger('RidesService');

  async acceptRide(...) {
    this.logger.log(`Driver ${driverId} accepting ride ${rideId}`);
    // ... rest of code
    this.logger.log(`Emitted driver accepted event for ride ${rideId}`);
  }
}
```

### Check Gateway Status

```typescript
// In any service
constructor(
  private ridesGateway: RidesGateway,
  private locationGateway: LocationGateway,
) {}

async checkStatus() {
  const onlineDrivers = this.locationGateway.getOnlineDrivers();
  console.log('Online drivers:', onlineDrivers);
  
  const driverLocation = this.locationGateway.getDriverLocation(123);
  console.log('Driver location:', driverLocation);
}
```

## ✅ Checklist

- [ ] Import gateways in rides.service.ts
- [ ] Add WebSocketModule to rides.module.ts
- [ ] Update create/update/accept/complete methods
- [ ] Add system messages for key events
- [ ] Test ride flow end-to-end
- [ ] Verify real-time updates in app
- [ ] Test chat functionality
- [ ] Test location tracking
- [ ] Add error handling
- [ ] Add logging

## 🚀 Production Tips

1. **Error Handling**: Wrap gateway calls in try-catch
2. **Async Operations**: Don't await gateway emissions (fire and forget)
3. **Logging**: Log all real-time events for debugging
4. **Monitoring**: Track WebSocket connection count
5. **Rate Limiting**: Limit location updates per driver

## 📚 References

- Backend Gateway Docs: `src/gateways/README.md`
- Frontend Socket Docs: `apps/rider-app/lib/socket/README.md`
- Main Implementation Doc: `REALTIME_IMPLEMENTATION.md`

