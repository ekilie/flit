import { BasicEntity } from "src/common/entities/base.entity";
import { Column, JoinColumn } from "typeorm";
import { User } from "./user.entity";

export class ExpoPushToken extends BasicEntity {
    @Column({ nullable: true })
    token: string;

    @JoinColumn({ name: 'userId' })
    user: User;
}