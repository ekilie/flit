# 📱 Mobile Apps Socket.IO Integration Guide

Complete guide for integrating real-time features in both Rider and Driver apps.

## 📦 Installation

### 1. Install Dependencies

Both apps already have `socket.io-client` added to package.json:

```bash
# Rider App
cd apps/rider-app
npm install

# Driver App
cd apps/driver-app
npm install
```

### 2. Environment Configuration

Create `.env` file in both app directories:

**Development:**
```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

**Production:**
```env
EXPO_PUBLIC_API_URL=https://api.flit.co.tz
```

## 🚗 Rider App Integration

### Features Implemented

✅ Real-time ride status updates  
✅ Live driver location tracking  
✅ In-ride chat with driver  
✅ Connection status monitoring  
✅ Automatic reconnection  

### File Structure

```
apps/rider-app/lib/socket/
├── socket-client.ts      # Connection manager
├── socket-context.tsx    # React context
├── socket-hooks.ts       # Custom hooks
└── README.md            # Documentation
```

### Usage Example

```typescript
// In any screen
import { useRideUpdates, useDriverLocation } from '@/lib/socket/socket-hooks';

function ActiveRideScreen() {
  const { rideId } = useParams();
  
  // Get real-time updates
  const { rideStatus, estimatedArrival } = useRideUpdates(rideId);
  const { location, isStale } = useDriverLocation(rideId);

  return (
    <MapView>
      {location && !isStale && (
        <Marker coordinate={location} title="Driver" />
      )}
    </MapView>
  );
}
```

### Available Hooks

1. **`useRideUpdates(rideId)`** - Subscribe to ride updates
2. **`useDriverLocation(rideId)`** - Track driver location
3. **`useRideChat(rideId)`** - Chat with driver
4. **`useSocketConnection()`** - Monitor connection
5. **`useRideStats(rideId)`** - Get ride statistics

## 🚕 Driver App Integration

### Features Implemented

✅ Real-time ride updates  
✅ Automatic location broadcasting  
✅ In-ride chat with rider  
✅ Connection status monitoring  
✅ Auto start/stop location tracking  

### File Structure

```
apps/driver-app/lib/socket/
├── socket-client.ts      # Connection manager (with location updates)
├── socket-context.tsx    # React context
└── socket-hooks.ts       # Custom hooks
```

### Usage Example

```typescript
// In active ride screen
import { useActiveRide, useRideChat } from '@/lib/socket/socket-hooks';

function ActiveRideScreen() {
  const { rideId } = useParams();
  
  // Manages ride status + automatic location tracking
  const { rideStatus, isTracking, stats } = useActiveRide(rideId);
  const { messages, sendMessage } = useRideChat(rideId);

  return (
    <View>
      <Text>Status: {rideStatus}</Text>
      <Text>Tracking: {isTracking ? 'ON' : 'OFF'}</Text>
      <Text>Fare: TSh {stats.fare}</Text>
    </View>
  );
}
```

### Available Hooks

1. **`useRideUpdates(rideId)`** - Subscribe to ride updates
2. **`useLocationTracking()`** - Manual location control
3. **`useRideChat(rideId)`** - Chat with rider
4. **`useSocketConnection()`** - Monitor connection
5. **`useRideStats(rideId)`** - Get ride statistics
6. **`useActiveRide(rideId)`** - Combined ride management (recommended)

### Location Tracking

The driver app automatically:
- **Starts** location updates when ride status = `'accepted'`
- **Stops** location updates when ride status = `'completed'` or `'cancelled'`
- Updates location every **5 seconds**
- Requires **location permissions**

Manual control:
```typescript
const { isTracking, startTracking, stopTracking } = useLocationTracking();

// Start tracking
await startTracking(rideId);

// Stop tracking
stopTracking();
```

## 🔧 Backend Setup

### 1. Install Dependencies

```bash
cd apps/backend
pnpm install
```

This will install:
- `@nestjs/websockets`
- `@nestjs/platform-socket.io`
- `socket.io`

### 2. Start Backend

```bash
pnpm start:dev
```

The WebSocket gateways will be available at:
- `http://localhost:3000/rides` - Ride updates
- `http://localhost:3000/location` - Location tracking
- `http://localhost:3000/chat` - In-ride chat

### 3. Verify Connection

Check backend logs for:
```
[RidesGateway] Rides WebSocket Gateway initialized
[LocationGateway] Location client connected: socket-id-123
```

## 🧪 Testing the Integration

### Test Flow - Rider App

1. **Start the app**
   ```bash
   cd apps/rider-app
   npm start
   ```

2. **Login as rider**

3. **Book a ride**
   - Select pickup and destination
   - Choose vehicle type
   - Click "Book Ride"

4. **Watch for real-time updates**:
   - ✅ Socket should connect automatically
   - ✅ Subscribe to ride updates
   - ✅ Wait for driver acceptance

### Test Flow - Driver App

1. **Start the app**
   ```bash
   cd apps/driver-app
   npm start
   ```

2. **Login as driver**

3. **Accept a ride**
   - View available rides
   - Accept a ride
   - ✅ Location tracking starts automatically

4. **Watch for**:
   - ✅ Socket connection established
   - ✅ Location updates sent every 5 seconds
   - ✅ Ride status synced in real-time

### Test Chat Feature

**In Rider App:**
```typescript
const { sendMessage } = useRideChat(rideId);
sendMessage('On my way!');
```

**In Driver App:**
```typescript
const { messages, sendMessage } = useRideChat(rideId);
// Messages appear in real-time
sendMessage('Arriving in 2 minutes');
```

## 🔍 Debugging

### Enable Debug Logs

Both apps log socket events:

**Rider App:**
```
[Socket] Connected to rides socket
[Socket] Ride update received: { rideId: 123, status: 'accepted' }
[Socket] Driver location update: { latitude: -6.77, longitude: 39.23 }
```

**Driver App:**
```
[Driver] Connected to location socket
[Driver] Started location tracking
[Driver] Location update sent: { latitude: -6.77, longitude: 39.23 }
```

### Common Issues

#### 1. "Socket not connecting"
**Solution**: 
- Check `EXPO_PUBLIC_API_URL` in `.env`
- Verify backend is running
- Check JWT token is valid

#### 2. "Location not tracking (Driver)"
**Solution**:
- Grant location permissions
- Check ride status is `'accepted'`
- Verify `useActiveRide` or `useLocationTracking` is called

#### 3. "Not receiving updates"
**Solution**:
- Verify socket connection: `const { isConnected } = useSocketConnection()`
- Check subscription: Hooks automatically subscribe
- Review backend logs for errors

## 📊 Performance Monitoring

### Check Connection Status

**Rider App:**
```typescript
const { isConnected, connectionStatus } = useSocketConnection();
console.log('Connected:', isConnected);
console.log('Status:', connectionStatus); // 'connected' | 'disconnected' | 'reconnecting'
```

**Driver App:**
```typescript
const { isTracking } = useLocationTracking();
console.log('Tracking location:', isTracking);
```

### Monitor Location Updates

Add to driver app:
```typescript
useEffect(() => {
  if (isTracking) {
    console.log('Location updates active');
  }
}, [isTracking]);
```

## 🚀 Production Checklist

### Backend

- [ ] Configure CORS properly (remove wildcard `*`)
- [ ] Add Redis adapter for multiple servers
- [ ] Set up rate limiting for location updates
- [ ] Configure proper JWT_SECRET
- [ ] Enable compression for WebSocket
- [ ] Set up monitoring (APM)
- [ ] Add error tracking (Sentry)

### Mobile Apps

- [ ] Update `EXPO_PUBLIC_API_URL` to production URL
- [ ] Test on both iOS and Android
- [ ] Verify location permissions flow
- [ ] Test reconnection logic
- [ ] Monitor battery usage (location tracking)
- [ ] Add analytics for socket events
- [ ] Test on slow networks (3G/4G)

## 📝 Example Integration in Existing Screens

### Rider App - Active Ride Screen

The screen is already integrated! Check `apps/rider-app/app/(core)/ride/active.tsx`:

```typescript
// Real-time updates via Socket.IO
const { rideUpdate, rideStatus, estimatedArrival } = useRideUpdates(rideId);
const { location: driverLocation, isStale } = useDriverLocation(rideId);
const { isConnected, connectionStatus } = useSocketConnection();

// Handles ride updates automatically
useEffect(() => {
  if (rideUpdate) {
    // Update UI based on status
    if (rideUpdate.status === 'accepted') {
      toast.success('Driver accepted your ride!');
    }
  }
}, [rideUpdate]);
```

### Driver App - Add to Active Ride Screen

```typescript
// apps/driver-app/app/(core)/ride/active.tsx
import { useActiveRide, useRideChat } from '@/lib/socket/socket-hooks';

export default function ActiveRideScreen() {
  const { rideId } = useParams();
  
  // All-in-one hook for drivers
  const { 
    rideStatus, 
    isTracking, 
    stats,
    startTracking,
    stopTracking 
  } = useActiveRide(rideId);

  return (
    <View>
      <Text>Status: {rideStatus}</Text>
      <Text>Location Tracking: {isTracking ? '✓ Active' : '✗ Inactive'}</Text>
      
      {stats.fare && <Text>Fare: TSh {stats.fare}</Text>}
      {stats.distance && <Text>Distance: {stats.distance} km</Text>}
    </View>
  );
}
```

## 🎓 Next Steps

1. **Install dependencies** in both apps
2. **Start backend** server
3. **Test with both apps** simultaneously
4. **Monitor logs** for socket events
5. **Integrate into more screens** as needed

## 📚 Additional Resources

- **Backend Docs**: `apps/backend/src/gateways/README.md`
- **Rider App Docs**: `apps/rider-app/lib/socket/README.md`
- **Integration Guide**: `apps/backend/SOCKET_INTEGRATION_GUIDE.md`
- **Implementation Summary**: `REALTIME_IMPLEMENTATION.md`

## 🆘 Support

For issues or questions:
1. Check the console logs in both apps
2. Review backend logs for WebSocket events
3. Verify JWT token is valid
4. Check network connectivity
5. Ensure location permissions are granted (driver app)

---

**Status**: ✅ Both apps are ready for real-time communication!

