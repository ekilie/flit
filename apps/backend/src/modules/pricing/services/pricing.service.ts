import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PricingConfig } from '../entities/pricing-config.entity';
import { DistanceCalculatorService } from './distance-calculator.service';
import { SurgePricingService } from './surge-pricing.service';

export interface FareEstimate {
  estimatedFare: number;
  distance: number; // km
  duration: number; // seconds
  surgeMultiplier: number;
  breakdown: {
    baseFare: number;
    distanceFare: number;
    timeFare: number;
    surgeFare: number;
    bookingFee: number;
    total: number;
  };
  vehicleType: string;
  currency: string;
}

export interface EstimateRequest {
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  vehicleType: string;
  timeOfDay?: Date;
}

@Injectable()
export class PricingService {
  private readonly logger = new Logger('PricingService');
  private readonly CURRENCY = 'TSh';

  constructor(
    @InjectRepository(PricingConfig)
    private pricingConfigRepository: Repository<PricingConfig>,
    private distanceCalculator: DistanceCalculatorService,
    private surgePricing: SurgePricingService,
  ) {}

  /**
   * Calculate fare estimate for a ride
   */
  async calculateFareEstimate(request: EstimateRequest): Promise<FareEstimate> {
    try {
      const {
        pickupLat,
        pickupLng,
        dropoffLat,
        dropoffLng,
        vehicleType,
        timeOfDay = new Date(),
      } = request;

      // 1. Get pricing configuration for vehicle type
      const config = await this.getPricingConfig(vehicleType);

      // 2. Calculate distance and duration
      const route = await this.distanceCalculator.calculateRoute(
        pickupLat,
        pickupLng,
        dropoffLat,
        dropoffLng,
      );

      // Adjust duration for traffic
      const duration = this.distanceCalculator.calculateDurationWithTraffic(
        route.distance,
        timeOfDay,
      );

      // 3. Get surge multiplier
      const surgeInfo = await this.surgePricing.getSurgeMultiplier(
        pickupLat,
        pickupLng,
      );

      // 4. Calculate fare components
      const baseFare = Number(config.baseFare);
      const distanceFare = route.distance * Number(config.perKmRate);
      const timeFare = (duration / 60) * Number(config.perMinuteRate);
      const bookingFee = Number(config.bookingFee);

      // Subtotal before surge
      const subtotal = baseFare + distanceFare + timeFare;

      // Apply surge pricing
      const surgeFare = subtotal * (surgeInfo.surgeMultiplier - 1);

      // Total fare
      let totalFare = subtotal + surgeFare + bookingFee;

      // Apply minimum fare
      if (totalFare < Number(config.minimumFare)) {
        totalFare = Number(config.minimumFare);
      }

      this.logger.log(
        `Fare estimate: ${totalFare} ${this.CURRENCY} for ${vehicleType} (${route.distance} km, surge: ${surgeInfo.surgeMultiplier}x)`,
      );

      return {
        estimatedFare: Math.round(totalFare),
        distance: route.distance,
        duration,
        surgeMultiplier: surgeInfo.surgeMultiplier,
        breakdown: {
          baseFare: Math.round(baseFare),
          distanceFare: Math.round(distanceFare),
          timeFare: Math.round(timeFare),
          surgeFare: Math.round(surgeFare),
          bookingFee: Math.round(bookingFee),
          total: Math.round(totalFare),
        },
        vehicleType,
        currency: this.CURRENCY,
      };
    } catch (error) {
      this.logger.error('Error calculating fare estimate:', error);
      throw error;
    }
  }

  /**
   * Get pricing configuration for vehicle type
   */
  async getPricingConfig(vehicleType: string): Promise<PricingConfig> {
    const config = await this.pricingConfigRepository.findOne({
      where: { vehicleType, isActive: true },
    });

    if (!config) {
      throw new NotFoundException(
        `Pricing config not found for vehicle type: ${vehicleType}`,
      );
    }

    return config;
  }

  /**
   * Get all pricing configurations
   */
  async getAllPricingConfigs(): Promise<PricingConfig[]> {
    return await this.pricingConfigRepository.find({
      where: { isActive: true },
      order: { vehicleType: 'ASC' },
    });
  }

  /**
   * Create pricing configuration
   */
  async createPricingConfig(data: {
    vehicleType: string;
    baseFare: number;
    perKmRate: number;
    perMinuteRate: number;
    minimumFare: number;
    bookingFee?: number;
    cancellationFee?: number;
  }): Promise<PricingConfig> {
    const config = this.pricingConfigRepository.create(data);
    return await this.pricingConfigRepository.save(config);
  }

  /**
   * Update pricing configuration
   */
  async updatePricingConfig(
    vehicleType: string,
    data: Partial<PricingConfig>,
  ): Promise<PricingConfig> {
    await this.pricingConfigRepository.update({ vehicleType }, data);
    return await this.getPricingConfig(vehicleType);
  }

  /**
   * Initialize default pricing configs (seed data)
   */
  async initializeDefaultPricing(): Promise<void> {
    const defaultConfigs = [
      {
        vehicleType: 'economy',
        baseFare: 2000, // TSh 2,000
        perKmRate: 1500, // TSh 1,500 per km
        perMinuteRate: 100, // TSh 100 per minute
        minimumFare: 3000, // TSh 3,000
        bookingFee: 500, // TSh 500
        cancellationFee: 1000, // TSh 1,000
      },
      {
        vehicleType: 'comfort',
        baseFare: 3000, // TSh 3,000
        perKmRate: 2000, // TSh 2,000 per km
        perMinuteRate: 150, // TSh 150 per minute
        minimumFare: 5000, // TSh 5,000
        bookingFee: 500, // TSh 500
        cancellationFee: 1500, // TSh 1,500
      },
      {
        vehicleType: 'premium',
        baseFare: 5000, // TSh 5,000
        perKmRate: 3000, // TSh 3,000 per km
        perMinuteRate: 200, // TSh 200 per minute
        minimumFare: 8000, // TSh 8,000
        bookingFee: 1000, // TSh 1,000
        cancellationFee: 2000, // TSh 2,000
      },
      {
        vehicleType: 'xl',
        baseFare: 4000, // TSh 4,000
        perKmRate: 2500, // TSh 2,500 per km
        perMinuteRate: 180, // TSh 180 per minute
        minimumFare: 6000, // TSh 6,000
        bookingFee: 800, // TSh 800
        cancellationFee: 1500, // TSh 1,500
      },
    ];

    for (const config of defaultConfigs) {
      const exists = await this.pricingConfigRepository.findOne({
        where: { vehicleType: config.vehicleType },
      });

      if (!exists) {
        await this.createPricingConfig(config);
        this.logger.log(
          `Created default pricing config for ${config.vehicleType}`,
        );
      }
    }
  }
}
