import { Module } from '@nestjs/common';
import { SeederService } from 'src/modules/seeder/seeder.service';
import { PricingModule } from '../pricing/pricing.module';

@Module({
  imports: [PricingModule],
  providers: [SeederService],
})
export class SeederModule {}
