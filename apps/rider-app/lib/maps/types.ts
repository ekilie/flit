// Google Maps API Types

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LatLng {
  lat: number;
  lng: number;
}

// Geocoding Types
export interface GeocodingResult {
  formattedAddress: string;
  location: Coordinates;
  placeId: string;
  types: string[];
  addressComponents: AddressComponent[];
}

export interface AddressComponent {
  longName: string;
  shortName: string;
  types: string[];
}

// Place Types
export interface PlacePrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
  types: string[];
}

export interface PlaceDetails {
  placeId: string;
  name: string;
  formattedAddress: string;
  location: Coordinates;
  types: string[];
  phoneNumber?: string;
  website?: string;
  rating?: number;
  photos?: string[];
  openingHours?: {
    openNow: boolean;
    weekdayText: string[];
  };
}

export interface NearbyPlace {
  placeId: string;
  name: string;
  vicinity: string;
  location: Coordinates;
  types: string[];
  rating?: number;
  distance?: number;
}

// Directions Types
export interface DirectionsResult {
  routes: Route[];
  status: string;
}

export interface Route {
  summary: string;
  legs: RouteLeg[];
  overviewPolyline: string;
  bounds: {
    northeast: LatLng;
    southwest: LatLng;
  };
  copyrights: string;
  warnings: string[];
}

export interface RouteLeg {
  distance: {
    value: number; // meters
    text: string;
  };
  duration: {
    value: number; // seconds
    text: string;
  };
  durationInTraffic?: {
    value: number; // seconds
    text: string;
  };
  startAddress: string;
  endAddress: string;
  startLocation: LatLng;
  endLocation: LatLng;
  steps: RouteStep[];
}

export interface RouteStep {
  distance: {
    value: number;
    text: string;
  };
  duration: {
    value: number;
    text: string;
  };
  startLocation: LatLng;
  endLocation: LatLng;
  htmlInstructions: string;
  travelMode: 'DRIVING' | 'WALKING' | 'BICYCLING' | 'TRANSIT';
  polyline: string;
  maneuver?: string;
}

// Distance Matrix Types
export interface DistanceMatrixResult {
  originAddresses: string[];
  destinationAddresses: string[];
  rows: DistanceMatrixRow[];
}

export interface DistanceMatrixRow {
  elements: DistanceMatrixElement[];
}

export interface DistanceMatrixElement {
  distance: {
    value: number; // meters
    text: string;
  };
  duration: {
    value: number; // seconds
    text: string;
  };
  durationInTraffic?: {
    value: number;
    text: string;
  };
  status: string;
}

// API Response Types
export interface GoogleMapsApiResponse<T> {
  status: string;
  results?: T[];
  error_message?: string;
}

export interface GoogleMapsPlaceResponse {
  status: string;
  predictions?: any[];
  result?: any;
  results?: any[];
  error_message?: string;
}

