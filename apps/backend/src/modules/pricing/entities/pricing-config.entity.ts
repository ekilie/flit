import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pricing_configs')
export class PricingConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  vehicleType: string; // 'economy', 'comfort', 'premium', 'xl'

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  baseFare: number; // Base fare in TSh

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  perKmRate: number; // Rate per kilometer

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  perMinuteRate: number; // Rate per minute

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  minimumFare: number; // Minimum fare

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  bookingFee: number; // Platform booking fee

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  cancellationFee: number; // Fee for cancellation

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}

