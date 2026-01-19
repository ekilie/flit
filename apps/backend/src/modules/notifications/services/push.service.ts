import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { ExpoPushToken } from 'src/modules/users/entities/expo-push-token.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class PushService {
    private readonly logger = new Logger(PushService.name);
    private expo: Expo;

    constructor(
        @InjectRepository(ExpoPushToken)
        private readonly expoPushTokenRepo: Repository<ExpoPushToken>
    ) {
        this.expo = new Expo({
            useFcmV1: true,
        });
    }

    async send(tokens: string[], payload: Partial<ExpoPushMessage>) {
        const messages: ExpoPushMessage[] = [];

        for (const token of tokens) {
            if (!Expo.isExpoPushToken(token)) {
                this.logger.warn(`Invalid Expo token: ${token}`);
                continue;
            }

            messages.push({
                to: token,
                sound: 'default',
                ...payload,
            });
        }

        const chunks = this.expo.chunkPushNotifications(messages);

        for (const chunk of chunks) {
            try {
                const tickets = await this.expo.sendPushNotificationsAsync(chunk);
                this.handleTickets(tickets);
            } catch (err) {
                this.logger.error(err);
            }
        }
    }

    async registerPushToken(user: User, token: string, platform?: string) {
        if (!Expo.isExpoPushToken(token)) {
            throw new BadRequestException('Invalid Expo push token');
        }

        const existing = await this.expoPushTokenRepo.findOne({
            where: { token },
        });

        if (existing) {
            existing.user = user;
            return this.expoPushTokenRepo.save(existing);
        }

        return this.expoPushTokenRepo.save({
            token,
            platform,
            user,
        });
    }


    private handleTickets(tickets) {
        for (const ticket of tickets) {
            if (ticket.status === 'error') {
                this.logger.error(ticket.message, ticket.details);
            }
        }
    }
}
