import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/modules/users/dto/update-user.dto';
import { EntityManager, Equal } from 'typeorm';
import { LoggerService } from 'src/lib/logger/logger.service';
import { User } from 'src/modules/users/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly logger: LoggerService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = this.entityManager.create(User, createUserDto);
    await this.entityManager.save(user);
    return user;
  }

  async findAll() {
    return await this.entityManager.find(User);
  }

  async findOne(id: number) {
    const user = await this.entityManager.findOneBy(User, { id: Equal(id) });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string) {
    return await this.entityManager.findOneBy(User, { email: Equal(email) });
  }

  async findById(id: number) {
    return await this.entityManager.findOneBy(User, { id: Equal(id) });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    await this.entityManager.save(user);
    return user;
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    await this.entityManager.remove(user);
    return { message: 'User deleted successfully' };
  }

  async updatePassword(userId: number, newPassword: string) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    user.password = newPassword;
    await this.entityManager.save(user);
    return user;
  }

  async resetPassword(userId: number, token: string) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Verify token here (implement your token verification logic)
    // This is just a placeholder
    user.password = token; // In real implementation, this would be a new password
    await this.entityManager.save(user);
    return user;
  }
}
