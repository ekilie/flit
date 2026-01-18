import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const payment = this.paymentRepository.create(createPaymentDto);
    return await this.paymentRepository.save(payment);
  }

  async findAll(): Promise<Payment[]> {
    return await this.paymentRepository.find({
      relations: ['ride', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['ride', 'user'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  async findByUser(userId: number): Promise<Payment[]> {
    return await this.paymentRepository.find({
      where: { userId },
      relations: ['ride', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByRide(rideId: number): Promise<Payment[]> {
    return await this.paymentRepository.find({
      where: { rideId },
      relations: ['ride', 'user'],
    });
  }

  async findByStatus(status: PaymentStatus): Promise<Payment[]> {
    return await this.paymentRepository.find({
      where: { status },
      relations: ['ride', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: number,
    updatePaymentDto: UpdatePaymentDto,
  ): Promise<Payment> {
    const payment = await this.findOne(id);

    // Validate status transitions if status is being updated
    if (updatePaymentDto.status && updatePaymentDto.status !== payment.status) {
      this.validateStatusTransition(payment.status, updatePaymentDto.status);
    }

    Object.assign(payment, updatePaymentDto);
    return await this.paymentRepository.save(payment);
  }

  private validateStatusTransition(
    currentStatus: PaymentStatus,
    newStatus: PaymentStatus,
  ): void {
    const validTransitions: Record<PaymentStatus, PaymentStatus[]> = {
      [PaymentStatus.PENDING]: [
        PaymentStatus.PROCESSING,
        PaymentStatus.FAILED,
        PaymentStatus.COMPLETED, // Allow direct completion for cash/wallet payments that don't require processing
      ],
      [PaymentStatus.PROCESSING]: [
        PaymentStatus.COMPLETED,
        PaymentStatus.FAILED,
      ],
      [PaymentStatus.COMPLETED]: [PaymentStatus.REFUNDED],
      [PaymentStatus.FAILED]: [
        PaymentStatus.PENDING, // Allow retry
      ],
      [PaymentStatus.REFUNDED]: [], // Terminal state
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid payment status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  async remove(id: number): Promise<void> {
    const payment = await this.findOne(id);

    // Prevent deletion of completed or refunded payments
    if (
      payment.status === PaymentStatus.COMPLETED ||
      payment.status === PaymentStatus.REFUNDED
    ) {
      throw new BadRequestException(
        'Cannot delete completed or refunded payments',
      );
    }

    await this.paymentRepository.remove(payment);
  }

  // Financial Analytics Methods
  async getPaymentAnalytics(startDate?: Date, endDate?: Date) {
    const where: any = {};

    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate);
    }

    const payments = await this.paymentRepository.find({ where });

    const analytics = {
      totalPayments: payments.length,
      totalRevenue: payments
        .filter(p => p.status === PaymentStatus.COMPLETED)
        .reduce((sum, p) => sum + p.amount, 0),
      averagePayment: 0,
      paymentsByStatus: {
        pending: payments.filter(p => p.status === PaymentStatus.PENDING)
          .length,
        processing: payments.filter(p => p.status === PaymentStatus.PROCESSING)
          .length,
        completed: payments.filter(p => p.status === PaymentStatus.COMPLETED)
          .length,
        failed: payments.filter(p => p.status === PaymentStatus.FAILED).length,
        refunded: payments.filter(p => p.status === PaymentStatus.REFUNDED)
          .length,
      },
      revenueByStatus: {
        pending: payments
          .filter(p => p.status === PaymentStatus.PENDING)
          .reduce((sum, p) => sum + p.amount, 0),
        processing: payments
          .filter(p => p.status === PaymentStatus.PROCESSING)
          .reduce((sum, p) => sum + p.amount, 0),
        completed: payments
          .filter(p => p.status === PaymentStatus.COMPLETED)
          .reduce((sum, p) => sum + p.amount, 0),
        failed: payments
          .filter(p => p.status === PaymentStatus.FAILED)
          .reduce((sum, p) => sum + p.amount, 0),
        refunded: payments
          .filter(p => p.status === PaymentStatus.REFUNDED)
          .reduce((sum, p) => sum + p.amount, 0),
      },
    };

    analytics.averagePayment =
      analytics.totalPayments > 0
        ? analytics.totalRevenue / analytics.paymentsByStatus.completed
        : 0;

    return analytics;
  }

  async getPendingPayouts() {
    return await this.paymentRepository.find({
      where: {
        status: PaymentStatus.COMPLETED,
      },
      relations: ['ride', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getRevenueByPeriod(period: 'day' | 'week' | 'month' | 'year' = 'day') {
    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case 'day':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const payments = await this.paymentRepository.find({
      where: {
        createdAt: Between(startDate, now),
        status: PaymentStatus.COMPLETED,
      },
    });

    return {
      period,
      startDate,
      endDate: now,
      totalRevenue: payments.reduce((sum, p) => sum + p.amount, 0),
      transactionCount: payments.length,
      averageTransaction:
        payments.length > 0
          ? payments.reduce((sum, p) => sum + p.amount, 0) / payments.length
          : 0,
    };
  }
}
