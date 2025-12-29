import { GOOGLE_MAPS_CONFIG } from './google-maps.config';
import {
  Coordinates,
  GeocodingResult,
  GoogleMapsApiResponse,
  AddressComponent,
} from './types';

/**
 * Google Maps Geocoding Service
 * Converts addresses to coordinates and vice versa
 */
export class GeocodingService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = GOOGLE_MAPS_CONFIG.apiKey;
    this.baseUrl = GOOGLE_MAPS_CONFIG.endpoints.geocoding;
  }

  /**
   * Convert address to coordinates (Geocoding)
   */
  async geocode(address: string): Promise<GeocodingResult | null> {
    try {
      const params = new URLSearchParams({
        address,
        key: this.apiKey,
        region: GOOGLE_MAPS_CONFIG.region,
        language: GOOGLE_MAPS_CONFIG.language,
      });

      const response = await fetch(`${this.baseUrl}?${params.toString()}`);
      const data: GoogleMapsApiResponse<any> = await response.json();

      if (data.status !== 'OK' || !data.results || data.results.length === 0) {
        console.error('Geocoding failed:', data.status, data.error_message);
        return null;
      }

      const result = data.results[0];
      return this.parseGeocodingResult(result);
    } catch (error) {
      console.error('Error in geocode:', error);
      return null;
    }
  }

  /**
   * Convert coordinates to address (Reverse Geocoding)
   */
  async reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<GeocodingResult | null> {
    try {
      const params = new URLSearchParams({
        latlng: `${latitude},${longitude}`,
        key: this.apiKey,
        language: GOOGLE_MAPS_CONFIG.language,
      });

      const response = await fetch(`${this.baseUrl}?${params.toString()}`);
      const data: GoogleMapsApiResponse<any> = await response.json();

      if (data.status !== 'OK' || !data.results || data.results.length === 0) {
        console.error('Reverse geocoding failed:', data.status, data.error_message);
        return null;
      }

      const result = data.results[0];
      return this.parseGeocodingResult(result);
    } catch (error) {
      console.error('Error in reverseGeocode:', error);
      return null;
    }
  }

  /**
   * Get multiple address suggestions for coordinates
   */
  async reverseGeocodeMultiple(
    latitude: number,
    longitude: number
  ): Promise<GeocodingResult[]> {
    try {
      const params = new URLSearchParams({
        latlng: `${latitude},${longitude}`,
        key: this.apiKey,
        language: GOOGLE_MAPS_CONFIG.language,
      });

      const response = await fetch(`${this.baseUrl}?${params.toString()}`);
      const data: GoogleMapsApiResponse<any> = await response.json();

      if (data.status !== 'OK' || !data.results) {
        return [];
      }

      return data.results.map((result: any) =>
        this.parseGeocodingResult(result)
      );
    } catch (error) {
      console.error('Error in reverseGeocodeMultiple:', error);
      return [];
    }
  }

  /**
   * Get formatted address from coordinates
   */
  async getFormattedAddress(
    latitude: number,
    longitude: number
  ): Promise<string> {
    const result = await this.reverseGeocode(latitude, longitude);
    return result?.formattedAddress || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  }

  /**
   * Get specific address component (e.g., city, country)
   */
  getAddressComponent(
    result: GeocodingResult,
    type: string
  ): string | null {
    const component = result.addressComponents.find((comp) =>
      comp.types.includes(type)
    );
    return component?.longName || null;
  }

  /**
   * Get city from geocoding result
   */
  getCity(result: GeocodingResult): string | null {
    return (
      this.getAddressComponent(result, 'locality') ||
      this.getAddressComponent(result, 'administrative_area_level_2') ||
      this.getAddressComponent(result, 'administrative_area_level_1')
    );
  }

  /**
   * Get country from geocoding result
   */
  getCountry(result: GeocodingResult): string | null {
    return this.getAddressComponent(result, 'country');
  }

  /**
   * Parse raw Google Maps geocoding result
   */
  private parseGeocodingResult(rawResult: any): GeocodingResult {
    return {
      formattedAddress: rawResult.formatted_address,
      location: {
        latitude: rawResult.geometry.location.lat,
        longitude: rawResult.geometry.location.lng,
      },
      placeId: rawResult.place_id,
      types: rawResult.types || [],
      addressComponents: (rawResult.address_components || []).map(
        (comp: any) => ({
          longName: comp.long_name,
          shortName: comp.short_name,
          types: comp.types,
        })
      ),
    };
  }

  /**
   * Validate address format
   */
  isValidAddress(address: string): boolean {
    return address.trim().length >= 3;
  }

  /**
   * Check if coordinates are within Tanzania (approximate bounds)
   */
  isWithinTanzania(latitude: number, longitude: number): boolean {
    const tanzaniaBounds = {
      north: -0.99,
      south: -11.75,
      east: 40.5,
      west: 29.3,
    };

    return (
      latitude >= tanzaniaBounds.south &&
      latitude <= tanzaniaBounds.north &&
      longitude >= tanzaniaBounds.west &&
      longitude <= tanzaniaBounds.east
    );
  }
}

// Export singleton instance
export const geocodingService = new GeocodingService();

