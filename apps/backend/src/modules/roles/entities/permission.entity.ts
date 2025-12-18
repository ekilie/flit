import { Entity, Column, ManyToMany } from 'typeorm';
import { Role } from 'src/modules/roles/entities/role.entity';
import { BasicEntity } from 'src/common/entities/base.entity';

@Entity('permissions')
export class Permission extends BasicEntity {
  @Column({ length: 100 })
  name: string;

  @ManyToMany(() => Role, role => role.permissions, {
    cascade: ['insert', 'update'],
  })
  roles: Role[];
}
