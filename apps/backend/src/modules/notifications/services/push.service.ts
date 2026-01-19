import { Injectable, Logger } from '@nestjs/common';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';

@Injectable()
export class PushService {
    private readonly logger = new Logger(PushService.name);
    private expo: Expo;

    constructor() {
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

    private handleTickets(tickets) {
        for (const ticket of tickets) {
            if (ticket.status === 'error') {
                this.logger.error(ticket.message, ticket.details);
            }
        }
    }
}
