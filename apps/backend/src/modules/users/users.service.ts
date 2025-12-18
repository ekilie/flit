import { Injectable } from '@nestjs/common';
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

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll() {
    return await this.entityManager.find(User);
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async findByEmail(email: string) {
    return await this.entityManager.findOneBy(User, { email: Equal(email) });
  }

  async findById(id: number) {
    return await this.entityManager.findOneBy(User, { id: Equal(id) });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async updatePassword(userId: number, newPassword: string) {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.password = newPassword;
    await this.entityManager.save(user);
    return user;
  }

  async resetPassword(userId: number, token: string) {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify token here (implement your token verification logic)
    // This is just a placeholder
    user.password = token; // In real implementation, this would be a new password
    await this.entityManager.save(user);
    return user;
  }
}
