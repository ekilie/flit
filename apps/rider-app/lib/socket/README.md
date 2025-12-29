# Socket.IO Client - Real-Time Communication

Production-ready Socket.IO client implementation for React Native/Expo apps.

## 📁 Structure

```
lib/socket/
├── socket-client.ts      # Socket connection manager
├── socket-context.tsx    # React context for real-time data
├── socket-hooks.ts       # Custom hooks for easy usage
└── README.md            # This file
```

## 🚀 Quick Start

### 1. Setup (Already Done)

The `SocketProvider` is already integrated in `app/_layout.tsx`:

```typescript
<SessionProvider>
  <SocketProvider>
    <App />
  </SocketProvider>
</SessionProvider>
```

### 2. Use in Components

```typescript
import { useRideUpdates, useDriverLocation } from '@/lib/socket/socket-hooks';

function ActiveRide({ rideId }: { rideId: number }) {
  // Get real-time ride updates
  const { rideUpdate, rideStatus, estimatedArrival } = useRideUpdates(rideId);
  
  // Get real-time driver location
  const { location, lastUpdate, isStale } = useDriverLocation(rideId);
  
  return (
    <View>
      <Text>Status: {rideStatus}</Text>
      {location && (
        <Text>Driver at: {location.latitude}, {location.longitude}</Text>
      )}
    </View>
  );
}
```

## 🎣 Available Hooks

### `useRideUpdates(rideId)`
Subscribe to real-time ride status updates.

```typescript
const { rideUpdate, rideStatus, estimatedArrival } = useRideUpdates(123);

// rideUpdate: Full ride update object
// rideStatus: Current ride status string
// estimatedArrival: ETA in seconds (if available)
```

**Events Received:**
- Driver accepted ride
- Driver arrived
- Ride started
- Ride completed
- Ride cancelled

### `useDriverLocation(rideId)`
Track driver's real-time location (updates every 3-5 seconds).

```typescript
const { location, lastUpdate, isStale } = useDriverLocation(123);

// location: { latitude, longitude, heading?, speed? }
// lastUpdate: Timestamp of last update
// isStale: true if no update in last 10 seconds
```

**Use Case:**
- Show driver marker on map
- Animate driver movement
- Display ETA based on location
- Show "connection lost" if stale

### `useRideChat(rideId)`
Real-time chat with driver.

```typescript
const { 
  messages, 
  sendMessage, 
  setTyping, 
  markAsRead,
  isOtherUserTyping 
} = useRideChat(123);

// Send a message
sendMessage('On my way!');

// Show typing indicator
setTyping(true);
setTimeout(() => setTyping(false), 3000);

// Mark messages as read
markAsRead(['msg-1', 'msg-2']);
```

**Features:**
- Real-time message delivery
- Typing indicators
- Read receipts
- Message history
- System messages

### `useSocketConnection()`
Monitor Socket.IO connection status.

```typescript
const { isConnected, connectionStatus, reconnect } = useSocketConnection();

// connectionStatus: 'connected' | 'disconnected' | 'reconnecting'

// Manual reconnection
if (!isConnected) {
  await reconnect();
}
```

**Use Case:**
- Show connection indicator
- Handle reconnection
- Display offline banner

### `useRideStats(rideId)`
Get real-time ride statistics.

```typescript
const { fare, distance, duration } = useRideStats(123);

// fare: Current fare amount
// distance: Distance traveled (km)
// duration: Trip duration (seconds)
```

## 💡 Usage Examples

### Example 1: Active Ride Screen with Real-Time Updates

```typescript
import { useRideUpdates, useDriverLocation } from '@/lib/socket/socket-hooks';
import MapView, { Marker } from 'react-native-maps';

export default function ActiveRideScreen() {
  const { rideId } = useLocalSearchParams();
  const { rideStatus, estimatedArrival } = useRideUpdates(Number(rideId));
  const { location, isStale } = useDriverLocation(Number(rideId));

  return (
    <View style={{ flex: 1 }}>
      <MapView style={{ flex: 1 }}>
        {location && !isStale && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="Driver"
            rotation={location.heading}
          />
        )}
      </MapView>
      
      <View style={styles.statusBar}>
        <Text>Status: {rideStatus}</Text>
        {estimatedArrival && (
          <Text>ETA: {Math.round(estimatedArrival / 60)} minutes</Text>
        )}
      </View>
    </View>
  );
}
```

### Example 2: Chat Interface

```typescript
import { useRideChat } from '@/lib/socket/socket-hooks';

export default function RideChatScreen() {
  const { rideId } = useLocalSearchParams();
  const { 
    messages, 
    sendMessage, 
    setTyping,
    isOtherUserTyping 
  } = useRideChat(Number(rideId));
  
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (inputText.trim()) {
      sendMessage(inputText);
      setInputText('');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <View style={item.senderType === 'rider' ? styles.myMessage : styles.theirMessage}>
            <Text>{item.message}</Text>
            <Text style={styles.timestamp}>
              {new Date(item.timestamp).toLocaleTimeString()}
            </Text>
          </View>
        )}
      />
      
      {isOtherUserTyping && (
        <Text style={styles.typing}>Driver is typing...</Text>
      )}
      
      <View style={styles.inputContainer}>
        <TextInput
          value={inputText}
          onChangeText={(text) => {
            setInputText(text);
            setTyping(text.length > 0);
          }}
          placeholder="Type a message..."
        />
        <Button title="Send" onPress={handleSend} />
      </View>
    </View>
  );
}
```

### Example 3: Connection Status Indicator

```typescript
import { useSocketConnection } from '@/lib/socket/socket-hooks';

export default function ConnectionIndicator() {
  const { isConnected, connectionStatus, reconnect } = useSocketConnection();

  if (connectionStatus === 'connected') {
    return null; // Don't show anything when connected
  }

  return (
    <View style={styles.banner}>
      {connectionStatus === 'disconnected' && (
        <>
          <Text>Connection lost</Text>
          <Button title="Reconnect" onPress={reconnect} />
        </>
      )}
      {connectionStatus === 'reconnecting' && (
        <>
          <ActivityIndicator />
          <Text>Reconnecting...</Text>
        </>
      )}
    </View>
  );
}
```

### Example 4: Ride Status Notifications

```typescript
import { useRideUpdates } from '@/lib/socket/socket-hooks';
import { useEffect } from 'react';
import { toast } from 'yooo-native';

export default function RideNotifications({ rideId }: { rideId: number }) {
  const { rideUpdate } = useRideUpdates(rideId);

  useEffect(() => {
    if (!rideUpdate) return;

    switch (rideUpdate.status) {
      case 'accepted':
        toast.success('Driver accepted your ride!');
        break;
      case 'arrived':
        toast.success('Driver has arrived!');
        break;
      case 'in_progress':
        toast.success('Ride started!');
        break;
      case 'completed':
        toast.success('Ride completed!');
        break;
      case 'cancelled':
        toast.error('Ride was cancelled');
        break;
    }
  }, [rideUpdate]);

  return null; // This is a notification-only component
}
```

## 🔧 Configuration

### Environment Variables

Create `.env` file:
```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

For production:
```env
EXPO_PUBLIC_API_URL=https://api.flit.co.tz
```

### Socket Client Configuration

Edit `socket-client.ts` to customize:

```typescript
const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
const RECONNECTION_DELAY = 1000;  // 1 second
const RECONNECTION_ATTEMPTS = 5;   // Try 5 times
```

## 🔐 Authentication

Socket connections automatically use the JWT token from `@/lib/api/authToken`:

```typescript
// Token is automatically attached
const token = await getToken();
socket = io(`${SOCKET_URL}/rides`, {
  auth: { token }
});
```

## 🐛 Debugging

### Enable Socket.IO Debug Logs

```typescript
// In socket-client.ts
const socket = io(url, {
  auth: { token },
  transports: ['websocket', 'polling'],
  // Add debug option
  debug: __DEV__, // Only in development
});
```

### Console Logs

All socket events are logged:
```
[Socket] Connected to rides socket
[Socket] User 123 subscribed to ride 456
[Socket] Ride update received: { rideId: 456, status: 'accepted' }
```

### Check Connection Status

```typescript
import { socketClient } from '@/lib/socket/socket-client';

// Check if connected
console.log('Connected:', socketClient.isConnected());

// Get socket instances
const ridesSocket = socketClient.getRidesSocket();
console.log('Rides socket connected:', ridesSocket?.connected);
```

## 📊 Performance Tips

1. **Unsubscribe when not needed**: Hooks automatically handle cleanup
2. **Throttle location updates**: Location updates are already throttled to 3-5 seconds
3. **Batch messages**: Send multiple updates together when possible
4. **Use connection pooling**: Socket.IO handles this automatically

## 🚨 Error Handling

### Connection Errors

```typescript
const { isConnected, reconnect } = useSocketConnection();

useEffect(() => {
  if (!isConnected) {
    // Show offline UI
    toast.error('Connection lost. Trying to reconnect...');
    
    // Attempt reconnection
    reconnect();
  }
}, [isConnected]);
```

### Missing Updates

If you're not receiving updates:
1. Check if you're subscribed to the ride
2. Verify JWT token is valid
3. Check network connection
4. Review console logs for errors

## 🧪 Testing

### Mock Socket Data

```typescript
// For testing without backend
const mockRideUpdate = {
  rideId: 123,
  status: 'accepted',
  driverId: 456,
  estimatedArrival: 300,
};

// Emit mock event
socketClient.getRidesSocket()?.emit('ride:update', mockRideUpdate);
```

### Integration Testing

```typescript
import { renderHook, waitFor } from '@testing-library/react-native';
import { useRideUpdates } from '@/lib/socket/socket-hooks';

test('receives ride updates', async () => {
  const { result } = renderHook(() => useRideUpdates(123));
  
  // Simulate server event
  mockSocket.emit('ride:update', { rideId: 123, status: 'accepted' });
  
  await waitFor(() => {
    expect(result.current.rideStatus).toBe('accepted');
  });
});
```

## 📚 Additional Resources

- [Socket.IO Client API](https://socket.io/docs/v4/client-api/)
- [React Native WebSocket](https://reactnative.dev/docs/network#websocket-support)
- [Backend Gateway Documentation](../../backend/src/gateways/README.md)

## 🆘 Troubleshooting

### Issue: Socket not connecting
**Solution**: Check API URL in `.env` and ensure backend is running

### Issue: Not receiving updates
**Solution**: Verify you're subscribed to the correct ride ID

### Issue: Stale location data
**Solution**: Check `isStale` flag and show "connection lost" indicator

### Issue: Messages not sending
**Solution**: Ensure you've joined the chat room first

### Issue: High battery drain
**Solution**: Location updates are already optimized to 3-5 seconds. Consider increasing interval for production.

