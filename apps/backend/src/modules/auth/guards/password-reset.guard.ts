import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class PasswordResetGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.params.token;

    try {
      const decoded = this.jwtService.verify(token);
      const user = await this.usersService.findById(decoded.userId);

      if (!user) {
        return false;
      }

      request.user = user;
      return true;
    } catch {
      return false;
    }
  }
}
