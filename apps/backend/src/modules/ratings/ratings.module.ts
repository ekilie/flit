import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RatingsService } from './ratings.service';
import { RatingsController } from './ratings.controller';
import { Rating } from './entities/rating.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rating])],
  controllers: [RatingsController],
  providers: [RatingsService],
  exports: [RatingsService, TypeOrmModule],
})
export class RatingsModule {}
