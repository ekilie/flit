import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BasicEntity } from 'src/common/entities/base.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Ride } from 'src/modules/rides/entities/ride.entity';

export enum RatingType {
  RIDER_TO_DRIVER = 'rider_to_driver',
  DRIVER_TO_RIDER = 'driver_to_rider',
}

@Entity('ratings')
export class Rating extends BasicEntity {
  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  review?: string;

  @Column({
    type: 'enum',
    enum: RatingType,
  })
  type: RatingType;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fromUserId' })
  fromUser: User;

  @Column()
  fromUserId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'toUserId' })
  toUser: User;

  @Column()
  toUserId: number;

  @ManyToOne(() => Ride, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rideId' })
  ride: Ride;

  @Column()
  rideId: number;
}
