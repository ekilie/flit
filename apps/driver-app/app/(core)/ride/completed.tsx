import ScreenLayout from "@/components/ScreenLayout";
import Colors from "@/constants/Colors";
import { useCurrentTheme } from "@/context/CentralTheme";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { toast } from "yooo-native";
import * as Haptics from "expo-haptics";

export default function RideCompletedScreen() {
  const theme = useCurrentTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  
  // Mock ride data
  const rideData = {
    id: params.id || '1',
    earnings: 25000,
    distance: 8.5,
    duration: 14, // minutes
    waitTime: 2, // minutes
    pickup: 'Mlimani City',
    dropoff: 'Airport',
    paymentMethod: 'Cash',
    riderName: 'John Doe',
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please rate your rider');
      return;
    }

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // TODO: API call to submit rating and feedback
      // await Api.rateRider(rideData.id, rating, feedback);
      
      toast.success('Thanks for your feedback!');
      
      // Navigate back to home immediately
      router.replace('/(core)/(tabs)/home');
    } catch (error) {
      toast.error('Failed to submit feedback');
      console.error('Submit feedback error:', error);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => {
              setRating(star);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={48}
              color={star <= rating ? '#f5c724' : theme.border}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <ScreenLayout>
      <StatusBar style={theme.isDark ? "light" : "dark"} />
      
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <View style={[styles.iconCircle, { backgroundColor: `${theme.success}20` }]}>
            <MaterialCommunityIcons name="check-circle" size={64} color={theme.success} />
          </View>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: theme.text }]}>
          🎉 Trip Completed!
        </Text>

        {/* Earnings Card */}
        <View style={[styles.earningsCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.earningsLabel, { color: theme.subtleText }]}>
            💰 You Earned
          </Text>
          <Text style={[styles.earningsAmount, { color: theme.success }]}>
            TSh {rideData.earnings.toLocaleString()}
          </Text>
        </View>

        {/* Trip Summary Card */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            📊 Trip Summary
          </Text>
          
          <View style={styles.summaryRows}>
            <View style={styles.summaryRow}>
              <MaterialCommunityIcons name="map-marker-distance" size={20} color={theme.primary} />
              <Text style={[styles.summaryLabel, { color: theme.subtleText }]}>
                Distance
              </Text>
              <Text style={[styles.summaryValue, { color: theme.text }]}>
                {rideData.distance} km
              </Text>
            </View>

            <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />

            <View style={styles.summaryRow}>
              <MaterialCommunityIcons name="clock-outline" size={20} color={theme.primary} />
              <Text style={[styles.summaryLabel, { color: theme.subtleText }]}>
                Duration
              </Text>
              <Text style={[styles.summaryValue, { color: theme.text }]}>
                {rideData.duration} min
              </Text>
            </View>

            <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />

            <View style={styles.summaryRow}>
              <MaterialCommunityIcons name="timer-outline" size={20} color={theme.primary} />
              <Text style={[styles.summaryLabel, { color: theme.subtleText }]}>
                Wait Time
              </Text>
              <Text style={[styles.summaryValue, { color: theme.text }]}>
                {rideData.waitTime} min
              </Text>
            </View>

            <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />

            <View style={styles.summaryRow}>
              <MaterialCommunityIcons name="cash" size={20} color={theme.primary} />
              <Text style={[styles.summaryLabel, { color: theme.subtleText }]}>
                Total Fare
              </Text>
              <Text style={[styles.summaryValue, { color: theme.primary }]}>
                TSh {rideData.earnings.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Route Card */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            📍 Route
          </Text>
          
          <View style={styles.routeContainer}>
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, styles.pickupDot]} />
              <Text style={[styles.routeText, { color: theme.text }]}>
                {rideData.pickup}
              </Text>
            </View>
            
            <View style={[styles.routeLine, { backgroundColor: theme.border }]} />
            
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, styles.dropoffDot]} />
              <Text style={[styles.routeText, { color: theme.text }]}>
                {rideData.dropoff}
              </Text>
            </View>
          </View>

          <View style={[styles.paymentInfo, { borderTopColor: theme.border }]}>
            <MaterialCommunityIcons name="cash" size={20} color={theme.primary} />
            <Text style={[styles.paymentText, { color: theme.text }]}>
              Payment: {rideData.paymentMethod}
            </Text>
          </View>
        </View>

        {/* Rating Card */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            ⭐ Rate Your Rider
          </Text>
          <Text style={[styles.ratingSubtitle, { color: theme.subtleText }]}>
            How was your experience with {rideData.riderName}?
          </Text>
          
          {renderStars()}

          {rating > 0 && (
            <>
              <Text style={[styles.feedbackLabel, { color: theme.subtleText }]}>
                💬 Optional Feedback
              </Text>
              <TextInput
                style={[styles.feedbackInput, { 
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.border,
                  color: theme.text,
                }]}
                placeholder="Share your experience..."
                placeholderTextColor={theme.inputPlaceholder}
                value={feedback}
                onChangeText={setFeedback}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </>
          )}
        </View>

        {/* Submit Button */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={rating === 0}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={rating === 0 
                ? ['#9ca3af', '#6b7280'] 
                : ['#10b981', '#059669']}
              style={styles.submitButtonGradient}
            >
              <Text style={styles.submitButtonText}>
                Submit & Go Online
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.reportButton, { borderColor: theme.border }]}
            onPress={() => {
              // TODO: Navigate to report issue screen
              toast.info('Report issue feature coming soon');
            }}
          >
            <MaterialCommunityIcons name="alert-circle-outline" size={20} color={theme.error} />
            <Text style={[styles.reportButtonText, { color: theme.error }]}>
              Report Issue
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  earningsCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  earningsLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  earningsAmount: {
    fontSize: 40,
    fontWeight: '700',
  },
  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  summaryRows: {
    gap: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryLabel: {
    flex: 1,
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  summaryDivider: {
    height: 1,
  },
  routeContainer: {
    marginBottom: 16,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  pickupDot: {
    backgroundColor: '#10b981',
  },
  dropoffDot: {
    backgroundColor: '#ef4444',
  },
  routeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  routeLine: {
    width: 2,
    height: 24,
    marginLeft: 5,
    marginVertical: 4,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  paymentText: {
    fontSize: 16,
    fontWeight: '600',
  },
  ratingSubtitle: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  feedbackLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  feedbackInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
  },
  actions: {
    gap: 12,
  },
  submitButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  submitButtonGradient: {
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  reportButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
