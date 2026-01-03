import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../guards/ws-jwt.guard';
import { AuthUser } from '../modules/auth/decorator/auth-user.decorator';
import { IAuthUser as User } from '../modules/auth/interfaces/auth-user.interface';

export interface RideUpdate {
  rideId: number;
  status: string;
  driverId?: number;
  estimatedArrival?: number;
  fare?: number;
  distance?: number;
  duration?: number;
}

export interface DriverLocation {
  rideId: number;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

@WebSocketGateway({
  cors: {
    origin: '*', // Configure this properly in production
    credentials: true,
  },
  namespace: '/rides',
  transports: ['websocket', 'polling'],
})
export class RidesGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('RidesGateway');
  private rideSubscriptions: Map<number, Set<string>> = new Map(); // rideId -> Set of socketIds
  private userSockets: Map<number, string> = new Map(); // userId -> socketId

  afterInit(server: Server) {
    this.logger.log('Rides WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Clean up subscriptions
    this.rideSubscriptions.forEach((subscribers, rideId) => {
      subscribers.delete(client.id);
      if (subscribers.size === 0) {
        this.rideSubscriptions.delete(rideId);
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

  @SubscribeMessage('subscribe:ride')
  @UseGuards(WsJwtGuard)
  handleSubscribeToRide(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { rideId: number },
    @AuthUser() user: User,
  ) {
    try {
      const { rideId } = data;
      
      if (!rideId) {
        return {
          success: false,
          message: 'Ride ID is required',
        };
      }
      
      if (!this.rideSubscriptions.has(rideId)) {
        this.rideSubscriptions.set(rideId, new Set());
      }
      
      this.rideSubscriptions.get(rideId).add(client.id);
      this.userSockets.set(user.userId, client.id);
      
      client.join(`ride:${rideId}`);
      
      this.logger.log(
        `User ${user.userId} (${client.id}) subscribed to ride ${rideId}`,
      );
      
      return {
        success: true,
        message: `Subscribed to ride ${rideId}`,
      };
    } catch (error) {
      this.logger.error('Error subscribing to ride:', error);
      return {
        success: false,
        message: 'Failed to subscribe to ride',
      };
    }
  }

  @SubscribeMessage('unsubscribe:ride')
  handleUnsubscribeFromRide(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { rideId: number },
  ) {
    try {
      const { rideId } = data;
      
      if (!rideId) {
        return {
          success: false,
          message: 'Ride ID is required',
        };
      }
      
      const subscribers = this.rideSubscriptions.get(rideId);
      if (subscribers) {
        subscribers.delete(client.id);
        if (subscribers.size === 0) {
          this.rideSubscriptions.delete(rideId);
        }
      }
      
      client.leave(`ride:${rideId}`);
      
      this.logger.log(`Client ${client.id} unsubscribed from ride ${rideId}`);
      
      return {
        success: true,
        message: `Unsubscribed from ride ${rideId}`,
      };
    } catch (error) {
      this.logger.error('Error unsubscribing from ride:', error);
      return {
        success: false,
        message: 'Failed to unsubscribe from ride',
      };
    }
  }

  // Server-side methods to emit events

  /**
   * Emit ride status update to all subscribers of a ride
   */
  emitRideUpdate(rideUpdate: RideUpdate) {
    const room = `ride:${rideUpdate.rideId}`;
    
    this.server.to(room).emit('ride:update', rideUpdate);
    
    this.logger.log(
      `Emitted ride update for ride ${rideUpdate.rideId}: ${rideUpdate.status}`,
    );
  }

  /**
   * Emit ride status change to specific user
   */
  emitRideStatusToUser(userId: number, rideUpdate: RideUpdate) {
    const socketId = this.userSockets.get(userId);
    
    if (socketId) {
      this.server.to(socketId).emit('ride:update', rideUpdate);
      this.logger.log(
        `Emitted ride update to user ${userId}: ${rideUpdate.status}`,
      );
    }
  }

  /**
   * Notify rider that driver has accepted the ride
   */
  emitDriverAccepted(rideId: number, driverId: number, estimatedArrival: number) {
    const room = `ride:${rideId}`;
    
    this.server.to(room).emit('ride:driver-accepted', {
      rideId,
      driverId,
      estimatedArrival,
      timestamp: Date.now(),
    });
    
    this.logger.log(`Driver ${driverId} accepted ride ${rideId}`);
  }

  /**
   * Notify rider that driver has arrived
   */
  emitDriverArrived(rideId: number) {
    const room = `ride:${rideId}`;
    
    this.server.to(room).emit('ride:driver-arrived', {
      rideId,
      timestamp: Date.now(),
    });
    
    this.logger.log(`Driver arrived for ride ${rideId}`);
  }

  /**
   * Notify rider that ride has started
   */
  emitRideStarted(rideId: number) {
    const room = `ride:${rideId}`;
    
    this.server.to(room).emit('ride:started', {
      rideId,
      timestamp: Date.now(),
    });
    
    this.logger.log(`Ride ${rideId} started`);
  }

  /**
   * Notify rider that ride has been completed
   */
  emitRideCompleted(rideId: number, fare: number, distance: number, duration: number) {
    const room = `ride:${rideId}`;
    
    this.server.to(room).emit('ride:completed', {
      rideId,
      fare,
      distance,
      duration,
      timestamp: Date.now(),
    });
    
    this.logger.log(`Ride ${rideId} completed`);
  }

  /**
   * Notify about ride cancellation
   */
  emitRideCancelled(rideId: number, cancelledBy: 'rider' | 'driver', reason?: string) {
    const room = `ride:${rideId}`;
    
    this.server.to(room).emit('ride:cancelled', {
      rideId,
      cancelledBy,
      reason,
      timestamp: Date.now(),
    });
    
    this.logger.log(`Ride ${rideId} cancelled by ${cancelledBy}`);
  }

  /**
   * Send ride request to specific driver
   */
  sendRideRequestToDriver(driverId: number, rideRequest: {
    rideId: number;
    pickupLatitude: number;
    pickupLongitude: number;
    pickupAddress: string;
    dropoffLatitude: number;
    dropoffLongitude: number;
    dropoffAddress: string;
    riderId: number;
    distance: number;
    estimatedArrival: number;
  }) {
    const socketId = this.userSockets.get(driverId);
    
    if (socketId) {
      this.server.to(socketId).emit('ride:request', {
        ...rideRequest,
        expiresAt: Date.now() + 15000, // 15 seconds to respond
        timestamp: Date.now(),
      });
      
      this.logger.log(
        `Sent ride request ${rideRequest.rideId} to driver ${driverId}`
      );
    } else {
      this.logger.warn(
        `Driver ${driverId} is not connected via WebSocket`
      );
    }
  }

  /**
   * Cancel ride request to driver (when another driver accepts)
   */
  cancelRideRequestToDriver(driverId: number, rideId: number) {
    const socketId = this.userSockets.get(driverId);
    
    if (socketId) {
      this.server.to(socketId).emit('ride:request-cancelled', {
        rideId,
        reason: 'accepted_by_another_driver',
        timestamp: Date.now(),
      });
      
      this.logger.log(
        `Cancelled ride request ${rideId} to driver ${driverId}`
      );
    }
  }

  /**
   * Notify rider about search status
   */
  emitDriverSearchUpdate(riderId: number, update: {
    status: 'searching' | 'found' | 'no_drivers';
    driversFound?: number;
    message: string;
  }) {
    const socketId = this.userSockets.get(riderId);
    
    if (socketId) {
      this.server.to(socketId).emit('ride:search-update', {
        ...update,
        timestamp: Date.now(),
      });
    }
  }
}

