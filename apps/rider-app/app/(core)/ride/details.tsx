import ScreenLayout from "@/components/ScreenLayout";
import { useCurrentTheme } from "@/context/CentralTheme";
import { useHaptics } from "@/hooks/useHaptics";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

// Dummy ride data - in production, fetch based on rideId
const RIDE_DETAILS = {
  id: "1",
  date: "2024-01-15",
  time: "14:30",
  pickup: {
    address: "Mlimani City, Sam Nujoma Road, Dar es Salaam",
    coordinates: { latitude: -6.7730, longitude: 39.2120 },
  },
  destination: {
    address: "Julius Nyerere International Airport, Dar es Salaam",
    coordinates: { latitude: -6.8781, longitude: 39.2026 },
  },
  vehicle: {
    type: "Comfort",
    make: "Toyota Corolla",
    plate: "T 123 ABC",
    color: "Nyeupe",
  },
  driver: {
    name: "Juma Mwangi",
    rating: 4.8,
    totalTrips: 1250,
    phone: "+255 712 345 678",
  },
  price: {
    subtotal: 23000,
    discount: 0,
    tip: 2000,
    total: 25000,
    currency: "TSh",
  },
  rating: 5,
  feedback: "Safari nzuri sana! Dereva alikuwa mkarimu na gari lilikuwa safi.",
  status: "imekamilika",
  distance: "8.5 km",
  duration: "15 dakika",
  paymentMethod: "Kadi ya Benki •••• 1234",
  bookingId: "FLT-2024-001-15678",
};

export default function RideDetailsScreen() {
  const theme = useCurrentTheme();
  const router = useRouter();
  const haptics = useHaptics();
  const params = useLocalSearchParams();

  const formatDate = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`);
    return dateObj.toLocaleDateString("sw-TZ", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
            Maelezo ya Safari
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
              Safari Imekamilika
            </Text>
            <Text style={[styles.statusDate, { color: theme.subtleText }]}>
              {formatDate(RIDE_DETAILS.date, RIDE_DETAILS.time)}
            </Text>
            <View style={[styles.bookingIdContainer, { backgroundColor: theme.surface }]}>
              <Text style={[styles.bookingIdLabel, { color: theme.mutedText }]}>
                Namba ya Oda:
              </Text>
              <Text style={[styles.bookingId, { color: theme.text }]}>
                {RIDE_DETAILS.bookingId}
              </Text>
            </View>
          </View>

          {/* Trip Route */}
          <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Njia ya Safari
            </Text>
            <View style={styles.route}>
              <View style={styles.routePoint}>
                <View style={[styles.routeDot, { backgroundColor: theme.primary }]} />
                <View style={styles.routeDetails}>
                  <Text style={[styles.routeLabel, { color: theme.subtleText }]}>
                    Kutoka
                  </Text>
                  <Text style={[styles.routeAddress, { color: theme.text }]}>
                    {RIDE_DETAILS.pickup.address}
                  </Text>
                </View>
              </View>
              <View style={[styles.routeLine, { backgroundColor: theme.border }]} />
              <View style={styles.routePoint}>
                <View style={[styles.routeDot, { backgroundColor: theme.success }]} />
                <View style={styles.routeDetails}>
                  <Text style={[styles.routeLabel, { color: theme.subtleText }]}>
                    Kwenda
                  </Text>
                  <Text style={[styles.routeAddress, { color: theme.text }]}>
                    {RIDE_DETAILS.destination.address}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.tripStats}>
              <View style={styles.statItem}>
                <Ionicons name="speedometer-outline" size={20} color={theme.mutedText} />
                <View>
                  <Text style={[styles.statValue, { color: theme.text }]}>
                    {RIDE_DETAILS.distance}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.subtleText }]}>
                    Umbali
                  </Text>
                </View>
              </View>
              <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={20} color={theme.mutedText} />
                <View>
                  <Text style={[styles.statValue, { color: theme.text }]}>
                    {RIDE_DETAILS.duration}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.subtleText }]}>
                    Muda
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Driver Info */}
          <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Maelezo ya Dereva
            </Text>
            <View style={styles.driverInfo}>
              <View style={[styles.driverAvatar, { backgroundColor: theme.primary }]}>
                <Text style={styles.driverInitials}>
                  {RIDE_DETAILS.driver.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </Text>
              </View>
              <View style={styles.driverDetails}>
                <Text style={[styles.driverName, { color: theme.text }]}>
                  {RIDE_DETAILS.driver.name}
                </Text>
                <View style={styles.driverMeta}>
                  <View style={styles.driverRating}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={[styles.driverRatingText, { color: theme.subtleText }]}>
                      {RIDE_DETAILS.driver.rating}
                    </Text>
                  </View>
                  <View style={[styles.metaDot, { backgroundColor: theme.border }]} />
                  <Text style={[styles.driverTrips, { color: theme.subtleText }]}>
                    Safari {RIDE_DETAILS.driver.totalTrips}+
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.vehicleInfo, { backgroundColor: theme.surface }]}>
              <View style={styles.vehicleRow}>
                <Ionicons name="car-sport" size={20} color={theme.primary} />
                <Text style={[styles.vehicleText, { color: theme.text }]}>
                  {RIDE_DETAILS.vehicle.make} • {RIDE_DETAILS.vehicle.color}
                </Text>
              </View>
              <View style={styles.vehicleRow}>
                <Ionicons name="reader-outline" size={20} color={theme.primary} />
                <Text style={[styles.vehicleText, { color: theme.text }]}>
                  {RIDE_DETAILS.vehicle.plate}
                </Text>
              </View>
            </View>
          </View>

          {/* Price Breakdown */}
          <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Muhtasari wa Gharama
            </Text>
            <View style={styles.priceBreakdown}>
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: theme.subtleText }]}>
                  Nauli
                </Text>
                <Text style={[styles.priceValue, { color: theme.text }]}>
                  {RIDE_DETAILS.price.currency} {RIDE_DETAILS.price.subtotal.toLocaleString()}
                </Text>
              </View>
              {RIDE_DETAILS.price.discount > 0 && (
                <View style={styles.priceRow}>
                  <Text style={[styles.priceLabel, { color: theme.success }]}>
                    Punguzo
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
                    Bakshishi
                  </Text>
                  <Text style={[styles.priceValue, { color: theme.text }]}>
                    {RIDE_DETAILS.price.currency} {RIDE_DETAILS.price.tip.toLocaleString()}
                  </Text>
                </View>
              )}
              <View style={[styles.priceDivider, { backgroundColor: theme.border }]} />
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabelTotal, { color: theme.text }]}>
                  Jumla
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
                Ukadiriaji Wako
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
              <Text style={styles.actionButtonText}>Agiza Tena</Text>
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
                  Pakua Risiti
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
                  Ripoti Tatizo
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
    paddingTop: 60,
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
