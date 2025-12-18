import { Module } from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { UsersController } from 'src/modules/users/users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/modules/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [TypeOrmModule.forFeature(), UsersService],
})
export class UsersModule {}
