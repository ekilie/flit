import { GOOGLE_MAPS_CONFIG } from './google-maps.config';
import {
  Coordinates,
  PlacePrediction,
  PlaceDetails,
  NearbyPlace,
  GoogleMapsPlaceResponse,
} from './types';

/**
 * Google Places Service
 * Handles place search, autocomplete, and details
 */
export class PlacesService {
  private apiKey: string;

  constructor() {
    this.apiKey = GOOGLE_MAPS_CONFIG.apiKey;
  }

  /**
   * Autocomplete address search
   */
  async autocomplete(
    input: string,
    location?: Coordinates,
    radius?: number
  ): Promise<PlacePrediction[]> {
    try {
      if (input.trim().length < 2) {
        return [];
      }

      const params: any = {
        input,
        key: this.apiKey,
        language: GOOGLE_MAPS_CONFIG.language,
        components: `country:${GOOGLE_MAPS_CONFIG.region}`,
      };

      // Add location bias if provided
      if (location) {
        params.location = `${location.latitude},${location.longitude}`;
        params.radius = radius || GOOGLE_MAPS_CONFIG.defaultSearchRadius;
      }

      const queryString = new URLSearchParams(params).toString();
      const url = `${GOOGLE_MAPS_CONFIG.endpoints.placeAutocomplete}?${queryString}`;

      const response = await fetch(url);
      const data: GoogleMapsPlaceResponse = await response.json();

      if (data.status !== 'OK' || !data.predictions) {
        if (data.status !== 'ZERO_RESULTS') {
          console.error('Autocomplete failed:', data.status, data.error_message);
        }
        return [];
      }

      return data.predictions.map((prediction: any) =>
        this.parsePlacePrediction(prediction)
      );
    } catch (error) {
      console.error('Error in autocomplete:', error);
      return [];
    }
  }

  /**
   * Get place details by place ID
   */
  async getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    try {
      const params = new URLSearchParams({
        place_id: placeId,
        key: this.apiKey,
        language: GOOGLE_MAPS_CONFIG.language,
        fields: 'name,formatted_address,geometry,types,formatted_phone_number,website,rating,photos,opening_hours',
      });

      const url = `${GOOGLE_MAPS_CONFIG.endpoints.placeDetails}?${params.toString()}`;
      const response = await fetch(url);
      const data: GoogleMapsPlaceResponse = await response.json();

      if (data.status !== 'OK' || !data.result) {
        console.error('Place details failed:', data.status, data.error_message);
        return null;
      }

      return this.parsePlaceDetails(data.result);
    } catch (error) {
      console.error('Error in getPlaceDetails:', error);
      return null;
    }
  }

  /**
   * Search nearby places by type
   */
  async searchNearby(
    location: Coordinates,
    radius: number = GOOGLE_MAPS_CONFIG.defaultSearchRadius,
    type?: string,
    keyword?: string
  ): Promise<NearbyPlace[]> {
    try {
      const params: any = {
        location: `${location.latitude},${location.longitude}`,
        radius: radius.toString(),
        key: this.apiKey,
        language: GOOGLE_MAPS_CONFIG.language,
      };

      if (type) {
        params.type = type;
      }

      if (keyword) {
        params.keyword = keyword;
      }

      const queryString = new URLSearchParams(params).toString();
      const url = `${GOOGLE_MAPS_CONFIG.endpoints.placeSearch}?${queryString}`;

      const response = await fetch(url);
      const data: GoogleMapsPlaceResponse = await response.json();

      if (data.status !== 'OK' || !data.results) {
        if (data.status !== 'ZERO_RESULTS') {
          console.error('Nearby search failed:', data.status, data.error_message);
        }
        return [];
      }

      return data.results.map((place: any) => {
        const nearbyPlace = this.parseNearbyPlace(place);
        // Calculate distance from search center
        nearbyPlace.distance = this.calculateDistance(
          location.latitude,
          location.longitude,
          nearbyPlace.location.latitude,
          nearbyPlace.location.longitude
        );
        return nearbyPlace;
      });
    } catch (error) {
      console.error('Error in searchNearby:', error);
      return [];
    }
  }

  /**
   * Search popular destinations near a location
   */
  async getPopularDestinations(location: Coordinates): Promise<NearbyPlace[]> {
    const types = ['tourist_attraction', 'shopping_mall', 'restaurant', 'airport'];
    const allPlaces: NearbyPlace[] = [];

    for (const type of types) {
      const places = await this.searchNearby(location, 10000, type);
      allPlaces.push(...places.slice(0, 3)); // Top 3 from each category
    }

    // Sort by rating and distance
    return allPlaces
      .sort((a, b) => {
        const ratingDiff = (b.rating || 0) - (a.rating || 0);
        const distanceDiff = (a.distance || 0) - (b.distance || 0);
        return ratingDiff * 0.6 + distanceDiff * 0.4;
      })
      .slice(0, 10);
  }

  /**
   * Search business locations
   */
  async searchBusinesses(
    location: Coordinates,
    query: string,
    radius: number = 5000
  ): Promise<NearbyPlace[]> {
    return await this.searchNearby(location, radius, undefined, query);
  }

  /**
   * Parse place prediction from API response
   */
  private parsePlacePrediction(prediction: any): PlacePrediction {
    return {
      placeId: prediction.place_id,
      description: prediction.description,
      mainText: prediction.structured_formatting.main_text,
      secondaryText: prediction.structured_formatting.secondary_text || '',
      types: prediction.types || [],
    };
  }

  /**
   * Parse place details from API response
   */
  private parsePlaceDetails(result: any): PlaceDetails {
    return {
      placeId: result.place_id,
      name: result.name,
      formattedAddress: result.formatted_address,
      location: {
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
      },
      types: result.types || [],
      phoneNumber: result.formatted_phone_number,
      website: result.website,
      rating: result.rating,
      photos: result.photos?.map((photo: any) => photo.photo_reference) || [],
      openingHours: result.opening_hours
        ? {
            openNow: result.opening_hours.open_now,
            weekdayText: result.opening_hours.weekday_text || [],
          }
        : undefined,
    };
  }

  /**
   * Parse nearby place from API response
   */
  private parseNearbyPlace(place: any): NearbyPlace {
    return {
      placeId: place.place_id,
      name: place.name,
      vicinity: place.vicinity,
      location: {
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
      },
      types: place.types || [],
      rating: place.rating,
    };
  }

  /**
   * Calculate distance between two points (Haversine)
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

// Export singleton instance
export const placesService = new PlacesService();

