import ScreenLayout from "@/components/ScreenLayout";
import { useCurrentTheme } from "@/context/CentralTheme";
import { useVoiceMemos } from "@/hooks/useVoiceMemos";
import { VoiceMemo } from "@/lib/api/types";
import { formatDuration } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Animated,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

const { width } = Dimensions.get("window");

const SORT_OPTIONS = [
  { label: "Recent", value: "recent" },
  { label: "Title A-Z", value: "title-asc" },
  { label: "Duration (Short)", value: "duration-asc" },
  { label: "Duration (Long)", value: "duration-desc" },
  { label: "Favorites", value: "favorites" },
];

// Voice Memo Card Component
interface VoiceMemoCardProps {
  memo: VoiceMemo;
  onPress: () => void;
  onPlay: () => void;
  onFavorite: () => void;
  onDelete: () => void;
  index: number;
  isPlaying?: boolean;
}

const VoiceMemoCard: React.FC<VoiceMemoCardProps> = ({
  memo,
  onPress,
  onPlay,
  onFavorite,
  onDelete,
  index,
  isPlaying = false,
}) => {
  const theme = useCurrentTheme();
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 60,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleFavorite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onFavorite();
  };

  const handlePlay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPlay();
  };

  const memoColor = "#FFA726"; // voicenote color from colors.ts

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
          styles.memoCard,
          { backgroundColor: theme.card, borderColor: theme.border },
          pressed && { opacity: 0.7 },
        ]}
      >
        <View style={styles.memoCardContent}>
          {/* Icon/Avatar */}
          <View
            style={[
              styles.memoIcon,
              { backgroundColor: `${memoColor}20` },
            ]}
          >
            <LinearGradient
              colors={[`${memoColor}40`, `${memoColor}20`]}
              style={styles.memoIconGradient}
            >
              <Ionicons name="mic" size={20} color={memoColor} />
            </LinearGradient>
          </View>

          {/* Content */}
          <View style={styles.memoInfo}>
            <Text
              style={[styles.memoTitle, { color: theme.text }]}
              numberOfLines={1}
            >
              {memo.title}
            </Text>
            {memo.description && (
              <Text
                style={[styles.memoDescription, { color: theme.mutedText }]}
                numberOfLines={2}
              >
                {memo.description}
              </Text>
            )}

            <View style={styles.memoMeta}>
              <View style={styles.metaItem}>
                <Ionicons
                  name="pricetag-outline"
                  size={12}
                  color={theme.subtleText}
                />
                <Text style={[styles.metaText, { color: theme.subtleText }]}>
                  {memo.category}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons
                  name="time-outline"
                  size={12}
                  color={theme.subtleText}
                />
                <Text style={[styles.metaText, { color: theme.subtleText }]}>
                  {formatDuration(memo.duration)}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons
                  name="calendar-outline"
                  size={12}
                  color={theme.subtleText}
                />
                <Text style={[styles.metaText, { color: theme.subtleText }]}>
                  {new Date(memo.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.memoActions}>
            <Pressable onPress={handlePlay} style={styles.playButton}>
              <View
                style={[
                  styles.playButtonInner,
                  {
                    backgroundColor: isPlaying ? memoColor : `${memoColor}20`,
                  },
                ]}
              >
                <Ionicons
                  name={isPlaying ? "pause" : "play"}
                  size={16}
                  color={isPlaying ? "white" : memoColor}
                />
              </View>
            </Pressable>
            <Pressable onPress={handleFavorite} style={styles.favoriteButton}>
              <Ionicons
                name={memo.is_favorite ? "heart" : "heart-outline"}
                size={18}
                color={memo.is_favorite ? "#FF6B6B" : theme.subtleText}
              />
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const VoiceMemoryScreen: React.FC = () => {
  const theme = useCurrentTheme();
  const router = useRouter();
  const {
    voiceMemos,
    categories,
    stats,
    loading,
    categoriesLoading,
    error,
    toggleFavorite,
    deleteVoiceMemo,
    playVoiceMemo,
    getVoiceMemosByCategory,
    fetchVoiceMemos,
    refresh,
    refreshing,
  } = useVoiceMemos();

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPlayingId, setCurrentPlayingId] = useState<number | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [sortBy, setSortBy] = useState("recent");
  const [showSortOptions, setShowSortOptions] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;
  const sortAnim = useRef(new Animated.Value(0)).current;

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
    Animated.timing(sortAnim, {
      toValue: showSortOptions ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showSortOptions]);

  // Client-side filtering and sorting
  const filteredAndSortedMemos = useMemo(() => {
    let filtered = [...voiceMemos];

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter((memo) => memo.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (memo) =>
          memo.title.toLowerCase().includes(query) ||
          memo.description?.toLowerCase().includes(query) ||
          memo.category.toLowerCase().includes(query)
      );
    }

    // Sort memos
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "duration-asc":
          return a.duration - b.duration;
        case "duration-desc":
          return b.duration - a.duration;
        case "favorites":
          return (b.is_favorite ? 1 : 0) - (a.is_favorite ? 1 : 0);
        case "recent":
        default:
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
      }
    });

    return filtered;
  }, [voiceMemos, selectedCategory, searchQuery, sortBy]);

  const favoriteMemos = useMemo(
    () => voiceMemos.filter((memo) => memo.is_favorite),
    [voiceMemos]
  );

  const handlePlay = async (memo: VoiceMemo) => {
    try {
      setCurrentPlayingId(memo.id);
      await playVoiceMemo(memo.id, memo.duration);
    } catch (error) {
      setCurrentPlayingId(null);
      console.error("Error playing memo:", error);
    }
  };

  const handleMemoPress = (memo: VoiceMemo) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/(core)/(modals)/voice-memo-detail?id=${memo.id}` as any);
  };

  const handleFavorite = async (memo: VoiceMemo) => {
    await toggleFavorite(memo.id);
  };

  const handleDelete = async (memo: VoiceMemo) => {
    await deleteVoiceMemo(memo.id);
  };

  const handleCategorySelect = (category: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(category);
    if (category !== "All") {
      getVoiceMemosByCategory(category);
    } else {
      fetchVoiceMemos();
    }
  };

  const handleSortSelect = (sortValue: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSortBy(sortValue);
    setShowSortOptions(false);
  };

  const handleRefresh = async () => {
    await refresh();
  };

  const handleCreateNew = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/(core)/(modals)/voice-memo-form");
  };

  return (
    <ScreenLayout>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {loading && voiceMemos.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.text }]}>
              Loading voice memories...
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
                      name="mic"
                      size={32}
                      color="#FFA726"
                      style={styles.headerIcon}
                    />
                    <View>
                      <Text style={[styles.title, { color: theme.text }]}>
                        Voice Memories
                      </Text>
                      {stats && (
                        <Text
                          style={[styles.subtitle, { color: theme.subtleText }]}
                        >
                          {stats.total_memos} memories •{" "}
                          {formatDuration(stats.total_duration)}
                        </Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.headerActions}>
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
                    <Pressable
                      onPress={handleCreateNew}
                      style={[
                        styles.headerActionButton,
                        { backgroundColor: "#FFA726" },
                      ]}
                    >
                      <Ionicons name="add" size={24} color="white" />
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
                        placeholder="Search voice memories..."
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

            {/* Category Filters */}
            {categories.length > 0 && (
              <View style={styles.genreSection}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.genreScroll}
                >
                  <Pressable
                    onPress={() => handleCategorySelect("All")}
                    style={[
                      styles.genreChip,
                      {
                        backgroundColor:
                          selectedCategory === "All" ? "#FFA726" : theme.card,
                        borderColor:
                          selectedCategory === "All" ? "#FFA726" : theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.genreText,
                        {
                          color:
                            selectedCategory === "All" ? "white" : theme.text,
                        },
                      ]}
                    >
                      All
                    </Text>
                  </Pressable>
                  {categories.map((category) => (
                    <Pressable
                      key={category.id}
                      onPress={() => handleCategorySelect(category.name)}
                      style={[
                        styles.genreChip,
                        {
                          backgroundColor:
                            selectedCategory === category.name
                              ? "#FFA726"
                              : theme.card,
                          borderColor:
                            selectedCategory === category.name
                              ? "#FFA726"
                              : theme.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.genreText,
                          {
                            color:
                              selectedCategory === category.name
                                ? "white"
                                : theme.text,
                          },
                        ]}
                      >
                        {category.name}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Favorites Section */}
            {favoriteMemos.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    Favorites
                  </Text>
                  <Ionicons name="heart" size={20} color="#FF6B6B" />
                </View>
                {favoriteMemos.slice(0, 3).map((memo, index) => (
                  <VoiceMemoCard
                    key={`favorite-${memo.id}`}
                    memo={memo}
                    onPress={() => handleMemoPress(memo)}
                    onPlay={() => handlePlay(memo)}
                    onFavorite={() => handleFavorite(memo)}
                    onDelete={() => handleDelete(memo)}
                    index={index}
                    isPlaying={currentPlayingId === memo.id}
                  />
                ))}
              </View>
            )}

            {/* All Memos Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                {selectedCategory === "All"
                  ? "All Memories"
                  : selectedCategory}
              </Text>
              {filteredAndSortedMemos.length === 0 && !loading ? (
                <View style={styles.emptyState}>
                  <Ionicons
                    name="mic-outline"
                    size={48}
                    color={theme.mutedText}
                  />
                  <Text
                    style={[styles.emptyStateText, { color: theme.mutedText }]}
                  >
                    {searchQuery
                      ? "No voice memories found matching your search"
                      : "No voice memories yet"}
                  </Text>
                  <Pressable
                    onPress={handleCreateNew}
                    style={[
                      styles.emptyButton,
                      { backgroundColor: "#FFA726" },
                    ]}
                  >
                    <Text style={styles.emptyButtonText}>
                      Create Your First Memory
                    </Text>
                  </Pressable>
                </View>
              ) : (
                filteredAndSortedMemos.map((memo, index) => (
                  <VoiceMemoCard
                    key={`memo-${memo.id}`}
                    memo={memo}
                    onPress={() => handleMemoPress(memo)}
                    onPlay={() => handlePlay(memo)}
                    onFavorite={() => handleFavorite(memo)}
                    onDelete={() => handleDelete(memo)}
                    index={index}
                    isPlaying={currentPlayingId === memo.id}
                  />
                ))
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
    fontSize: 20,
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  // Voice Memo Card Styles
  memoCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  memoCardContent: {
    flexDirection: "row",
    gap: 12,
  },
  memoIcon: {
    width: 48,
    height: 48,
  },
  memoIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  memoInfo: {
    flex: 1,
  },
  memoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  memoDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  memoMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 11,
  },
  memoActions: {
    gap: 8,
    justifyContent: "center",
  },
  playButton: {
    width: 40,
    height: 40,
  },
  playButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default VoiceMemoryScreen;
