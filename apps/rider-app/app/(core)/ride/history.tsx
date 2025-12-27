import ScreenLayout from "@/components/ScreenLayout";
import { useCurrentTheme } from "@/context/CentralTheme";
import { useHaptics } from "@/hooks/useHaptics";
import Api from "@/lib/api";
import { Ride, RideStatus } from "@/lib/api/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { toast } from "yooo-native";

interface RideHistoryItemProps {
  ride: Ride;
  onPress: () => void;
}

const RideHistoryItem: React.FC<RideHistoryItemProps> = ({ ride, onPress }) => {
  const theme = useCurrentTheme();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return "TSh 0";
    return `TSh ${price.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return theme.success || "#4CAF50";
      case "cancelled":
        return theme.error || "#F44336";
      default:
        return theme.warning || "#FF9800";
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.rideItem,
        {
          opacity: pressed ? 0.8 : 1,
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.rideHeader}>
        <View style={styles.rideDateContainer}>
          <Text style={[styles.rideDate, { color: theme.text }]}>
            {formatDate(ride.createdAt)}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(ride.status)}15` }]}>
            <Text style={[styles.statusText, { color: getStatusColor(ride.status) }]}>
              {ride.status}
            </Text>
          </View>
        </View>
        <Text style={[styles.ridePrice, { color: theme.primary }]}>{formatPrice(ride.fare)}</Text>
      </View>

      <View style={styles.rideLocations}>
        <View style={styles.locationRow}>
          <View style={[styles.locationDot, { backgroundColor: theme.primary }]} />
          <Text style={[styles.locationText, { color: theme.text }]} numberOfLines={1}>
            {ride.pickupAddress}
          </Text>
        </View>
        <View style={[styles.locationConnector, { backgroundColor: theme.border }]} />
        <View style={styles.locationRow}>
          <View style={[styles.locationDot, { backgroundColor: theme.success || "#4CAF50" }]} />
          <Text style={[styles.locationText, { color: theme.text }]} numberOfLines={1}>
            {ride.dropoffAddress}
          </Text>
        </View>
      </View>

      <View style={styles.rideFooter}>
        <View style={styles.rideMeta}>
          <Ionicons name="car-outline" size={16} color={theme.mutedText} />
          <Text style={[styles.rideMetaText, { color: theme.subtleText }]}>
            {ride.vehicle?.type || "Vehicle"}
          </Text>
          {ride.driver && (
            <>
              <View style={[styles.metaDivider, { backgroundColor: theme.border }]} />
              <Ionicons name="person-outline" size={16} color={theme.mutedText} />
              <Text style={[styles.rideMetaText, { color: theme.subtleText }]}>
                {ride.driver.name}
              </Text>
            </>
          )}
        </View>
        {ride.distance && (
          <View style={styles.ratingContainer}>
            <Ionicons name="navigate-outline" size={14} color={theme.mutedText} />
            <Text style={[styles.ratingText, { color: theme.subtleText }]}>
              {(ride.distance / 1000).toFixed(1)} km
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
};

export default function RideHistoryScreen() {
  const theme = useCurrentTheme();
  const router = useRouter();
  const haptics = useHaptics();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchRideHistory();
  }, []);

  const fetchRideHistory = async () => {
    try {
      setLoading(true);
      const user = await Api.getCurrentUser();
      const userData = user.data || user;
      
      // Fetch all rides for the user
      const allRides = await Api.getRidesByRider(userData.id);
      
      // Filter for completed and cancelled rides (history)
      const historyRides = allRides.filter(
        (ride) => ride.status === RideStatus.COMPLETED || ride.status === RideStatus.CANCELLED
      );
      
      // Sort by most recent first
      historyRides.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setRides(historyRides);
    } catch (error) {
      console.error("Failed to fetch ride history:", error);
      toast.error("Failed to load ride history");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRideHistory();
    setRefreshing(false);
  };

  const handleRidePress = (ride: Ride) => {
    haptics.selection();
    // Navigate to ride details
    router.push({
      pathname: "/(core)/ride/details",
      params: { rideId: ride.id.toString() },
    } as any);
  };

  return (
    <ScreenLayout>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              {
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Ride History</Text>
            <Text style={[styles.headerSubtitle, { color: theme.subtleText }]}>
              {rides.length} trips
            </Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.subtleText }]}>
              Loading ride history...
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.primary}
                colors={[theme.primary]}
              />
            }
            showsVerticalScrollIndicator={false}
          >
            {rides.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="car-outline" size={64} color={theme.mutedText} />
                <Text style={[styles.emptyTitle, { color: theme.text }]}>
                  No ride history
                </Text>
                <Text style={[styles.emptyDescription, { color: theme.subtleText }]}>
                  Your completed rides will appear here
                </Text>
              </View>
            ) : (
              <View style={styles.ridesList}>
                {rides.map((ride) => (
                  <RideHistoryItem
                    key={ride.id}
                    ride={ride}
                    onPress={() => handleRidePress(ride)}
                  />
                ))}
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: "center",
  },
  ridesList: {
    gap: 12,
  },
  rideItem: {
    padding: 16,
    borderRadius: 12,
    borderColor: "rgba(0,0,0,0.05)",
    borderWidth: 1,
  },
  rideHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  rideDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rideDate: {
    fontSize: 16,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  ridePrice: {
    fontSize: 18,
    fontWeight: "bold",
  },
  rideLocations: {
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
  },
  locationConnector: {
    width: 2,
    height: 12,
    marginLeft: 4,
    marginBottom: 8,
  },
  rideFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rideMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  rideMetaText: {
    fontSize: 12,
    marginRight: 8,
  },
  metaDivider: {
    width: 1,
    height: 12,
    marginHorizontal: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "500",
  },
});

