import { useEffect, useState, useCallback } from 'react';
import { useSocket, RideUpdate, ChatMessage } from './socket-context';

/**
 * Hook to subscribe to ride updates for a specific ride (driver perspective)
 */
export const useRideUpdates = (rideId: number | null) => {
  const { subscribeToRide, unsubscribeFromRide, currentRideUpdate } = useSocket();
  const [rideStatus, setRideStatus] = useState<string | null>(null);

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
    }
  }, [currentRideUpdate, rideId]);

  return {
    rideUpdate: currentRideUpdate,
    rideStatus,
  };
};

/**
 * Hook to manage location tracking for drivers
 */
export const useLocationTracking = () => {
  const { isTrackingLocation, startLocationTracking, stopLocationTracking } = useSocket();
  const [trackingError, setTrackingError] = useState<string | null>(null);

  const startTracking = useCallback(async (rideId?: number) => {
    try {
      setTrackingError(null);
      await startLocationTracking(rideId);
    } catch (error: any) {
      setTrackingError(error.message || 'Failed to start location tracking');
      console.error('Location tracking error:', error);
    }
  }, [startLocationTracking]);

  const stopTracking = useCallback(() => {
    stopLocationTracking();
    setTrackingError(null);
  }, [stopLocationTracking]);

  return {
    isTracking: isTrackingLocation,
    startTracking,
    stopTracking,
    trackingError,
  };
};

/**
 * Hook to manage chat for a specific ride (driver perspective)
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
  const [isRiderTyping, setIsRiderTyping] = useState(false);

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
      setIsRiderTyping(typingIndicator.isTyping && typingIndicator.userType === 'rider');
    } else {
      setIsRiderTyping(false);
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
    isRiderTyping,
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

/**
 * Hook for active ride management (combines multiple features)
 */
export const useActiveRide = (rideId: number | null) => {
  const { rideUpdate, rideStatus } = useRideUpdates(rideId);
  const { isTracking, startTracking, stopTracking } = useLocationTracking();
  const stats = useRideStats(rideId);

  // Automatically start/stop location tracking based on ride status
  useEffect(() => {
    if (rideId && rideStatus === 'accepted' && !isTracking) {
      // Start tracking when ride is accepted
      startTracking(rideId);
    } else if (rideStatus === 'completed' || rideStatus === 'cancelled') {
      // Stop tracking when ride ends
      stopTracking();
    }
  }, [rideId, rideStatus, isTracking, startTracking, stopTracking]);

  return {
    rideUpdate,
    rideStatus,
    isTracking,
    startTracking,
    stopTracking,
    stats,
  };
};

