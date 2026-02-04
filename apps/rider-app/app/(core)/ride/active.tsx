import ScreenLayout from "@/components/ScreenLayout";
import { useCurrentTheme } from "@/context/CentralTheme";
import { useHaptics } from "@/hooks/useHaptics";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Api from "@/lib/api";
import { Ride, RideStatus } from "@/lib/api/types";
import { toast } from "yooo-native";
import { useRideUpdates, useDriverLocation, useSocketConnection } from "@/lib/socket/socket-hooks";

const { width } = Dimensions.get("window");

export default function ActiveRideScreen() {
  const theme = useCurrentTheme();
  const router = useRouter();
  const haptics = useHaptics();
  const params = useLocalSearchParams();
  const rideId = params.rideId as string;
  
  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Real-time updates via Socket.IO
  const { rideUpdate, rideStatus, estimatedArrival } = useRideUpdates(rideId ? parseInt(rideId) : null);
  const { location: driverLocation, isStale } = useDriverLocation(rideId ? parseInt(rideId) : null);
  const { isConnected, connectionStatus, reconnect } = useSocketConnection();

  useEffect(() => {
    if (rideId) {
      fetchRideDetails();
    }
  }, [rideId]);

  // Handle real-time ride updates
  useEffect(() => {
    if (rideUpdate && ride) {
      // Update local ride state with real-time data
      setRide((prevRide) => {
        if (!prevRide) return prevRide;
        return {
          ...prevRide,
          status: rideUpdate.status as RideStatus,
          fare: rideUpdate.fare ?? prevRide.fare,
          distance: rideUpdate.distance ?? prevRide.distance,
          duration: rideUpdate.duration ?? prevRide.duration,
        };
      });

      // Show notifications for status changes
      if (rideUpdate.status === 'accepted') {
        toast.success('Driver accepted your ride!');
        haptics.success();
      } else if (rideUpdate.status === 'arrived') {
        toast.success('Driver has arrived!');
        haptics.success();
      } else if (rideUpdate.status === 'in_progress') {
        toast.success('Ride started!');
        haptics.success();
      } else if (rideUpdate.status === 'completed') {
        toast.success('Ride completed!');
        haptics.success();
        // Navigate to rating screen
        router.replace({
          pathname: "/(core)/ride/rating",
          params: { 
            rideId: ride.id.toString(),
            driverId: ride.driver?.id?.toString() || "",
            driverName: ride.driver?.name || "Driver"
          }
        } as any);
      } else if (rideUpdate.status === 'cancelled') {
        toast.error('Ride was cancelled');
        haptics.error();
        router.back();
      }
    }
  }, [rideUpdate]);

  const fetchRideDetails = async () => {
    try {
      if (!rideId) return;
      const rideData = await Api.getRide(parseInt(rideId));
      setRide(rideData);
      setLoading(false);
      
      // If ride is completed, navigate to rating screen
      if (rideData.status === RideStatus.COMPLETED && !loading) {
        router.replace({
          pathname: "/(core)/ride/rating",
          params: { 
            rideId: rideData.id.toString(),
            driverId: rideData.driver?.id?.toString() || "",
            driverName: rideData.driver?.name || "Driver"
          }
        } as any);
      }
    } catch (error: any) {
      console.error("Failed to fetch ride:", error);
      if (loading) {
        toast.error("Failed to load ride details");
        router.back();
      }
    }
  };

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

    // Timer for elapsed time
    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleCallDriver = () => {
    haptics.selection();
    // In production, use Linking to call
    if (ride?.driver?.metadata?.phone) {
      // Linking.openURL(`tel:${ride.driver.metadata.phone}`);
      toast.info("Call driver: " + ride.driver.metadata.phone);
    }
  };

  const handleCancelRide = async () => {
    if (!ride) return;
    
    haptics.medium();
    try {
      await Api.cancelRide(ride.id);
      toast.success("Ride cancelled");
      router.back();
    } catch (error: any) {
      console.error("Failed to cancel ride:", error);
      toast.error(error.message || "Failed to cancel ride");
    }
  };

  const handleEmergency = () => {
    haptics.error();
    toast.error("Emergency feature - Call emergency services");
    // In production, trigger emergency protocol
  };

  const handleShareETA = () => {
    haptics.selection();
    toast.info("Share ETA feature coming soon");
    // In production, use Share API
  };

  const handleMessageDriver = () => {
    haptics.selection();
    toast.info("Messaging feature coming soon");
    // In production, open messaging interface
  };

  const getStatusText = () => {
    if (!ride) return "Loading...";
    
    switch (ride.status) {
      case RideStatus.REQUESTED:
        return "Finding driver...";
      case RideStatus.ACCEPTED:
        return "Driver arriving";
      case RideStatus.ARRIVED:
        return "Driver has arrived";
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

  const getDriverName = () => {
    return ride?.driver?.name || "Driver";
  };

  const getDriverInitials = () => {
    const name = getDriverName();
    return name.split(" ").map((n) => n[0]).join("").toUpperCase();
  };

  if (loading) {
    return (
      <ScreenLayout>
        <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[{ color: theme.subtleText, marginTop: 16 }]}>Loading ride...</Text>
        </View>
      </ScreenLayout>
    );
  }

  if (!ride) {
    return (
      <ScreenLayout>
        <View style={[styles.container, { justifyContent: "center", alignItems: "center", padding: 20 }]}>
          <Ionicons name="alert-circle-outline" size={64} color={theme.mutedText} />
          <Text style={[{ color: theme.text, fontSize: 18, fontWeight: "bold", marginTop: 16 }]}>
            Ride Not Found
          </Text>
          <Pressable
            style={({ pressed }) => [
              {
                backgroundColor: theme.primary,
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 8,
                marginTop: 20,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            onPress={() => router.back()}
          >
            <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>Go Back</Text>
          </Pressable>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
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

        {/* Searching for Driver Overlay */}
        {ride?.status === RideStatus.REQUESTED && (
          <View style={[styles.searchingOverlay, { backgroundColor: `${theme.background}F0` }]}>
            <View style={[styles.searchingCard, { backgroundColor: theme.cardBackground }]}>
              <Animated.View
                style={[
                  styles.searchingPulse,
                  {
                    backgroundColor: `${theme.primary}40`,
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              />
              <View style={[styles.searchingIcon, { backgroundColor: theme.primary }]}>
                <Ionicons name="search" size={32} color="white" />
              </View>
              <Text style={[styles.searchingTitle, { color: theme.text }]}>
                Finding nearby drivers...
              </Text>
              <Text style={[styles.searchingSubtitle, { color: theme.subtleText }]}>
                This usually takes a few seconds
              </Text>
              <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 16 }} />
            </View>
          </View>
        )}

        {/* Bottom Sheet */}
        <View style={[styles.bottomSheet, { backgroundColor: theme.cardBackground }]}>
          <ScrollView
            style={styles.bottomSheetContent}
            contentContainerStyle={styles.bottomSheetScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Driver Info - Only show if driver is assigned */}
            {ride?.driver && (
              <View style={styles.driverSection}>
                <View style={styles.driverInfo}>
                  <View style={[styles.driverAvatar, { backgroundColor: theme.primary }]}>
                    <Text style={styles.driverInitials}>
                      {getDriverInitials()}
                    </Text>
                  </View>
                  <View style={styles.driverDetails}>
                    <Text style={[styles.driverName, { color: theme.text }]}>
                      {getDriverName()}
                    </Text>
                    <View style={styles.driverRating}>
                      <Ionicons name="star" size={14} color={theme.warning} />
                      <Text style={[styles.ratingText, { color: theme.subtleText }]}>
                        {ride.driver?.metadata?.rating || "N/A"}
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
            )}

            {/* Vehicle Info - Only show if vehicle is assigned */}
            {ride?.vehicle && (
              <View style={[styles.vehicleSection, { backgroundColor: theme.surface }]}>
                <View style={styles.vehicleInfo}>
                <Ionicons
                  name="car-sport-outline"
                  size={24}
                  color={theme.primary}
                />
                <View style={styles.vehicleDetails}>
                  <Text style={[styles.vehicleName, { color: theme.text }]}>
                    {ride.vehicle ? `${ride.vehicle.make} ${ride.vehicle.model}` : "Vehicle"}
                  </Text>
                  <Text style={[styles.vehiclePlate, { color: theme.subtleText }]}>
                    {ride.vehicle ? ride.vehicle.licensePlate : "N/A"}
                  </Text>
                </View>
              </View>
            </View>
            )}

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
                    {ride.distance ? `${(ride.distance / 1000).toFixed(1)} km` : "N/A"}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.subtleText }]}>Distance</Text>
                </View>
              </View>
              <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
              <View style={styles.statItem}>
                <Ionicons name="cash-outline" size={20} color={theme.mutedText} />
                <View style={styles.statInfo}>
                  <Text style={[styles.statValue, { color: theme.primary }]}>
                    {ride.fare ? `TSh ${ride.fare.toLocaleString()}` : "TSh 0"}
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

            {ride.status === RideStatus.PENDING && (
              <Pressable
                style={({ pressed }) => [
                  styles.cancelButton,
                  {
                    backgroundColor: theme.error,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                onPress={handleCancelRide}
              >
                <Text style={styles.cancelButtonText}>Cancel Ride</Text>
              </Pressable>
            )}
          </ScrollView>
        </View>
      </View>
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
  searchingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  searchingCard: {
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
    minWidth: width * 0.8,
  },
  searchingPulse: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.3,
  },
  searchingIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  searchingTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  searchingSubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 8,
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
});

