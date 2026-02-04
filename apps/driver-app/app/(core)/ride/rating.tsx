import ScreenLayout from "@/components/ScreenLayout";
import { useCurrentTheme } from "@/context/CentralTheme";
import { useHaptics } from "@/hooks/useHaptics";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import Api from "@/lib/api";
import { toast } from "yooo-native";
import { Ride } from "@/lib/api/types";

const { width } = Dimensions.get("window");

const TIP_OPTIONS = [
  { id: "no-tip", label: "No Tip", amount: 0 },
  { id: "small", label: "TSh 2,000", amount: 2000 },
  { id: "medium", label: "TSh 5,000", amount: 5000 },
  { id: "large", label: "TSh 10,000", amount: 10000 },
];

const FEEDBACK_OPTIONS = [
  { id: "clean", label: "Clean", icon: "sparkles-outline" },
  { id: "professional", label: "Professional", icon: "shield-checkmark-outline" },
  { id: "friendly", label: "Friendly", icon: "happy-outline" },
  { id: "safe", label: "Safe", icon: "checkmark-circle-outline" },
  { id: "ontime", label: "On Time", icon: "time-outline" },
];

export default function RideRatingScreen() {
  const theme = useCurrentTheme();
  const router = useRouter();
  const haptics = useHaptics();
  const params = useLocalSearchParams();
  const rideId = params.rideId as string;
  const riderId = params.riderId as string;
  const riderName = params.riderName as string || "Rider";
  
  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [selectedTip, setSelectedTip] = useState("no-tip");
  const [selectedFeedback, setSelectedFeedback] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchRide = async () => {
      if (!rideId) {
        toast.error("Missing ride information");
        router.back();
        return;
      }
      
      try {
        const rideData = await Api.getRide(parseInt(rideId));
        setRide(rideData);
      } catch (error) {
        console.error("Failed to fetch ride:", error);
        toast.error("Failed to load ride details");
      } finally {
        setLoading(false);
      }
    };

    fetchRide();
  }, [rideId]);

  const handleStarPress = (star: number) => {
    haptics.selection();
    setRating(star);
  };

  const handleFeedbackToggle = (feedbackId: string) => {
    haptics.selection();
    setSelectedFeedback((prev) =>
      prev.includes(feedbackId)
        ? prev.filter((id) => id !== feedbackId)
        : [...prev, feedbackId]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      haptics.error();
      toast.error("Please select a rating");
      return;
    }

    if (!rideId || !riderId) {
      haptics.error();
      toast.error("Missing ride information");
      return;
    }
    
    try {
      haptics.success();
      setIsSubmitting(true);
      
      // Submit rating to backend
      await Api.createRating({
        rideId: parseInt(rideId),
        raterId: parseInt(riderId), // Rating the rider
        rating,
        comment: comment || undefined,
      });
      
      toast.success("Rating submitted successfully!");
      
      // Navigate back to home
      router.replace("/(core)/(tabs)/ride");
    } catch (error: any) {
      console.error("Failed to submit rating:", error);
      toast.error(error.message || "Failed to submit rating");
      haptics.error();
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <ScreenLayout>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Loading ride details...</Text>
        </View>
      </ScreenLayout>
    );
  }

  if (!ride) {
    return (
      <ScreenLayout>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={[styles.errorText, { color: theme.text }]}>Failed to load ride details</Text>
          <Pressable
            style={[styles.backButton, { backgroundColor: theme.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              styles.closeButton,
              {
                backgroundColor: theme.cardBackground,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={24} color={theme.text} />
          </Pressable>
        </View>

        {/* Trip Summary Card */}
        <View style={[styles.tripCard, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.successIcon}>
            <View style={[styles.successIconCircle, { backgroundColor: `${theme.success}15` }]}>
              <Ionicons name="checkmark-circle" size={48} color={theme.success} />
            </View>
          </View>

          <Text style={[styles.title, { color: theme.text }]}>
            Trip Completed!
          </Text>
          <Text style={[styles.subtitle, { color: theme.subtleText }]}>
            {formatDate(ride.createdAt)}
          </Text>

          <View style={styles.tripDetails}>
            <View style={styles.tripRoute}>
              <View style={[styles.routeDot, { backgroundColor: theme.primary }]} />
              <Text style={[styles.routeText, { color: theme.text }]} numberOfLines={1}>
                {ride.pickupAddress.split(",")[0]}
              </Text>
            </View>
            <View style={[styles.routeLine, { backgroundColor: theme.border }]} />
            <View style={styles.tripRoute}>
              <View style={[styles.routeDot, { backgroundColor: theme.success }]} />
              <Text style={[styles.routeText, { color: theme.text }]} numberOfLines={1}>
                {ride.dropoffAddress.split(",")[0]}
              </Text>
            </View>
          </View>

          <View style={[styles.priceRow, { borderTopColor: theme.border }]}>
            <Text style={[styles.priceLabel, { color: theme.subtleText }]}>
              Total Fare
            </Text>
            <Text style={[styles.priceValue, { color: theme.text }]}>
              TSh {ride.fare?.toLocaleString() || '0'}
            </Text>
          </View>
        </View>

        {/* Rider Rating */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <View style={[styles.driverAvatar, { backgroundColor: theme.primary }]}>
            <Text style={styles.driverInitials}>
              {riderName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </Text>
          </View>

          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Rate {riderName}
          </Text>

          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable
                key={star}
                onPress={() => handleStarPress(star)}
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.7 : 1,
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                  },
                ]}
              >
                <Ionicons
                  name={star <= rating ? "star" : "star-outline"}
                  size={48}
                  color={star <= rating ? "#FFD700" : theme.mutedText}
                  style={styles.star}
                />
              </Pressable>
            ))}
          </View>

          {rating > 0 && (
            <Text style={[styles.ratingText, { color: theme.subtleText }]}>
              {rating === 5
                ? "Excellent!"
                : rating === 4
                ? "Good"
                : rating === 3
                ? "Average"
                : "Needs improvement"}
            </Text>
          )}
        </View>

        {/* Feedback Tags */}
        {rating >= 4 && (
          <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              What did you like?
            </Text>
            <View style={styles.feedbackGrid}>
              {FEEDBACK_OPTIONS.map((option) => (
                <Pressable
                  key={option.id}
                  style={({ pressed }) => [
                    styles.feedbackChip,
                    {
                      backgroundColor: selectedFeedback.includes(option.id)
                        ? `${theme.primary}15`
                        : theme.surface,
                      borderColor: selectedFeedback.includes(option.id)
                        ? theme.primary
                        : theme.border,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                  onPress={() => handleFeedbackToggle(option.id)}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={20}
                    color={
                      selectedFeedback.includes(option.id)
                        ? theme.primary
                        : theme.mutedText
                    }
                  />
                  <Text
                    style={[
                      styles.feedbackLabel,
                      {
                        color: selectedFeedback.includes(option.id)
                          ? theme.primary
                          : theme.text,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Comment Section */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Additional Comments (optional)
          </Text>
          <TextInput
            style={[
              styles.commentInput,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            placeholder="Write your comments here..."
            placeholderTextColor={theme.inputPlaceholder}
            multiline
            numberOfLines={4}
            value={comment}
            onChangeText={setComment}
            textAlignVertical="top"
          />
        </View>

        {/* Tip Section */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.tipHeader}>
            <Ionicons name="cash-outline" size={24} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 0 }]}>
              Add a Tip
            </Text>
          </View>
          <Text style={[styles.tipSubtitle, { color: theme.subtleText }]}>
            Your driver will appreciate it!
          </Text>
          <View style={styles.tipOptions}>
            {TIP_OPTIONS.map((tip) => (
              <Pressable
                key={tip.id}
                style={({ pressed }) => [
                  styles.tipButton,
                  {
                    backgroundColor:
                      selectedTip === tip.id ? `${theme.primary}15` : theme.surface,
                    borderColor: selectedTip === tip.id ? theme.primary : theme.border,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                onPress={() => {
                  haptics.selection();
                  setSelectedTip(tip.id);
                }}
              >
                <Text
                  style={[
                    styles.tipLabel,
                    {
                      color: selectedTip === tip.id ? theme.primary : theme.text,
                      fontWeight: selectedTip === tip.id ? "700" : "600",
                    },
                  ]}
                >
                  {tip.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Submit Button */}
        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            {
              backgroundColor: rating > 0 ? theme.primary : theme.mutedText,
              opacity: pressed || isSubmitting ? 0.8 : 1,
            },
          ]}
          onPress={handleSubmit}
          disabled={rating === 0 || isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? "Submitting..." : "Submit Rating"}
          </Text>
        </Pressable>

        <Pressable
          style={styles.skipButton}
          onPress={() => router.replace("/(core)/(tabs)/ride")}
        >
          <Text style={[styles.skipButtonText, { color: theme.mutedText }]}>
            Skip for now
          </Text>
        </Pressable>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 20,
  },
  closeButton: {
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
  tripCard: {
    padding: 24,
    borderRadius: 20,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  successIcon: {
    marginBottom: 16,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: "center",
  },
  tripDetails: {
    width: "100%",
    marginBottom: 20,
  },
  tripRoute: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  routeText: {
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },
  routeLine: {
    width: 2,
    height: 20,
    marginLeft: 4,
    marginVertical: 4,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingTop: 20,
    borderTopWidth: 1,
  },
  priceLabel: {
    fontSize: 14,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  section: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  driverAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  driverInitials: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 20,
    textAlign: "center",
  },
  starsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  star: {
    marginHorizontal: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
  feedbackGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    width: "100%",
  },
  feedbackChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 6,
  },
  feedbackLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  commentInput: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    minHeight: 100,
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  tipSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
  },
  tipOptions: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  tipButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
  },
  tipLabel: {
    fontSize: 14,
  },
  submitButton: {
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  skipButton: {
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 20,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
