# WebSocket Real-Time Communication

Production-ready Socket.IO implementation for real-time communication between riders and drivers.

## 📁 Architecture

```
gateways/
├── rides.gateway.ts      # Ride status updates
├── location.gateway.ts   # Driver location tracking
├── chat.gateway.ts       # In-ride messaging
└── websocket.module.ts   # Module configuration

guards/
└── ws-jwt.guard.ts       # WebSocket authentication
```

## 🚀 Features

### 1. Rides Gateway (`/rides` namespace)
- **Real-time ride status updates**
- **Driver acceptance notifications**
- **Arrival notifications**
- **Ride start/completion events**
- **Cancellation handling**

### 2. Location Gateway (`/location` namespace)
- **Live driver location streaming** (every 3-5 seconds)
- **Location history tracking**
- **Driver online/offline status**
- **Stale location detection**

### 3. Chat Gateway (`/chat` namespace)
- **Real-time messaging**
- **Typing indicators**
- **Read receipts**
- **Message history**
- **System messages**

## 🔐 Authentication

All WebSocket connections require JWT authentication:

```typescript
// Connection with token
const socket = io('http://localhost:3000/rides', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

The `WsJwtGuard` validates tokens from:
1. `auth.token` in handshake
2. `query.token` in URL
3. `Authorization: Bearer <token>` header

## 📡 Events Reference

### Rides Events

#### Client → Server
```typescript
// Subscribe to ride updates
socket.emit('subscribe:ride', { rideId: 123 });

// Unsubscribe from ride updates
socket.emit('unsubscribe:ride', { rideId: 123 });
```

#### Server → Client
```typescript
// Ride status update
socket.on('ride:update', (data: RideUpdate) => {
  // data: { rideId, status, driverId?, estimatedArrival?, fare?, distance?, duration? }
});

// Driver accepted ride
socket.on('ride:driver-accepted', (data) => {
  // data: { rideId, driverId, estimatedArrival, timestamp }
});

// Driver arrived
socket.on('ride:driver-arrived', (data) => {
  // data: { rideId, timestamp }
});

// Ride started
socket.on('ride:started', (data) => {
  // data: { rideId, timestamp }
});

// Ride completed
socket.on('ride:completed', (data) => {
  // data: { rideId, fare, distance, duration, timestamp }
});

// Ride cancelled
socket.on('ride:cancelled', (data) => {
  // data: { rideId, cancelledBy, reason?, timestamp }
});
```

### Location Events

#### Client → Server
```typescript
// Driver updates location
socket.emit('location:update', {
  location: {
    latitude: -6.7735,
    longitude: 39.2395,
    heading: 180,
    speed: 25,
    accuracy: 10,
    timestamp: Date.now()
  },
  rideId: 123 // Optional, only if on active ride
});

// Rider subscribes to driver location
socket.emit('location:subscribe', { rideId: 123 });

// Unsubscribe from location updates
socket.emit('location:unsubscribe', { rideId: 123 });

// Get current driver location
socket.emit('location:get-driver', { driverId: 456 });
```

#### Server → Client
```typescript
// Driver location update
socket.on('location:driver-update', (data: DriverLocation) => {
  // data: { driverId, rideId, location: { latitude, longitude, heading?, speed?, accuracy?, timestamp } }
});
```

### Chat Events

#### Client → Server
```typescript
// Join chat room
socket.emit('chat:join', { rideId: 123 });

// Leave chat room
socket.emit('chat:leave', { rideId: 123 });

// Send message
socket.emit('chat:message', {
  rideId: 123,
  message: 'On my way!',
  senderType: 'rider' // or 'driver'
});

// Send typing indicator
socket.emit('chat:typing', {
  rideId: 123,
  isTyping: true,
  userType: 'rider'
});

// Mark messages as read
socket.emit('chat:mark-read', {
  rideId: 123,
  messageIds: ['msg-1', 'msg-2']
});
```

#### Server → Client
```typescript
// New message received
socket.on('chat:message', (message: ChatMessage) => {
  // message: { id, rideId, senderId, senderType, message, timestamp, read }
});

// System message
socket.on('chat:system-message', (message: ChatMessage) => {
  // e.g., "Driver has arrived"
});

// Typing indicator
socket.on('chat:typing', (indicator: TypingIndicator) => {
  // indicator: { rideId, userId, userType, isTyping }
});

// Messages marked as read
socket.on('chat:messages-read', (data) => {
  // data: { rideId, messageIds, readBy }
});
```

## 🔧 Server-Side Usage

### Emitting Events from Services

```typescript
import { RidesGateway } from '../gateways/rides.gateway';

@Injectable()
export class RidesService {
  constructor(private ridesGateway: RidesGateway) {}

  async acceptRide(rideId: number, driverId: number) {
    // ... business logic ...
    
    // Emit real-time update
    this.ridesGateway.emitDriverAccepted(rideId, driverId, estimatedArrival);
  }

  async updateRideStatus(rideId: number, status: string) {
    // ... business logic ...
    
    // Emit status update
    this.ridesGateway.emitRideUpdate({
      rideId,
      status,
      // ... other fields
    });
  }
}
```

## 📊 Monitoring & Debugging

### Connection Logs
All gateways log connection events:
```
[RidesGateway] Client connected: socket-id-123
[RidesGateway] User 456 subscribed to ride 789
[RidesGateway] Emitted ride update for ride 789: accepted
```

### Check Online Drivers
```typescript
const onlineDrivers = locationGateway.getOnlineDrivers();
console.log('Online drivers:', onlineDrivers);
```

### Get Driver Location
```typescript
const location = locationGateway.getDriverLocation(driverId);
if (location) {
  console.log('Driver location:', location);
}
```

## 🔒 Security Considerations

1. **Authentication**: All connections require valid JWT tokens
2. **Authorization**: Users can only subscribe to their own rides
3. **Rate Limiting**: Consider implementing rate limiting for location updates
4. **CORS**: Configure CORS properly for production (currently set to `*`)

## 🚀 Production Deployment

### Environment Variables
```env
JWT_SECRET=your-secret-key
JWT_EXPIRATION=7d
```

### Scaling Considerations

1. **Redis Adapter**: For multi-server deployments, use Redis adapter:
```typescript
import { RedisIoAdapter } from '@nestjs/platform-socket.io';

// In main.ts
const redisIoAdapter = new RedisIoAdapter(app);
await redisIoAdapter.connectToRedis();
app.useWebSocketAdapter(redisIoAdapter);
```

2. **Message Persistence**: Store chat messages in database instead of memory
3. **Location History**: Use Redis or TimescaleDB for location history
4. **Connection Pooling**: Monitor and limit concurrent connections

### Performance Optimization

1. **Location Updates**: Throttle to 3-5 seconds
2. **Batch Updates**: Group multiple updates when possible
3. **Compression**: Enable WebSocket compression
4. **Binary Protocol**: Consider using binary protocol for location data

## 📝 Testing

### Manual Testing with Socket.IO Client
```bash
npm install -g socket.io-client-cli

# Connect to rides namespace
socket-io-client http://localhost:3000/rides --auth '{"token":"your-jwt-token"}'

# Subscribe to ride
> emit subscribe:ride {"rideId":123}

# Listen for updates
> on ride:update
```

### Integration Tests
```typescript
describe('RidesGateway', () => {
  it('should emit ride update to subscribers', async () => {
    const client = io('http://localhost:3000/rides', {
      auth: { token: testToken }
    });

    client.emit('subscribe:ride', { rideId: 123 });
    
    // Trigger update from service
    await ridesService.updateStatus(123, 'accepted');
    
    // Assert client received update
    expect(receivedUpdate).toBeDefined();
  });
});
```

## 🐛 Troubleshooting

### Connection Issues
1. Check JWT token validity
2. Verify CORS configuration
3. Check firewall/network settings
4. Ensure WebSocket support in load balancer

### Missing Updates
1. Verify subscription to correct room
2. Check authentication
3. Review server logs for errors
4. Confirm event names match exactly

### Performance Issues
1. Monitor connection count
2. Check location update frequency
3. Review database query performance
4. Consider Redis for caching

## 📚 Additional Resources

- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [NestJS WebSockets](https://docs.nestjs.com/websockets/gateways)
- [Production Best Practices](https://socket.io/docs/v4/performance-tuning/)

