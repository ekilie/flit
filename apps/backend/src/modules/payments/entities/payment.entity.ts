import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BasicEntity } from 'src/common/entities/base.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Ride } from 'src/modules/rides/entities/ride.entity';

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  WALLET = 'wallet',
  MOBILE_MONEY = 'mobile_money',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Entity('payments')
export class Payment extends BasicEntity {
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.CASH,
  })
  method: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ length: 255, nullable: true })
  transactionId?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @ManyToOne(() => Ride, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rideId' })
  ride: Ride;

  @Column()
  rideId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;
}
