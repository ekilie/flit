import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RidesService } from './rides.service';
import { RidesController } from './rides.controller';
import { Ride } from './entities/ride.entity';
import { DriverMatchingService } from './services/driver-matching.service';
import { WebSocketModule } from '../../gateways/websocket.module';
import { UsersModule } from '../users/users.module';
import { PricingModule } from '../pricing/pricing.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ride]),
    WebSocketModule,
    UsersModule,
    PricingModule,
    NotificationsModule,
  ],
  controllers: [RidesController],
  providers: [RidesService, DriverMatchingService],
  exports: [RidesService, DriverMatchingService, TypeOrmModule],
})
export class RidesModule {}
