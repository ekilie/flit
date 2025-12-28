import { Injectable } from '@nestjs/common';
import { UpdateRoleDto } from 'src/modules/roles/dto/update-role.dto';
import { EntityManager } from 'typeorm';
import { LoggerService } from 'src/lib/logger/logger.service';
import { Role } from 'src/modules/roles/entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly logger: LoggerService,
  ) {}

  async findAll() {
    return await this.entityManager.find(Role);
  }

  async findByName(name: string) {
    const role = await this.entityManager.findOne(Role, { where: { name } });
    if (!role) {
      this.logger.error(`Role not found with name: ${name}`, '');
      throw new Error(`Role not found with name: ${name}`);
    }
    return role;
  }

  async findOne(id: number) {
    const role = await this.entityManager.findOne(Role, {
      where: { id },
      relations: ['permissions'],
    });
    if (!role) {
      this.logger.error(`Role not found with id: ${id}`, '');
      throw new Error(`Role not found with id: ${id}`);
    }
    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const role = await this.entityManager.preload(Role, {
      id,
      ...updateRoleDto,
    });
    if (!role) {
      this.logger.error(`Role not found with id: ${id}`, '');
      throw new Error(`Role not found with id: ${id}`);
    }
    await this.entityManager.save(role);
    this.logger.log(`Role updated with id: ${id}`);
    return role;
  }
}
