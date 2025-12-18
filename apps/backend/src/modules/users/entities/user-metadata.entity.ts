import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';
import { BasicEntity } from 'src/common/entities/base.entity';

@Entity('user_metadata')
export class UserMetadata extends BasicEntity {
  @OneToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  username?: string;

  @Column({ nullable: true })
  location?: string;

  @Column({ nullable: true })
  website?: string;

  @Column({ nullable: true })
  instagram?: string;

  @Column({ nullable: true })
  twitter?: string;

  @Column({ nullable: true })
  linkedin?: string;

  @Column({ default: 0 })
  totalListens: number;

  @Column({ default: 0 })
  totalLikes: number;

  @Column({ default: 0 })
  totalUploads: number;

  @Column({ nullable: true })
  lastDevice?: string;

  @Column({ nullable: true })
  lastIp?: string;

  @Column({ nullable: true })
  lastLocation?: string;

  @Column({ type: 'json', nullable: true })
  extra?: Record<string, any>;
}
