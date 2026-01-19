import { BasicEntity } from 'src/common/entities/base.entity';
import { Column, Entity, ManyToOne, Index } from 'typeorm';
import { User } from './user.entity';

@Entity()
@Index(['token'], { unique: true })
export class ExpoPushToken extends BasicEntity {
    @Column()
    token: string;

    @Column({ nullable: true })
    platform?: 'ios' | 'android' | 'web';

    @ManyToOne(
        () => User,
        (user) => user.expoPushTokens,
        { onDelete: 'CASCADE' },
    )
    user: User;
}
