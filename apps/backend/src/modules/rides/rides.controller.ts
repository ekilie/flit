import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { RidesService } from './rides.service';
import { CreateRideDto } from './dto/create-ride.dto';
import { UpdateRideDto } from './dto/update-ride.dto';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthUser } from '../auth/decorator/auth-user.decorator';
import { IAuthUser } from '../auth/interfaces/auth-user.interface';
import { RideStatus } from './entities/ride.entity';
import { DriverMatchingService } from './services/driver-matching.service';

@ApiTags('rides')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('rides')
export class RidesController {
  constructor(
    private readonly ridesService: RidesService,
    private readonly driverMatchingService: DriverMatchingService,
  ) {}

  @Post()
  create(@Body() createRideDto: CreateRideDto) {
    return this.ridesService.create(createRideDto);
  }

  @Get()
  @ApiQuery({ name: 'status', enum: RideStatus, required: false })
  findAll(@Query('status') status?: RideStatus) {
    if (status) {
      return this.ridesService.findByStatus(status);
    }
    return this.ridesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ridesService.findOne(+id);
  }

  @Get('rider/:riderId')
  findByRider(@Param('riderId') riderId: string) {
    return this.ridesService.findByRider(+riderId);
  }

  @Get('driver/:driverId')
  findByDriver(@Param('driverId') driverId: string) {
    return this.ridesService.findByDriver(+driverId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRideDto: UpdateRideDto) {
    return this.ridesService.update(+id, updateRideDto);
  }

  @Post(':id/accept')
  async acceptRide(
    @Param('id') id: string,
    @AuthUser() user: IAuthUser,
    @Body() body?: { vehicleId?: number },
  ) {
    const driverId = user.userId;
    const rideId = +id;
    
    // Handle driver acceptance through matching service
    const result = await this.driverMatchingService.handleDriverAcceptance(
      rideId,
      driverId,
    );

    if (!result.success) {
      throw new Error(result.message);
    }

    // Update ride with vehicle if provided
    if (body?.vehicleId) {
      await this.ridesService.update(rideId, {
        vehicleId: body.vehicleId,
      });
    }

    return result;
  }

  @Post(':id/reject')
  async rejectRide(
    @Param('id') id: string,
    @AuthUser() user: IAuthUser,
  ) {
    const driverId = user.userId;
    const rideId = +id;
    
    // Handle driver rejection through matching service
    await this.driverMatchingService.handleDriverRejection(rideId, driverId);
    
    return {
      success: true,
      message: 'Ride rejected successfully',
    };
  }

  @Post(':id/cancel')
  cancelRide(@Param('id') id: string) {
    return this.ridesService.cancelRide(+id);
  }

  @Get('matching/stats')
  async getMatchingStats() {
    return this.driverMatchingService.getMatchingStats();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ridesService.remove(+id);
  }
}
