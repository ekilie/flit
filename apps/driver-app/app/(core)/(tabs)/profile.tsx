import AvatarModal from "@/components/AvatarModal";
import ScreenLayout from "@/components/ScreenLayout";
import MePageSkeleton from "@/components/skeletons/MePageSkeleton";
import StatCard from "@/components/StatCard";
import { useCurrentTheme } from "@/context/CentralTheme";
import { useSession } from "@/context/ctx";
import Api from "@/lib/api";
import { User } from "@/lib/api/types";
import { HapticFeedback } from "@/lib/haptics";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";

// Backend API User structure (camelCase)
interface BackendUser {
  id: number;
  fullName?: string;
  name?: string; // fallback for compatibility
  displayName?: string;
  email: string;
  emailVerified?: boolean;
  phoneNumber?: string;
  isActive?: boolean;
  is_active?: boolean; // fallback for compatibility
  role?: string;
  createdAt?: string;
  created_at?: string; // fallback for compatibility
  updatedAt?: string;
  updated_at?: string; // fallback for compatibility
  lastLogin?: string;
  last_login?: string; // fallback for compatibility
  metadata?: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
    [key: string]: any;
  } | null;
}
import {
  Dimensions,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { alert } from "yooo-native";

const { width } = Dimensions.get("window");

interface SocialLinkProps {
  platform: string;
  username?: string;
  url?: string;
  iconName: string;
  color: string;
}


interface InfoRowProps {
  icon: string;
  label: string;
  value: string;
  iconColor?: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value, iconColor }) => {
  const theme = useCurrentTheme();

  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <MaterialIcons
          name={icon as any}
          size={20}
          color={iconColor || "black"}
        />
        <Text style={[styles.infoLabel, { color: theme.subtleText }]}>
          {label}
        </Text>
      </View>
      <Text style={[styles.infoValue, { color: theme.text }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
};

export default function Profile() {
  const theme = useCurrentTheme();
  const [user, setUser] = useState<BackendUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [rideStats, setRideStats] = useState<{
    totalRides: number;
    thisMonth: number;
    totalSpent: number;
    averageRating: number;
  } | null>(null);

  const { signOut } = useSession();

  const bottomSheetRef = useRef<BottomSheet>(null);

  const fetchUserData = async () => {
    try {
      // API.getCurrentUser() already extracts data from {success: true, data: {...}}
      const userData = await Api.getCurrentUser();
      console.log("User data:", userData);

      setUser(userData as BackendUser);

      // Fetch follow stats
      if (userData?.id) {

        // Fetch ride statistics
        try {
          const rStats = await Api.getRideStatistics(userData.id);
          setRideStats(rStats);
        } catch (error) {
          console.error("Failed to fetch ride statistics:", error);
        }
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Bottom sheet handlers
  const handleOpenBottomSheet = () => {
    HapticFeedback("light");
    bottomSheetRef.current?.expand();
  };

  const handleCloseBottomSheet = () => {
    bottomSheetRef.current?.close();
  };

  const handleLogout = async () => {
    HapticFeedback("medium");
    handleCloseBottomSheet();

    alert.dialog("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          try {
            await Api.logout();
            signOut();
            router.replace("/(auth)/login");
          } catch (error) {
            console.error("Logout error:", error);
          }
        },
      },
    ]);
  };

  const handleSwitchAccount = () => {
    HapticFeedback("light");
    handleCloseBottomSheet();

    alert.dialog(
      "Switch Account",
      "You will be redirected to login to switch accounts.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          style: "default",
          onPress: () => {
            router.replace("/(auth)/login");
          },
        },
      ]
    );
  };

  const getInitials = (name: string | undefined | null) => {
    if (!name || typeof name !== "string") {
      return "U";
    }
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  if (loading) {
    return <MePageSkeleton />;
  }

  if (!user) {
    return (
      <ScreenLayout>
        <View style={styles.centerContainer}>
          <View style={styles.errorContent}>
            <MaterialIcons
              name="error-outline"
              size={64}
              color={theme.mutedText}
            />
            <Text style={[styles.errorTitle, { color: theme.text }]}>
              Profile Unavailable
            </Text>
            <Text
              style={[styles.errorDescription, { color: theme.subtleText }]}
            >
              We couldn't load your profile information. Please check your
              connection and try again.
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.retryButton,
                {
                  backgroundColor: "black",
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              onPress={fetchUserData}
            >
              <Ionicons name="refresh" size={20} color="white" />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </Pressable>
          </View>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={"black"}
            colors={["black"]}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View
          style={[styles.header, { backgroundColor: theme.cardBackground }]}
        >
          <View style={styles.avatarSection}>
            <Pressable
              style={({ pressed }) => [
                styles.avatarContainer,
                {
                  backgroundColor: "black",
                  shadowColor: "black",
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
              onPress={() => {
                HapticFeedback("light");
                setAvatarModalVisible(true);
              }}
            >
              <Text style={styles.avatarText}>{getInitials(user.fullName || user.name)}</Text>
              <View
                style={[styles.statusIndicator, { backgroundColor: "#4CAF50" }]}
              />
            </Pressable>

            <View style={styles.userMainInfo}>
              <Text style={[styles.userName, { color: theme.text }]}>
                {user.displayName || user.fullName || user.name || "User"}
              </Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <Pressable
              style={({ pressed }) => [
                styles.iconButton,
                {
                  backgroundColor: `${"black"}15`,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              onPress={() => {
                HapticFeedback("selection");
                router.push("/(core)/settings");
              }}
            >
              <Ionicons
                name="settings-outline"
                size={22}
                color={"black"}
              />
            </Pressable>
            {/* Logout Button - Opens Bottom Sheet */}
            <Pressable
              style={({ pressed }) => [
                styles.iconButton,
                {
                  backgroundColor: `${"black"}15`,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              onPress={handleOpenBottomSheet}
            >
              <Ionicons
                name="log-out-outline"
                size={22}
                color={"black"}
              />
            </Pressable>
          </View>
        </View>

        {/* Ride Stats Grid */}
        <View style={styles.statsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Ride Statistics
            </Text>
            <MaterialIcons name="directions-car" size={20} color={theme.mutedText} />
          </View>
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Rides"
              value={rideStats?.totalRides || 0}
              description="Completed trips"
              icon="car"
              color="#7BCA88"
            />
            <StatCard
              title="This Month"
              value={rideStats?.thisMonth || 0}
              description="Rides"
              icon="calendar"
              color="#45B7D1"
            />
            <StatCard
              title="Total Spent"
              value={`TSh ${(rideStats?.totalSpent || 0).toLocaleString()}`}
              description="All time"
              icon="cash"
              color="#96CEB4"
            />
            <StatCard
              title="Rating"
              value={rideStats?.averageRating?.toFixed(1) || "0.0"}
              description="Average"
              icon="star"
              color="#FFA726"
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View
          style={[styles.section, { backgroundColor: theme.cardBackground }]}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Quick Actions
            </Text>
            <Ionicons name="flash" size={20} color={theme.mutedText} />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.actionItem,
              {
                backgroundColor: pressed ? theme.highlight : "transparent",
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            onPress={() => {
              HapticFeedback("light");
              router.push("/(core)/ride/history" as any);
            }}
          >
            <View style={[styles.actionIcon, { backgroundColor: `${"black"}15` }]}>
              <Ionicons name="time-outline" size={22} color={"black"} />
            </View>
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, { color: theme.text }]}>Ride History</Text>
              <Text style={[styles.actionSubtitle, { color: theme.subtleText }]}>
                View your past trips
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.mutedText} />
          </Pressable>

          <View
            style={[styles.separator, { backgroundColor: theme.border }]}
          />

          <Pressable
            style={({ pressed }) => [
              styles.actionItem,
              {
                backgroundColor: pressed ? theme.highlight : "transparent",
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            onPress={() => {
              HapticFeedback("light");
              router.push("/(core)/ride/payment" as any);
            }}
          >
            <View style={[styles.actionIcon, { backgroundColor: `${"black"}15` }]}>
              <Ionicons name="card-outline" size={22} color={"black"} />
            </View>
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, { color: theme.text }]}>Payment Methods</Text>
              <Text style={[styles.actionSubtitle, { color: theme.subtleText }]}>
                Manage payment options
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.mutedText} />
          </Pressable>
        </View>

        {/* Account Information */}
        <View
          style={[styles.section, { backgroundColor: theme.cardBackground }]}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Account Information
            </Text>
            <MaterialIcons
              name="verified-user"
              size={20}
              color={theme.mutedText}
            />
          </View>

          <View style={styles.infoContainer}>
            <InfoRow icon="person" label="Full Name" value={user.fullName || user.name || "N/A"} />
            <View
              style={[styles.separator, { backgroundColor: theme.border }]}
            />
            <InfoRow icon="email" label="Email Address" value={user.email} />
            {user.phoneNumber && (
              <>
                <View
                  style={[styles.separator, { backgroundColor: theme.border }]}
                />
                <InfoRow icon="phone" label="Phone Number" value={user.phoneNumber} />
              </>
            )}
            <View
              style={[styles.separator, { backgroundColor: theme.border }]}
            />
            <InfoRow
              icon="calendar-today"
              label="Member Since"
              value={formatDate(user.createdAt || user.created_at || new Date().toISOString())}
            />
            {(user.lastLogin || user.last_login) && (
              <>
                <View
                  style={[styles.separator, { backgroundColor: theme.border }]}
                />
                <InfoRow
                  icon="access-time"
                  label="Last Active"
                  value={formatDate(user.lastLogin || user.last_login || "")}
                />
              </>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Avatar Modal */}
      {user && (
        <AvatarModal
          visible={avatarModalVisible}
          onClose={() => setAvatarModalVisible(false)}
          user={user as any}
        />
      )}

      {/* Account Actions Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={["30%"]}
        enablePanDownToClose={true}
        backdropComponent={BottomSheetBackdrop}
        backgroundStyle={{ backgroundColor: theme.cardBackground }}
        handleIndicatorStyle={{ backgroundColor: theme.mutedText }}
      >
        <BottomSheetView style={styles.bottomSheetContent}>
          <Text style={[styles.bottomSheetTitle, { color: theme.text }]}>
            Account Actions
          </Text>

          {/* Switch Account Option */}
          <Pressable
            style={({ pressed }) => [
              styles.bottomSheetButton,
              {
                backgroundColor: theme.cardBackground,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            onPress={handleSwitchAccount}
          >
            <View style={styles.bottomSheetButtonContent}>
              <Ionicons
                name="swap-horizontal"
                size={24}
                color={"black"}
              />
              <View style={styles.bottomSheetButtonText}>
                <Text
                  style={[styles.bottomSheetButtonTitle, { color: theme.text }]}
                >
                  Switch Account
                </Text>
                <Text
                  style={[
                    styles.bottomSheetButtonDescription,
                    { color: theme.subtleText },
                  ]}
                >
                  Sign in with a different account
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.mutedText}
            />
          </Pressable>

          {/* Logout Option */}
          <Pressable
            style={({ pressed }) => [
              styles.bottomSheetButton,
              {
                backgroundColor: theme.cardBackground,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            onPress={handleLogout}
          >
            <View style={styles.bottomSheetButtonContent}>
              <Ionicons name="log-out-outline" size={24} color="#FF6B6B" />
              <View style={styles.bottomSheetButtonText}>
                <Text
                  style={[styles.bottomSheetButtonTitle, { color: "#FF6B6B" }]}
                >
                  Log Out
                </Text>
                <Text
                  style={[
                    styles.bottomSheetButtonDescription,
                    { color: theme.subtleText },
                  ]}
                >
                  Sign out of your account
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.mutedText}
            />
          </Pressable>
        </BottomSheetView>
      </BottomSheet>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "500",
  },
  errorContent: {
    alignItems: "center",
    padding: 32,
    maxWidth: 280,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  errorDescription: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    padding: 20,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  statusIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "white",
  },
  userMainInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 2,
  },
  userHandle: {
    fontSize: 15,
    marginBottom: 4,
    fontWeight: "500",
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  statsSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  section: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  infoContainer: {
    borderRadius: 12,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    flexShrink: 1,
    marginLeft: 8,
  },
  separator: {
    height: 1,
  },
  socialContainer: {
    gap: 8,
  },
  socialLink: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  socialIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  socialContent: {
    flex: 1,
  },
  socialPlatform: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  socialText: {
    fontSize: 13,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  summaryItem: {
    padding: 16,
    borderRadius: 12,
    minWidth: (width - 96) / 2,
    flex: 1,
    borderLeftWidth: 4,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  footer: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  footerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: "center",
  },
  footerButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  followStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 12,
  },
  followStatButton: {
    alignItems: "center",
  },
  followStatValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  followStatLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  followStatDivider: {
    width: 1,
    height: 24,
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  bottomSheetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  bottomSheetButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  bottomSheetButtonText: {
    marginLeft: 12,
    flex: 1,
  },
  bottomSheetButtonTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  bottomSheetButtonDescription: {
    fontSize: 12,
  },
  cancelButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
  },
});
