import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RidesGateway } from './rides.gateway';
import { LocationGateway } from './location.gateway';
import { ChatGateway } from './chat.gateway';
import { WsJwtGuard } from '../guards/ws-jwt.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION') || '7d',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [RidesGateway, LocationGateway, ChatGateway, WsJwtGuard],
  exports: [RidesGateway, LocationGateway, ChatGateway],
})
export class WebSocketModule {}
