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
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiQuery,
  ApiOperation,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentStatus } from './entities/payment.entity';

@ApiTags('payments')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Get()
  @ApiQuery({ name: 'status', enum: PaymentStatus, required: false })
  findAll(@Query('status') status?: PaymentStatus) {
    if (status) {
      return this.paymentsService.findByStatus(status);
    }
    return this.paymentsService.findAll();
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get payment analytics and financial insights' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async getAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.paymentsService.getPaymentAnalytics(start, end);
  }

  @Get('revenue/period')
  @ApiOperation({ summary: 'Get revenue by time period' })
  @ApiQuery({
    name: 'period',
    enum: ['day', 'week', 'month', 'year'],
    required: false,
  })
  async getRevenueByPeriod(
    @Query('period') period?: 'day' | 'week' | 'month' | 'year',
  ) {
    return this.paymentsService.getRevenueByPeriod(period);
  }

  @Get('payouts/pending')
  @ApiOperation({ summary: 'Get all pending payouts for drivers' })
  async getPendingPayouts() {
    return this.paymentsService.getPendingPayouts();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(+id);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.paymentsService.findByUser(+userId);
  }

  @Get('ride/:rideId')
  findByRide(@Param('rideId') rideId: string) {
    return this.paymentsService.findByRide(+rideId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentsService.update(+id, updatePaymentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(+id);
  }
}
