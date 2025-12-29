import { Injectable, Logger } from '@nestjs/common';

export interface RouteInfo {
  distance: number; // Distance in kilometers
  duration: number; // Duration in seconds
  polyline?: string; // Encoded polyline for map display
}

@Injectable()
export class DistanceCalculatorService {
  private readonly logger = new Logger('DistanceCalculatorService');

  /**
   * Calculate distance and duration between two points using Haversine formula
   * For production, integrate with Google Maps Distance Matrix API
   */
  async calculateRoute(
    pickupLat: number,
    pickupLng: number,
    dropoffLat: number,
    dropoffLng: number,
  ): Promise<RouteInfo> {
    try {
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
        `Calculated route: ${roadDistance.toFixed(2)} km, ${Math.round(durationSeconds / 60)} minutes`,
      );

      return {
        distance: Math.round(roadDistance * 100) / 100, // Round to 2 decimals
        duration: durationSeconds,
      };
    } catch (error) {
      this.logger.error('Error calculating route:', error);
      throw error;
    }
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

