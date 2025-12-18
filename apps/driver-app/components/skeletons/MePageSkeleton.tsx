import ScreenLayout from "@/components/ScreenLayout";
import { SkeletonItem } from "@/components/SkeletonLoader";
import { useCurrentTheme } from "@/context/CentralTheme";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";

const { width } = Dimensions.get("window");

const MePageSkeleton: React.FC = () => {
  const theme = useCurrentTheme();

  return (
    <ScreenLayout>
      <ScrollView
        style={[styles.container]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Profile Header Skeleton */}
        <View style={[styles.header, { backgroundColor: theme.card }]}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <SkeletonItem
                width={80}
                height={80}
                borderRadius={40}
                style={{ marginBottom: 8 }}
              />
              <SkeletonItem
                width={12}
                height={12}
                borderRadius={6}
                style={{ position: "absolute", bottom: 8, right: 8 }}
              />
            </View>

            <View style={styles.userMainInfo}>
              <SkeletonItem
                width={140}
                height={22}
                style={{ marginBottom: 6 }}
              />
              <SkeletonItem
                width={100}
                height={16}
                style={{ marginBottom: 6 }}
              />
              <SkeletonItem
                width={180}
                height={14}
                style={{ marginBottom: 12 }}
              />

              {/* Status Row */}
              <View style={styles.statusRow}>
                <SkeletonItem
                  width={8}
                  height={8}
                  borderRadius={4}
                  style={{ marginRight: 8 }}
                />
                <SkeletonItem width={120} height={14} />
              </View>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <SkeletonItem width={44} height={44} borderRadius={22} />
          </View>
        </View>

        {/* Stats Section Skeleton */}
        <View style={styles.statsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Activity Overview
            </Text>
            <MaterialIcons name="analytics" size={20} color={theme.mutedText} />
          </View>
          <View style={styles.statsGrid}>
            {Array.from({ length: 4 }).map((_, index) => (
              <View
                key={index}
                style={[styles.statCard, { backgroundColor: theme.card }]}
              >
                <View style={styles.statHeader}>
                  <SkeletonItem
                    width={40}
                    height={40}
                    borderRadius={20}
                    style={{ marginRight: 12 }}
                  />
                  <SkeletonItem width={50} height={24} />
                </View>
                <SkeletonItem
                  width={80}
                  height={16}
                  style={{ marginTop: 8, marginBottom: 4 }}
                />
                <SkeletonItem width={60} height={12} />
              </View>
            ))}
          </View>
        </View>

        {/* Account Information Section Skeleton */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
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

          {/* Account Info Items */}
          {Array.from({ length: 4 }).map((_, index) => (
            <View key={index} style={styles.infoItem}>
              <SkeletonItem
                width={24}
                height={24}
                borderRadius={12}
                style={{ marginRight: 16 }}
              />
              <View style={styles.infoContent}>
                <SkeletonItem
                  width={100}
                  height={16}
                  style={{ marginBottom: 4 }}
                />
                <SkeletonItem width={160} height={14} />
              </View>
            </View>
          ))}
        </View>

        {/* Social Links Section Skeleton */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Social Links
            </Text>
            <MaterialIcons name="link" size={20} color={theme.mutedText} />
          </View>

          {Array.from({ length: 3 }).map((_, index) => (
            <View key={index} style={styles.socialLink}>
              <SkeletonItem
                width={40}
                height={40}
                borderRadius={20}
                style={{ marginRight: 16 }}
              />
              <View style={styles.socialContent}>
                <SkeletonItem
                  width={80}
                  height={16}
                  style={{ marginBottom: 4 }}
                />
                <SkeletonItem width={120} height={14} />
              </View>
              <SkeletonItem width={20} height={20} borderRadius={10} />
            </View>
          ))}
        </View>

        {/* App Settings Section Skeleton */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              App Settings
            </Text>
            <MaterialIcons name="settings" size={20} color={theme.mutedText} />
          </View>

          {Array.from({ length: 5 }).map((_, index) => (
            <View key={index} style={styles.settingItem}>
              <SkeletonItem
                width={24}
                height={24}
                borderRadius={12}
                style={{ marginRight: 16 }}
              />
              <View style={styles.settingContent}>
                <SkeletonItem
                  width={120}
                  height={16}
                  style={{ marginBottom: 4 }}
                />
                <SkeletonItem width={180} height={12} />
              </View>
              <SkeletonItem width={16} height={16} borderRadius={8} />
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  header: {
    padding: 20,
    borderRadius: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  avatarSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  avatarContainer: {
    alignItems: "center",
    marginRight: 16,
    position: "relative",
  },
  userMainInfo: {
    flex: 1,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButtons: {
    position: "absolute",
    top: 20,
    right: 20,
  },
  statsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: (width - 48) / 2,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  section: {
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  infoContent: {
    flex: 1,
  },
  socialLink: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  socialContent: {
    flex: 1,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  settingContent: {
    flex: 1,
  },
});

export default MePageSkeleton;
