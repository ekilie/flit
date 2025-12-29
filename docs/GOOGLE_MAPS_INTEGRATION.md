# Google Maps Integration - Complete Implementation

## Overview
Full-featured Google Maps integration with geocoding, directions, place search, and real-time traffic-aware routing.

## 🚀 Features Implemented

### 1. **Geocoding & Reverse Geocoding**
- Convert addresses to coordinates
- Convert coordinates to human-readable addresses
- Multi-language support
- Address component extraction (city, country, etc.)
- Tanzania region bias for accurate local results

### 2. **Place Search & Autocomplete**
- Real-time address autocomplete
- Place details with ratings, photos, hours
- Nearby places search by type
- Popular destinations discovery
- Business location search

### 3. **Directions & Routes**
- Optimal route calculation with real-time traffic
- Alternative routes
- Turn-by-turn navigation steps
- Polyline encoding/decoding for map display
- ETA calculation with traffic awareness
- Distance matrix for multiple origins/destinations

### 4. **Mobile App Integration**
- React hooks for all map services
- Custom AddressAutocomplete component
- Automatic error handling and fallbacks
- TypeScript types for type safety

### 5. **Backend Integration**
- Updated pricing service to use Google Maps Distance Matrix
- Automatic fallback to Haversine formula if API unavailable
- Traffic-aware fare calculation
- Production-ready error handling

## 📁 File Structure

```
apps/rider-app/lib/maps/
├── google-maps.config.ts      # Configuration & API keys
├── types.ts                    # TypeScript type definitions
├── geocoding.service.ts        # Geocoding & reverse geocoding
├── places.service.ts           # Place search & autocomplete
├── directions.service.ts       # Routes & directions
├── google-maps.service.ts      # Main service aggregator
└── hooks/
    └── useGoogleMaps.ts        # React hooks

apps/rider-app/components/maps/
└── AddressAutocomplete.tsx     # Autocomplete component

apps/backend/src/modules/pricing/services/
└── distance-calculator.service.ts  # Updated with Google Maps
```

## 🔑 Setup Instructions

### 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the following APIs:
   - Maps SDK for Android
   - Maps SDK for iOS
   - Places API
   - Directions API
   - Distance Matrix API
   - Geocoding API

4. Create credentials (API Key)
5. Restrict the API key (optional but recommended):
   - Application restrictions: iOS/Android apps
   - API restrictions: Select the enabled APIs above

### 2. Configure Environment Variables

**Mobile Apps (`apps/rider-app/.env` and `apps/driver-app/.env`):**
```bash
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

**Backend (`apps/backend/.env`):**
```bash
GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

### 3. Install in Mobile Apps

```bash
# Already configured in expo config
# Google Maps is included via expo-location and react-native-maps
```

### 4. Restart Development Servers

```bash
# Backend
cd apps/backend
pnpm run dev

# Mobile app
cd apps/rider-app
pnpm start
```

## 💻 Usage Examples

### Frontend (Mobile Apps)

#### 1. Address Autocomplete

```typescript
import { AddressAutocomplete } from '@/components/maps/AddressAutocomplete';
import { PlacePrediction } from '@/lib/maps/types';

function MyComponent() {
  const [address, setAddress] = useState('');
  const currentLocation = { latitude: -6.7924, longitude: 39.2083 };

  const handleSelectPlace = async (prediction: PlacePrediction) => {
    // Get full place details
    const details = await googleMapsService.places.getPlaceDetails(
      prediction.placeId
    );
    
    if (details) {
      setAddress(details.formattedAddress);
      // Use details.location for coordinates
    }
  };

  return (
    <AddressAutocomplete
      value={address}
      onChangeText={setAddress}
      onSelectPlace={handleSelectPlace}
      currentLocation={currentLocation}
      placeholder="Where to?"
    />
  );
}
```

#### 2. Get Directions with Traffic

```typescript
import { useDirections } from '@/lib/maps/hooks/useGoogleMaps';

function RideScreen() {
  const { routes, selectedRoute, getDirections, isLoading } = useDirections();

  const calculateRoute = async () => {
    const origin = { latitude: -6.7924, longitude: 39.2083 };
    const destination = { latitude: -6.8162, longitude: 39.2803 };

    const routes = await getDirections(origin, destination, true); // true = get alternatives

    if (routes.length > 0) {
      const mainRoute = routes[0];
      console.log(`Distance: ${mainRoute.legs[0].distance.text}`);
      console.log(`Duration: ${mainRoute.legs[0].duration.text}`);
      console.log(`With traffic: ${mainRoute.legs[0].durationInTraffic?.text}`);
    }
  };

  return (
    // ... UI
  );
}
```

#### 3. Reverse Geocode (Get Address from Coordinates)

```typescript
import { useReverseGeocode } from '@/lib/maps/hooks/useGoogleMaps';

function LocationPicker() {
  const { address, getAddress, isLoading } = useReverseGeocode();

  const handleLocationSelect = async (lat: number, lng: number) => {
    const address = await getAddress(lat, lng);
    console.log('Address:', address);
  };

  return (
    // ... UI
  );
}
```

#### 4. Search Nearby Places

```typescript
import { useNearbyPlaces } from '@/lib/maps/hooks/useGoogleMaps';

function NearbyPlacesScreen() {
  const { places, searchNearby, isLoading } = useNearbyPlaces();
  const currentLocation = { latitude: -6.7924, longitude: 39.2083 };

  useEffect(() => {
    // Search for restaurants within 2km
    searchNearby(currentLocation, 2000, 'restaurant');
  }, []);

  return (
    <FlatList
      data={places}
      renderItem={({ item }) => (
        <View>
          <Text>{item.name}</Text>
          <Text>{item.vicinity}</Text>
          <Text>Rating: {item.rating}</Text>
          <Text>Distance: {item.distance?.toFixed(2)} km</Text>
        </View>
      )}
    />
  );
}
```

#### 5. Calculate ETA with Traffic

```typescript
import { useETA } from '@/lib/maps/hooks/useGoogleMaps';

function ETADisplay() {
  const { eta, calculateETA, isLoading } = useETA();

  const getETA = async () => {
    const origin = { latitude: -6.7924, longitude: 39.2083 };
    const destination = { latitude: -6.8162, longitude: 39.2803 };

    const result = await calculateETA(origin, destination);

    if (result) {
      console.log(`Distance: ${result.distance / 1000} km`);
      console.log(`Normal duration: ${result.duration / 60} min`);
      console.log(`With traffic: ${result.durationInTraffic / 60} min`);
    }
  };

  return (
    // ... UI
  );
}
```

#### 6. Direct Service Usage

```typescript
import { googleMapsService } from '@/lib/maps/google-maps.service';

// Geocode an address
const result = await googleMapsService.geocoding.geocode('Mikocheni, Dar es Salaam');
console.log(result?.location);

// Get place details
const place = await googleMapsService.places.getPlaceDetails('ChIJ...');
console.log(place?.name, place?.rating);

// Get optimal route
const route = await googleMapsService.directions.getOptimalRoute(
  { latitude: -6.7924, longitude: 39.2083 },
  { latitude: -6.8162, longitude: 39.2803 }
);
console.log(route?.legs[0].distance.text);

// Decode polyline for map display
const coordinates = googleMapsService.directions.decodePolyline(
  route.overviewPolyline
);
```

### Backend (Pricing Service)

The backend automatically uses Google Maps Distance Matrix API if the API key is configured:

```typescript
// In pricing.service.ts
const fareEstimate = await this.pricingService.calculateFareEstimate({
  pickupLat: -6.7924,
  pickupLng: 39.2083,
  dropoffLat: -6.8162,
  dropoffLng: 39.2803,
  vehicleType: 'economy',
});

// Returns accurate distance and traffic-aware duration
console.log(fareEstimate.distance); // Real road distance in km
console.log(fareEstimate.duration); // Duration with current traffic in seconds
```

**Key Features:**
- Automatic fallback to Haversine formula if API unavailable
- Traffic-aware duration calculation
- Production-ready error handling
- Configurable via environment variables

## 🎨 UI Components

### AddressAutocomplete Component

A fully-featured address autocomplete component with:
- Real-time predictions as user types
- Loading indicator
- Custom theming support
- Keyboard-friendly interaction
- Location bias for better local results

**Props:**
```typescript
interface AddressAutocompleteProps {
  value: string;
  onChangeText: (text: string) => void;
  onSelectPlace: (prediction: PlacePrediction) => void;
  placeholder?: string;
  currentLocation?: Coordinates;
  icon?: string;
}
```

## 📊 TypeScript Types

All services are fully typed. Key types:

```typescript
// Coordinates
interface Coordinates {
  latitude: number;
  longitude: number;
}

// Place Prediction (Autocomplete)
interface PlacePrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
  types: string[];
}

// Place Details
interface PlaceDetails {
  placeId: string;
  name: string;
  formattedAddress: string;
  location: Coordinates;
  types: string[];
  phoneNumber?: string;
  website?: string;
  rating?: number;
  photos?: string[];
  openingHours?: { ... };
}

// Route
interface Route {
  summary: string;
  legs: RouteLeg[];
  overviewPolyline: string;
  bounds: { ... };
  warnings: string[];
}

// Route Leg
interface RouteLeg {
  distance: { value: number; text: string };
  duration: { value: number; text: string };
  durationInTraffic?: { value: number; text: string };
  startAddress: string;
  endAddress: string;
  steps: RouteStep[];
}
```

## 🔒 Security Best Practices

### API Key Restrictions (Recommended)

1. **Application Restrictions:**
   - Android: Add your app's package name and SHA-1 certificate fingerprint
   - iOS: Add your app's bundle identifier

2. **API Restrictions:**
   - Restrict to only the APIs you're using
   - Don't use unrestricted keys in production

3. **Environment Variables:**
   - Never commit API keys to version control
   - Use `.env` files (already in `.gitignore`)
   - Use different keys for development and production

### Rate Limiting

Google Maps API has usage limits. Monitor your usage in the Google Cloud Console.

**Free Tier Limits:**
- Distance Matrix: $5 USD credit/month (~40,000 elements)
- Directions: $5 USD credit/month (~40,000 requests)
- Places: $5 USD credit/month (~varies by request type)
- Geocoding: $5 USD credit/month (~40,000 requests)

## 🧪 Testing

### Test Without API Key

Services will fallback gracefully to Haversine formula if API key is not configured:

```typescript
// Backend will use Haversine
// Frontend will show error messages but won't crash
```

### Test with Mock Data

```typescript
// Create a mock service for testing
class MockGoogleMapsService {
  async geocode(address: string) {
    return {
      formattedAddress: 'Mock Address, Dar es Salaam',
      location: { latitude: -6.7924, longitude: 39.2083 },
      placeId: 'mock-place-id',
      types: ['locality'],
      addressComponents: [],
    };
  }
}
```

## 🚨 Troubleshooting

### "Google Maps API key not configured"

**Solution:**
1. Check `.env` file exists
2. Verify `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` is set (mobile)
3. Verify `GOOGLE_MAPS_API_KEY` is set (backend)
4. Restart development servers

### "OVER_QUERY_LIMIT" Error

**Solution:**
- You've exceeded your API quota
- Check usage in Google Cloud Console
- Consider enabling billing or optimizing requests

### "REQUEST_DENIED" Error

**Solution:**
- API not enabled in Google Cloud Console
- API key restrictions too strict
- Check API key is correct

### Autocomplete Not Working

**Solution:**
- Check Places API is enabled
- Verify API key has Places API permission
- Check console for error messages
- Ensure you're typing at least 2 characters

### Directions Not Loading

**Solution:**
- Check Directions API is enabled
- Verify coordinates are valid
- Check network connectivity
- Look for CORS issues (web only)

## 📈 Performance Optimization

### 1. Debounce Autocomplete

Already implemented in `useAddressAutocomplete`:
```typescript
// Searches only after user stops typing for 300ms
```

### 2. Cache Results

```typescript
// Cache place details
const placeCache = new Map<string, PlaceDetails>();

async function getCachedPlaceDetails(placeId: string) {
  if (placeCache.has(placeId)) {
    return placeCache.get(placeId);
  }
  
  const details = await googleMapsService.places.getPlaceDetails(placeId);
  if (details) {
    placeCache.set(placeId, details);
  }
  return details;
}
```

### 3. Batch Requests

Use Distance Matrix for multiple destinations:
```typescript
const etas = await googleMapsService.getBatchETAs(
  origin,
  [destination1, destination2, destination3]
);
```

## 📝 Next Steps

### High Priority
1. ✅ **Integrate with Fare Calculation** - DONE
2. ✅ **Add Address Autocomplete to Ride Screen** - Component ready
3. ⏳ **Display Routes on Map** - Use decoded polylines
4. ⏳ **Turn-by-Turn Navigation** - Use route steps

### Medium Priority
5. ⏳ **Save Favorite Places** - Store frequently used addresses
6. ⏳ **Recent Searches** - Cache recent autocomplete results
7. ⏳ **Offline Support** - Cache essential data
8. ⏳ **Custom Markers** - Show pickup/dropoff with custom icons

### Low Priority
9. ⏳ **Place Photos** - Display place images
10. ⏳ **Street View** - Integrate street view for places
11. ⏳ **Traffic Layer** - Show traffic conditions on map
12. ⏳ **Indoor Maps** - Support indoor navigation

## 🎉 Summary

**What's Working:**
- ✅ Full geocoding and reverse geocoding
- ✅ Address autocomplete with predictions
- ✅ Place search and details
- ✅ Directions with traffic-aware routing
- ✅ Distance Matrix for multiple locations
- ✅ React hooks for easy integration
- ✅ AddressAutocomplete UI component
- ✅ Backend integration with pricing service
- ✅ Automatic fallback to Haversine formula
- ✅ Complete TypeScript type definitions
- ✅ Production-ready error handling

**Ready for:**
- ✅ Development and testing
- ✅ Production deployment (with API key)
- ✅ Integration with existing ride booking flow
- ✅ Enhanced user experience with real addresses

**Status:** 🚀 **Production Ready!**

