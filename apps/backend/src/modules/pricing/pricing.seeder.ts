import { Injectable, Logger } from '@nestjs/common';
import { PricingService } from './services/pricing.service';
import { SurgePricingService } from './services/surge-pricing.service';

@Injectable()
export class PricingSeeder {
  private readonly logger = new Logger('PricingSeeder');

  constructor(
    private readonly pricingService: PricingService,
    private readonly surgePricingService: SurgePricingService,
  ) {}

  async seed() {
    this.logger.log('🌱 Seeding pricing configurations...');

    try {
      // Initialize default pricing configs
      await this.pricingService.initializeDefaultPricing();

      // Create sample surge zones for Dar es Salaam
      await this.createSampleSurgeZones();

      this.logger.log('✅ Pricing configurations seeded successfully');
    } catch (error) {
      this.logger.error('❌ Error seeding pricing configurations:', error);
      throw error;
    }
  }

  private async createSampleSurgeZones() {
    const sampleZones = [
      {
        name: 'Mikocheni Business District',
        centerLatitude: -6.7735,
        centerLongitude: 39.2395,
        radiusKm: 2.0,
        surgeMultiplier: 1.2,
      },
      {
        name: 'City Center (Posta)',
        centerLatitude: -6.8160,
        centerLongitude: 39.2803,
        radiusKm: 2.5,
        surgeMultiplier: 1.3,
      },
      {
        name: 'Mlimani City Area',
        centerLatitude: -6.7730,
        centerLongitude: 39.2120,
        radiusKm: 1.5,
        surgeMultiplier: 1.2,
      },
    ];

    for (const zone of sampleZones) {
      try {
        await this.surgePricingService.createSurgeZone(zone);
        this.logger.log(`Created surge zone: ${zone.name}`);
      } catch (error) {
        // Zone might already exist, skip
        this.logger.debug(`Surge zone ${zone.name} may already exist, skipping`);
      }
    }
  }
}

