import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PricingService } from './services/pricing.service';
import { SurgePricingService } from './services/surge-pricing.service';
import { FareEstimateDto } from './dto/fare-estimate.dto';
import { CreatePricingConfigDto } from './dto/create-pricing-config.dto';
import { CreateSurgeZoneDto } from './dto/create-surge-zone.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('pricing')
@Controller('pricing')
export class PricingController {
  constructor(
    private readonly pricingService: PricingService,
    private readonly surgePricingService: SurgePricingService,
  ) {}

  @Post('estimate')
  @ApiOperation({ summary: 'Get fare estimate for a ride' })
  @ApiResponse({
    status: 200,
    description: 'Fare estimate calculated successfully',
  })
  async getFareEstimate(@Body() dto: FareEstimateDto) {
    const timeOfDay = dto.timeOfDay ? new Date(dto.timeOfDay) : new Date();

    return await this.pricingService.calculateFareEstimate({
      pickupLat: dto.pickupLat,
      pickupLng: dto.pickupLng,
      dropoffLat: dto.dropoffLat,
      dropoffLng: dto.dropoffLng,
      vehicleType: dto.vehicleType,
      timeOfDay,
    });
  }

  @Get('configs')
  @ApiOperation({ summary: 'Get all pricing configurations' })
  @ApiResponse({
    status: 200,
    description: 'Pricing configurations retrieved successfully',
  })
  async getAllConfigs() {
    return await this.pricingService.getAllPricingConfigs();
  }

  @Get('configs/:vehicleType')
  @ApiOperation({ summary: 'Get pricing configuration for a vehicle type' })
  @ApiResponse({
    status: 200,
    description: 'Pricing configuration retrieved successfully',
  })
  async getConfig(@Param('vehicleType') vehicleType: string) {
    return await this.pricingService.getPricingConfig(vehicleType);
  }

  @Post('configs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create pricing configuration (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Pricing configuration created successfully',
  })
  async createConfig(@Body() dto: CreatePricingConfigDto) {
    return await this.pricingService.createPricingConfig(dto);
  }

  @Patch('configs/:vehicleType')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update pricing configuration (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Pricing configuration updated successfully',
  })
  async updateConfig(
    @Param('vehicleType') vehicleType: string,
    @Body() dto: Partial<CreatePricingConfigDto>,
  ) {
    return await this.pricingService.updatePricingConfig(vehicleType, dto);
  }

  @Get('surge-zones')
  @ApiOperation({ summary: 'Get all active surge zones' })
  @ApiResponse({
    status: 200,
    description: 'Surge zones retrieved successfully',
  })
  async getSurgeZones() {
    return await this.surgePricingService.getActiveSurgeZones();
  }

  @Post('surge-zones')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create surge zone (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Surge zone created successfully',
  })
  async createSurgeZone(@Body() dto: CreateSurgeZoneDto) {
    return await this.surgePricingService.createSurgeZone({
      name: dto.name,
      centerLatitude: dto.centerLatitude,
      centerLongitude: dto.centerLongitude,
      radiusKm: dto.radiusKm,
      surgeMultiplier: dto.surgeMultiplier,
      startTime: dto.startTime ? new Date(dto.startTime) : undefined,
      endTime: dto.endTime ? new Date(dto.endTime) : undefined,
    });
  }

  @Patch('surge-zones/:id/multiplier')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update surge multiplier (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Surge multiplier updated successfully',
  })
  async updateSurgeMultiplier(
    @Param('id') id: number,
    @Body() body: { multiplier: number },
  ) {
    await this.surgePricingService.updateSurgeMultiplier(id, body.multiplier);
    return { message: 'Surge multiplier updated successfully' };
  }

  @Delete('surge-zones/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate surge zone (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Surge zone deactivated successfully',
  })
  async deactivateSurgeZone(@Param('id') id: number) {
    await this.surgePricingService.deactivateSurgeZone(id);
    return { message: 'Surge zone deactivated successfully' };
  }
}

