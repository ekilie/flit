import React, { createContext, useContext, useEffect, useState, useCallback, PropsWithChildren } from 'react';
import { socketClient } from './socket-client';
import { useAuth } from '@/context/ctx';

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
  driverId: number;
  rideId: number;
  location: {
    latitude: number;
    longitude: number;
    heading?: number;
    speed?: number;
    accuracy?: number;
    timestamp: number;
  };
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
  
  // Driver location
  driverLocation: DriverLocation | null;
  
  // Chat
  messages: ChatMessage[];
  typingIndicator: TypingIndicator | null;
  
  // Actions
  subscribeToRide: (rideId: number) => void;
  unsubscribeFromRide: (rideId: number) => void;
  subscribeToLocation: (rideId: number) => void;
  unsubscribeFromLocation: (rideId: number) => void;
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
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingIndicator, setTypingIndicator] = useState<TypingIndicator | null>(null);

  // Initialize socket connection when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      socketClient.connect().then(() => {
        setIsConnected(socketClient.isConnected());
        setupSocketListeners();
      });
    }

    return () => {
      socketClient.disconnect();
      setIsConnected(false);
    };
  }, [isAuthenticated, user]);

  const setupSocketListeners = useCallback(() => {
    const ridesSocket = socketClient.getRidesSocket();
    const locationSocket = socketClient.getLocationSocket();
    const chatSocket = socketClient.getChatSocket();

    // Rides socket listeners
    if (ridesSocket) {
      ridesSocket.on('connect', () => setIsConnected(true));
      ridesSocket.on('disconnect', () => setIsConnected(false));
      
      ridesSocket.on('ride:update', (update: RideUpdate) => {
        console.log('Ride update received:', update);
        setCurrentRideUpdate(update);
      });

      ridesSocket.on('ride:driver-accepted', (data) => {
        console.log('Driver accepted ride:', data);
        setCurrentRideUpdate({
          rideId: data.rideId,
          status: 'accepted',
          driverId: data.driverId,
          estimatedArrival: data.estimatedArrival,
        });
      });

      ridesSocket.on('ride:driver-arrived', (data) => {
        console.log('Driver arrived:', data);
        setCurrentRideUpdate({
          rideId: data.rideId,
          status: 'arrived',
        });
      });

      ridesSocket.on('ride:started', (data) => {
        console.log('Ride started:', data);
        setCurrentRideUpdate({
          rideId: data.rideId,
          status: 'in_progress',
        });
      });

      ridesSocket.on('ride:completed', (data) => {
        console.log('Ride completed:', data);
        setCurrentRideUpdate({
          rideId: data.rideId,
          status: 'completed',
          fare: data.fare,
          distance: data.distance,
          duration: data.duration,
        });
      });

      ridesSocket.on('ride:cancelled', (data) => {
        console.log('Ride cancelled:', data);
        setCurrentRideUpdate({
          rideId: data.rideId,
          status: 'cancelled',
        });
      });
    }

    // Location socket listeners
    if (locationSocket) {
      locationSocket.on('location:driver-update', (data: DriverLocation) => {
        console.log('Driver location update:', data);
        setDriverLocation(data);
      });
    }

    // Chat socket listeners
    if (chatSocket) {
      chatSocket.on('chat:message', (message: ChatMessage) => {
        console.log('Chat message received:', message);
        setMessages((prev) => [...prev, message]);
      });

      chatSocket.on('chat:system-message', (message: ChatMessage) => {
        console.log('System message received:', message);
        setMessages((prev) => [...prev, message]);
      });

      chatSocket.on('chat:typing', (indicator: TypingIndicator) => {
        console.log('Typing indicator:', indicator);
        setTypingIndicator(indicator);
        
        // Clear typing indicator after 3 seconds
        setTimeout(() => {
          setTypingIndicator(null);
        }, 3000);
      });

      chatSocket.on('chat:messages-read', (data) => {
        console.log('Messages marked as read:', data);
        setMessages((prev) =>
          prev.map((msg) =>
            data.messageIds.includes(msg.id) ? { ...msg, read: true } : msg
          )
        );
      });
    }
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

  const subscribeToLocation = useCallback((rideId: number) => {
    const socket = socketClient.getLocationSocket();
    socket?.emit('location:subscribe', { rideId });
  }, []);

  const unsubscribeFromLocation = useCallback((rideId: number) => {
    const socket = socketClient.getLocationSocket();
    socket?.emit('location:unsubscribe', { rideId });
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
      senderType: 'rider',
    });
  }, []);

  const sendTyping = useCallback((rideId: number, isTyping: boolean) => {
    const socket = socketClient.getChatSocket();
    socket?.emit('chat:typing', {
      rideId,
      isTyping,
      userType: 'rider',
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
    driverLocation,
    messages,
    typingIndicator,
    subscribeToRide,
    unsubscribeFromRide,
    subscribeToLocation,
    unsubscribeFromLocation,
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

