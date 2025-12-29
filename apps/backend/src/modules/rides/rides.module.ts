import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RidesService } from './rides.service';
import { RidesController } from './rides.controller';
import { Ride } from './entities/ride.entity';
import { DriverMatchingService } from './services/driver-matching.service';
import { WebSocketModule } from '../../gateways/websocket.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ride]),
    WebSocketModule,
    UsersModule,
  ],
  controllers: [RidesController],
  providers: [RidesService, DriverMatchingService],
  exports: [RidesService, DriverMatchingService, TypeOrmModule],
})
export class RidesModule {}
