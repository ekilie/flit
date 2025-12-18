import { View, Text, Animated, StyleSheet, ScrollView, Pressable } from "react-native";
import React, { useEffect, useRef } from "react";
import { usePodcasts } from "@/hooks/usePodcasts";
import { BLURHASH } from "@/constants/constants";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import ScreenLayout from "@/components/ScreenLayout";
import { useCurrentTheme } from "@/context/CentralTheme";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

export default function PodcastsSubscriptions() {
  const theme = useCurrentTheme();
  const { subscribedPodcasts } = usePodcasts();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePodcastPress = (podcast: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to podcast details or handle action
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIcon, { backgroundColor: `${theme.primary}15` }]}>
        <Ionicons name="radio-outline" size={48} color={theme.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        No Subscriptions Yet
      </Text>
      <Text style={[styles.emptyDescription, { color: theme.subtleText }]}>
        Subscribe to podcasts to see them here
      </Text>
    </View>
  );

  return (
    <ScreenLayout>
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={[styles.headerIcon, { backgroundColor: `${theme.primary}15` }]}>
              <Ionicons name="headset" size={28} color={theme.primary} />
            </View>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: theme.text }]}>
                Your Podcasts
              </Text>
              <Text style={[styles.subtitle, { color: theme.subtleText }]}>
                {subscribedPodcasts.length} subscription{subscribedPodcasts.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {subscribedPodcasts.length === 0 ? (
            renderEmptyState()
          ) : (
            <>
              {/* Stats Card */}
              <View style={[styles.statsCard, { 
                backgroundColor: theme.card,
                borderColor: theme.border 
              }]}>
                <LinearGradient
                  colors={[`${theme.primary}10`, `${theme.primary}05`]}
                  style={styles.statsGradient}
                >
                  <View style={styles.statsContent}>
                    <View style={styles.statItem}>
                      <Text style={[styles.statNumber, { color: theme.primary }]}>
                        {subscribedPodcasts.length}
                      </Text>
                      <Text style={[styles.statLabel, { color: theme.subtleText }]}>
                        Subscriptions
                      </Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={[styles.statNumber, { color: theme.primary }]}>
                        {subscribedPodcasts.length * 12}
                      </Text>
                      <Text style={[styles.statLabel, { color: theme.subtleText }]}>
                        Episodes
                      </Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={[styles.statNumber, { color: theme.primary }]}>
                        {Math.floor(Math.random() * 50) + 10}
                      </Text>
                      <Text style={[styles.statLabel, { color: theme.subtleText }]}>
                        Hours
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>

              {/* Podcast List */}
              <View style={styles.podcastList}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Your Subscriptions
                </Text>
                {subscribedPodcasts.map((podcast, index) => (
                  <Pressable
                    key={podcast.id}
                    onPress={() => handlePodcastPress(podcast)}
                    style={({ pressed }) => [
                      styles.podcastCard,
                      {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                        opacity: pressed ? 0.8 : 1,
                        transform: [{ scale: pressed ? 0.98 : 1 }],
                      },
                    ]}
                  >
                    {/* Podcast Artwork */}
                    <View style={styles.podcastArtwork}>
                      <Image
                        source={{ uri: podcast.artwork }}
                        placeholder={{ blurhash: BLURHASH }}
                        contentFit="cover"
                        transition={1000}
                        style={StyleSheet.absoluteFillObject}
                      />
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.3)']}
                        style={styles.artworkOverlay}
                      />
                      {/* Play button overlay */}
                      <View style={styles.playOverlay}>
                        <Ionicons name="play" size={16} color="white" />
                      </View>
                    </View>

                    {/* Podcast Info */}
                    <View style={styles.podcastInfo}>
                      <Text 
                        style={[styles.podcastTitle, { color: theme.text }]}
                        numberOfLines={2}
                      >
                        {podcast.title}
                      </Text>
                      <Text 
                        style={[styles.podcastHost, { color: theme.subtleText }]}
                        numberOfLines={1}
                      >
                        {podcast.host}
                      </Text>
                      
                      {/* Podcast Meta */}
                      <View style={styles.podcastMeta}>
                        <View style={styles.metaItem}>
                          <Ionicons name="time-outline" size={12} color={theme.subtleText} />
                          <Text style={[styles.metaText, { color: theme.subtleText }]}>
                            {podcast.release_frequency || 'Weekly'}
                          </Text>
                        </View>
                        <View style={styles.metaItem}>
                          <Ionicons name="list-outline" size={12} color={theme.subtleText} />
                          <Text style={[styles.metaText, { color: theme.subtleText }]}>
                            {Math.floor(Math.random() * 20) + 5} episodes
                          </Text>
                        </View>
                      </View>

                      {/* Category Badge */}
                      {podcast.category && (
                        <View style={[styles.categoryBadge, { backgroundColor: `${theme.primary}15` }]}>
                          <Text style={[styles.categoryText, { color: theme.primary }]}>
                            {podcast.category}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Subscription Status */}
                    <View style={styles.statusContainer}>
                      <View style={[styles.subscribedBadge, { backgroundColor: theme.primary }]}>
                        <Ionicons name="checkmark" size={12} color="white" />
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </Animated.View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    opacity: 0.8,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    opacity: 0.7,
  },
  statsCard: {
    borderRadius: 20,
    marginBottom: 28,
    borderWidth: 1,
    overflow: "hidden",
  },
  statsGradient: {
    padding: 20,
  },
  statsContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(0,0,0,0.1)",
    marginHorizontal: 16,
  },
  podcastList: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  podcastCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  podcastArtwork: {
    width: 64,
    height: 64,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  artworkOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  playOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    opacity: 0.8,
  },
  podcastInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: "space-between",
  },
  podcastTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  podcastHost: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.8,
  },
  podcastMeta: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontWeight: "500",
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statusContainer: {
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingLeft: 8,
  },
  subscribedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});