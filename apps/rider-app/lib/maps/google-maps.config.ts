// Google Maps API Configuration

// Get your API key from: https://console.cloud.google.com/apis/credentials
export const GOOGLE_MAPS_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY',
  
  // API Endpoints
  endpoints: {
    geocoding: 'https://maps.googleapis.com/maps/api/geocode/json',
    directions: 'https://maps.googleapis.com/maps/api/directions/json',
    distanceMatrix: 'https://maps.googleapis.com/maps/api/distancematrix/json',
    placeAutocomplete: 'https://maps.googleapis.com/maps/api/place/autocomplete/json',
    placeDetails: 'https://maps.googleapis.com/maps/api/place/details/json',
    placeSearch: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
  },
  
  // Default options
  region: 'TZ', // Tanzania
  language: 'en',
  
  // Search radius in meters
  defaultSearchRadius: 5000, // 5km
};

// API Key validation
// TODO: will improve this later
export const isGoogleMapsConfigured = (): boolean => {
  const apiKey = GOOGLE_MAPS_CONFIG.apiKey;
  return apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY' && apiKey.length > 0;
};

