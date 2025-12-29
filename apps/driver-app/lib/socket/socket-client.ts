import { io, Socket } from 'socket.io-client';
import { getToken } from '../api/authToken';

// Socket.IO configuration
const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
const RECONNECTION_DELAY = 1000;
const RECONNECTION_ATTEMPTS = 5;

class SocketClient {
  private ridesSocket: Socket | null = null;
  private locationSocket: Socket | null = null;
  private chatSocket: Socket | null = null;
  private token: string | null = null;
  private locationUpdateInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize socket connections with authentication
   */
  async connect(): Promise<void> {
    try {
      this.token = await getToken();
      
      if (!this.token) {
        console.warn('No auth token available for socket connection');
        return;
      }

      // Connect to rides namespace
      this.ridesSocket = io(`${SOCKET_URL}/rides`, {
        auth: { token: this.token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: RECONNECTION_DELAY,
        reconnectionAttempts: RECONNECTION_ATTEMPTS,
      });

      // Connect to location namespace
      this.locationSocket = io(`${SOCKET_URL}/location`, {
        auth: { token: this.token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: RECONNECTION_DELAY,
        reconnectionAttempts: RECONNECTION_ATTEMPTS,
      });

      // Connect to chat namespace
      this.chatSocket = io(`${SOCKET_URL}/chat`, {
        auth: { token: this.token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: RECONNECTION_DELAY,
        reconnectionAttempts: RECONNECTION_ATTEMPTS,
      });

      this.setupConnectionHandlers();
      
      console.log('[Driver] Socket.IO clients initialized');
    } catch (error) {
      console.error('[Driver] Failed to initialize socket connections:', error);
    }
  }

  /**
   * Setup connection event handlers
   */
  private setupConnectionHandlers(): void {
    // Rides socket handlers
    this.ridesSocket?.on('connect', () => {
      console.log('[Driver] Connected to rides socket');
    });

    this.ridesSocket?.on('disconnect', (reason) => {
      console.log('[Driver] Disconnected from rides socket:', reason);
    });

    this.ridesSocket?.on('connect_error', (error) => {
      console.error('[Driver] Rides socket connection error:', error.message);
    });

    // Location socket handlers
    this.locationSocket?.on('connect', () => {
      console.log('[Driver] Connected to location socket');
    });

    this.locationSocket?.on('disconnect', (reason) => {
      console.log('[Driver] Disconnected from location socket:', reason);
    });

    this.locationSocket?.on('connect_error', (error) => {
      console.error('[Driver] Location socket connection error:', error.message);
    });

    // Chat socket handlers
    this.chatSocket?.on('connect', () => {
      console.log('[Driver] Connected to chat socket');
    });

    this.chatSocket?.on('disconnect', (reason) => {
      console.log('[Driver] Disconnected from chat socket:', reason);
    });

    this.chatSocket?.on('connect_error', (error) => {
      console.error('[Driver] Chat socket connection error:', error.message);
    });
  }

  /**
   * Start sending location updates at specified interval
   */
  startLocationUpdates(
    getLocation: () => Promise<{
      latitude: number;
      longitude: number;
      heading?: number;
      speed?: number;
      accuracy?: number;
    }>,
    rideId?: number,
    intervalMs: number = 5000 // Default 5 seconds
  ): void {
    if (this.locationUpdateInterval) {
      this.stopLocationUpdates();
    }

    this.locationUpdateInterval = setInterval(async () => {
      try {
        const location = await getLocation();
        this.sendLocationUpdate(location, rideId);
      } catch (error) {
        console.error('[Driver] Error getting location:', error);
      }
    }, intervalMs);

    console.log('[Driver] Started location updates');
  }

  /**
   * Stop sending location updates
   */
  stopLocationUpdates(): void {
    if (this.locationUpdateInterval) {
      clearInterval(this.locationUpdateInterval);
      this.locationUpdateInterval = null;
      console.log('[Driver] Stopped location updates');
    }
  }

  /**
   * Send location update to server
   */
  sendLocationUpdate(
    location: {
      latitude: number;
      longitude: number;
      heading?: number;
      speed?: number;
      accuracy?: number;
    },
    rideId?: number
  ): void {
    if (!this.locationSocket?.connected) {
      console.warn('[Driver] Location socket not connected');
      return;
    }

    this.locationSocket.emit('location:update', {
      location: {
        ...location,
        timestamp: Date.now(),
      },
      rideId,
    });
  }

  /**
   * Disconnect all sockets
   */
  disconnect(): void {
    this.stopLocationUpdates();
    this.ridesSocket?.disconnect();
    this.locationSocket?.disconnect();
    this.chatSocket?.disconnect();
    
    this.ridesSocket = null;
    this.locationSocket = null;
    this.chatSocket = null;
    
    console.log('[Driver] All socket connections closed');
  }

  /**
   * Get rides socket instance
   */
  getRidesSocket(): Socket | null {
    return this.ridesSocket;
  }

  /**
   * Get location socket instance
   */
  getLocationSocket(): Socket | null {
    return this.locationSocket;
  }

  /**
   * Get chat socket instance
   */
  getChatSocket(): Socket | null {
    return this.chatSocket;
  }

  /**
   * Check if sockets are connected
   */
  isConnected(): boolean {
    return (
      this.ridesSocket?.connected === true ||
      this.locationSocket?.connected === true ||
      this.chatSocket?.connected === true
    );
  }

  /**
   * Reconnect all sockets
   */
  async reconnect(): Promise<void> {
    this.disconnect();
    await this.connect();
  }
}

// Export singleton instance
export const socketClient = new SocketClient();
export default socketClient;

