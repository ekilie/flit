import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BasicEntity } from 'src/common/entities/base.entity';
import { User } from 'src/modules/users/entities/user.entity';

export enum NotificationType {
  RIDE_REQUEST = 'ride_request',
  RIDE_ACCEPTED = 'ride_accepted',
  RIDE_STARTED = 'ride_started',
  RIDE_COMPLETED = 'ride_completed',
  RIDE_CANCELLED = 'ride_cancelled',
  DRIVER_ARRIVED = 'driver_arrived',
  PAYMENT_RECEIVED = 'payment_received',
  RATING_RECEIVED = 'rating_received',
  SYSTEM = 'system',
}

@Entity('notifications')
export class Notification extends BasicEntity {
  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({ default: false })
  isRead: boolean;

  @Column({ type: 'jsonb', nullable: true })
  data?: Record<string, any>;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;
}
