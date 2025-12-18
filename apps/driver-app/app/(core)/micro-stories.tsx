import ScreenLayout from "@/components/ScreenLayout";
import { SkeletonItem } from "@/components/SkeletonLoader";
import { useCurrentTheme } from "@/context/CentralTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";

const { width } = Dimensions.get("window");

const MicroAudioStoriesScreen: React.FC = () => {
  const theme = useCurrentTheme();

  return (
    <ScreenLayout>
      <ScrollView style={[styles.container]}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Ionicons
              name="book-outline"
              size={32}
              color={theme.primary}
              style={styles.headerIcon}
            />
            <Text style={[styles.title, { color: theme.text }]}>
              Micro-Audio Stories
            </Text>
            <Text style={[styles.subtitle, { color: theme.subtleText }]}>
              Loading bite-sized audio tales...
            </Text>
          </View>
        </View>

        {/* Story of the Day */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Story of the Day
          </Text>
          <View
            style={[
              styles.featuredStory,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <SkeletonItem
              width="100%"
              height={140}
              borderRadius={12}
              style={{ marginBottom: 16 }}
            />
            <SkeletonItem width="90%" height={22} style={{ marginBottom: 8 }} />
            <SkeletonItem
              width="70%"
              height={16}
              style={{ marginBottom: 12 }}
            />
            <View style={styles.storyMetadata}>
              <SkeletonItem width={80} height={14} />
              <SkeletonItem width={60} height={14} />
              <SkeletonItem width={90} height={14} />
            </View>
          </View>
        </View>

        {/* Quick Listen Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Quick Listen (Under 5 min)
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Array.from({ length: 6 }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.quickStoryCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <SkeletonItem
                  width={160}
                  height={100}
                  borderRadius={8}
                  style={{ marginBottom: 12 }}
                />
                <SkeletonItem
                  width="85%"
                  height={16}
                  style={{ marginBottom: 6 }}
                />
                <SkeletonItem
                  width="65%"
                  height={14}
                  style={{ marginBottom: 8 }}
                />
                <SkeletonItem width={60} height={12} />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Story Categories
          </Text>
          <View style={styles.categoriesGrid}>
            {Array.from({ length: 6 }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.categoryCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <SkeletonItem
                  width={50}
                  height={50}
                  borderRadius={25}
                  style={{ marginBottom: 8 }}
                />
                <SkeletonItem
                  width="80%"
                  height={14}
                  style={{ marginBottom: 4 }}
                />
                <SkeletonItem width="60%" height={12} />
              </View>
            ))}
          </View>
        </View>

        {/* Latest Stories */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Latest Stories
          </Text>
          {Array.from({ length: 5 }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.storyItem,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <SkeletonItem
                width={70}
                height={70}
                borderRadius={8}
                style={{ marginRight: 16 }}
              />
              <View style={styles.storyContent}>
                <SkeletonItem
                  width="90%"
                  height={18}
                  style={{ marginBottom: 6 }}
                />
                <SkeletonItem
                  width="75%"
                  height={14}
                  style={{ marginBottom: 8 }}
                />
                <View style={styles.storyInfo}>
                  <SkeletonItem width={70} height={12} />
                  <SkeletonItem width={50} height={12} />
                  <SkeletonItem width={60} height={12} />
                </View>
              </View>
              <View style={styles.playButton}>
                <SkeletonItem width={36} height={36} borderRadius={18} />
              </View>
            </View>
          ))}
        </View>

        {/* Narrator Spotlight */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Narrator Spotlight
          </Text>
          <View
            style={[
              styles.narratorCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <SkeletonItem
              width={80}
              height={80}
              borderRadius={40}
              style={{ marginRight: 16 }}
            />
            <View style={styles.narratorContent}>
              <SkeletonItem
                width="70%"
                height={20}
                style={{ marginBottom: 8 }}
              />
              <SkeletonItem
                width="85%"
                height={14}
                style={{ marginBottom: 12 }}
              />
              <View style={styles.narratorStats}>
                <SkeletonItem width={80} height={12} />
                <SkeletonItem width={100} height={12} />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerContent: {
    alignItems: "center",
  },
  headerIcon: {
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  featuredStory: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  storyMetadata: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickStoryCard: {
    width: 180,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 12,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryCard: {
    width: (width - 60) / 2,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: 12,
  },
  storyItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  storyContent: {
    flex: 1,
  },
  storyInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  playButton: {
    marginLeft: 12,
  },
  narratorCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  narratorContent: {
    flex: 1,
  },
  narratorStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default MicroAudioStoriesScreen;
