import { Module } from '@nestjs/common';
import { AuthService } from 'src/modules/auth/services/auth.service';
import { AuthController } from 'src/modules/auth/auth.controller';
import { UsersModule } from 'src/modules/users/users.module';
import configuration from 'src/config/configuration';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from 'src/modules/auth/services/jwt.strategy';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      global: true,
      secret: configuration().jwtSecret,
      signOptions: { expiresIn: '60m' },
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  controllers: [AuthController],
  exports: [JwtModule],
})
export class AuthModule {}
