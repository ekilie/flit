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
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('locations')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  create(@Body() createLocationDto: CreateLocationDto) {
    return this.locationsService.create(createLocationDto);
  }

  @Get()
  findAll() {
    return this.locationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.locationsService.findOne(+id);
  }

  @Get('user/:userId')
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findByUser(@Param('userId') userId: string, @Query('limit') limit?: string) {
    return this.locationsService.findByUser(+userId, limit ? +limit : 100);
  }

  @Get('user/:userId/latest')
  findLatestByUser(@Param('userId') userId: string) {
    return this.locationsService.findLatestByUser(+userId);
  }

  @Get('ride/:rideId')
  findByRide(@Param('rideId') rideId: string) {
    return this.locationsService.findByRide(+rideId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLocationDto: UpdateLocationDto,
  ) {
    return this.locationsService.update(+id, updateLocationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.locationsService.remove(+id);
  }
}
