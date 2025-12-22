import ScreenLayout from "@/components/ScreenLayout";
import { useCurrentTheme } from "@/context/CentralTheme";
import { useHaptics } from "@/hooks/useHaptics";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

// Dummy ride data - Tanzania locations
const ACTIVE_RIDE = {
  id: "1",
  vehicle: {
    name: "Comfort",
    icon: "car-sport-outline",
  },
  pickup: "Mlimani City, Sam Nujoma Road, Dar es Salaam",
  destination: "Julius Nyerere International Airport, Dar es Salaam",
  driver: {
    name: "Juma Mwangi",
    rating: 4.8,
    vehicle: "Toyota Corolla",
    plate: "T 123 ABC",
    phone: "+255 712 345 678",
    avatar: null,
  },
  eta: "5 dakika",
  price: "TSh 25,000",
  status: "arriving", // arriving, in-ride, completed
  distance: "8.5 km",
  duration: "15 dakika",
};

export default function ActiveRideScreen() {
  const theme = useCurrentTheme();
  const router = useRouter();
  const haptics = useHaptics();
  const [rideStatus, setRideStatus] = useState(ACTIVE_RIDE.status);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;

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

    // Simulate ride progression
    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
      if (timeElapsed > 30 && rideStatus === "arriving") {
        setRideStatus("in-ride");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timeElapsed, rideStatus]);

  const handleCallDriver = () => {
    haptics.selection();
    // In production, use Linking to call
  };

  const handleCancelRide = () => {
    haptics.medium();
    router.back();
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
    switch (rideStatus) {
      case "arriving":
        return "Driver arriving";
      case "in-ride":
        return "On the way";
      case "completed":
        return "Ride completed";
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
                    {ACTIVE_RIDE.driver.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </Text>
                </View>
                <View style={styles.driverDetails}>
                  <Text style={[styles.driverName, { color: theme.text }]}>
                    {ACTIVE_RIDE.driver.name}
                  </Text>
                  <View style={styles.driverRating}>
                    <Ionicons name="star" size={14} color={theme.warning} />
                    <Text style={[styles.ratingText, { color: theme.subtleText }]}>
                      {ACTIVE_RIDE.driver.rating}
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
                  name={ACTIVE_RIDE.vehicle.icon as any}
                  size={24}
                  color={theme.primary}
                />
                <View style={styles.vehicleDetails}>
                  <Text style={[styles.vehicleName, { color: theme.text }]}>
                    {ACTIVE_RIDE.driver.vehicle}
                  </Text>
                  <Text style={[styles.vehiclePlate, { color: theme.subtleText }]}>
                    {ACTIVE_RIDE.driver.plate}
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
                    {ACTIVE_RIDE.pickup}
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
                    {ACTIVE_RIDE.destination}
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
                    {ACTIVE_RIDE.distance}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.subtleText }]}>Distance</Text>
                </View>
              </View>
              <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
              <View style={styles.statItem}>
                <Ionicons name="cash-outline" size={20} color={theme.mutedText} />
                <View style={styles.statInfo}>
                  <Text style={[styles.statValue, { color: theme.primary }]}>
                    {ACTIVE_RIDE.price}
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
                  Shiriki ETA
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
                  Dharura
                </Text>
              </Pressable>
            </View>

            {rideStatus === "arriving" && (
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
                <Text style={styles.cancelButtonText}>Ghairi Safari</Text>
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

