import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SurgeZone } from '../entities/surge-zone.entity';

export interface SurgeInfo {
  isInSurgeZone: boolean;
  surgeMultiplier: number;
  zoneName?: string;
  reason?: string;
}

@Injectable()
export class SurgePricingService {
  private readonly logger = new Logger('SurgePricingService');

  constructor(
    @InjectRepository(SurgeZone)
    private surgeZoneRepository: Repository<SurgeZone>,
  ) {}

  /**
   * Get surge multiplier for a location
   */
  async getSurgeMultiplier(
    latitude: number,
    longitude: number,
  ): Promise<SurgeInfo> {
    try {
      // Get all active surge zones
      const activeZones = await this.surgeZoneRepository.find({
        where: { isActive: true },
      });

      // Check if location is in any surge zone
      for (const zone of activeZones) {
        const distance = this.calculateDistance(
          latitude,
          longitude,
          zone.centerLatitude,
          zone.centerLongitude,
        );

        if (distance <= zone.radiusKm) {
          // Check if surge is still valid (within time window)
          const now = new Date();

          if (zone.startTime && zone.endTime) {
            if (now < zone.startTime || now > zone.endTime) {
              continue; // Surge window not active
            }
          }

          this.logger.log(
            `Location is in surge zone: ${zone.name} (${zone.surgeMultiplier}x)`,
          );

          return {
            isInSurgeZone: true,
            surgeMultiplier: Number(zone.surgeMultiplier),
            zoneName: zone.name,
            reason: 'High demand area',
          };
        }
      }

      // Check time-based surge
      const timeBasedSurge = this.getTimeBasedSurge();
      if (timeBasedSurge > 1.0) {
        return {
          isInSurgeZone: true,
          surgeMultiplier: timeBasedSurge,
          reason: 'Peak hours',
        };
      }

      return {
        isInSurgeZone: false,
        surgeMultiplier: 1.0,
      };
    } catch (error) {
      this.logger.error('Error getting surge multiplier:', error);
      // Return normal pricing on error
      return {
        isInSurgeZone: false,
        surgeMultiplier: 1.0,
      };
    }
  }

  /**
   * Calculate time-based surge
   */
  private getTimeBasedSurge(timeOfDay: Date = new Date()): number {
    const hour = timeOfDay.getHours();
    const dayOfWeek = timeOfDay.getDay(); // 0 = Sunday, 6 = Saturday

    // Weekend nights (Friday & Saturday, 9 PM - 3 AM)
    if (
      (dayOfWeek === 5 || dayOfWeek === 6) &&
      ((hour >= 21 && hour <= 23) || (hour >= 0 && hour <= 3))
    ) {
      return 1.3; // 30% surge on weekend nights
    }

    // Weekday rush hours (7-9 AM, 5-7 PM)
    if (
      dayOfWeek >= 1 &&
      dayOfWeek <= 5 &&
      ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19))
    ) {
      return 1.2; // 20% surge during rush hours
    }

    return 1.0; // No time-based surge
  }

  /**
   * Calculate distance between two points (Haversine)
   */
  private calculateDistance(
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
   * Create a surge zone (admin function)
   */
  async createSurgeZone(data: {
    name: string;
    centerLatitude: number;
    centerLongitude: number;
    radiusKm: number;
    surgeMultiplier: number;
    startTime?: Date;
    endTime?: Date;
  }): Promise<SurgeZone> {
    const zone = this.surgeZoneRepository.create(data);
    return await this.surgeZoneRepository.save(zone);
  }

  /**
   * Update surge multiplier for a zone
   */
  async updateSurgeMultiplier(
    zoneId: number,
    multiplier: number,
  ): Promise<void> {
    await this.surgeZoneRepository.update(zoneId, {
      surgeMultiplier: multiplier,
    });
    this.logger.log(`Updated surge zone ${zoneId} to ${multiplier}x`);
  }

  /**
   * Deactivate surge zone
   */
  async deactivateSurgeZone(zoneId: number): Promise<void> {
    await this.surgeZoneRepository.update(zoneId, { isActive: false });
    this.logger.log(`Deactivated surge zone ${zoneId}`);
  }

  /**
   * Get all active surge zones
   */
  async getActiveSurgeZones(): Promise<SurgeZone[]> {
    return await this.surgeZoneRepository.find({
      where: { isActive: true },
    });
  }
}
