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
import { RideStatus } from './entities/ride.entity';

@ApiTags('rides')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('rides')
export class RidesController {
  constructor(private readonly ridesService: RidesService) {}

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
  acceptRide(
    @Param('id') id: string,
    @Body() body: { driverId: number; vehicleId: number },
  ) {
    return this.ridesService.acceptRide(+id, body.driverId, body.vehicleId);
  }

  @Post(':id/cancel')
  cancelRide(@Param('id') id: string) {
    return this.ridesService.cancelRide(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ridesService.remove(+id);
  }
}
