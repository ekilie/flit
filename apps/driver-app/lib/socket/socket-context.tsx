import React, { createContext, useContext, useEffect, useState, useCallback, PropsWithChildren } from 'react';
import { socketClient } from './socket-client';
import { useAuth } from '@/context/ctx';
import * as Location from 'expo-location';

export interface RideUpdate {
  rideId: number;
  status: string;
  riderId?: number;
  estimatedArrival?: number;
  fare?: number;
  distance?: number;
  duration?: number;
}

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

interface SocketContextType {
  // Connection state
  isConnected: boolean;
  
  // Ride updates
  currentRideUpdate: RideUpdate | null;
  
  // Location tracking
  isTrackingLocation: boolean;
  startLocationTracking: (rideId?: number) => Promise<void>;
  stopLocationTracking: () => void;
  
  // Chat
  messages: ChatMessage[];
  typingIndicator: TypingIndicator | null;
  
  // Actions
  subscribeToRide: (rideId: number) => void;
  unsubscribeFromRide: (rideId: number) => void;
  joinChat: (rideId: number) => void;
  leaveChat: (rideId: number) => void;
  sendMessage: (rideId: number, message: string) => void;
  sendTyping: (rideId: number, isTyping: boolean) => void;
  markMessagesAsRead: (rideId: number, messageIds: string[]) => void;
  reconnect: () => Promise<void>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [currentRideUpdate, setCurrentRideUpdate] = useState<RideUpdate | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingIndicator, setTypingIndicator] = useState<TypingIndicator | null>(null);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [currentRideId, setCurrentRideId] = useState<number | undefined>();

  // Initialize socket connection when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      socketClient.connect().then(() => {
        setIsConnected(socketClient.isConnected());
        setupSocketListeners();
      });
    }

    return () => {
      socketClient.stopLocationUpdates();
      socketClient.disconnect();
      setIsConnected(false);
    };
  }, [isAuthenticated, user]);

  const setupSocketListeners = useCallback(() => {
    const ridesSocket = socketClient.getRidesSocket();
    const chatSocket = socketClient.getChatSocket();

    // Rides socket listeners
    if (ridesSocket) {
      ridesSocket.on('connect', () => setIsConnected(true));
      ridesSocket.on('disconnect', () => setIsConnected(false));
      
      ridesSocket.on('ride:update', (update: RideUpdate) => {
        console.log('[Driver] Ride update received:', update);
        setCurrentRideUpdate(update);
      });

      // Driver-specific events (if any are added later)
      ridesSocket.on('ride:cancelled', (data) => {
        console.log('[Driver] Ride cancelled:', data);
        setCurrentRideUpdate({
          rideId: data.rideId,
          status: 'cancelled',
        });
        // Stop location tracking if this was the active ride
        if (data.rideId === currentRideId) {
          socketClient.stopLocationUpdates();
          setIsTrackingLocation(false);
        }
      });
    }

    // Chat socket listeners
    if (chatSocket) {
      chatSocket.on('chat:message', (message: ChatMessage) => {
        console.log('[Driver] Chat message received:', message);
        setMessages((prev) => [...prev, message]);
      });

      chatSocket.on('chat:system-message', (message: ChatMessage) => {
        console.log('[Driver] System message received:', message);
        setMessages((prev) => [...prev, message]);
      });

      chatSocket.on('chat:typing', (indicator: TypingIndicator) => {
        console.log('[Driver] Typing indicator:', indicator);
        setTypingIndicator(indicator);
        
        // Clear typing indicator after 3 seconds
        setTimeout(() => {
          setTypingIndicator(null);
        }, 3000);
      });

      chatSocket.on('chat:messages-read', (data) => {
        console.log('[Driver] Messages marked as read:', data);
        setMessages((prev) =>
          prev.map((msg) =>
            data.messageIds.includes(msg.id) ? { ...msg, read: true } : msg
          )
        );
      });
    }
  }, [currentRideId]);

  // Start location tracking
  const startLocationTracking = useCallback(async (rideId?: number) => {
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('[Driver] Location permission denied');
        return;
      }

      setCurrentRideId(rideId);
      setIsTrackingLocation(true);

      // Start sending location updates
      socketClient.startLocationUpdates(
        async () => {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });

          return {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            heading: location.coords.heading ?? undefined,
            speed: location.coords.speed ?? undefined,
            accuracy: location.coords.accuracy ?? undefined,
          };
        },
        rideId,
        5000 // Update every 5 seconds
      );

      console.log('[Driver] Started location tracking');
    } catch (error) {
      console.error('[Driver] Failed to start location tracking:', error);
      setIsTrackingLocation(false);
    }
  }, []);

  // Stop location tracking
  const stopLocationTracking = useCallback(() => {
    socketClient.stopLocationUpdates();
    setIsTrackingLocation(false);
    setCurrentRideId(undefined);
    console.log('[Driver] Stopped location tracking');
  }, []);

  // Actions
  const subscribeToRide = useCallback((rideId: number) => {
    const socket = socketClient.getRidesSocket();
    socket?.emit('subscribe:ride', { rideId });
  }, []);

  const unsubscribeFromRide = useCallback((rideId: number) => {
    const socket = socketClient.getRidesSocket();
    socket?.emit('unsubscribe:ride', { rideId });
  }, []);

  const joinChat = useCallback((rideId: number) => {
    const socket = socketClient.getChatSocket();
    socket?.emit('chat:join', { rideId }, (response: any) => {
      if (response.success && response.history) {
        setMessages(response.history);
      }
    });
  }, []);

  const leaveChat = useCallback((rideId: number) => {
    const socket = socketClient.getChatSocket();
    socket?.emit('chat:leave', { rideId });
    setMessages([]);
  }, []);

  const sendMessage = useCallback((rideId: number, message: string) => {
    const socket = socketClient.getChatSocket();
    socket?.emit('chat:message', {
      rideId,
      message,
      senderType: 'driver',
    });
  }, []);

  const sendTyping = useCallback((rideId: number, isTyping: boolean) => {
    const socket = socketClient.getChatSocket();
    socket?.emit('chat:typing', {
      rideId,
      isTyping,
      userType: 'driver',
    });
  }, []);

  const markMessagesAsRead = useCallback((rideId: number, messageIds: string[]) => {
    const socket = socketClient.getChatSocket();
    socket?.emit('chat:mark-read', { rideId, messageIds });
  }, []);

  const reconnect = useCallback(async () => {
    await socketClient.reconnect();
    setIsConnected(socketClient.isConnected());
    setupSocketListeners();
  }, [setupSocketListeners]);

  const value: SocketContextType = {
    isConnected,
    currentRideUpdate,
    isTrackingLocation,
    startLocationTracking,
    stopLocationTracking,
    messages,
    typingIndicator,
    subscribeToRide,
    unsubscribeFromRide,
    joinChat,
    leaveChat,
    sendMessage,
    sendTyping,
    markMessagesAsRead,
    reconnect,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

