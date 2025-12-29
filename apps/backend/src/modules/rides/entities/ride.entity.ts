import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BasicEntity } from 'src/common/entities/base.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Vehicle } from 'src/modules/vehicles/entities/vehicle.entity';

export enum RideStatus {
  REQUESTED = 'requested',
  ACCEPTED = 'accepted',
  ARRIVED = 'arrived',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('rides')
export class Ride extends BasicEntity {
  @Column({ type: 'decimal', precision: 10, scale: 7 })
  pickupLatitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  pickupLongitude: number;

  @Column({ length: 255 })
  pickupAddress: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  dropoffLatitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  dropoffLongitude: number;

  @Column({ length: 255 })
  dropoffAddress: string;

  @Column({
    type: 'enum',
    enum: RideStatus,
    default: RideStatus.REQUESTED,
  })
  status: RideStatus;

  @Column({ type: 'varchar', nullable: true })
  vehicleType?: string; // 'economy', 'comfort', 'premium', 'xl'

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  fare?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedFare?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  distance?: number;

  @Column({ type: 'int', nullable: true })
  estimatedDuration?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1.0 })
  surgeMultiplier: number;

  @Column({ type: 'int', nullable: true })
  actualDuration?: number;

  @Column({ type: 'timestamptz', nullable: true })
  acceptedAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  startedAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'riderId' })
  rider: User;

  @Column()
  riderId: number;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'driverId' })
  driver?: User;

  @Column({ nullable: true })
  driverId?: number;

  @ManyToOne(() => Vehicle, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'vehicleId' })
  vehicle?: Vehicle;

  @Column({ nullable: true })
  vehicleId?: number;
}
