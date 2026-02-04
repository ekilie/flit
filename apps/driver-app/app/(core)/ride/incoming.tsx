import ScreenLayout from "@/components/ScreenLayout";
import Colors from "@/constants/Colors";
import { useCurrentTheme } from "@/context/CentralTheme";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Image,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { toast } from "yooo-native";
import * as Haptics from "expo-haptics";
import { useRideRequests } from "@/lib/socket/socket-hooks";
import Api from "@/lib/api";

const { width } = Dimensions.get("window");

export default function IncomingRideScreen() {
  const theme = useCurrentTheme();
  const router = useRouter();
  const params = useLocalSearchParams();

  // Get ride request from socket
  const { rideRequest, timeRemainingSeconds, clearRequest } = useRideRequests();
  
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  // Use time remaining from hook or fallback to 15
  const countdown = timeRemainingSeconds || 15;

  // If no ride request and params.id, redirect back
  useEffect(() => {
    if (!rideRequest && !params.id) {
      router.back();
    }
  }, [rideRequest, params.id, router]);

  // Prepare ride data from socket request or fallback to params
  const rideData = rideRequest ? {
    id: rideRequest.rideId.toString(),
    pickup: {
      name: 'Pickup Location',
      address: rideRequest.pickupAddress,
    },
    dropoff: {
      name: 'Dropoff Location',
      address: rideRequest.dropoffAddress,
    },
    estimatedFare: 25000, // TODO: Calculate from distance
    distance: rideRequest.distance,
    duration: rideRequest.estimatedArrival,
    rider: {
      name: 'Rider', // Backend doesn't send rider details in request
      rating: 4.8,
      photo: null,
    },
  } : {
    // Fallback for testing or when navigated with params
    id: params.id as string || '1',
    pickup: {
      name: 'Pickup Location',
      address: 'Loading...',
    },
    dropoff: {
      name: 'Dropoff Location',
      address: 'Loading...',
    },
    estimatedFare: 25000,
    distance: 8.5,
    duration: 15,
    rider: {
      name: 'Rider',
      rating: 4.8,
      photo: null,
    },
  };

  const handleDecline = useCallback(async (reason?: string) => {
    if (isDeclining) return; // Prevent double-click
    
    try {
      setIsDeclining(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (reason === 'timeout') {
        toast.info('Ride request expired');
      } else {
        // Call API to reject ride
        await Api.rejectRide(parseInt(rideData.id));
        toast.info('Ride declined');
      }

      // Clear the request from socket context
      clearRequest();

      // Navigate back to home
      router.back();
    } catch (error) {
      console.error('Decline ride error:', error);
      toast.error('Failed to decline ride');
      setIsDeclining(false);
    }
  }, [rideData.id, router, clearRequest, isDeclining]);

  const handleAccept = async () => {
    if (isAccepting) return; // Prevent double-click
    
    try {
      setIsAccepting(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Call API to accept ride
      const response = await Api.acceptRide(parseInt(rideData.id));
      
      if (response.success) {
        toast.success('Ride accepted!');
        
        // Clear the request from socket context
        clearRequest();

        // Navigate to active ride screen
        router.replace(`/(core)/ride/active?id=${rideData.id}`);
      } else {
        throw new Error(response.message || 'Failed to accept ride');
      }
    } catch (error: any) {
      console.error('Accept ride error:', error);
      toast.error(error.message || 'Failed to accept ride');
      setIsAccepting(false);
    }
  };

  // Auto-decline on timeout
  useEffect(() => {
    if (countdown <= 0 && !isAccepting && !isDeclining && !hasTimedOut) {
      setHasTimedOut(true);
      handleDecline('timeout');
    }
  }, [countdown, handleDecline, isAccepting, isDeclining, hasTimedOut]);

  return (
    <ScreenLayout>
      <StatusBar style="light" />

      <View style={[styles.container, { backgroundColor: 'rgba(0, 0, 0, 0.9)' }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            NEW RIDE REQUEST
          </Text>
          <View style={[styles.timerBadge, countdown <= 5 && styles.timerBadgeUrgent]}>
            <Ionicons name="timer" size={18} color="#fff" />
            <Text style={styles.timerText}>
              {countdown}s
            </Text>
          </View>
        </View>

        {/* Ride Details Card */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          {/* Pickup Location */}
          <View style={styles.locationSection}>
            <View style={[styles.locationDot, styles.pickupDot]} />
            <View style={styles.locationInfo}>
              <Text style={[styles.locationLabel, { color: theme.subtleText }]}>
                📍 Pickup
              </Text>
              <Text style={[styles.locationName, { color: theme.text }]}>
                {rideData.pickup.name}
              </Text>
              <Text style={[styles.locationAddress, { color: theme.mutedText }]}>
                {rideData.pickup.address}
              </Text>
            </View>
          </View>

          {/* Route Line */}
          <View style={styles.routeLine} />

          {/* Dropoff Location */}
          <View style={styles.locationSection}>
            <View style={[styles.locationDot, styles.dropoffDot]} />
            <View style={styles.locationInfo}>
              <Text style={[styles.locationLabel, { color: theme.subtleText }]}>
                📍 Dropoff
              </Text>
              <Text style={[styles.locationName, { color: theme.text }]}>
                {rideData.dropoff.name}
              </Text>
              <Text style={[styles.locationAddress, { color: theme.mutedText }]}>
                {rideData.dropoff.address}
              </Text>
            </View>
          </View>

          {/* Ride Info */}
          <View style={[styles.rideInfo, { borderTopColor: theme.border }]}>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="cash" size={20} color={theme.primary} />
              <View style={styles.infoTextContainer}>
                <Text style={[styles.infoLabel, { color: theme.subtleText }]}>
                  Estimated Fare
                </Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>
                  TSh {rideData.estimatedFare.toLocaleString()}
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="map-marker-distance" size={20} color={theme.primary} />
              <View style={styles.infoTextContainer}>
                <Text style={[styles.infoLabel, { color: theme.subtleText }]}>
                  Distance
                </Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>
                  {rideData.distance} km
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="clock-outline" size={20} color={theme.primary} />
              <View style={styles.infoTextContainer}>
                <Text style={[styles.infoLabel, { color: theme.subtleText }]}>
                  Duration
                </Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>
                  ~{rideData.duration} min
                </Text>
              </View>
            </View>
          </View>

          {/* Rider Info */}
          <View style={[styles.riderSection, { borderTopColor: theme.border }]}>
            <View style={styles.riderAvatar}>
              {rideData.rider.photo ? (
                <Image source={{ uri: rideData.rider.photo }} style={styles.avatarImage} />
              ) : (
                <MaterialCommunityIcons name="account-circle" size={40} color={theme.subtleText} />
              )}
            </View>
            <View style={styles.riderInfo}>
              <Text style={[styles.riderName, { color: theme.text }]}>
                👤 {rideData.rider.name}
              </Text>
              <View style={styles.riderRating}>
                <Ionicons name="star" size={16} color="#98a75e" />
                <Text style={[styles.ratingText, { color: theme.text }]}>
                  {rideData.rider.rating}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.declineButton, { borderColor: theme.error }]}
            onPress={() => handleDecline('manual')}
            activeOpacity={0.8}
            disabled={isAccepting || isDeclining}
          >
            {isDeclining ? (
              <ActivityIndicator color={theme.error} size="small" />
            ) : (
              <>
                <MaterialCommunityIcons name="close-circle" size={24} color={theme.error} />
                <Text style={[styles.declineButtonText, { color: theme.error }]}>
                  DECLINE
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.acceptButton}
            onPress={handleAccept}
            activeOpacity={0.8}
            disabled={isAccepting || isDeclining}
          >
            <LinearGradient
              colors={['#10b981', '#059669']}
              style={styles.acceptButtonGradient}
            >
              {isAccepting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <MaterialCommunityIcons name="check-circle" size={24} color="#fff" />
                  <Text style={styles.acceptButtonText}>
                    ACCEPT
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  timerBadgeUrgent: {
    backgroundColor: '#ef4444',
  },
  timerText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  card: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 6,
    marginRight: 12,
  },
  pickupDot: {
    backgroundColor: '#10b981',
  },
  dropoffDot: {
    backgroundColor: '#ef4444',
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#666',
    marginLeft: 5,
    marginVertical: 4,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  locationName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
  },
  rideInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 20,
    marginTop: 20,
    borderTopWidth: 1,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  infoTextContainer: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  riderSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    marginTop: 20,
    borderTopWidth: 1,
    gap: 16,
  },
  riderAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 50,
    height: 50,
  },
  riderInfo: {
    flex: 1,
  },
  riderName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  riderRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  declineButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 2,
    gap: 8,
  },
  declineButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  acceptButton: {
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  acceptButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 8,
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
