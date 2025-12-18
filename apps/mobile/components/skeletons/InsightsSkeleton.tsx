import FloatingActionButton from "@/components/FloatingActionButton";
import ScreenLayout from "@/components/ScreenLayout";
import { SkeletonItem } from "@/components/SkeletonLoader";
import { useCurrentTheme } from "@/context/CentralTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const InsightsSkeleton: React.FC = () => {
  const theme = useCurrentTheme();

  return (
    <ScreenLayout>
      <View style={[styles.container]}>
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.heroSection}>
              <View style={styles.titleContainer}>
                <Text style={[styles.title, { color: theme.text }]}>
                  Insights
                </Text>
                <Text style={[styles.subtitle, { color: theme.subtleText }]}>
                  Loading your insights...
                </Text>
              </View>
              <View
                style={[
                  styles.heroIcon,
                  { backgroundColor: `${theme.primary}15` },
                ]}
              >
                <Ionicons
                  name="document-text"
                  size={28}
                  color={theme.primary}
                />
              </View>
            </View>
          </View>

          {/* Insights List Skeletons */}
          {Array.from({ length: 6 }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.insightCard,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                },
              ]}
            >
              {/* Header with avatar and name */}
              <View style={styles.cardHeader}>
                <SkeletonItem
                  width={40}
                  height={40}
                  borderRadius={20}
                  style={{ marginRight: 12 }}
                />
                <View style={styles.headerInfo}>
                  <SkeletonItem
                    width={120}
                    height={16}
                    style={{ marginBottom: 4 }}
                  />
                  <SkeletonItem width={80} height={12} />
                </View>
                <SkeletonItem width={24} height={24} borderRadius={12} />
              </View>

              {/* Content */}
              <View style={styles.cardContent}>
                <SkeletonItem
                  width="90%"
                  height={16}
                  style={{ marginBottom: 8 }}
                />
                <SkeletonItem
                  width="75%"
                  height={16}
                  style={{ marginBottom: 8 }}
                />
                <SkeletonItem width="85%" height={16} />
              </View>

              {/* Footer with actions */}
              <View style={styles.cardFooter}>
                <View style={styles.footerLeft}>
                  <SkeletonItem width={60} height={12} />
                </View>
                <View style={styles.footerActions}>
                  <SkeletonItem
                    width={30}
                    height={30}
                    borderRadius={15}
                    style={{ marginLeft: 8 }}
                  />
                  <SkeletonItem
                    width={30}
                    height={30}
                    borderRadius={15}
                    style={{ marginLeft: 8 }}
                  />
                  <SkeletonItem
                    width={30}
                    height={30}
                    borderRadius={15}
                    style={{ marginLeft: 8 }}
                  />
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        <FloatingActionButton icon="add" onPress={() => {}} />
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 8,
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  header: {
    paddingTop: 8,
  },
  heroSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    opacity: 0.8,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  insightCard: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 6,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  headerInfo: {
    flex: 1,
  },
  cardContent: {
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLeft: {
    flex: 1,
  },
  footerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default InsightsSkeleton;
