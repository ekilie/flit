import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('surge_zones')
export class SurgeZone {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  name: string; // e.g., "Mikocheni", "City Center"

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  centerLatitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  centerLongitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  radiusKm: number; // Radius in kilometers

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1.0 })
  surgeMultiplier: number; // 1.0 = normal, 1.5 = 50% surge, etc.

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  startTime: Date; // When surge started

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date; // When surge ends

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}

