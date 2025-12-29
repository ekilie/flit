import { useState, useEffect, useCallback } from 'react';
import { googleMapsService } from '../google-maps.service';
import {
  PlacePrediction,
  PlaceDetails,
  Route,
  Coordinates,
  NearbyPlace,
} from '../types';

/**
 * Hook for address autocomplete
 */
export function useAddressAutocomplete(currentLocation?: Coordinates) {
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchAddress = useCallback(
    async (query: string) => {
      if (query.trim().length < 2) {
        setPredictions([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const results = await googleMapsService.places.autocomplete(
          query,
          currentLocation
        );
        setPredictions(results);
      } catch (err) {
        setError('Failed to search addresses');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
    [currentLocation]
  );

  const clearPredictions = useCallback(() => {
    setPredictions([]);
  }, []);

  return {
    predictions,
    isLoading,
    error,
    searchAddress,
    clearPredictions,
  };
}

/**
 * Hook for place details
 */
export function usePlaceDetails() {
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPlaceDetails = useCallback(async (placeId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const details = await googleMapsService.places.getPlaceDetails(placeId);
      setPlaceDetails(details);
      return details;
    } catch (err) {
      setError('Failed to load place details');
      console.error(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    placeDetails,
    isLoading,
    error,
    getPlaceDetails,
  };
}

/**
 * Hook for directions and routes
 */
export function useDirections() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDirections = useCallback(
    async (origin: Coordinates, destination: Coordinates, alternatives = false) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await googleMapsService.directions.getDirections(
          origin,
          destination,
          'DRIVING',
          alternatives,
          'now'
        );

        if (result) {
          setRoutes(result.routes);
          setSelectedRoute(result.routes[0] || null);
          return result.routes;
        } else {
          setError('No routes found');
          return [];
        }
      } catch (err) {
        setError('Failed to calculate route');
        console.error(err);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const selectRoute = useCallback((route: Route) => {
    setSelectedRoute(route);
  }, []);

  const clearRoutes = useCallback(() => {
    setRoutes([]);
    setSelectedRoute(null);
  }, []);

  return {
    routes,
    selectedRoute,
    isLoading,
    error,
    getDirections,
    selectRoute,
    clearRoutes,
  };
}

/**
 * Hook for reverse geocoding
 */
export function useReverseGeocode() {
  const [address, setAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAddress = useCallback(
    async (latitude: number, longitude: number) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await googleMapsService.geocoding.reverseGeocode(
          latitude,
          longitude
        );

        if (result) {
          setAddress(result.formattedAddress);
          return result.formattedAddress;
        } else {
          setError('Failed to get address');
          return '';
        }
      } catch (err) {
        setError('Failed to get address');
        console.error(err);
        return '';
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    address,
    isLoading,
    error,
    getAddress,
  };
}

/**
 * Hook for nearby places search
 */
export function useNearbyPlaces() {
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchNearby = useCallback(
    async (
      location: Coordinates,
      radius?: number,
      type?: string,
      keyword?: string
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const results = await googleMapsService.places.searchNearby(
          location,
          radius,
          type,
          keyword
        );
        setPlaces(results);
        return results;
      } catch (err) {
        setError('Failed to search nearby places');
        console.error(err);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    places,
    isLoading,
    error,
    searchNearby,
  };
}

/**
 * Hook for ETA calculation
 */
export function useETA() {
  const [eta, setEta] = useState<{
    duration: number;
    durationInTraffic: number;
    distance: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateETA = useCallback(
    async (origin: Coordinates, destination: Coordinates) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await googleMapsService.directions.calculateETA(
          origin,
          destination
        );

        if (result) {
          setEta(result);
          return result;
        } else {
          setError('Failed to calculate ETA');
          return null;
        }
      } catch (err) {
        setError('Failed to calculate ETA');
        console.error(err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    eta,
    isLoading,
    error,
    calculateETA,
  };
}

