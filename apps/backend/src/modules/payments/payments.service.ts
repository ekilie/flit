import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    Object.assign(payment, updatePaymentDto);
    return await this.paymentRepository.save(payment);
  }

  async remove(id: number): Promise<void> {
    const payment = await this.findOne(id);
    await this.paymentRepository.remove(payment);
  }
}
