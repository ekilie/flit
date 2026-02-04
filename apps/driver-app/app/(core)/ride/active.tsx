import ScreenLayout from "@/components/ScreenLayout";
import { useCurrentTheme } from "@/context/CentralTheme";
import { useHaptics } from "@/hooks/useHaptics";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { useRideUpdates } from "@/lib/socket/socket-hooks";
import Api from "@/lib/api";
import { Ride, RideStatus } from "@/lib/api/types";
import { toast } from "yooo-native";

const { width } = Dimensions.get("window");

// Helper function to get initials from name
const getInitials = (name: string | undefined): string => {
  if (!name) return "R";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

export default function ActiveRideScreen() {
  const theme = useCurrentTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const haptics = useHaptics();
  
  const rideId = params.id ? parseInt(params.id as string) : null;
  
  // Get real-time ride updates from socket
  const { rideStatus: socketRideStatus } = useRideUpdates(rideId);
  
  // State for ride data
  const [ride, setRide] = useState<Ride | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Fetch ride details on mount
  useEffect(() => {
    if (rideId) {
      fetchRideDetails();
    }
  }, [rideId]);

  const fetchRideDetails = async () => {
    try {
      setIsLoading(true);
      const rideData = await Api.getRide(rideId!);
      setRide(rideData);
      setIsLoading(false);
    } catch (error: any) {
      console.error('Failed to fetch ride details:', error);
      toast.error(error.message || 'Failed to load ride details');
      setIsLoading(false);
    }
  };

  // Update local ride status from socket
  useEffect(() => {
    if (socketRideStatus && ride) {
      setRide(prev => prev ? { ...prev, status: socketRideStatus as RideStatus } : null);
    }
  }, [socketRideStatus]);

  useEffect(() => {
    // Pulse animation for driver marker
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Track elapsed time (for display purposes)
    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleCallDriver = () => {
    haptics.selection();
    // In production, use Linking to call
  };

  const handleCancelRide = async () => {
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      haptics.medium();
      
      await Api.cancelRide(rideId!);
      toast.success('Ride cancelled');
      router.back();
    } catch (error: any) {
      console.error('Failed to cancel ride:', error);
      toast.error(error.message || 'Failed to cancel ride');
      setIsUpdating(false);
    }
  };

  const handleMarkArrived = async () => {
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      haptics.success();
      
      await Api.updateRide(rideId!, { status: RideStatus.ARRIVED });
      toast.success('Marked as arrived');
      setIsUpdating(false);
    } catch (error: any) {
      console.error('Failed to update ride status:', error);
      toast.error(error.message || 'Failed to update status');
      setIsUpdating(false);
    }
  };

  const handleStartRide = async () => {
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      haptics.success();
      
      await Api.updateRide(rideId!, { status: RideStatus.IN_PROGRESS });
      toast.success('Ride started');
      setIsUpdating(false);
    } catch (error: any) {
      console.error('Failed to start ride:', error);
      toast.error(error.message || 'Failed to start ride');
      setIsUpdating(false);
    }
  };

  const handleCompleteRide = async () => {
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      haptics.success();
      
      await Api.updateRide(rideId!, { status: RideStatus.COMPLETED });
      toast.success('Ride completed!');
      
      // Navigate to completion/rating screen or back home
      setTimeout(() => {
        router.replace('/(core)/(tabs)/home');
      }, 1000);
    } catch (error: any) {
      console.error('Failed to complete ride:', error);
      toast.error(error.message || 'Failed to complete ride');
      setIsUpdating(false);
    }
  };

  const handleEmergency = () => {
    haptics.error();
    // In production, trigger emergency protocol
  };

  const handleShareETA = () => {
    haptics.selection();
    // In production, use Share API
  };

  const handleMessageDriver = () => {
    haptics.selection();
    // In production, open messaging interface
  };

  const getStatusText = () => {
    if (!ride) return "Loading...";
    
    switch (ride.status) {
      case RideStatus.ACCEPTED:
        return "Heading to pickup";
      case RideStatus.ARRIVED:
        return "Arrived at pickup";
      case RideStatus.IN_PROGRESS:
        return "On the way";
      case RideStatus.COMPLETED:
        return "Ride completed";
      case RideStatus.CANCELLED:
        return "Ride cancelled";
      default:
        return "Ride in progress";
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <ScreenLayout>
      {isLoading ? (
        <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Loading ride details...</Text>
        </View>
      ) : !ride ? (
        <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
          <Text style={[styles.loadingText, { color: theme.text }]}>Ride not found</Text>
          <Pressable
            style={[styles.backToHomeButton, { backgroundColor: theme.primary }]}
            onPress={() => router.replace('/(core)/(tabs)/home')}
          >
            <Text style={styles.backToHomeText}>Back to Home</Text>
          </Pressable>
        </View>
      ) : (
      <View style={styles.container}>
        {/* Map View */}
        <View style={[styles.mapContainer, { backgroundColor: theme.surface }]}>
          {/* Placeholder Map */}
          <View style={styles.mapPlaceholder}>
            <View style={styles.mapMarkerContainer}>
              {/* Pickup Marker */}
              <View style={[styles.mapMarker, { backgroundColor: theme.primary }]}>
                <Ionicons name="location" size={20} color="white" />
              </View>
              {/* Driver Marker with Pulse */}
              <Animated.View
                style={[
                  styles.driverMarkerContainer,
                  {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              >
                <View style={[styles.driverMarker, { backgroundColor: theme.success }]}>
                  <Ionicons name="car" size={20} color="white" />
                </View>
                <View style={[styles.pulseRing, { borderColor: theme.success }]} />
              </Animated.View>
              {/* Destination Marker */}
              <View style={[styles.mapMarker, { backgroundColor: theme.success, marginTop: 200 }]}>
                <Ionicons name="flag" size={20} color="white" />
              </View>
            </View>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Pressable
              style={({ pressed }) => [
                styles.backButton,
                {
                  backgroundColor: theme.cardBackground,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={theme.text} />
            </Pressable>
            <View style={[styles.statusBadge, { backgroundColor: `${theme.primary}15` }]}>
              <Text style={[styles.statusText, { color: theme.primary }]}>
                {getStatusText()}
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom Sheet */}
        <View style={[styles.bottomSheet, { backgroundColor: theme.cardBackground }]}>
          <ScrollView
            style={styles.bottomSheetContent}
            contentContainerStyle={styles.bottomSheetScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Driver Info */}
            <View style={styles.driverSection}>
              <View style={styles.driverInfo}>
                <View style={[styles.driverAvatar, { backgroundColor: theme.primary }]}>
                  <Text style={styles.driverInitials}>
                    {getInitials(ride.rider?.name)}
                  </Text>
                </View>
                <View style={styles.driverDetails}>
                  <Text style={[styles.driverName, { color: theme.text }]}>
                    {ride.rider?.name || "Rider"}
                  </Text>
                  <View style={styles.driverRating}>
                    <Ionicons name="star" size={14} color={theme.warning} />
                    <Text style={[styles.ratingText, { color: theme.subtleText }]}>
                      4.8
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.contactButtons}>
                <Pressable
                  style={({ pressed }) => [
                    styles.contactButton,
                    {
                      backgroundColor: `${theme.primary}15`,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                  onPress={handleMessageDriver}
                >
                  <Ionicons name="chatbubble-outline" size={20} color={theme.primary} />
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.contactButton,
                    {
                      backgroundColor: `${theme.primary}15`,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                  onPress={handleCallDriver}
                >
                  <Ionicons name="call" size={20} color={theme.primary} />
                </Pressable>
              </View>
            </View>

            {/* Vehicle Info */}
            <View style={[styles.vehicleSection, { backgroundColor: theme.surface }]}>
              <View style={styles.vehicleInfo}>
                <Ionicons
                  name="car-sport-outline"
                  size={24}
                  color={theme.primary}
                />
                <View style={styles.vehicleDetails}>
                  <Text style={[styles.vehicleName, { color: theme.text }]}>
                    {ride.vehicle?.model || "Vehicle"}
                  </Text>
                  <Text style={[styles.vehiclePlate, { color: theme.subtleText }]}>
                    {ride.vehicle?.licensePlate || "N/A"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Trip Details */}
            <View style={styles.tripSection}>
              <View style={styles.tripLocation}>
                <View style={[styles.tripDot, { backgroundColor: theme.primary }]} />
                <View style={styles.tripLocationInfo}>
                  <Text style={[styles.tripLocationLabel, { color: theme.subtleText }]}>
                    Pickup
                  </Text>
                  <Text style={[styles.tripLocationValue, { color: theme.text }]}>
                    {ride.pickupAddress}
                  </Text>
                </View>
              </View>
              <View style={[styles.tripLine, { backgroundColor: theme.border }]} />
              <View style={styles.tripLocation}>
                <View style={[styles.tripDot, { backgroundColor: theme.success }]} />
                <View style={styles.tripLocationInfo}>
                  <Text style={[styles.tripLocationLabel, { color: theme.subtleText }]}>
                    Destination
                  </Text>
                  <Text style={[styles.tripLocationValue, { color: theme.text }]}>
                    {ride.dropoffAddress}
                  </Text>
                </View>
              </View>
            </View>

            {/* Trip Stats */}
            <View style={[styles.statsSection, { backgroundColor: theme.surface }]}>
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={20} color={theme.mutedText} />
                <View style={styles.statInfo}>
                  <Text style={[styles.statValue, { color: theme.text }]}>
                    {formatTime(timeElapsed)}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.subtleText }]}>Time</Text>
                </View>
              </View>
              <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
              <View style={styles.statItem}>
                <Ionicons name="navigate-outline" size={20} color={theme.mutedText} />
                <View style={styles.statInfo}>
                  <Text style={[styles.statValue, { color: theme.text }]}>
                    {ride.distance ? `${ride.distance} km` : "N/A"}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.subtleText }]}>Distance</Text>
                </View>
              </View>
              <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
              <View style={styles.statItem}>
                <Ionicons name="cash-outline" size={20} color={theme.mutedText} />
                <View style={styles.statInfo}>
                  <Text style={[styles.statValue, { color: theme.primary }]}>
                    {ride.estimatedFare ? `TSh ${ride.estimatedFare.toLocaleString()}` : "TBD"}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.subtleText }]}>Price</Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  {
                    backgroundColor: `${theme.primary}15`,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                onPress={handleShareETA}
              >
                <Ionicons name="share-outline" size={20} color={theme.primary} />
                <Text style={[styles.actionButtonText, { color: theme.primary }]}>
                  Share ETA
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  {
                    backgroundColor: `${theme.error}15`,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                onPress={handleEmergency}
              >
                <Ionicons name="alert-circle-outline" size={20} color={theme.error} />
                <Text style={[styles.actionButtonText, { color: theme.error }]}>
                  Emergency
                </Text>
              </Pressable>
            </View>

            {/* Status Transition Buttons */}
            {ride.status === RideStatus.ACCEPTED && (
              <Pressable
                style={({ pressed }) => [
                  styles.statusButton,
                  {
                    backgroundColor: theme.primary,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                onPress={handleMarkArrived}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={styles.statusButtonText}>I've Arrived</Text>
                  </>
                )}
              </Pressable>
            )}

            {ride.status === RideStatus.ARRIVED && (
              <Pressable
                style={({ pressed }) => [
                  styles.statusButton,
                  {
                    backgroundColor: theme.success,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                onPress={handleStartRide}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="play-circle" size={20} color="#fff" />
                    <Text style={styles.statusButtonText}>Start Ride</Text>
                  </>
                )}
              </Pressable>
            )}

            {ride.status === RideStatus.IN_PROGRESS && (
              <Pressable
                style={({ pressed }) => [
                  styles.statusButton,
                  {
                    backgroundColor: theme.success,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                onPress={handleCompleteRide}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="flag" size={20} color="#fff" />
                    <Text style={styles.statusButtonText}>Complete Ride</Text>
                  </>
                )}
              </Pressable>
            )}

            {(ride.status === RideStatus.ACCEPTED || ride.status === RideStatus.ARRIVED) && (
              <Pressable
                style={({ pressed }) => [
                  styles.cancelButton,
                  {
                    backgroundColor: theme.error,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                onPress={handleCancelRide}
                disabled={isUpdating}
              >
                <Text style={styles.cancelButtonText}>Cancel Ride</Text>
              </Pressable>
            )}
          </ScrollView>
        </View>
      </View>
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mapMarkerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  mapMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  driverMarkerContainer: {
    position: "relative",
    marginVertical: 20,
  },
  driverMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  pulseRing: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    top: -10,
    left: -10,
  },
  header: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "60%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  bottomSheetContent: {
    flex: 1,
  },
  bottomSheetScrollContent: {
    padding: 20,
    paddingBottom: 32,
  },
  driverSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  driverInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  driverAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  driverInitials: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  driverRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "500",
  },
  callButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  contactButtons: {
    flexDirection: "row",
    gap: 8,
  },
  contactButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  vehicleSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  vehicleInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  vehicleDetails: {
    marginLeft: 12,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  vehiclePlate: {
    fontSize: 14,
  },
  tripSection: {
    marginBottom: 16,
  },
  tripLocation: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  tripDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
    marginTop: 4,
  },
  tripLocationInfo: {
    flex: 1,
  },
  tripLocationLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  tripLocationValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  tripLine: {
    width: 2,
    height: 20,
    marginLeft: 5,
    marginBottom: 12,
  },
  statsSection: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 40,
    marginHorizontal: 12,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  cancelButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  cancelButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 16,
  },
  backToHomeButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backToHomeText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  statusButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  statusButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

