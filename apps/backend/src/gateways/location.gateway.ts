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
import { IAuthUser as User } from '../modules/auth/interfaces/auth-user.interface';

export interface LocationUpdate {
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  accuracy?: number;
  timestamp: number;
}

export interface DriverLocationData extends LocationUpdate {
  driverId: number;
  rideId?: number;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/location',
  transports: ['websocket', 'polling'],
})
export class LocationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('LocationGateway');
  
  // Track driver locations in memory TODO: will move to Redis for production
  private driverLocations: Map<number, DriverLocationData> = new Map();
  
  // Track which rides are being tracked TODO: will move to Redis for production
  private rideLocationSubscribers: Map<number, Set<string>> = new Map(); // rideId -> Set of socketIds
  
  // Track driver socket connections TODO: will move to Redis for production
  private driverSockets: Map<number, string> = new Map(); // driverId -> socketId

  handleConnection(client: Socket) {
    this.logger.log(`Location client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Location client disconnected: ${client.id}`);
    
    // Clean up ride subscriptions
    this.rideLocationSubscribers.forEach((subscribers, rideId) => {
      subscribers.delete(client.id);
      if (subscribers.size === 0) {
        this.rideLocationSubscribers.delete(rideId);
      }
    });

    // Clean up driver socket mapping
    for (const [driverId, socketId] of this.driverSockets.entries()) {
      if (socketId === client.id) {
        this.driverSockets.delete(driverId);
        break;
      }
    }
  }

  /**
   * Driver updates their location (called every 3-5 seconds)
   */
  @SubscribeMessage('location:update')
  @UseGuards(WsJwtGuard)
  handleLocationUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { location: LocationUpdate; rideId?: number },
    @AuthUser() user: User,
  ) {
    const driverId = user.userId;
    const { location, rideId } = data;

    const driverLocationData: DriverLocationData = {
      driverId,
      rideId,
      ...location,
    };

    // Store driver location
    this.driverLocations.set(driverId, driverLocationData);
    this.driverSockets.set(driverId, client.id);

    // If driver is on a ride, broadcast location to ride subscribers
    if (rideId) {
      const room = `ride:${rideId}:location`;
      this.server.to(room).emit('location:driver-update', {
        driverId,
        rideId,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          heading: location.heading,
          speed: location.speed,
          accuracy: location.accuracy,
          timestamp: location.timestamp,
        },
      });
    }

    return {
      success: true,
      message: 'Location updated',
    };
  }

  /**
   * Rider subscribes to driver location updates for their ride
   */
  @SubscribeMessage('location:subscribe')
  @UseGuards(WsJwtGuard)
  handleSubscribeToLocation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { rideId: number },
    @AuthUser() user: User,
  ) {
    const { rideId } = data;
    const room = `ride:${rideId}:location`;

    if (!this.rideLocationSubscribers.has(rideId)) {
      this.rideLocationSubscribers.set(rideId, new Set());
    }

    this.rideLocationSubscribers.get(rideId).add(client.id);
    client.join(room);

    this.logger.log(
      `User ${user.userId} subscribed to location updates for ride ${rideId}`,
    );

    return {
      success: true,
      message: `Subscribed to location updates for ride ${rideId}`,
    };
  }

  /**
   * Unsubscribe from driver location updates
   */
  @SubscribeMessage('location:unsubscribe')
  handleUnsubscribeFromLocation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { rideId: number },
  ) {
    const { rideId } = data;
    const room = `ride:${rideId}:location`;

    const subscribers = this.rideLocationSubscribers.get(rideId);
    if (subscribers) {
      subscribers.delete(client.id);
      if (subscribers.size === 0) {
        this.rideLocationSubscribers.delete(rideId);
      }
    }

    client.leave(room);

    this.logger.log(`Client ${client.id} unsubscribed from ride ${rideId} location`);

    return {
      success: true,
      message: `Unsubscribed from location updates for ride ${rideId}`,
    };
  }

  /**
   * Get current driver location (on-demand)
   */
  @SubscribeMessage('location:get-driver')
  @UseGuards(WsJwtGuard)
  handleGetDriverLocation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { driverId: number },
  ) {
    const { driverId } = data;
    const location = this.driverLocations.get(driverId);

    if (location) {
      return {
        success: true,
        location,
      };
    }

    return {
      success: false,
      message: 'Driver location not available',
    };
  }

  // Server-side methods

  /**
   * Broadcast driver location to all ride subscribers
   */
  broadcastDriverLocation(rideId: number, driverId: number, location: LocationUpdate) {
    const room = `ride:${rideId}:location`;

    this.server.to(room).emit('location:driver-update', {
      driverId,
      rideId,
      location,
    });
  }

  /**
   * Get driver's last known location
   */
  getDriverLocation(driverId: number): DriverLocationData | undefined {
    return this.driverLocations.get(driverId);
  }

  /**
   * Check if driver is online
   */
  isDriverOnline(driverId: number): boolean {
    return this.driverSockets.has(driverId);
  }

  /**
   * Get all online drivers (for admin/debugging)
   */
  getOnlineDrivers(): number[] {
    return Array.from(this.driverSockets.keys());
  }
}

