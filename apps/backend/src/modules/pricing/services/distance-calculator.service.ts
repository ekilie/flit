import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface RouteInfo {
  distance: number; // Distance in kilometers
  duration: number; // Duration in seconds
  polyline?: string; // Encoded polyline for map display
}

@Injectable()
export class DistanceCalculatorService {
  private readonly logger = new Logger('DistanceCalculatorService');
  private readonly googleMapsApiKey: string;
  private readonly useGoogleMaps: boolean;

  constructor(private configService: ConfigService) {
    this.googleMapsApiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY') || '';
    this.useGoogleMaps = this.googleMapsApiKey.length > 0;
    
    if (this.useGoogleMaps) {
      this.logger.log('Google Maps Distance Matrix API enabled');
    } else {
      this.logger.warn('Google Maps API key not configured, using Haversine formula');
    }
  }

  /**
   * Calculate distance and duration between two points
   * Uses Google Maps Distance Matrix API if configured, otherwise falls back to Haversine
   */
  async calculateRoute(
    pickupLat: number,
    pickupLng: number,
    dropoffLat: number,
    dropoffLng: number,
  ): Promise<RouteInfo> {
    try {
      if (this.useGoogleMaps) {
        return await this.calculateRouteWithGoogleMaps(
          pickupLat,
          pickupLng,
          dropoffLat,
          dropoffLng,
        );
      } else {
        return await this.calculateRouteWithHaversine(
          pickupLat,
          pickupLng,
          dropoffLat,
          dropoffLng,
        );
      }
    } catch (error) {
      this.logger.error('Error calculating route, falling back to Haversine:', error);
      // Fallback to Haversine if Google Maps fails
      return await this.calculateRouteWithHaversine(
        pickupLat,
        pickupLng,
        dropoffLat,
        dropoffLng,
      );
    }
  }

  /**
   * Calculate route using Google Maps Distance Matrix API
   */
  private async calculateRouteWithGoogleMaps(
    pickupLat: number,
    pickupLng: number,
    dropoffLat: number,
    dropoffLng: number,
  ): Promise<RouteInfo> {
    const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json');
    url.searchParams.append('origins', `${pickupLat},${pickupLng}`);
    url.searchParams.append('destinations', `${dropoffLat},${dropoffLng}`);
    url.searchParams.append('mode', 'driving');
    url.searchParams.append('departure_time', 'now'); // For traffic-aware routing
    url.searchParams.append('key', this.googleMapsApiKey);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status !== 'OK' || !data.rows || data.rows.length === 0) {
      throw new Error(`Google Maps API error: ${data.status}`);
    }

    const element = data.rows[0].elements[0];

    if (element.status !== 'OK') {
      throw new Error(`Route calculation failed: ${element.status}`);
    }

    const distanceMeters = element.distance.value;
    const durationSeconds = element.duration_in_traffic?.value || element.duration.value;

    this.logger.log(
      `Google Maps route: ${(distanceMeters / 1000).toFixed(2)} km, ${Math.round(durationSeconds / 60)} minutes (with traffic)`,
    );

    return {
      distance: Math.round((distanceMeters / 1000) * 100) / 100, // meters to km, 2 decimals
      duration: durationSeconds,
    };
  }

  /**
   * Calculate route using Haversine formula (fallback method)
   */
  private async calculateRouteWithHaversine(
    pickupLat: number,
    pickupLng: number,
    dropoffLat: number,
    dropoffLng: number,
  ): Promise<RouteInfo> {
    // Calculate straight-line distance using Haversine formula
    const distance = this.haversineDistance(
      pickupLat,
      pickupLng,
      dropoffLat,
      dropoffLng,
    );

    // Estimate road distance (typically 1.3x straight-line distance in cities)
    const roadDistance = distance * 1.3;

    // Estimate duration based on average speed (30 km/h in city traffic)
    const averageSpeedKmh = 30;
    const durationHours = roadDistance / averageSpeedKmh;
    const durationSeconds = Math.round(durationHours * 3600);

    this.logger.log(
      `Haversine route: ${roadDistance.toFixed(2)} km, ${Math.round(durationSeconds / 60)} minutes (estimated)`,
    );

    return {
      distance: Math.round(roadDistance * 100) / 100, // Round to 2 decimals
      duration: durationSeconds,
    };
  }

  /**
   * Calculate distance using Haversine formula
   */
  private haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
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

  /**
   * Calculate duration with traffic estimation
   */
  calculateDurationWithTraffic(
    baseDistance: number,
    timeOfDay: Date = new Date(),
  ): number {
    const hour = timeOfDay.getHours();
    let trafficMultiplier = 1.0;

    // Peak hours traffic multipliers
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      trafficMultiplier = 1.5; // 50% slower during rush hour
    } else if (hour >= 22 || hour <= 5) {
      trafficMultiplier = 0.8; // 20% faster late night
    }

    const baseSpeed = 30; // km/h
    const adjustedSpeed = baseSpeed / trafficMultiplier;
    const hours = baseDistance / adjustedSpeed;

    return Math.round(hours * 3600);
  }
}

