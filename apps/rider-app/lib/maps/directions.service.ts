import { GOOGLE_MAPS_CONFIG } from './google-maps.config';
import {
  Coordinates,
  DirectionsResult,
  Route,
  RouteLeg,
  DistanceMatrixResult,
} from './types';

export type TravelMode = 'DRIVING' | 'WALKING' | 'BICYCLING' | 'TRANSIT';

/**
 * Google Directions Service
 * Handles route calculation, navigation, and distance matrix
 */
export class DirectionsService {
  private apiKey: string;

  constructor() {
    this.apiKey = GOOGLE_MAPS_CONFIG.apiKey;
  }

  /**
   * Get directions between two points
   */
  async getDirections(
    origin: Coordinates,
    destination: Coordinates,
    mode: TravelMode = 'DRIVING',
    alternatives: boolean = false,
    departureTime: Date | 'now' = 'now'
  ): Promise<DirectionsResult | null> {
    try {
      const params: any = {
        origin: `${origin.latitude},${origin.longitude}`,
        destination: `${destination.latitude},${destination.longitude}`,
        key: this.apiKey,
        mode: mode.toLowerCase(),
        language: GOOGLE_MAPS_CONFIG.language,
        region: GOOGLE_MAPS_CONFIG.region,
        alternatives: alternatives.toString(),
      };

      // Add departure time for traffic-aware routing
      if (mode === 'DRIVING') {
        if (departureTime === 'now') {
          params.departure_time = 'now';
        } else {
          params.departure_time = Math.floor(departureTime.getTime() / 1000);
        }
      }

      const queryString = new URLSearchParams(params).toString();
      const url = `${GOOGLE_MAPS_CONFIG.endpoints.directions}?${queryString}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK') {
        console.error('Directions failed:', data.status, data.error_message);
        return null;
      }

      return {
        routes: data.routes.map((route: any) => this.parseRoute(route)),
        status: data.status,
      };
    } catch (error) {
      console.error('Error in getDirections:', error);
      return null;
    }
  }

  /**
   * Get optimal route with traffic
   */
  async getOptimalRoute(
    origin: Coordinates,
    destination: Coordinates
  ): Promise<Route | null> {
    const result = await this.getDirections(origin, destination, 'DRIVING', false, 'now');
    return result?.routes[0] || null;
  }

  /**
   * Get alternative routes
   */
  async getAlternativeRoutes(
    origin: Coordinates,
    destination: Coordinates
  ): Promise<Route[]> {
    const result = await this.getDirections(origin, destination, 'DRIVING', true, 'now');
    return result?.routes || [];
  }

  /**
   * Calculate ETA with traffic
   */
  async calculateETA(
    origin: Coordinates,
    destination: Coordinates
  ): Promise<{
    duration: number; // seconds
    durationInTraffic: number; // seconds
    distance: number; // meters
  } | null> {
    const route = await this.getOptimalRoute(origin, destination);
    
    if (!route || route.legs.length === 0) {
      return null;
    }

    const leg = route.legs[0];
    return {
      duration: leg.duration.value,
      durationInTraffic: leg.durationInTraffic?.value || leg.duration.value,
      distance: leg.distance.value,
    };
  }

  /**
   * Get distance matrix between multiple origins and destinations
   */
  async getDistanceMatrix(
    origins: Coordinates[],
    destinations: Coordinates[],
    mode: TravelMode = 'DRIVING',
    departureTime: Date | 'now' = 'now'
  ): Promise<DistanceMatrixResult | null> {
    try {
      const params: any = {
        origins: origins.map(o => `${o.latitude},${o.longitude}`).join('|'),
        destinations: destinations.map(d => `${d.latitude},${d.longitude}`).join('|'),
        key: this.apiKey,
        mode: mode.toLowerCase(),
        language: GOOGLE_MAPS_CONFIG.language,
        region: GOOGLE_MAPS_CONFIG.region,
      };

      // Add departure time for traffic-aware calculation
      if (mode === 'DRIVING') {
        if (departureTime === 'now') {
          params.departure_time = 'now';
        } else {
          params.departure_time = Math.floor(departureTime.getTime() / 1000);
        }
      }

      const queryString = new URLSearchParams(params).toString();
      const url = `${GOOGLE_MAPS_CONFIG.endpoints.distanceMatrix}?${queryString}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK') {
        console.error('Distance matrix failed:', data.status, data.error_message);
        return null;
      }

      return {
        originAddresses: data.origin_addresses,
        destinationAddresses: data.destination_addresses,
        rows: data.rows,
      };
    } catch (error) {
      console.error('Error in getDistanceMatrix:', error);
      return null;
    }
  }

  /**
   * Decode polyline string to coordinates array
   */
  decodePolyline(encoded: string): Coordinates[] {
    const points: Coordinates[] = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
      let result = 0;
      let shift = 0;
      let byte;

      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += deltaLat;

      result = 0;
      shift = 0;

      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += deltaLng;

      points.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }

    return points;
  }

  /**
   * Get polyline coordinates from route
   */
  getRouteCoordinates(route: Route): Coordinates[] {
    return this.decodePolyline(route.overviewPolyline);
  }

  /**
   * Format duration in human-readable format
   */
  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} min`;
  }

  /**
   * Format distance in human-readable format
   */
  formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${meters} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  }

  /**
   * Parse route from API response
   */
  private parseRoute(route: any): Route {
    return {
      summary: route.summary,
      legs: route.legs.map((leg: any) => this.parseRouteLeg(leg)),
      overviewPolyline: route.overview_polyline.points,
      bounds: {
        northeast: route.bounds.northeast,
        southwest: route.bounds.southwest,
      },
      copyrights: route.copyrights,
      warnings: route.warnings || [],
    };
  }

  /**
   * Parse route leg from API response
   */
  private parseRouteLeg(leg: any): RouteLeg {
    return {
      distance: leg.distance,
      duration: leg.duration,
      durationInTraffic: leg.duration_in_traffic,
      startAddress: leg.start_address,
      endAddress: leg.end_address,
      startLocation: leg.start_location,
      endLocation: leg.end_location,
      steps: leg.steps.map((step: any) => ({
        distance: step.distance,
        duration: step.duration,
        startLocation: step.start_location,
        endLocation: step.end_location,
        htmlInstructions: step.html_instructions,
        travelMode: step.travel_mode,
        polyline: step.polyline.points,
        maneuver: step.maneuver,
      })),
    };
  }

  /**
   * Check if two routes are significantly different
   */
  areRoutesDifferent(route1: Route, route2: Route): boolean {
    if (route1.legs.length === 0 || route2.legs.length === 0) {
      return false;
    }

    const distance1 = route1.legs[0].distance.value;
    const distance2 = route2.legs[0].distance.value;
    const duration1 = route1.legs[0].duration.value;
    const duration2 = route2.legs[0].duration.value;

    // Consider routes different if distance differs by >10% or duration by >15%
    const distanceDiff = Math.abs(distance1 - distance2) / distance1;
    const durationDiff = Math.abs(duration1 - duration2) / duration1;

    return distanceDiff > 0.1 || durationDiff > 0.15;
  }
}

// Export singleton instance
export const directionsService = new DirectionsService();

