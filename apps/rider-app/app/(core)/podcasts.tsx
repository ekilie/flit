import ScreenLayout from "@/components/ScreenLayout";
import { useCurrentTheme } from "@/context/CentralTheme";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import React, { use, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import { usePodcasts } from "@/hooks/usePodcasts";
import { usePodcastPlayer } from "@/hooks/usePodcastPlayer";
import { Podcast } from "@/lib/api/types";
import { BLURHASH } from "@/constants/constants";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const GENRE_FILTERS = [
  "All",
  "Technology",
  "Health",
  "Business",
  "Education",
  "Entertainment",
  "News",
  "Science",
];

const SORT_OPTIONS = [
  { label: "Most Popular", value: "popular" },
  { label: "Title A-Z", value: "title-asc" },
  { label: "Recently Added", value: "recent" },
  { label: "Highest Rated", value: "rating" },
];

// Podcast Card Component
interface PodcastCardProps {
  podcast: Podcast;
  onPress: () => void;
  onSubscribe: () => void;
  index: number;
}

const PodcastCard: React.FC<PodcastCardProps> = ({
  podcast,
  onPress,
  onSubscribe,
  index,
}) => {
  const theme = useCurrentTheme();
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSubscribe = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSubscribe();
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim,
      }}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.podcastCard,
          { backgroundColor: theme.card, borderColor: theme.border },
          pressed && { opacity: 0.7 },
        ]}
      >
        <View style={styles.podcastArtwork}>
          <Image
            source={{ uri: podcast.artwork }}
            placeholder={{ blurhash: BLURHASH }}
            contentFit="cover"
            transition={1000}
            style={[StyleSheet.absoluteFillObject, {
              borderRadius: 8,
            }]}
          />
        </View>

        <View style={styles.podcastInfo}>
          <Text
            style={[styles.podcastTitle, { color: theme.text }]}
            numberOfLines={1}
          >
            {podcast.title}
          </Text>
          <Text
            style={[styles.podcastHost, { color: theme.subtleText }]}
            numberOfLines={1}
          >
            {podcast.host}
          </Text>
          <Text
            style={[styles.podcastDescription, { color: theme.mutedText }]}
            numberOfLines={2}
          >
            {podcast.description}
          </Text>

          <View style={styles.podcastMeta}>
            <View style={styles.metaItem}>
              <Ionicons
                name="albums-outline"
                size={14}
                color={theme.subtleText}
              />
              <Text style={[styles.metaText, { color: theme.subtleText }]}>
                {podcast.episodes} episodes
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons
                name="people-outline"
                size={14}
                color={theme.subtleText}
              />
              <Text style={[styles.metaText, { color: theme.subtleText }]}>
                {podcast.subscribers}
              </Text>
            </View>
          </View>

          {podcast.progress > 0 && (
            <View style={styles.progressContainer}>
              <View
                style={[
                  styles.progressBar,
                  { backgroundColor: `${podcast.color}20` },
                ]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${podcast.progress * 100}%`,
                      backgroundColor: podcast.color,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.progressText, { color: theme.mutedText }]}>
                {Math.round(podcast.progress * 100)}% complete
              </Text>
            </View>
          )}
        </View>

        <Pressable
          onPress={handleSubscribe}
          style={[
            styles.subscribeButton,
            {
              backgroundColor: podcast.is_subscribed
                ? `${podcast.color}20`
                : podcast.color,
            },
          ]}
        >
          <Ionicons
            name={podcast.is_subscribed ? "checkmark" : "add"}
            size={18}
            color={podcast.is_subscribed ? podcast.color : "white"}
          />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
};

// Episode Item Component
interface EpisodeItemProps {
  episode: {
    title: string;
    duration: string;
    date: string;
    podcast: string;
  };
  color: string;
  onPlay: () => void;
}

const EpisodeItem: React.FC<EpisodeItemProps> = ({
  episode,
  color,
  onPlay,
}) => {
  const theme = useCurrentTheme();

  const handlePlay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPlay();
  };

  return (
    <Pressable
      style={[
        styles.episodeItem,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
      onPress={handlePlay}
    >
      <View style={styles.episodeIcon}>
        <LinearGradient
          colors={[`${color}40`, `${color}20`]}
          style={styles.episodeIconGradient}
        >
          <Ionicons name="play" size={16} color={color} />
        </LinearGradient>
      </View>
      <View style={styles.episodeContent}>
        <Text
          style={[styles.episodeTitle, { color: theme.text }]}
          numberOfLines={2}
        >
          {episode.title}
        </Text>
        <Text style={[styles.episodePodcast, { color: theme.subtleText }]}>
          {episode.podcast}
        </Text>
        <View style={styles.episodeMeta}>
          <Text style={[styles.episodeMetaText, { color: theme.mutedText }]}>
            {episode.date}
          </Text>
          <Text style={[styles.episodeMetaText, { color: theme.mutedText }]}>
            {episode.duration}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const PodcastsScreen: React.FC = () => {
  const theme = useCurrentTheme();
  const {
    podcasts,
    trendingPodcasts,
    subscribedPodcasts,
    recentEpisodes,
    loading,
    refreshing,
    error,
    fetchPodcasts,
    subscribeToPodcast,
    unsubscribeFromPodcast,
    refresh,
  } = usePodcasts();
  const { playPodcastEpisode } = usePodcastPlayer();

  const [selectedGenre, setSelectedGenre] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [sortBy, setSortBy] = useState("popular");
  const [showSortOptions, setShowSortOptions] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;
  const notificationAnim = useRef(new Animated.Value(0)).current;
  const sortAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    Animated.timing(searchAnim, {
      toValue: showSearch ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showSearch]);

  useEffect(() => {
    Animated.timing(notificationAnim, {
      toValue: showNotifications ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showNotifications]);

  useEffect(() => {
    Animated.timing(sortAnim, {
      toValue: showSortOptions ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showSortOptions]);

  // I only fetch podcasts when genre or search changes
  useEffect(() => {
    const filters: any = {};

    if (selectedGenre !== "All") {
      filters.genre = selectedGenre;
    }

    if (searchQuery.trim()) {
      filters.search = searchQuery;
    }

    const delayDebounce = searchQuery.trim()
      ? setTimeout(() => {
          fetchPodcasts(filters);
        }, 500)
      : null;

    if (!searchQuery.trim()) {
      fetchPodcasts(filters);
    }

    return () => {
      if (delayDebounce) {
        clearTimeout(delayDebounce);
      }
    };
  }, [selectedGenre, searchQuery, sortBy, fetchPodcasts]);

  const handleSubscribe = async (podcastId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const podcast = podcasts?.find((p) => p.id === podcastId);
    if (podcast?.is_subscribed) {
      await unsubscribeFromPodcast(podcastId);
    } else {
      await subscribeToPodcast(podcastId);
    }
  };

  const handlePodcastPress = (podcast: Podcast) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log("Opening podcast:", podcast.title);
  };

  const handleEpisodePlay = (episode: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Play the episode with podcast context if available
    const podcast = podcasts?.find(p => p.id === episode.podcast_id);
    playPodcastEpisode(episode, podcast, recentEpisodes);
  };

  const handleRefresh = async () => {
    await refresh();
  };

  const handleGenreSelect = (genre: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedGenre(genre);
  };

  const handleSortSelect = (sortValue: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSortBy(sortValue);
    setShowSortOptions(false);
  };

  // Client-side filtering and sorting for better user experience
  const filteredAndSortedPodcasts = React.useMemo(() => {
    let filteredPodcasts = [...podcasts];

    // Client-side category filtering (backup in case server doesn't filter)
    if (selectedGenre !== "All") {
      filteredPodcasts = filteredPodcasts.filter(
        (podcast) =>
          podcast.category?.toLowerCase() === selectedGenre.toLowerCase()
      );
    }

    // Client-side search filtering (backup in case server doesn't filter)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredPodcasts = filteredPodcasts.filter(
        (podcast) =>
          podcast.title.toLowerCase().includes(query) ||
          podcast.host?.toLowerCase().includes(query) ||
          podcast.description?.toLowerCase().includes(query) ||
          podcast.category?.toLowerCase().includes(query)
      );
    }

    // Sort podcasts based on selected option
    filteredPodcasts.sort((a, b) => {
      switch (sortBy) {
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "recent":
          // For recent, maintain original order
          return 0;
        case "popular":
        default:
          // Sort by rating first, then by title
          if (a.rating && b.rating) {
            return b.rating - a.rating;
          }
          return a.title.localeCompare(b.title);
      }
    });

    return filteredPodcasts;
  }, [podcasts, selectedGenre, searchQuery, sortBy]);

  const podcastsWithProgress = filteredAndSortedPodcasts.filter(
    (p) => p.progress > 0
  );

  return (
    <ScreenLayout>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {loading && podcasts.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.text }]}>
              Loading podcasts...
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={theme.primary}
              />
            }
          >
            {/* Hero Header Section */}
            <View style={styles.heroSection}>
              <View style={styles.header}>
                <View style={styles.headerTop}>
                  <View style={styles.headerContent}>
                    <Ionicons
                      name="radio"
                      size={32}
                      color="#45B7D1"
                      style={styles.headerIcon}
                    />
                    <View>
                      <Text style={[styles.title, { color: theme.text }]}>
                        Podcasts
                      </Text>
                      <Text
                        style={[styles.subtitle, { color: theme.subtleText }]}
                      >
                        Discover amazing shows
                      </Text>
                    </View>
                  </View>

                  <View style={styles.headerActions}>
                    <Pressable
                      onPress={() =>
                        router.push("/(core)/(formsheets)/podcasts-subscriptions")
                      }
                      style={[
                        styles.headerActionButton,
                        { backgroundColor: theme.card },
                      ]}
                    >
                      <Ionicons
                        name="notifications-outline"
                        size={20}
                        color={theme.text}
                      />
                      {subscribedPodcasts.length > 0 && (
                        <View
                          style={[
                            styles.notificationBadge,
                            { backgroundColor: "#FF6B6B" },
                          ]}
                        >
                          <Text style={styles.notificationBadgeText}>
                            {subscribedPodcasts.length}
                          </Text>
                        </View>
                      )}
                    </Pressable>
                    <Pressable
                      onPress={() => setShowSortOptions(!showSortOptions)}
                      style={[
                        styles.headerActionButton,
                        {
                          backgroundColor: showSortOptions
                            ? theme.primary + "20"
                            : theme.card,
                        },
                      ]}
                    >
                      <Ionicons
                        name="funnel-outline"
                        size={20}
                        color={showSortOptions ? theme.primary : theme.text}
                      />
                    </Pressable>
                    <Pressable
                      onPress={() => setShowSearch(!showSearch)}
                      style={[
                        styles.headerActionButton,
                        {
                          backgroundColor: showSearch
                            ? theme.primary + "20"
                            : theme.card,
                        },
                      ]}
                    >
                      <Ionicons
                        name={showSearch ? "close" : "search"}
                        size={20}
                        color={showSearch ? theme.primary : theme.text}
                      />
                    </Pressable>
                  </View>
                </View>

                {/* Search Bar */}
                {showSearch && (
                  <Animated.View
                    style={[
                      styles.searchContainer,
                      {
                        opacity: searchAnim,
                        transform: [
                          {
                            translateY: searchAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [-20, 0],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.searchBar,
                        { backgroundColor: theme.card },
                      ]}
                    >
                      <Ionicons
                        name="search"
                        size={18}
                        color={theme.subtleText}
                      />
                      <TextInput
                        style={[styles.searchInput, { color: theme.text }]}
                        placeholder="Search podcasts..."
                        placeholderTextColor={theme.subtleText}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus
                      />
                    </View>
                  </Animated.View>
                )}

                {/* Sort Options */}
                {showSortOptions && (
                  <Animated.View
                    style={[
                      styles.searchContainer,
                      {
                        opacity: sortAnim,
                        transform: [
                          {
                            translateY: sortAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [-20, 0],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.searchBar,
                        { backgroundColor: theme.card },
                      ]}
                    >
                      <Text
                        style={[
                          styles.searchInput,
                          {
                            color: theme.text,
                            fontSize: 14,
                            fontWeight: "600",
                          },
                        ]}
                      >
                        Sort by:{" "}
                        {
                          SORT_OPTIONS.find((option) => option.value === sortBy)
                            ?.label
                        }
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: 8,
                        marginTop: 12,
                      }}
                    >
                      {SORT_OPTIONS.map((option) => (
                        <Pressable
                          key={option.value}
                          onPress={() => handleSortSelect(option.value)}
                          style={[
                            {
                              paddingHorizontal: 16,
                              paddingVertical: 8,
                              borderRadius: 12,
                              borderWidth: 1,
                              borderColor:
                                sortBy === option.value
                                  ? theme.primary
                                  : theme.border,
                              backgroundColor:
                                sortBy === option.value
                                  ? theme.primary + "20"
                                  : "transparent",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              {
                                fontSize: 13,
                                fontWeight: "500",
                                color:
                                  sortBy === option.value
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
                  </Animated.View>
                )}
              </View>
            </View>

            {/* Genre Filters */}
            <View style={styles.genreSection}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.genreScroll}
              >
                {GENRE_FILTERS.map((genre) => (
                  <Pressable
                    key={genre}
                    onPress={() => handleGenreSelect(genre)}
                    style={[
                      styles.genreChip,
                      {
                        backgroundColor:
                          selectedGenre === genre ? "#45B7D1" : theme.card,
                        borderColor:
                          selectedGenre === genre ? "#45B7D1" : theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.genreText,
                        {
                          color: selectedGenre === genre ? "white" : theme.text,
                        },
                      ]}
                    >
                      {genre}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Continue Listening Section */}
            {podcastsWithProgress.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Continue Listening
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScroll}
                >
                  {podcastsWithProgress.map((podcast, index) => (
                    <PodcastCard
                      key={podcast.id}
                      podcast={podcast}
                      onPress={() => handlePodcastPress(podcast)}
                      onSubscribe={() => handleSubscribe(podcast.id)}
                      index={index}
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Trending Now - Hero Section */}
            {trendingPodcasts.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Trending Now
                </Text>
                {trendingPodcasts.slice(0, 1).map((podcast) => (
                  <Pressable
                    key={podcast.id}
                    onPress={() => handlePodcastPress(podcast)}
                    style={[
                      styles.trendingCard,
                      {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <View style={styles.trendingArtwork}>
                      <Image
                        source={{ uri: podcast.artwork }}
                        placeholder={{ blurhash: BLURHASH }}
                        contentFit="cover"
                        transition={1000}
                        style={[
                          StyleSheet.absoluteFillObject,
                          {
                            borderRadius: 9,
                          },
                        ]}
                      />
                      <View style={styles.trendingBadge}>
                        <Ionicons name="flame" size={12} color="#FF6B6B" />
                        <Text style={styles.trendingBadgeText}>Trending</Text>
                      </View>
                    </View>
                    <Text style={[styles.trendingTitle, { color: theme.text }]}>
                      {podcast.title}
                    </Text>
                    <Text
                      style={[styles.trendingHost, { color: theme.subtleText }]}
                    >
                      {podcast.host ? `Hosted by ${podcast.host}` : ""}
                    </Text>
                    <Text
                      style={[
                        styles.trendingDescription,
                        { color: theme.mutedText },
                      ]}
                    >
                      {podcast.description}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            {/* New Episodes */}
            {recentEpisodes.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  New Episodes
                </Text>
                {recentEpisodes.map((episode, index) => (
                  <EpisodeItem
                    key={`${episode.id}-${index}`}
                    episode={{
                      title: episode.title,
                      duration: episode.duration,
                      date: episode.date,
                      podcast: episode.podcast,
                    }}
                    color={episode.color}
                    onPlay={() => handleEpisodePlay(episode)}
                  />
                ))}
              </View>
            )}

            {/* Your Podcasts */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                {selectedGenre === "All" ? "All Podcasts" : selectedGenre}
              </Text>
              {filteredAndSortedPodcasts.length === 0 && !loading ? (
                <View style={styles.emptyState}>
                  <Text
                    style={[styles.emptyStateText, { color: theme.mutedText }]}
                  >
                    {searchQuery
                      ? "No podcasts found matching your search"
                      : "No podcasts available"}
                  </Text>
                </View>
              ) : (
                filteredAndSortedPodcasts.map(
                  (podcast: Podcast, index: number) => (
                    <PodcastCard
                      key={podcast.id}
                      podcast={podcast}
                      onPress={() => handlePodcastPress(podcast)}
                      onSubscribe={() => handleSubscribe(podcast.id)}
                      index={index}
                    />
                  )
                )
              )}
            </View>
          </ScrollView>
        )}
      </Animated.View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroSection: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  headerIcon: {
    marginRight: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  headerActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  searchContainer: {
    marginTop: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },

  genreSection: {
    paddingVertical: 16,
  },
  genreScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  genreChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  genreText: {
    fontSize: 14,
    fontWeight: "500",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  horizontalScroll: {
    gap: 12,
  },
  // Podcast Card Styles
  podcastCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
    width: width - 40,
  },
  podcastArtwork: {
    width: 80,
    height: 80,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  podcastInfo: {
    flex: 1,
  },
  podcastTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  podcastHost: {
    fontSize: 14,
    marginBottom: 8,
  },
  podcastDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  podcastMeta: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 12,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
  },
  subscribeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  // Trending Card Styles
  trendingCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  trendingArtwork: {
    height: 160,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    position: "relative",
  },
  trendingBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  trendingBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FF6B6B",
  },
  trendingTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 6,
  },
  trendingHost: {
    fontSize: 14,
    marginBottom: 8,
  },
  trendingDescription: {
    fontSize: 13,
    lineHeight: 20,
  },
  // Episode Item Styles
  episodeItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    gap: 12,
  },
  episodeIcon: {
    width: 48,
    height: 48,
  },
  episodeIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  episodeContent: {
    flex: 1,
  },
  episodeTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  episodePodcast: {
    fontSize: 13,
    marginBottom: 6,
  },
  episodeMeta: {
    flexDirection: "row",
    gap: 12,
  },
  episodeMetaText: {
    fontSize: 11,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: "center",
  },
});

export default PodcastsScreen;
