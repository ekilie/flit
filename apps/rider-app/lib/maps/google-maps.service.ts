/**
 * Google Maps Service - Main Service
 * Aggregates all map-related services
 */

import { geocodingService, GeocodingService } from './geocoding.service';
import { placesService, PlacesService } from './places.service';
import { directionsService, DirectionsService } from './directions.service';
import { isGoogleMapsConfigured } from './google-maps.config';

export class GoogleMapsService {
  public geocoding: GeocodingService;
  public places: PlacesService;
  public directions: DirectionsService;

  constructor() {
    this.geocoding = geocodingService;
    this.places = placesService;
    this.directions = directionsService;
  }

  /**
   * Check if Google Maps is properly configured
   */
  isConfigured(): boolean {
    return isGoogleMapsConfigured();
  }

  /**
   * Initialize Google Maps services
   */
  async initialize(): Promise<boolean> {
    if (!this.isConfigured()) {
      console.warn('Google Maps API key not configured');
      return false;
    }

    console.log('Google Maps services initialized');
    return true;
  }

  /**
   * Quick address search with autocomplete
   */
  async searchAddress(
    query: string,
    currentLocation?: { latitude: number; longitude: number }
  ) {
    return await this.places.autocomplete(query, currentLocation);
  }

  /**
   * Get full place details and directions
   */
  async getPlaceWithDirections(
    placeId: string,
    fromLocation: { latitude: number; longitude: number }
  ) {
    // First get place details
    const placeDetails = await this.places.getPlaceDetails(placeId);
    
    if (!placeDetails) {
      return {
        place: null,
        route: null,
      };
    }

    // Then get directions to the place
    const directions = await this.directions.getOptimalRoute(fromLocation, {
      latitude: placeDetails.location.latitude,
      longitude: placeDetails.location.longitude,
    });

    return {
      place: placeDetails,
      route: directions,
    };
  }

  /**
   * Get ETA and distance for multiple destinations
   */
  async getBatchETAs(
    origin: { latitude: number; longitude: number },
    destinations: Array<{ latitude: number; longitude: number }>
  ) {
    const result = await this.directions.getDistanceMatrix(
      [origin],
      destinations,
      'DRIVING',
      'now'
    );

    if (!result || !result.rows[0]) {
      return [];
    }

    return result.rows[0].elements.map((element, index) => ({
      destination: destinations[index],
      distance: element.distance,
      duration: element.duration,
      durationInTraffic: element.durationInTraffic,
      status: element.status,
    }));
  }
}

// Export singleton instance
export const googleMapsService = new GoogleMapsService();

// Export individual services for direct access
export { geocodingService, placesService, directionsService };

// Export types
export * from './types';
export * from './google-maps.config';

