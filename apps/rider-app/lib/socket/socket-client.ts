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
      
      console.log('Socket.IO clients initialized');
    } catch (error) {
      console.error('Failed to initialize socket connections:', error);
    }
  }

  /**
   * Setup connection event handlers
   */
  private setupConnectionHandlers(): void {
    // Rides socket handlers
    this.ridesSocket?.on('connect', () => {
      console.log('Connected to rides socket');
    });

    this.ridesSocket?.on('disconnect', (reason) => {
      console.log('Disconnected from rides socket:', reason);
    });

    this.ridesSocket?.on('connect_error', (error) => {
      console.error('Rides socket connection error:', error.message);
    });

    // Location socket handlers
    this.locationSocket?.on('connect', () => {
      console.log('Connected to location socket');
    });

    this.locationSocket?.on('disconnect', (reason) => {
      console.log('Disconnected from location socket:', reason);
    });

    this.locationSocket?.on('connect_error', (error) => {
      console.error('Location socket connection error:', error.message);
    });

    // Chat socket handlers
    this.chatSocket?.on('connect', () => {
      console.log('Connected to chat socket');
    });

    this.chatSocket?.on('disconnect', (reason) => {
      console.log('Disconnected from chat socket:', reason);
    });

    this.chatSocket?.on('connect_error', (error) => {
      console.error('Chat socket connection error:', error.message);
    });
  }

  /**
   * Disconnect all sockets
   */
  disconnect(): void {
    this.ridesSocket?.disconnect();
    this.locationSocket?.disconnect();
    this.chatSocket?.disconnect();
    
    this.ridesSocket = null;
    this.locationSocket = null;
    this.chatSocket = null;
    
    console.log('All socket connections closed');
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

