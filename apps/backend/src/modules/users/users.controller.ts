import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/modules/users/dto/update-user.dto';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { ExcludeFromObject } from 'src/common/dto/sanitize-response.dto';

@ApiTags('Users')
@ApiBearerAuth('JWT')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user' })
  async getCurrentUser(@Req() req: any) {
    const user = await this.usersService.findOne(req.user?.userId);
    return {
      success: true,
      data: ExcludeFromObject(user, ['password']),
    };
  }

  @Put('me/edit')
  @ApiOperation({ summary: 'Update current authenticated user' })
  async updateCurrentUser(
    @Req() req: any,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(
      req.user?.userId,
      updateUserDto,
    );
    return {
      success: true,
      data: ExcludeFromObject(user, ['password']),
      message: 'Profile updated successfully',
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@Param('id') id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user by ID (Admin only)' })
  update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by ID (Admin only)' })
  remove(@Param('id') id: number) {
    return this.usersService.remove(id);
  }
}
