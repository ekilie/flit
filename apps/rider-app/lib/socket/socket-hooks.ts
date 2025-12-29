import { useEffect, useState, useCallback } from 'react';
import { useSocket, RideUpdate, DriverLocation, ChatMessage } from './socket-context';

/**
 * Hook to subscribe to ride updates for a specific ride
 */
export const useRideUpdates = (rideId: number | null) => {
  const { subscribeToRide, unsubscribeFromRide, currentRideUpdate } = useSocket();
  const [rideStatus, setRideStatus] = useState<string | null>(null);
  const [estimatedArrival, setEstimatedArrival] = useState<number | null>(null);

  useEffect(() => {
    if (rideId) {
      subscribeToRide(rideId);

      return () => {
        unsubscribeFromRide(rideId);
      };
    }
  }, [rideId, subscribeToRide, unsubscribeFromRide]);

  useEffect(() => {
    if (currentRideUpdate && currentRideUpdate.rideId === rideId) {
      setRideStatus(currentRideUpdate.status);
      if (currentRideUpdate.estimatedArrival) {
        setEstimatedArrival(currentRideUpdate.estimatedArrival);
      }
    }
  }, [currentRideUpdate, rideId]);

  return {
    rideUpdate: currentRideUpdate,
    rideStatus,
    estimatedArrival,
  };
};

/**
 * Hook to track driver location for a specific ride
 */
export const useDriverLocation = (rideId: number | null) => {
  const { subscribeToLocation, unsubscribeFromLocation, driverLocation } = useSocket();
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    heading?: number;
    speed?: number;
  } | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);

  useEffect(() => {
    if (rideId) {
      subscribeToLocation(rideId);

      return () => {
        unsubscribeFromLocation(rideId);
      };
    }
  }, [rideId, subscribeToLocation, unsubscribeFromLocation]);

  useEffect(() => {
    if (driverLocation && driverLocation.rideId === rideId) {
      setLocation({
        latitude: driverLocation.location.latitude,
        longitude: driverLocation.location.longitude,
        heading: driverLocation.location.heading,
        speed: driverLocation.location.speed,
      });
      setLastUpdate(driverLocation.location.timestamp);
    }
  }, [driverLocation, rideId]);

  return {
    location,
    lastUpdate,
    isStale: lastUpdate ? Date.now() - lastUpdate > 10000 : false, // Consider stale after 10 seconds
  };
};

/**
 * Hook to manage chat for a specific ride
 */
export const useRideChat = (rideId: number | null) => {
  const {
    joinChat,
    leaveChat,
    sendMessage: sendSocketMessage,
    sendTyping: sendSocketTyping,
    markMessagesAsRead,
    messages,
    typingIndicator,
  } = useSocket();

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);

  useEffect(() => {
    if (rideId) {
      joinChat(rideId);

      return () => {
        leaveChat(rideId);
      };
    }
  }, [rideId, joinChat, leaveChat]);

  useEffect(() => {
    // Filter messages for this ride
    const rideMessages = messages.filter((msg) => msg.rideId === rideId);
    setChatMessages(rideMessages);
  }, [messages, rideId]);

  useEffect(() => {
    // Update typing indicator
    if (typingIndicator && typingIndicator.rideId === rideId) {
      setIsOtherUserTyping(typingIndicator.isTyping && typingIndicator.userType === 'driver');
    } else {
      setIsOtherUserTyping(false);
    }
  }, [typingIndicator, rideId]);

  const sendMessage = useCallback(
    (message: string) => {
      if (rideId) {
        sendSocketMessage(rideId, message);
      }
    },
    [rideId, sendSocketMessage]
  );

  const setTyping = useCallback(
    (isTyping: boolean) => {
      if (rideId) {
        sendSocketTyping(rideId, isTyping);
      }
    },
    [rideId, sendSocketTyping]
  );

  const markAsRead = useCallback(
    (messageIds: string[]) => {
      if (rideId) {
        markMessagesAsRead(rideId, messageIds);
      }
    },
    [rideId, markMessagesAsRead]
  );

  return {
    messages: chatMessages,
    sendMessage,
    setTyping,
    markAsRead,
    isOtherUserTyping,
  };
};

/**
 * Hook to monitor connection status
 */
export const useSocketConnection = () => {
  const { isConnected, reconnect } = useSocket();
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('disconnected');

  useEffect(() => {
    setConnectionStatus(isConnected ? 'connected' : 'disconnected');
  }, [isConnected]);

  const handleReconnect = useCallback(async () => {
    setConnectionStatus('reconnecting');
    try {
      await reconnect();
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Reconnection failed:', error);
      setConnectionStatus('disconnected');
    }
  }, [reconnect]);

  return {
    isConnected,
    connectionStatus,
    reconnect: handleReconnect,
  };
};

/**
 * Hook to get real-time ride statistics
 */
export const useRideStats = (rideId: number | null) => {
  const { currentRideUpdate } = useSocket();
  const [stats, setStats] = useState<{
    fare: number | null;
    distance: number | null;
    duration: number | null;
  }>({
    fare: null,
    distance: null,
    duration: null,
  });

  useEffect(() => {
    if (currentRideUpdate && currentRideUpdate.rideId === rideId) {
      setStats({
        fare: currentRideUpdate.fare ?? null,
        distance: currentRideUpdate.distance ?? null,
        duration: currentRideUpdate.duration ?? null,
      });
    }
  }, [currentRideUpdate, rideId]);

  return stats;
};

