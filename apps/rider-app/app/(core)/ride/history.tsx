import ScreenLayout from "@/components/ScreenLayout";
import { useCurrentTheme } from "@/context/CentralTheme";
import { useHaptics } from "@/hooks/useHaptics";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// Dummy ride history data - Tanzania locations
const RIDE_HISTORY = [
  {
    id: "1",
    date: "2024-01-15",
    time: "14:30",
    pickup: "Mlimani City, Sam Nujoma Road, Dar es Salaam",
    destination: "Julius Nyerere International Airport, Dar es Salaam",
    vehicle: "Comfort",
    price: "TSh 25,000",
    driver: "Juma Mwangi",
    driverRating: 4.8,
    rating: 5,
    status: "imekamilika",
    distance: "8.5 km",
    duration: "15 dakika",
    paymentMethod: "Kadi ya Benki",
  },
  {
    id: "2",
    date: "2024-01-14",
    time: "09:15",
    pickup: "Coco Beach, Msasani, Dar es Salaam",
    destination: "Kariakoo Market, Dar es Salaam",
    vehicle: "Economy",
    price: "TSh 15,000",
    driver: "Amina Hassan",
    driverRating: 4.6,
    rating: 4,
    status: "imekamilika",
    distance: "5.2 km",
    duration: "12 dakika",
    paymentMethod: "M-Pesa",
  },
  {
    id: "3",
    date: "2024-01-13",
    time: "18:45",
    pickup: "Posta Road, Dar es Salaam",
    destination: "Mikocheni B, Dar es Salaam",
    vehicle: "Premium",
    price: "TSh 35,000",
    driver: "Mohamed Ali",
    driverRating: 4.9,
    rating: 5,
    status: "imekamilika",
    distance: "7.8 km",
    duration: "18 dakika",
    paymentMethod: "Kadi ya Benki",
  },
  {
    id: "4",
    date: "2024-01-12",
    time: "12:00",
    pickup: "Ubungo Plaza, Dar es Salaam",
    destination: "Slipway, Msasani Peninsula",
    vehicle: "XL",
    price: "TSh 28,000",
    driver: "Grace Kimaro",
    driverRating: 4.7,
    rating: 4,
    status: "imekamilika",
    distance: "9.3 km",
    duration: "20 dakika",
    paymentMethod: "Airtel Money",
  },
];

interface RideHistoryItemProps {
  ride: typeof RIDE_HISTORY[0];
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
      return "Leo";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Jana";
    } else {
      return date.toLocaleDateString("sw-TZ", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
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
            {formatDate(ride.date)}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: `${theme.success}15` }]}>
            <Text style={[styles.statusText, { color: theme.success }]}>
              {ride.status}
            </Text>
          </View>
        </View>
        <Text style={[styles.ridePrice, { color: theme.primary }]}>{ride.price}</Text>
      </View>

      <View style={styles.rideLocations}>
        <View style={styles.locationRow}>
          <View style={[styles.locationDot, { backgroundColor: theme.primary }]} />
          <Text style={[styles.locationText, { color: theme.text }]} numberOfLines={1}>
            {ride.pickup}
          </Text>
        </View>
        <View style={[styles.locationConnector, { backgroundColor: theme.border }]} />
        <View style={styles.locationRow}>
          <View style={[styles.locationDot, { backgroundColor: theme.success }]} />
          <Text style={[styles.locationText, { color: theme.text }]} numberOfLines={1}>
            {ride.destination}
          </Text>
        </View>
      </View>

      <View style={styles.rideFooter}>
        <View style={styles.rideMeta}>
          <Ionicons name="car-outline" size={16} color={theme.mutedText} />
          <Text style={[styles.rideMetaText, { color: theme.subtleText }]}>
            {ride.vehicle}
          </Text>
          <View style={[styles.metaDivider, { backgroundColor: theme.border }]} />
          <Ionicons name="person-outline" size={16} color={theme.mutedText} />
          <Text style={[styles.rideMetaText, { color: theme.subtleText }]}>
            {ride.driver}
          </Text>
        </View>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color={theme.warning} />
          <Text style={[styles.ratingText, { color: theme.subtleText }]}>
            {ride.rating}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

export default function RideHistoryScreen() {
  const theme = useCurrentTheme();
  const router = useRouter();
  const haptics = useHaptics();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleRidePress = (ride: typeof RIDE_HISTORY[0]) => {
    haptics.selection();
    // Navigate to ride details
    router.push({
      pathname: "/(core)/ride/details",
      params: { rideId: ride.id },
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
            <Text style={[styles.headerTitle, { color: theme.text }]}>Historia ya Safari</Text>
            <Text style={[styles.headerSubtitle, { color: theme.subtleText }]}>
              Safari {RIDE_HISTORY.length}
            </Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        {/* Content */}
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
          {RIDE_HISTORY.length === 0 ? (
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
              {RIDE_HISTORY.map((ride) => (
                <RideHistoryItem
                  key={ride.id}
                  ride={ride}
                  onPress={() => handleRidePress(ride)}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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

