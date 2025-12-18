import ScreenLayout from "@/components/ScreenLayout";
import { SkeletonItem } from "@/components/SkeletonLoader";
import { useCurrentTheme } from "@/context/CentralTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";

const { width } = Dimensions.get("window");

const PlaylistMixesScreen: React.FC = () => {
  const theme = useCurrentTheme();

  return (
    <ScreenLayout>
      <ScrollView style={[styles.container]}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Ionicons
              name="musical-notes-outline"
              size={32}
              color={theme.primary}
              style={styles.headerIcon}
            />
            <Text style={[styles.title, { color: theme.text }]}>
              Copyright-Free Mixes
            </Text>
            <Text style={[styles.subtitle, { color: theme.subtleText }]}>
              Loading curated playlists...
            </Text>
          </View>
        </View>

        {/* Featured Mix Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Today's Featured Mix
          </Text>
          <View
            style={[
              styles.featuredMix,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <SkeletonItem
              width="100%"
              height={200}
              borderRadius={12}
              style={{ marginBottom: 16 }}
            />
            <SkeletonItem width="75%" height={24} style={{ marginBottom: 8 }} />
            <SkeletonItem
              width="55%"
              height={16}
              style={{ marginBottom: 16 }}
            />
            <View style={styles.mixMetadata}>
              <SkeletonItem width={80} height={14} />
              <SkeletonItem width={100} height={14} />
            </View>
          </View>
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Browse by Mood
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Array.from({ length: 5 }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.moodCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <SkeletonItem
                  width={120}
                  height={80}
                  borderRadius={8}
                  style={{ marginBottom: 8 }}
                />
                <SkeletonItem width="80%" height={16} />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Popular Mixes Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Popular This Week
          </Text>
          {Array.from({ length: 6 }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.mixItem,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <SkeletonItem
                width={80}
                height={80}
                borderRadius={8}
                style={{ marginRight: 16 }}
              />
              <View style={styles.mixContent}>
                <SkeletonItem
                  width="85%"
                  height={18}
                  style={{ marginBottom: 6 }}
                />
                <SkeletonItem
                  width="65%"
                  height={14}
                  style={{ marginBottom: 8 }}
                />
                <View style={styles.mixInfo}>
                  <SkeletonItem width={60} height={12} />
                  <SkeletonItem width={80} height={12} />
                </View>
              </View>
              <View style={styles.playButton}>
                <SkeletonItem width={40} height={40} borderRadius={20} />
              </View>
            </View>
          ))}
        </View>

        {/* Genres Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Explore Genres
          </Text>
          <View style={styles.genresGrid}>
            {Array.from({ length: 8 }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.genreCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <SkeletonItem
                  width="100%"
                  height={60}
                  borderRadius={8}
                  style={{ marginBottom: 8 }}
                />
                <SkeletonItem width="70%" height={14} />
              </View>
            ))}
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
  featuredMix: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  mixMetadata: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  moodCard: {
    width: 140,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 12,
    alignItems: "center",
  },
  mixItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  mixContent: {
    flex: 1,
  },
  mixInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  playButton: {
    marginLeft: 12,
  },
  genresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  genreCard: {
    width: (width - 60) / 2,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: 12,
  },
});

export default PlaylistMixesScreen;
