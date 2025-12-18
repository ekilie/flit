import { Entity, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { BasicEntity } from 'src/common/entities/base.entity';
import { Permission } from 'src/modules/roles/entities/permission.entity';

@Entity('roles')
export class Role extends BasicEntity {
  @Column({ length: 100 })
  name: string;

  @ManyToMany(() => Permission, permission => permission.roles, {
    cascade: ['insert', 'update'], // Cascade on insert and update
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinTable()
  permissions: Permission[];

  @OneToMany(() => User, user => user.role, {
    onDelete: 'SET NULL',
  })
  users: User[];
}
