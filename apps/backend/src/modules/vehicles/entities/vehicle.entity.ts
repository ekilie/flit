import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BasicEntity } from 'src/common/entities/base.entity';
import { User } from 'src/modules/users/entities/user.entity';

export enum VehicleType {
  SEDAN = 'sedan',
  SUV = 'suv',
  VAN = 'van',
  LUXURY = 'luxury',
  ECONOMY = 'economy',
}

export enum VehicleStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
}

@Entity('vehicles')
export class Vehicle extends BasicEntity {
  @Column({ length: 50 })
  make: string;

  @Column({ length: 50 })
  model: string;

  @Column({ type: 'int' })
  year: number;

  @Column({ length: 50, unique: true })
  licensePlate: string;

  @Column({ length: 30 })
  color: string;

  @Column({ type: 'int', default: 4 })
  capacity: number;

  @Column({
    type: 'enum',
    enum: VehicleType,
    default: VehicleType.SEDAN,
  })
  type: VehicleType;

  @Column({
    type: 'enum',
    enum: VehicleStatus,
    default: VehicleStatus.ACTIVE,
  })
  status: VehicleStatus;

  @Column({ nullable: true, length: 255 })
  imageUrl?: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'driverId' })
  driver: User;

  @Column()
  driverId: number;
}
