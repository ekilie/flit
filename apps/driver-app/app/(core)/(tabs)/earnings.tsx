import ScreenLayout from "@/components/ScreenLayout";
import Colors from "@/constants/Colors";
import { useCurrentTheme } from "@/context/CentralTheme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { toast } from "yooo-native";

const { width } = Dimensions.get("window");

// Mock data for earnings
const DAILY_EARNINGS = [
  { day: 'Mon', amount: 52000 },
  { day: 'Tue', amount: 48000 },
  { day: 'Wed', amount: 61000 },
  { day: 'Thu', amount: 45000 },
  { day: 'Fri', amount: 55000 },
  { day: 'Sat', amount: 72000 },
  { day: 'Sun', amount: 52000 },
];

const RECENT_TRIPS = [
  {
    id: '1',
    pickup: 'Mlimani City Mall',
    dropoff: 'Julius Nyerere Airport',
    time: '2:30 PM',
    amount: 25000,
  },
  {
    id: '2',
    pickup: 'Masaki',
    dropoff: 'CBD',
    time: '1:45 PM',
    amount: 18000,
  },
  {
    id: '3',
    pickup: 'Kariakoo',
    dropoff: 'Mikocheni',
    time: '12:15 PM',
    amount: 22000,
  },
];

export default function EarningsScreen() {
  const theme = useCurrentTheme();
  const router = useRouter();
  
  const [todayEarnings] = useState(45000);
  const [weekEarnings] = useState(285000);
  const [todayTrips] = useState(5);
  const [weekTrips] = useState(28);
  const [todayOnlineTime] = useState('3h 24m');
  const [weekOnlineTime] = useState('22h 15m');

  const maxEarnings = Math.max(...DAILY_EARNINGS.map(d => d.amount));

  return (
    <ScreenLayout>
      <StatusBar style={theme.isDark ? "light" : "dark"} />
      
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.background }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            💰 Your Earnings
          </Text>
        </View>

        {/* Today's Earnings Card */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.cardLabel, { color: theme.subtleText }]}>
            Today
          </Text>
          <Text style={[styles.earningsAmount, { color: theme.text }]}>
            TSh {todayEarnings.toLocaleString()}
          </Text>
          <Text style={[styles.cardSubtext, { color: theme.mutedText }]}>
            {todayTrips} trips · {todayOnlineTime} online
          </Text>
        </View>

        {/* This Week's Earnings Card */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.cardLabel, { color: theme.subtleText }]}>
            This Week
          </Text>
          <Text style={[styles.earningsAmount, { color: theme.text }]}>
            TSh {weekEarnings.toLocaleString()}
          </Text>
          <Text style={[styles.cardSubtext, { color: theme.mutedText }]}>
            {weekTrips} trips · {weekOnlineTime} online
          </Text>
        </View>

        {/* Earnings Chart */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            📊 This Week's Breakdown
          </Text>
          
          <View style={styles.chart}>
            {DAILY_EARNINGS.map((item, index) => (
              <View key={index} style={styles.chartBar}>
                <View 
                  style={[
                    styles.bar, 
                    { backgroundColor: theme.primary },
                    { height: (item.amount / maxEarnings) * 100 }
                  ]} 
                />
                <Text style={[styles.barLabel, { color: theme.subtleText }]}>
                  {item.day}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Trips */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Recent Trips
            </Text>
            <TouchableOpacity onPress={() => {
              // TODO: Create ride history screen
              toast.info('Ride history coming soon');
            }}>
              <Text style={[styles.viewAllLink, { color: theme.primary }]}>
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {RECENT_TRIPS.map((trip) => (
            <View key={trip.id} style={[styles.tripItem, { borderBottomColor: theme.border }]}>
              <View style={styles.tripInfo}>
                <View style={styles.tripRoute}>
                  <MaterialCommunityIcons 
                    name="map-marker" 
                    size={16} 
                    color={theme.primary} 
                  />
                  <Text style={[styles.tripLocation, { color: theme.text }]}>
                    {trip.pickup}
                  </Text>
                </View>
                <View style={styles.tripRoute}>
                  <MaterialCommunityIcons 
                    name="flag-checkered" 
                    size={16} 
                    color={theme.success} 
                  />
                  <Text style={[styles.tripLocation, { color: theme.text }]}>
                    {trip.dropoff}
                  </Text>
                </View>
                <Text style={[styles.tripTime, { color: theme.mutedText }]}>
                  {trip.time}
                </Text>
              </View>
              <Text style={[styles.tripAmount, { color: theme.text }]}>
                TSh {trip.amount.toLocaleString()}
              </Text>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(core)/earnings/cash-out')}
          >
            <LinearGradient
              colors={[theme.primary, Colors.light.buttonBackground]}
              style={styles.actionButtonGradient}
            >
              <MaterialCommunityIcons name="cash" size={20} color="#000" />
              <Text style={styles.actionButtonText}>Cash Out</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton, { borderColor: theme.border }]}
            onPress={() => {
              // TODO: Create ride history screen
              toast.info('Ride history coming soon');
            }}
          >
            <MaterialCommunityIcons name="history" size={20} color={theme.text} />
            <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
              Trip History
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    borderColor: 'rgba(0,0,0,0.2)',
    borderWidth: StyleSheet.hairlineWidth,

  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  earningsAmount: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardSubtext: {
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  viewAllLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
    marginTop: 16,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  bar: {
    width: 24,
    borderRadius: 4,
    minHeight: 20,
  },
  barLabel: {
    fontSize: 12,
    marginTop: 8,
  },
  tripItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  tripInfo: {
    flex: 1,
  },
  tripRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  tripLocation: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
  tripTime: {
    fontSize: 12,
    marginTop: 4,
  },
  tripAmount: {
    fontSize: 16,
    fontWeight: '700',
    alignSelf: 'center',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
