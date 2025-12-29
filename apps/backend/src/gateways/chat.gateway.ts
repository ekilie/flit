import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../guards/ws-jwt.guard';
import { AuthUser } from '../modules/auth/decorator/auth-user.decorator';
import { User } from '../modules/auth/interfaces/auth-user.interface';

export interface ChatMessage {
  id: string;
  rideId: number;
  senderId: number;
  senderType: 'rider' | 'driver';
  message: string;
  timestamp: number;
  read: boolean;
}

export interface TypingIndicator {
  rideId: number;
  userId: number;
  userType: 'rider' | 'driver';
  isTyping: boolean;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/chat',
  transports: ['websocket', 'polling'],
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('ChatGateway');
  
  // Track chat participants
  private chatParticipants: Map<number, Set<string>> = new Map(); // rideId -> Set of socketIds
  private userSockets: Map<number, string> = new Map(); // userId -> socketId
  
  // Store messages in memory (consider using database for production)
  private messages: Map<number, ChatMessage[]> = new Map(); // rideId -> messages

  handleConnection(client: Socket) {
    this.logger.log(`Chat client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Chat client disconnected: ${client.id}`);
    
    // Clean up chat subscriptions
    this.chatParticipants.forEach((participants, rideId) => {
      participants.delete(client.id);
      if (participants.size === 0) {
        this.chatParticipants.delete(rideId);
      }
    });

    // Clean up user socket mapping
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        break;
      }
    }
  }

  /**
   * Join a ride chat room
   */
  @SubscribeMessage('chat:join')
  @UseGuards(WsJwtGuard)
  handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { rideId: number },
    @AuthUser() user: User,
  ) {
    const { rideId } = data;
    const room = `ride:${rideId}:chat`;

    if (!this.chatParticipants.has(rideId)) {
      this.chatParticipants.set(rideId, new Set());
    }

    this.chatParticipants.get(rideId).add(client.id);
    this.userSockets.set(user.userId, client.id);
    
    client.join(room);

    this.logger.log(`User ${user.userId} joined chat for ride ${rideId}`);

    // Send chat history
    const chatHistory = this.messages.get(rideId) || [];

    return {
      success: true,
      message: `Joined chat for ride ${rideId}`,
      history: chatHistory,
    };
  }

  /**
   * Leave a ride chat room
   */
  @SubscribeMessage('chat:leave')
  handleLeaveChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { rideId: number },
  ) {
    const { rideId } = data;
    const room = `ride:${rideId}:chat`;

    const participants = this.chatParticipants.get(rideId);
    if (participants) {
      participants.delete(client.id);
      if (participants.size === 0) {
        this.chatParticipants.delete(rideId);
      }
    }

    client.leave(room);

    this.logger.log(`Client ${client.id} left chat for ride ${rideId}`);

    return {
      success: true,
      message: `Left chat for ride ${rideId}`,
    };
  }

  /**
   * Send a message in ride chat
   */
  @SubscribeMessage('chat:message')
  @UseGuards(WsJwtGuard)
  handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      rideId: number;
      message: string;
      senderType: 'rider' | 'driver';
    },
    @AuthUser() user: User,
  ) {
    const { rideId, message, senderType } = data;
    const room = `ride:${rideId}:chat`;

    const chatMessage: ChatMessage = {
      id: `${Date.now()}-${user.userId}`,
      rideId,
      senderId: user.userId,
      senderType,
      message,
      timestamp: Date.now(),
      read: false,
    };

    // Store message
    if (!this.messages.has(rideId)) {
      this.messages.set(rideId, []);
    }
    this.messages.get(rideId).push(chatMessage);

    // Broadcast to all participants in the room
    this.server.to(room).emit('chat:message', chatMessage);

    this.logger.log(
      `Message sent in ride ${rideId} by user ${user.userId} (${senderType})`,
    );

    return {
      success: true,
      message: chatMessage,
    };
  }

  /**
   * Send typing indicator
   */
  @SubscribeMessage('chat:typing')
  @UseGuards(WsJwtGuard)
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      rideId: number;
      isTyping: boolean;
      userType: 'rider' | 'driver';
    },
    @AuthUser() user: User,
  ) {
    const { rideId, isTyping, userType } = data;
    const room = `ride:${rideId}:chat`;

    const typingIndicator: TypingIndicator = {
      rideId,
      userId: user.userId,
      userType,
      isTyping,
    };

    // Broadcast typing indicator to others in the room (not to sender)
    client.to(room).emit('chat:typing', typingIndicator);

    return {
      success: true,
    };
  }

  /**
   * Mark messages as read
   */
  @SubscribeMessage('chat:mark-read')
  @UseGuards(WsJwtGuard)
  handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { rideId: number; messageIds: string[] },
    @AuthUser() user: User,
  ) {
    const { rideId, messageIds } = data;
    const rideMessages = this.messages.get(rideId);

    if (rideMessages) {
      rideMessages.forEach((msg) => {
        if (messageIds.includes(msg.id) && msg.senderId !== user.userId) {
          msg.read = true;
        }
      });
    }

    // Notify sender that messages were read
    const room = `ride:${rideId}:chat`;
    this.server.to(room).emit('chat:messages-read', {
      rideId,
      messageIds,
      readBy: user.userId,
    });

    return {
      success: true,
    };
  }

  // Server-side methods

  /**
   * Send system message to chat (e.g., "Driver has arrived")
   */
  sendSystemMessage(rideId: number, message: string) {
    const room = `ride:${rideId}:chat`;

    const systemMessage: ChatMessage = {
      id: `system-${Date.now()}`,
      rideId,
      senderId: 0, // System
      senderType: 'rider', // Placeholder
      message,
      timestamp: Date.now(),
      read: true,
    };

    // Store message
    if (!this.messages.has(rideId)) {
      this.messages.set(rideId, []);
    }
    this.messages.get(rideId).push(systemMessage);

    this.server.to(room).emit('chat:system-message', systemMessage);

    this.logger.log(`System message sent to ride ${rideId}: ${message}`);
  }

  /**
   * Get chat history for a ride
   */
  getChatHistory(rideId: number): ChatMessage[] {
    return this.messages.get(rideId) || [];
  }

  /**
   * Clear chat history for a ride (e.g., after ride completion)
   */
  clearChatHistory(rideId: number) {
    this.messages.delete(rideId);
    this.logger.log(`Chat history cleared for ride ${rideId}`);
  }
}

