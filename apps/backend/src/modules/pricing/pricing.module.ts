import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PricingController } from './pricing.controller';
import { PricingService } from './services/pricing.service';
import { DistanceCalculatorService } from './services/distance-calculator.service';
import { SurgePricingService } from './services/surge-pricing.service';
import { PricingConfig } from './entities/pricing-config.entity';
import { SurgeZone } from './entities/surge-zone.entity';
import { PricingSeeder } from './pricing.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([PricingConfig, SurgeZone])],
  controllers: [PricingController],
  providers: [
    PricingService,
    DistanceCalculatorService,
    SurgePricingService,
    PricingSeeder,
  ],
  exports: [
    PricingService,
    DistanceCalculatorService,
    SurgePricingService,
    PricingSeeder,
  ],
})
export class PricingModule {}
