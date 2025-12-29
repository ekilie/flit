# ⚡ Real-Time Features - Quick Start Guide

Get up and running with Socket.IO real-time features in under 5 minutes!

## 🚀 Quick Setup

### 1. Install Dependencies (One-time setup)

```bash
# Backend
cd apps/backend
pnpm install

# Rider App
cd apps/rider-app
npm install

# Driver App
cd apps/driver-app
npm install
```

### 2. Start Backend

```bash
cd apps/backend
pnpm start:dev
```

**✅ You should see:**
```
[RidesGateway] Rides WebSocket Gateway initialized
[Nest] 12345   - LOG [NestApplication] Nest application successfully started
```

### 3. Start Rider App

```bash
cd apps/rider-app
npm start
# Press 'a' for Android or 'i' for iOS
```

**✅ You should see in console:**
```
[Socket] Connected to rides socket
[Socket] Connected to location socket
[Socket] Connected to chat socket
```

### 4. Start Driver App

```bash
cd apps/driver-app
npm start
# Press 'a' for Android or 'i' for iOS
```

**✅ You should see in console:**
```
[Driver] Socket.IO clients initialized
[Driver] Connected to rides socket
```

## 🧪 Test Real-Time Features

### Test 1: Book a Ride (Rider App)

1. Login to rider app
2. Select pickup and destination
3. Click "Book Ride"
4. **Watch console**: `[Socket] Ride update received`

### Test 2: Accept Ride (Driver App)

1. Login to driver app
2. View available rides
3. Accept a ride
4. **Watch console**: 
   ```
   [Driver] Started location tracking
   [Driver] Location update sent
   ```

### Test 3: Track Driver (Rider App)

After driver accepts:
1. Open active ride screen
2. **You should see**:
   - Driver marker on map
   - Marker updates every 5 seconds
   - ETA countdown

### Test 4: Send Chat Message

**Rider App:**
```typescript
// In active ride screen
const { sendMessage } = useRideChat(rideId);
sendMessage('Hello driver!');
```

**Driver App:**
- Message appears instantly
- No refresh needed!

## 🎯 What's Working

### Rider App ✅
- ✅ Real-time ride status updates
- ✅ Live driver location on map
- ✅ In-ride chat
- ✅ Typing indicators
- ✅ Read receipts
- ✅ Connection monitoring
- ✅ Auto-reconnection

### Driver App ✅
- ✅ Real-time ride updates
- ✅ Automatic location broadcasting (every 5s)
- ✅ In-ride chat
- ✅ Auto start/stop location tracking
- ✅ Connection monitoring
- ✅ Ride statistics

### Backend ✅
- ✅ 3 WebSocket gateways (rides, location, chat)
- ✅ JWT authentication
- ✅ Event broadcasting
- ✅ Connection management
- ✅ Logging and debugging

## 📱 How It Works

### Rider Flow
```
1. Book Ride → Socket subscribes to ride updates
2. Driver Accepts → Receive real-time notification
3. Track Driver → Location updates every 5 seconds
4. Chat → Messages appear instantly
5. Complete Ride → Navigate to rating screen
```

### Driver Flow
```
1. Accept Ride → Auto-start location tracking
2. Location Updates → Sent to backend every 5 seconds
3. Ride Updates → Receive rider actions in real-time
4. Chat → Messages appear instantly
5. Complete Ride → Auto-stop location tracking
```

## 🔍 Verify It's Working

### Check Backend Logs

```bash
cd apps/backend
pnpm start:dev

# Look for:
[RidesGateway] Client connected: socket-abc123
[RidesGateway] User 456 subscribed to ride 789
[LocationGateway] Location client connected
[ChatGateway] Chat client connected
```

### Check Rider App Logs

```javascript
// In console/terminal where rider app is running
[Socket] Connected to rides socket
[Socket] Ride update received: { rideId: 123, status: 'accepted' }
[Socket] Driver location update: { latitude: -6.77, longitude: 39.23 }
```

### Check Driver App Logs

```javascript
// In console/terminal where driver app is running
[Driver] Connected to location socket
[Driver] Started location tracking
[Driver] Location update sent: { latitude: -6.77, longitude: 39.23 }
```

## 🐛 Troubleshooting

### Issue: Sockets not connecting

**Check 1: Backend running?**
```bash
curl http://localhost:3000
# Should return: Hello World!
```

**Check 2: Environment variables set?**
```bash
# In apps/rider-app/.env and apps/driver-app/.env
cat .env
# Should show:
EXPO_PUBLIC_API_URL=http://localhost:3000
```

**Check 3: JWT token valid?**
- Try logging out and back in
- Check token expiration

### Issue: Driver location not updating

**Solution:**
1. Grant location permissions when prompted
2. Ride status must be `'accepted'`
3. Check `useActiveRide` hook is called
4. Look for `[Driver] Started location tracking` in console

### Issue: Not receiving messages

**Solution:**
1. Both users must be in chat room
2. Check `useRideChat` hook is active
3. Verify backend logs show `chat:join` events

## 💡 Quick Tips

### 1. Monitor Connection Status

```typescript
const { isConnected } = useSocketConnection();
// Show banner if !isConnected
```

### 2. Test on Real Devices

Socket.IO works better on real devices than simulators for location tracking.

### 3. Use Production URL

For testing on real devices, use your computer's IP:
```env
EXPO_PUBLIC_API_URL=http://192.168.1.10:3000
```

### 4. Battery Optimization

Location updates are already optimized to 5 seconds. For production, consider:
- Increase to 10 seconds when far from pickup
- Decrease to 3 seconds when close to rider

## 📊 Performance Tips

1. **Location Updates**: Already optimized to 5 seconds
2. **Connection Pooling**: Handled automatically by Socket.IO
3. **Memory Management**: Hooks clean up on unmount
4. **Reconnection**: Auto-reconnects on network issues

## 🎓 Next Steps

1. ✅ **Done**: Basic setup
2. ✅ **Done**: Test connections
3. 📝 **TODO**: Integrate into more screens
4. 📝 **TODO**: Add push notifications
5. 📝 **TODO**: Production deployment

## 📚 Learn More

- **Complete Docs**: `REALTIME_IMPLEMENTATION.md`
- **Mobile Integration**: `MOBILE_APPS_INTEGRATION.md`
- **Backend Guide**: `apps/backend/src/gateways/README.md`
- **Backend Integration**: `apps/backend/SOCKET_INTEGRATION_GUIDE.md`

## ✅ Checklist

Before deploying to production:

**Backend**
- [ ] Installed dependencies
- [ ] Backend running
- [ ] WebSocket gateways initialized
- [ ] JWT authentication working

**Rider App**
- [ ] Installed dependencies
- [ ] Environment variables set
- [ ] Socket connections working
- [ ] Receiving driver location updates
- [ ] Chat working

**Driver App**
- [ ] Installed dependencies
- [ ] Environment variables set
- [ ] Socket connections working
- [ ] Location permissions granted
- [ ] Location tracking working (auto start/stop)
- [ ] Chat working

## 🎉 Success!

If you can:
- ✅ Book a ride (rider app)
- ✅ Accept a ride (driver app)
- ✅ See driver location updating on map (rider app)
- ✅ Send/receive chat messages (both apps)

**Then everything is working! 🚀**

---

Need help? Check the full documentation or review backend logs for errors.

