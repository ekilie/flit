import ScreenLayout from "@/components/ScreenLayout";
import { useCurrentTheme } from "@/context/CentralTheme";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import React, { useState, useRef, useEffect } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  Animated,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useAudiobooks } from "@/hooks/useAudiobooks";
import { useAudiobookPlayer } from "@/hooks/useAudiobookPlayer";
import { Audiobook } from "@/lib/api/types";
import { BLURHASH } from "@/constants/constants";
import { useHaptics } from "@/hooks/useHaptics";

const { width } = Dimensions.get("window");

// Layout Constants
const BOOKSHELF_HORIZONTAL_PADDING = 40; // 20px on each side
const BOOKSHELF_GAP = 12;
const BOOKSHELF_TOTAL_PADDING = BOOKSHELF_HORIZONTAL_PADDING + BOOKSHELF_GAP;

const GENRE_FILTERS = [
  "All",
  "Fiction",
  "Self-Help",
  "Sci-Fi",
  "History",
  "Memoir",
  "Business",
  "Mystery",
];

// Sort options
const SORT_OPTIONS = [
  { label: "Recently Added", value: "recent" },
  { label: "Title A-Z", value: "title-asc" },
  { label: "Author A-Z", value: "author" },
  { label: "Duration (Short)", value: "duration-asc" },
  { label: "Duration (Long)", value: "duration-desc" },
  { label: "Rating (High)", value: "rating" },
];

const READING_SPEEDS = [
  { label: "0.75x", value: 0.75 },
  { label: "1.0x", value: 1.0 },
  { label: "1.25x", value: 1.25 },
  { label: "1.5x", value: 1.5 },
  { label: "1.75x", value: 1.75 },
  { label: "2.0x", value: 2.0 },
];

// Audiobook Card Component
interface AudiobookCardProps {
  book: Audiobook;
  onPress: () => void;
  onFavorite: () => void;
  onDownload: () => void;
  index: number;
  isBookshelf?: boolean;
}

const AudiobookCard: React.FC<AudiobookCardProps> = ({
  book,
  onPress,
  onFavorite,
  onDownload,
  index,
  isBookshelf = false,
}) => {
  const theme = useCurrentTheme();
  const scaleAnim = useRef(new Animated.Value(0.9)).current; //#StandOutOps
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const { trigger: hapticFeedback } = useHaptics();

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

  const handleFavorite = () => {
    hapticFeedback("light");
    onFavorite();
  };

  const handleDownload = () => {
    hapticFeedback("light");
    onDownload();
  };

  if (isBookshelf) {
    return (
      <Animated.View
        style={[
          styles.bookshelfCard,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [pressed && { opacity: 0.7 }]}
        >
          <View style={styles.bookSpine}>
            <Image
              source={{ uri: book.cover }}
              placeholder={{ blurhash: BLURHASH }}
              contentFit="cover"
              transition={1000}
              style={[
                StyleSheet.absoluteFillObject,
                {
                  borderRadius: 4,
                },
              ]}
            />
            {book.progress > 0 && (
              <View style={styles.bookmarkIndicator}>
                <Ionicons name="bookmark" size={16} color={book.color} />
              </View>
            )}
          </View>
          <Text
            style={[styles.bookshelfTitle, { color: theme.text }]}
            numberOfLines={2}
          >
            {book.title}
          </Text>
          <Text
            style={[styles.bookshelfAuthor, { color: theme.subtleText }]}
            numberOfLines={1}
          >
            {book.author}
          </Text>
        </Pressable>
      </Animated.View>
    );
  }

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
          styles.audiobookCard,
          { backgroundColor: theme.card, borderColor: theme.border },
          pressed && { opacity: 0.7 },
        ]}
      >
        <View style={styles.bookCardContent}>
          <View style={styles.bookCover}>
            <Image
              source={{ uri: book.cover }}
              placeholder={{ blurhash: BLURHASH }}
              contentFit="cover"
              transition={1000}
              style={[
                StyleSheet.absoluteFillObject,
                {
                  borderRadius: 6,
                },
              ]}
            />
            {book.is_downloaded && (
              <View
                style={[styles.downloadBadge, { backgroundColor: book.color }]}
              >
                <Ionicons name="cloud-done" size={12} color="white" />
              </View>
            )}
          </View>

          <View style={styles.bookInfo}>
            <Text
              style={[styles.bookTitle, { color: theme.text }]}
              numberOfLines={2}
            >
              {book.title}
            </Text>
            <Text
              style={[styles.bookAuthor, { color: theme.subtleText }]}
              numberOfLines={1}
            >
              by {book.author}
            </Text>
            <Text
              style={[styles.bookNarrator, { color: theme.mutedText }]}
              numberOfLines={1}
            >
              Narrated by {book.narrator}
            </Text>

            <View style={styles.bookMeta}>
              <View style={styles.metaItem}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={theme.subtleText}
                />
                <Text style={[styles.metaText, { color: theme.subtleText }]}>
                  {book.duration}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons
                  name="list-outline"
                  size={14}
                  color={theme.subtleText}
                />
                <Text style={[styles.metaText, { color: theme.subtleText }]}>
                  {book.chapters} chapters
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={[styles.metaText, { color: theme.subtleText }]}>
                  {book.rating}
                </Text>
              </View>
            </View>

            {book.progress > 0 && (
              <View style={styles.progressContainer}>
                <View
                  style={[
                    styles.progressBar,
                    { backgroundColor: `${book.color}20` },
                  ]}
                >
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${book.progress * 100}%`,
                        backgroundColor: book.color,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.progressText, { color: theme.mutedText }]}>
                  Chapter {book.current_chapter} of {book.chapters} •{" "}
                  {Math.round(book.progress * 100)}%
                </Text>
              </View>
            )}
          </View>

          <View style={styles.cardActions}>
            {/* <Pressable onPress={handleDownload} style={styles.actionButton}>
              <Ionicons
                name={
                  book.is_downloaded ? "cloud-done" : "cloud-download-outline"
                }
                size={20}
                color={book.is_downloaded ? book.color : theme.subtleText}
              />
            </Pressable> */}
            <Pressable onPress={handleFavorite} style={styles.actionButton}>
              <Ionicons
                name={book.is_favorite ? "heart" : "heart-outline"}
                size={20}
                color={book.is_favorite ? "#FF6B6B" : theme.subtleText}
              />
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

// Reading Speed Control Component
interface ReadingSpeedControlProps {
  currentSpeed: number;
  onSpeedChange: (speed: number) => void;
}

const ReadingSpeedControl: React.FC<ReadingSpeedControlProps> = ({
  currentSpeed,
  onSpeedChange,
}) => {
  const theme = useCurrentTheme();

  return (
    <View style={styles.speedControl}>
      <Text style={[styles.speedLabel, { color: theme.text }]}>
        Playback Speed
      </Text>
      <View style={styles.speedOptions}>
        {READING_SPEEDS.map((speed) => (
          <Pressable
            key={speed.value}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSpeedChange(speed.value);
            }}
            style={[
              styles.speedButton,
              {
                backgroundColor:
                  currentSpeed === speed.value ? "#6C5CE7" : theme.card,
                borderColor:
                  currentSpeed === speed.value ? "#6C5CE7" : theme.border,
              },
            ]}
          >
            <Text
              style={[
                styles.speedButtonText,
                {
                  color: currentSpeed === speed.value ? "white" : theme.text,
                },
              ]}
            >
              {speed.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const AudiobooksScreen: React.FC = () => {
  const theme = useCurrentTheme();
  const {
    audiobooks,
    recommendations,
    libraryBooks,
    favoriteBooks,
    continueReadingBooks: continueListenBooks,
    loading,
    refreshing,
    error,
    fetchAudiobooks,
    fetchLibrary,
    toggleFavorite,
    toggleDownload,
    refresh,
  } = useAudiobooks();
  const { playAudiobook } = useAudiobookPlayer();

  const [selectedGenre, setSelectedGenre] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [readingSpeed, setReadingSpeed] = useState(1.0);
  const [showSpeedControl, setShowSpeedControl] = useState(false);
  const [sortBy, setSortBy] = useState("recent");
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;
  const speedControlAnim = useRef(new Animated.Value(0)).current;
  const sortAnim = useRef(new Animated.Value(0)).current;
  const { trigger: hapticFeedback } = useHaptics();

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
    Animated.timing(speedControlAnim, {
      toValue: showSpeedControl ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showSpeedControl]);

  useEffect(() => {
    Animated.timing(sortAnim, {
      toValue: showSortOptions ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showSortOptions]);

  useEffect(() => {
    const filters: any = {};

    if (selectedGenre !== "All") {
      filters.genre = selectedGenre;
    }

    if (searchQuery.trim()) {
      filters.search = searchQuery;
    }

    if (sortBy !== "recent") {
      filters.sort = sortBy;
    }

    const delayDebounce = searchQuery.trim()
      ? setTimeout(() => {
          fetchAudiobooks(filters);
          fetchLibrary(filters);
        }, 500)
      : null;

    if (!searchQuery.trim()) {
      fetchAudiobooks(filters);
      fetchLibrary(filters);
    }

    return () => {
      if (delayDebounce) {
        clearTimeout(delayDebounce);
      }
    };
  }, [selectedGenre, searchQuery, sortBy, fetchAudiobooks, fetchLibrary]);

  const handleFavorite = async (bookId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const book =
      libraryBooks?.find((b) => b.id === bookId) ||
      audiobooks?.find((b) => b.id === bookId);
    if (book) {
      await toggleFavorite(bookId, book.is_favorite);
    }
  };

  const handleDownload = async (bookId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const book =
      libraryBooks?.find((b) => b.id === bookId) ||
      audiobooks?.find((b) => b.id === bookId);
    if (book) {
      await toggleDownload(bookId, book.is_downloaded);
    }
  };

  const handleBookPress = (book: Audiobook) => {
    hapticFeedback("light");
    // Play the audiobook from the last chapter or from beginning
    playAudiobook(book, book.current_chapter);
  };

  const handleRefresh = async () => {
    await refresh();
  };

  const handleGenreSelect = (genre: string) => {
    hapticFeedback("light");
    setSelectedGenre(genre);
  };

  const handleSortSelect = (sortValue: string) => {
    hapticFeedback("light");
    setSortBy(sortValue);
    setShowSortOptions(false);
  };

  const handleViewModeToggle = () => {
    hapticFeedback("light");
    setViewMode((prev) => (prev === "list" ? "grid" : "list"));
  };

  const displayBooks = libraryBooks.length > 0 ? libraryBooks : audiobooks;

  const deduplicatedContinueBooks = React.useMemo(() => {
    const uniqueBooks = new Map();
    continueListenBooks?.forEach((book) => {
      if (!uniqueBooks.has(book.id)) {
        uniqueBooks.set(book.id, book);
      }
    });
    return Array.from(uniqueBooks.values());
  }, [continueListenBooks]);

  const deduplicatedFavoriteBooks = React.useMemo(() => {
    const uniqueBooks = new Map();
    favoriteBooks?.forEach((book) => {
      if (!uniqueBooks.has(book.id)) {
        uniqueBooks.set(book.id, book);
      }
    });
    return Array.from(uniqueBooks.values());
  }, [favoriteBooks]);

  const deduplicatedRecommendations = React.useMemo(() => {
    const uniqueBooks = new Map();
    if (recommendations && Array.isArray(recommendations)) {
      recommendations.forEach((book) => {
        if (!uniqueBooks.has(book.id)) {
          uniqueBooks.set(book.id, book);
        }
      });
    }
    return Array.from(uniqueBooks.values());
  }, [recommendations]);

  // Client-side filtering and sorting for better user experience
  const filteredAndSortedBooks = React.useMemo(() => {
    let books = [...displayBooks];

    // Client-side genre filtering (backup in case server doesn't filter)
    if (selectedGenre !== "All") {
      books = books.filter(
        (book) => book.genre?.toLowerCase() === selectedGenre.toLowerCase()
      );
    }

    // Client-side search filtering (backup in case server doesn't filter)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      books = books.filter(
        (book) =>
          book.title.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query) ||
          book.narrator?.toLowerCase().includes(query) ||
          book.genre?.toLowerCase().includes(query)
      );
    }

    // Client-side sorting
    books.sort((a, b) => {
      switch (sortBy) {
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "author":
          return a.author.localeCompare(b.author);
        case "duration-asc":
          const aDurationMs = parseDurationToMs(a.duration);
          const bDurationMs = parseDurationToMs(b.duration);
          return aDurationMs - bDurationMs;
        case "duration-desc":
          const aDurationMsDesc = parseDurationToMs(a.duration);
          const bDurationMsDesc = parseDurationToMs(b.duration);
          return bDurationMsDesc - aDurationMsDesc;
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "recent":
        default:
          // Default order (no sorting for recent)
          return 0;
      }
    });

    return books;
  }, [displayBooks, selectedGenre, searchQuery, sortBy]);

  // Helper function to parse duration string to milliseconds for proper sorting
  const parseDurationToMs = (duration: string): number => {
    const parts = duration.split(":");
    if (parts.length === 3) {
      const [hours, minutes, seconds] = parts.map(Number);
      return (hours * 3600 + minutes * 60 + seconds) * 1000;
    } else if (parts.length === 2) {
      const [minutes, seconds] = parts.map(Number);
      return (minutes * 60 + seconds) * 1000;
    }
    return 0;
  };

  return (
    <ScreenLayout>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {loading && displayBooks.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.text }]}>
              Loading audiobooks...
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
                      name="book"
                      size={32}
                      color="#6C5CE7"
                      style={styles.headerIcon}
                    />
                    <View>
                      <Text style={[styles.title, { color: theme.text }]}>
                        Audiobooks
                      </Text>
                      {/* <Text
                        style={[styles.subtitle, { color: theme.subtleText }]}
                      >
                        Your personal library
                      </Text> */}
                    </View>
                  </View>

                  <View style={styles.headerActions}>
                    <Pressable
                      onPress={() => setShowSortOptions(!showSortOptions)}
                      style={[
                        styles.headerActionButton,
                        // { backgroundColor: theme.card },
                      ]}
                    >
                      <Ionicons
                        name="filter-outline"
                        size={20}
                        color={theme.text}
                      />
                    </Pressable>
                    {/* <Pressable
                      onPress={() => setShowSpeedControl(!showSpeedControl)}
                      style={[
                        styles.headerActionButton,
                        // { backgroundColor: theme.card },
                      ]}
                    >
                      <Ionicons
                        name="speedometer-outline"
                        size={20}
                        color={theme.text}
                      />
                    </Pressable> */}
                    <Pressable
                      onPress={() => setShowSortOptions(!showSortOptions)}
                      style={[
                        styles.headerActionButton,
                        showSortOptions && {
                          backgroundColor: theme.primary + "20",
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
                        showSearch && { backgroundColor: theme.primary + "20" },
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
                        placeholder="Search audiobooks..."
                        placeholderTextColor={theme.subtleText}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus
                      />
                    </View>
                  </Animated.View>
                )}

                {/* Reading Speed Control */}
                {showSpeedControl && (
                  <Animated.View
                    style={[
                      styles.speedControlContainer,
                      {
                        opacity: speedControlAnim,
                        transform: [
                          {
                            translateY: speedControlAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [-20, 0],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <ReadingSpeedControl
                      currentSpeed={readingSpeed}
                      onSpeedChange={setReadingSpeed}
                    />
                  </Animated.View>
                )}

                {/* Sort Options */}
                {showSortOptions && (
                  <Animated.View
                    style={[
                      styles.sortOptionsContainer,
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
                    <Text style={[styles.sortLabel, { color: theme.text }]}>
                      Sort by
                    </Text>
                    <View style={styles.sortOptions}>
                      {SORT_OPTIONS.map((option) => (
                        <Pressable
                          key={option.value}
                          onPress={() => handleSortSelect(option.value)}
                          style={[
                            styles.sortButton,
                            {
                              backgroundColor:
                                sortBy === option.value
                                  ? "#6C5CE7"
                                  : theme.card,
                              borderColor:
                                sortBy === option.value
                                  ? "#6C5CE7"
                                  : theme.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.sortButtonText,
                              {
                                color:
                                  sortBy === option.value
                                    ? "white"
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
                          selectedGenre === genre ? "#6C5CE7" : theme.card,
                        borderColor:
                          selectedGenre === genre ? "#6C5CE7" : theme.border,
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

            {/* Continue Reading Section */}
            {deduplicatedContinueBooks.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    Continue Listen
                  </Text>
                  <Pressable
                    onPress={handleViewModeToggle}
                    style={[
                      styles.headerActionButton,
                      // { backgroundColor: theme.card },
                    ]}
                  >
                    <Ionicons
                      name={
                        viewMode === "list" ? "grid-outline" : "list-outline"
                      }
                      size={20}
                      color={theme.text}
                    />
                  </Pressable>
                </View>
                {deduplicatedContinueBooks.map((book, index) => (
                  <AudiobookCard
                    key={`continue-${book.id}`}
                    book={book}
                    onPress={() => handleBookPress(book)}
                    onFavorite={() => handleFavorite(book.id)}
                    onDownload={() => handleDownload(book.id)}
                    index={index}
                  />
                ))}
              </View>
            )}

            {/* Bookshelf - My Library */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  My Library
                </Text>
                <Text
                  style={[styles.sectionSubtitle, { color: theme.subtleText }]}
                >
                  {filteredAndSortedBooks.length} books
                </Text>
              </View>
              {filteredAndSortedBooks.length === 0 && !loading ? (
                <View style={styles.emptyState}>
                  <Text
                    style={[styles.emptyStateText, { color: theme.mutedText }]}
                  >
                    {searchQuery
                      ? "No audiobooks found matching your search"
                      : "No audiobooks in your library"}
                  </Text>
                </View>
              ) : viewMode === "grid" ? (
                <View style={styles.bookshelfGrid}>
                  {filteredAndSortedBooks.map(
                    (book: Audiobook, index: number) => (
                      <AudiobookCard
                        key={`grid-${book.id}`}
                        book={book}
                        onPress={() => handleBookPress(book)}
                        onFavorite={() => handleFavorite(book.id)}
                        onDownload={() => handleDownload(book.id)}
                        index={index}
                        isBookshelf
                      />
                    )
                  )}
                </View>
              ) : (
                <>
                  {filteredAndSortedBooks.map(
                    (book: Audiobook, index: number) => (
                      <AudiobookCard
                        key={`list-${book.id}`}
                        book={book}
                        onPress={() => handleBookPress(book)}
                        onFavorite={() => handleFavorite(book.id)}
                        onDownload={() => handleDownload(book.id)}
                        index={index}
                      />
                    )
                  )}
                </>
              )}
            </View>

            {/* Favorites */}
            {deduplicatedFavoriteBooks.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    Favorites
                  </Text>
                  <Ionicons name="heart" size={20} color="#FF6B6B" />
                </View>
                {deduplicatedFavoriteBooks.map((book, index) => (
                  <AudiobookCard
                    key={`favorite-${book.id}`}
                    book={book}
                    onPress={() => handleBookPress(book)}
                    onFavorite={() => handleFavorite(book.id)}
                    onDownload={() => handleDownload(book.id)}
                    index={index}
                  />
                ))}
              </View>
            )}

            {/* Recommendations */}
            {deduplicatedRecommendations.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Recommended for You
                </Text>
                {deduplicatedRecommendations.slice(0, 3).map((book, index) => (
                  <AudiobookCard
                    key={`recommendation-${book.id}`}
                    book={book}
                    onPress={() => handleBookPress(book)}
                    onFavorite={() => handleFavorite(book.id)}
                    onDownload={() => handleDownload(book.id)}
                    index={index}
                  />
                ))}
              </View>
            )}
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
    gap: 0,
    flex: 1,
  },
  headerIcon: {
    marginRight: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    gap: 10,
  },
  headerActionButton: {
    width: 32,
    height: 32,
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
  speedControlContainer: {
    marginTop: 12,
  },
  speedControl: {
    gap: 12,
  },
  speedLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  speedOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  speedButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  speedButtonText: {
    fontSize: 13,
    fontWeight: "500",
  },
  sortOptionsContainer: {
    marginTop: 12,
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  sortOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  sortButtonText: {
    fontSize: 13,
    fontWeight: "500",
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
  },
  sectionSubtitle: {
    fontSize: 14,
  },
  // Audiobook Card Styles
  audiobookCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  bookCardContent: {
    flexDirection: "row",
    gap: 16,
  },
  bookCover: {
    width: 100,
    height: 140,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  coverEmoji: {
    fontSize: 48,
  },
  downloadBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    marginBottom: 4,
  },
  bookNarrator: {
    fontSize: 12,
    marginBottom: 12,
  },
  bookMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
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
  cardActions: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  // Bookshelf Styles
  bookshelfGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  bookshelfCard: {
    width: (width - BOOKSHELF_TOTAL_PADDING) / 3,
  },
  bookSpine: {
    width: "100%",
    height: 140,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    position: "relative",
  },
  bookCoverEmoji: {
    // fontSize: 36,
  },
  bookmarkIndicator: {
    position: "absolute",
    top: -4,
    right: 8,
  },
  bookshelfTitle: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  bookshelfAuthor: {
    fontSize: 10,
  },
  // Recommendation Card
  recommendationCard: {
    borderRadius: 16,
    overflow: "hidden",
  },
  recommendationContent: {
    padding: 24,
    alignItems: "center",
  },
  recommendationEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
  recommendationText: {
    fontSize: 14,
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

export default AudiobooksScreen;
