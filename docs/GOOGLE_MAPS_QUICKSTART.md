# Google Maps Integration - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Get Google Maps API Key

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project
3. Enable these APIs:
   - ✅ Maps SDK for Android
   - ✅ Maps SDK for iOS
   - ✅ Places API
   - ✅ Directions API
   - ✅ Distance Matrix API
   - ✅ Geocoding API

4. Create API Key in Credentials
5. Copy the API key

### Step 2: Configure Environment Variables

Create `.env` file in project root (or update existing):

```bash
# Mobile Apps
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE

# Backend
GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

### Step 3: Restart Servers

```bash
# Backend
cd apps/backend
pnpm run dev

# Mobile App
cd apps/rider-app
pnpm start
```

### Step 4: Test It!

Open the rider app → Select destination → See real-time address suggestions! 🎉

## 📱 Quick Usage

### Address Autocomplete

```typescript
import { AddressAutocomplete } from '@/components/maps/AddressAutocomplete';

<AddressAutocomplete
  value={address}
  onChangeText={setAddress}
  onSelectPlace={async (prediction) => {
    const details = await googleMapsService.places.getPlaceDetails(
      prediction.placeId
    );
    console.log(details?.location); // { latitude, longitude }
  }}
  currentLocation={{ latitude: -6.7924, longitude: 39.2083 }}
/>
```

### Get Directions

```typescript
import { directionsService } from '@/lib/maps/google-maps.service';

const route = await directionsService.getOptimalRoute(
  { latitude: -6.7924, longitude: 39.2083 },
  { latitude: -6.8162, longitude: 39.2803 }
);

console.log(`Distance: ${route?.legs[0].distance.text}`);
console.log(`Duration: ${route?.legs[0].durationInTraffic?.text}`);
```

### Reverse Geocode

```typescript
import { geocodingService } from '@/lib/maps/google-maps.service';

const result = await geocodingService.reverseGeocode(-6.7924, 39.2083);
console.log(result?.formattedAddress);
```

## 🎯 What You Get

**Mobile Apps:**
- ✅ Real-time address autocomplete
- ✅ Place search and details
- ✅ Turn-by-turn directions
- ✅ Traffic-aware routing
- ✅ Nearby places search
- ✅ Reverse geocoding

**Backend:**
- ✅ Accurate distance calculation
- ✅ Traffic-aware duration
- ✅ Better fare estimates
- ✅ Auto-fallback to Haversine if API unavailable

## 🔍 Verify Setup

Check if Google Maps is configured:

```typescript
import { googleMapsService } from '@/lib/maps/google-maps.service';

if (googleMapsService.isConfigured()) {
  console.log('✅ Google Maps configured!');
} else {
  console.log('❌ API key not configured');
}
```

## 🚨 Troubleshooting

**"API key not configured"**
→ Check `.env` file exists and has `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`

**"REQUEST_DENIED"**
→ Enable the APIs in Google Cloud Console

**"OVER_QUERY_LIMIT"**
→ Check usage limits in Google Cloud Console

## 📚 Full Documentation

For complete API reference and advanced usage, see:
- [GOOGLE_MAPS_INTEGRATION.md](./GOOGLE_MAPS_INTEGRATION.md)

## 💰 Pricing

Google Maps offers **$200 free credit per month**, which includes:
- ~40,000 Geocoding requests
- ~40,000 Distance Matrix calculations
- ~40,000 Directions API calls
- ~40,000 Places API requests

Perfect for development and moderate production use!

## ✅ Next Steps

1. ✅ **Setup Complete** - Your app now has Google Maps!
2. 📍 **Integrate with Ride Screen** - Already done!
3. 🗺️ **Display Routes on Map** - Use decoded polylines
4. 🔔 **Add Turn-by-Turn Navigation** - Use route steps

---

**Status:** 🎉 **Ready to Use!**

All Google Maps services are integrated and working. Start using real addresses and accurate routing in your app!

