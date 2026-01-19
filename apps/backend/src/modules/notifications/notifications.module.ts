import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './services/notifications.service';
import { NotificationsController } from './notifications.controller';
import { Notification } from './entities/notification.entity';
import { PushService } from './services/push.service';
import { ExpoPushToken } from '../users/entities/expo-push-token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification,ExpoPushToken])],
  controllers: [NotificationsController],
  providers: [NotificationsService, PushService],
  exports: [NotificationsService, PushService, TypeOrmModule],
})
export class NotificationsModule { }
