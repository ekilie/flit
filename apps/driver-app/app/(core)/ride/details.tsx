import ScreenLayout from "@/components/ScreenLayout";
import { useCurrentTheme } from "@/context/CentralTheme";
import { useHaptics } from "@/hooks/useHaptics";
import Api from "@/lib/api";
import { Ride } from "@/lib/api/types";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { toast } from "yooo-native";

const { width } = Dimensions.get("window");

export default function RideDetailsScreen() {
  const theme = useCurrentTheme();
  const router = useRouter();
  const haptics = useHaptics();
  const params = useLocalSearchParams();
  const rideId = params.rideId as string;
  
  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (rideId) {
      fetchRideDetails();
    }
  }, [rideId]);

  const fetchRideDetails = async () => {
    try {
      setLoading(true);
      const rideDetails = await Api.getRide(parseInt(rideId));
      setRide(rideDetails);
    } catch (error) {
      console.error("Failed to fetch ride details:", error);
      toast.error("Failed to load ride details");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price?: number) => {
    if (!price) return "TSh 0";
    return `TSh ${price.toLocaleString()}`;
  };

  const handleShareReceipt = () => {
    haptics.selection();
    // In production, share receipt
  };

  const handleDownloadReceipt = () => {
    haptics.selection();
    // In production, download receipt
  };

  const handleReportIssue = () => {
    haptics.selection();
    // In production, open issue reporting
  };

  const handleBookAgain = () => {
    haptics.success();
    // In production, pre-fill booking with same locations
    router.push("/(core)/(tabs)/ride");
  };

  if (loading) {
    return (
      <ScreenLayout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.subtleText }]}>
            Loading ride details...
          </Text>
        </View>
      </ScreenLayout>
    );
  }

  if (!ride) {
    return (
      <ScreenLayout>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={theme.mutedText} />
          <Text style={[styles.errorTitle, { color: theme.text }]}>
            Ride Not Found
          </Text>
          <Text style={[styles.errorText, { color: theme.subtleText }]}>
            Unable to load ride details
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.retryButton,
              {
                backgroundColor: theme.primary,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <View style={styles.container}>
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
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Trip Details
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.shareButton,
              {
                backgroundColor: theme.cardBackground,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            onPress={handleShareReceipt}
          >
            <Ionicons name="share-outline" size={24} color={theme.text} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Status Card */}
          <View style={[styles.statusCard, { backgroundColor: theme.cardBackground }]}>
            <View style={[styles.statusIcon, { backgroundColor: `${theme.success}15` }]}>
              <Ionicons name="checkmark-circle" size={48} color={theme.success} />
            </View>
            <Text style={[styles.statusTitle, { color: theme.text }]}>
              Trip Completed
            </Text>
            <Text style={[styles.statusDate, { color: theme.subtleText }]}>
              {formatDate(ride.createdAt)}
            </Text>
            <View style={[styles.bookingIdContainer, { backgroundColor: theme.surface }]}>
              <Text style={[styles.bookingIdLabel, { color: theme.mutedText }]}>
                Order Number:
              </Text>
              <Text style={[styles.bookingId, { color: theme.text }]}>
                #{ride.id}
              </Text>
            </View>
          </View>

          {/* Trip Route */}
          <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Trip Route
            </Text>
            <View style={styles.route}>
              <View style={styles.routePoint}>
                <View style={[styles.routeDot, { backgroundColor: theme.primary }]} />
                <View style={styles.routeDetails}>
                  <Text style={[styles.routeLabel, { color: theme.subtleText }]}>
                    From
                  </Text>
                  <Text style={[styles.routeAddress, { color: theme.text }]}>
                    {ride.pickupAddress}
                  </Text>
                </View>
              </View>
              <View style={[styles.routeLine, { backgroundColor: theme.border }]} />
              <View style={styles.routePoint}>
                <View style={[styles.routeDot, { backgroundColor: theme.success }]} />
                <View style={styles.routeDetails}>
                  <Text style={[styles.routeLabel, { color: theme.subtleText }]}>
                    To
                  </Text>
                  <Text style={[styles.routeAddress, { color: theme.text }]}>
                    {ride.dropoffAddress}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.tripStats}>
              <View style={styles.statItem}>
                <Ionicons name="speedometer-outline" size={20} color={theme.mutedText} />
                <View>
                  <Text style={[styles.statValue, { color: theme.text }]}>
                    {ride.distance ? `${(ride.distance / 1000).toFixed(1)} km` : "N/A"}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.subtleText }]}>
                    Distance
                  </Text>
                </View>
              </View>
              <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={20} color={theme.mutedText} />
                <View>
                  <Text style={[styles.statValue, { color: theme.text }]}>
                    {ride.actualDuration ? `${Math.round(ride.actualDuration / 60)} min` : ride.estimatedDuration ? `${Math.round(ride.estimatedDuration / 60)} min` : "N/A"}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.subtleText }]}>
                    Duration
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Driver Info */}
          {ride.driver && (
            <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Driver Details
              </Text>
              <View style={styles.driverInfo}>
                <View style={[styles.driverAvatar, { backgroundColor: theme.primary }]}>
                  <Text style={styles.driverInitials}>
                    {ride.driver.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </Text>
                </View>
                <View style={styles.driverDetails}>
                  <Text style={[styles.driverName, { color: theme.text }]}>
                    {ride.driver.name}
                  </Text>
                  <View style={styles.driverMeta}>
                    <Text style={[styles.driverEmail, { color: theme.subtleText }]}>
                      {ride.driver.email}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Vehicle Info */}
          {ride.vehicle && (
            <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Vehicle Details
              </Text>
              <View style={[styles.vehicleInfo, { backgroundColor: theme.surface }]}>
                <View style={styles.vehicleRow}>
                  <Ionicons name="car-sport" size={20} color={theme.primary} />
                  <Text style={[styles.vehicleText, { color: theme.text }]}>
                    {ride.vehicle.make} {ride.vehicle.model} • {ride.vehicle.color}
                  </Text>
                </View>
                <View style={styles.vehicleRow}>
                  <Ionicons name="reader-outline" size={20} color={theme.primary} />
                  <Text style={[styles.vehicleText, { color: theme.text }]}>
                    {ride.vehicle.licensePlate}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Price Breakdown */}
          <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Price Breakdown
            </Text>
            <View style={styles.priceBreakdown}>
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: theme.subtleText }]}>
                  Fare
                </Text>
                <Text style={[styles.priceValue, { color: theme.text }]}>
                  {RIDE_DETAILS.price.currency} {RIDE_DETAILS.price.subtotal.toLocaleString()}
                </Text>
              </View>
              {RIDE_DETAILS.price.discount > 0 && (
                <View style={styles.priceRow}>
                  <Text style={[styles.priceLabel, { color: theme.success }]}>
                    Discount
                  </Text>
                  <Text style={[styles.priceValue, { color: theme.success }]}>
                    -{RIDE_DETAILS.price.currency}{" "}
                    {RIDE_DETAILS.price.discount.toLocaleString()}
                  </Text>
                </View>
              )}
              {RIDE_DETAILS.price.tip > 0 && (
                <View style={styles.priceRow}>
                  <Text style={[styles.priceLabel, { color: theme.subtleText }]}>
                    Tip
                  </Text>
                  <Text style={[styles.priceValue, { color: theme.text }]}>
                    {RIDE_DETAILS.price.currency} {RIDE_DETAILS.price.tip.toLocaleString()}
                  </Text>
                </View>
              )}
              <View style={[styles.priceDivider, { backgroundColor: theme.border }]} />
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabelTotal, { color: theme.text }]}>
                  Total
                </Text>
                <Text style={[styles.priceValueTotal, { color: theme.primary }]}>
                  {RIDE_DETAILS.price.currency} {RIDE_DETAILS.price.total.toLocaleString()}
                </Text>
              </View>
              <View style={styles.paymentMethod}>
                <Ionicons name="card-outline" size={16} color={theme.mutedText} />
                <Text style={[styles.paymentText, { color: theme.subtleText }]}>
                  {RIDE_DETAILS.paymentMethod}
                </Text>
              </View>
            </View>
          </View>

          {/* Rating & Feedback */}
          {RIDE_DETAILS.rating > 0 && (
            <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Your Rating
              </Text>
              <View style={styles.ratingStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= RIDE_DETAILS.rating ? "star" : "star-outline"}
                    size={28}
                    color={star <= RIDE_DETAILS.rating ? "#FFD700" : theme.mutedText}
                  />
                ))}
              </View>
              {RIDE_DETAILS.feedback && (
                <Text style={[styles.feedback, { color: theme.subtleText }]}>
                  "{RIDE_DETAILS.feedback}"
                </Text>
              )}
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                {
                  backgroundColor: theme.primary,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              onPress={handleBookAgain}
            >
              <Ionicons name="refresh" size={20} color="white" />
              <Text style={styles.actionButtonText}>Book Again</Text>
            </Pressable>

            <View style={styles.secondaryActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.secondaryButton,
                  {
                    backgroundColor: `${theme.primary}15`,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                onPress={handleDownloadReceipt}
              >
                <Ionicons name="download-outline" size={20} color={theme.primary} />
                <Text style={[styles.secondaryButtonText, { color: theme.primary }]}>
                  Download Receipt
                </Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.secondaryButton,
                  {
                    backgroundColor: `${theme.error}15`,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                onPress={handleReportIssue}
              >
                <Ionicons name="alert-circle-outline" size={20} color={theme.error} />
                <Text style={[styles.secondaryButtonText, { color: theme.error }]}>
                  Report Issue
                </Text>
              </Pressable>
            </View>
          </View>
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
    justifyContent: "space-between",
    padding: 16,
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  shareButton: {
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  statusCard: {
    alignItems: "center",
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  statusDate: {
    fontSize: 14,
    marginBottom: 16,
  },
  bookingIdContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  bookingIdLabel: {
    fontSize: 13,
  },
  bookingId: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  section: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  route: {
    marginBottom: 16,
  },
  routePoint: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
    marginTop: 4,
  },
  routeDetails: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  routeAddress: {
    fontSize: 15,
    fontWeight: "500",
  },
  routeLine: {
    width: 2,
    height: 24,
    marginLeft: 5,
    marginVertical: 8,
  },
  tripStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  driverInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  driverAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  driverInitials: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  driverMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  driverRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  driverRatingText: {
    fontSize: 14,
    fontWeight: "500",
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  driverTrips: {
    fontSize: 13,
  },
  vehicleInfo: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  vehicleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  vehicleText: {
    fontSize: 15,
    fontWeight: "500",
  },
  priceBreakdown: {
    gap: 14,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 15,
  },
  priceValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  priceDivider: {
    height: 1,
    marginVertical: 4,
  },
  priceLabelTotal: {
    fontSize: 17,
    fontWeight: "bold",
  },
  priceValueTotal: {
    fontSize: 20,
    fontWeight: "bold",
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  paymentText: {
    fontSize: 13,
  },
  ratingStars: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  feedback: {
    fontSize: 15,
    lineHeight: 22,
    fontStyle: "italic",
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryActions: {
    flexDirection: "row",
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
    gap: 6,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
