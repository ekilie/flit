import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BasicEntity } from 'src/common/entities/base.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Ride } from 'src/modules/rides/entities/ride.entity';

@Entity('locations')
export class Location extends BasicEntity {
  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  accuracy?: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  speed?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  heading?: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Ride, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'rideId' })
  ride?: Ride;

  @Column({ nullable: true })
  rideId?: number;
}
