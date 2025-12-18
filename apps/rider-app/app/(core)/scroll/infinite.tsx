import { useGlobalAudioPlayer } from "@/hooks/use-global-audio-player";
import { getTypeColor } from "@/lib/colors";
import Api from "@/lib/api";
import { Post } from "@/lib/api/types";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const { width, height } = Dimensions.get("window");

const FALLBACK_WAVEFORM = [
  20, 45, 60, 85, 95, 120, 110, 85, 65, 40, 55, 70, 90, 110, 95, 75, 50, 65, 80,
  100,
];

const pickColorByType = (type: string) => {
  switch (type) {
    case "music":
      return "#FF6B6B";
    case "podcast":
      return "#4ECDC4";
    case "audiobook":
      return "#6C5CE7";
    case "voicenote":
      return "#FFA726";
    default:
      return "#6C5CE7";
  }
};
const formatCount = (value?: number) => {
  if (!value) return "0";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
};

const formatDuration = (value?: number) => {
  if (!value || Number.isNaN(value)) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const buildWaveform = (duration?: number) => {
  const bars = 20;
  const seed = Math.floor((duration || 60) * 7);
  return Array.from({ length: bars }, (_, index) => {
    const amplitude = (seed + index * 13) % 100;
    return Math.max(20, Math.min(120, amplitude + 30));
  });
};

const mapPostToReel = (post: Post): AudioReel => {
  const type = post.type || "audio";
  const color = pickColorByType(type);
  return {
    id: post.id.toString(),
    title: post.text || "Untitled audio",
    artist: post.user?.display_name || post.user?.name || "Unknown artist",
    duration: formatDuration(post.duration),
    likes: formatCount(post.like_count),
    comments: formatCount(post.comment_count),
    shares: "0",
    plays: formatCount(post.play_count),
    audioUrl: post.audio_url || "",
    waveform: buildWaveform(post.duration || FALLBACK_WAVEFORM.length),
    color,
    gradient: [color, `${color}CC`, color],
    artistAvatar:
      post.user?.metadata?.instagram ||
      post.user?.metadata?.linkedin ||
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    type,
  };
};

// Reactions data
const REACTIONS_DATA = {
  "1": [
    { emoji: "🔥", count: 45, users: ["MusicLover", "BeatFan"] },
    { emoji: "❤️", count: 23, users: ["AudioFan"] },
    { emoji: "🎵", count: 18, users: ["SoundLover"] },
    { emoji: "💯", count: 12, users: ["VibesCheck"] },
  ],
  "2": [
    { emoji: "🧘", count: 67, users: ["ZenMaster", "PeacefulSoul"] },
    { emoji: "❤️", count: 34, users: ["MeditationGuru"] },
    { emoji: "🌊", count: 28, users: ["CalmVibes"] },
    { emoji: "✨", count: 15, users: ["Mindful"] },
  ],
};

// Available reactions
const AVAILABLE_REACTIONS = [
  "❤️",
  "🔥",
  "🎵",
  "💯",
  "🧘",
  "🌊",
  "✨",
  "🎶",
  "👏",
  "💫",
  "🙌",
  "😍",
  "🤩",
  "💪",
  "🎉",
  "⚡",
];

export interface AudioReel {
  id: string;
  title: string;
  artist: string;
  duration: string;
  likes: string;
  comments: string;
  shares: string;
  plays: string;
  audioUrl: string;
  waveform: number[];
  color: string;
  gradient: string[];
  artistAvatar: string;
  type: string;
}

interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

interface UserReaction {
  reelId: string;
  emoji: string;
  timestamp: string;
}

interface WaveformProps {
  data: number[];
  color: string;
  isPlaying: boolean;
  progress: number;
}

const Waveform: React.FC<WaveformProps> = ({
  data,
  color,
  isPlaying,
  progress,
}) => {
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.timing(animation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      animation.setValue(0);
    }
  }, [isPlaying]);

  const interpolatedAnimation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  return (
    <View style={styles.waveformContainer}>
      {data.map((amplitude, index) => {
        const isActive = index / data.length < progress;
        const scale = isActive ? interpolatedAnimation : 1;

        return (
          <Animated.View
            key={index}
            style={[
              styles.waveBar,
              {
                height: amplitude,
                backgroundColor: isActive ? color : `${color}40`,
                transform: [{ scaleY: isPlaying ? scale : 1 }],
                shadowColor: isActive ? color : "transparent",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: isActive ? 0.8 : 0,
                shadowRadius: 4,
                elevation: isActive ? 4 : 0,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

interface AudioReelProps {
  reel: AudioReel;
  isActive: boolean;
  audioPlayer: ReturnType<typeof useGlobalAudioPlayer>; // Pass the player down
  onLike: (id: string) => void;
  onReaction: (id: string) => void;
  onShare: (id: string) => void;
  onMore: (reel: AudioReel) => void;
}

const AudioReelComponent: React.FC<AudioReelProps> = ({
  reel,
  isActive,
  audioPlayer, // Use passed-in player instead of creating new one
  onLike,
  onReaction,
  onShare,
  onMore,
}) => {
  const [progress, setProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Update progress based on player - only for the active reel
    if (isActive && audioPlayer.isPlaying && audioPlayer.duration > 0) {
      const currentProgress =
        audioPlayer.currentPosition / audioPlayer.duration;
      setProgress(currentProgress);
      progressAnim.setValue(currentProgress);
    } else if (!isActive) {
      // Reset progress for inactive reels
      setProgress(0);
      progressAnim.setValue(0);
    }
  }, [
    isActive,
    audioPlayer.currentPosition,
    audioPlayer.duration,
    audioPlayer.isPlaying,
  ]);

  const handlePlayPause = async () => {
    if (!isActive) return; // Only allow play/pause for active reel
    await audioPlayer.togglePlayPause();
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike(reel.id);
  };

  const getTypeIcon = () => {
    switch (reel.type) {
      case "music":
        return "musical-notes";
      case "podcast":
        return "mic";
      case "audiobook":
        return "book";
      case "voicenote":
        return "chatbubble";
      default:
        return "musical-notes";
    }
  };

  return (
    <View style={styles.reelContainer}>
      <LinearGradient
        colors={reel.gradient as any}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Main Content */}
        <View style={styles.content}>
          {/* Top Info Bar */}
          <View style={styles.topBar}>
            <View style={styles.artistInfo}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: reel.artistAvatar }}
                  style={styles.avatar}
                />
                <View
                  style={[
                    styles.typeBadge,
                    { backgroundColor: getTypeColor(reel) },
                  ]}
                >
                  <Ionicons
                    name={getTypeIcon() as any}
                    size={12}
                    color="white"
                  />
                </View>
              </View>
              <View>
                <Text style={styles.artistName}>{reel.artist}</Text>
                <Text style={styles.songTitle}>{reel.title}</Text>
              </View>
            </View>
            <View style={styles.stats}>
              <Ionicons name="play" size={14} color="white" />
              <Text style={styles.statText}>{reel.plays}</Text>
            </View>
          </View>

          {/* Center Waveform and Play Button */}
          <View style={styles.centerSection}>
            <Waveform
              data={reel.waveform}
              color={reel.color}
              isPlaying={isActive && audioPlayer.isPlaying}
              progress={isActive ? progress : 0}
            />

            <TouchableOpacity
              style={[
                styles.playButton,
                {
                  backgroundColor: reel.color,
                  shadowColor: reel.color,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.4,
                  shadowRadius: 16,
                  elevation: 8,
                },
              ]}
              onPress={handlePlayPause}
            >
              <Ionicons
                name={isActive && audioPlayer.isPlaying ? "pause" : "play"}
                size={32}
                color="white"
              />
            </TouchableOpacity>
          </View>

          {/* Bottom Controls */}
          <View style={styles.bottomSection}>
            <View style={styles.songInfo}>
              <Text style={styles.duration}>{reel.duration}</Text>
              <Text style={styles.nowPlaying}>
                {isActive && audioPlayer.isPlaying
                  ? "NOW PLAYING"
                  : "TAP TO PLAY"}
              </Text>
            </View>

            {/* Right Action Buttons */}
            <View style={styles.actionButtons}>
              <Pressable style={styles.actionButton} onPress={handleLike}>
                <Ionicons
                  name={isLiked ? "heart" : "heart-outline"}
                  size={28}
                  color={isLiked ? "#FF4757" : "white"}
                />
                <Text style={styles.actionCount}>{reel.likes}</Text>
              </Pressable>

              <Pressable
                style={styles.actionButton}
                onPress={() => onReaction(reel.id)}
              >
                <Ionicons name="happy-outline" size={26} color="white" />
                <Text style={styles.actionCount}>{reel.comments}</Text>
              </Pressable>

              <Pressable
                style={styles.actionButton}
                onPress={() => onMore(reel)}
              >
                <Ionicons name="ellipsis-horizontal" size={26} color="white" />
              </Pressable>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

// Reaction Components
const ReactionItem: React.FC<{
  reaction: Reaction;
  onPress: (emoji: string) => void;
}> = ({ reaction, onPress }) => (
  <Pressable
    style={styles.reactionItem}
    onPress={() => onPress(reaction.emoji)}
  >
    <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
    <Text style={styles.reactionCount}>{reaction.count}</Text>
    {reaction.users.length > 0 && (
      <Text style={styles.reactionUsers}>
        {reaction.users.slice(0, 2).join(", ")}
        {reaction.users.length > 2 && ` +${reaction.users.length - 2} others`}
      </Text>
    )}
  </Pressable>
);

const ReactionPicker: React.FC<{
  onSelectReaction: (emoji: string) => void;
}> = ({ onSelectReaction }) => (
  <View style={styles.reactionPicker}>
    <Text style={styles.reactionPickerTitle}>Add your reaction</Text>
    <View style={styles.reactionsGrid}>
      {AVAILABLE_REACTIONS.map((emoji, index) => (
        <Pressable
          key={index}
          style={({ pressed }) => [
            styles.reactionButton,
            pressed && styles.reactionButtonPressed,
          ]}
          onPress={() => onSelectReaction(emoji)}
        >
          <Text style={styles.reactionButtonEmoji}>{emoji}</Text>
        </Pressable>
      ))}
    </View>
  </View>
);

const GENRE_FILTERS = ["All", "Music", "Podcast", "Audiobook", "Voice Note"];

export default function AudioReelsPage() {
  // Component mount/unmount logging
  useEffect(() => {
    console.log("📱 INFINITE SCROLL - Component mounted");
    return () => {
      console.log("📱 INFINITE SCROLL - Component unmounted");
    };
  }, []);

  const [reels, setReels] = useState<AudioReel[]>([]);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedReels, setLikedReels] = useState<Set<string>>(new Set());
  const [reactionsSheetOpen, setReactionsSheetOpen] = useState(false);
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);
  const [selectedReel, setSelectedReel] = useState<AudioReel | null>(null);
  const [userReactions, setUserReactions] = useState<UserReaction[]>([]);
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const reactionsSheetRef = useRef<BottomSheet>(null);
  const moreSheetRef = useRef<BottomSheet>(null);

  const fetchAudioFeed = useCallback(
    async (options?: { cursor?: number | null; append?: boolean; isRefresh?: boolean }) => {
      const { cursor, append = false, isRefresh = false } = options || {};

      if (append) setLoadingMore(true);
      else if (isRefresh) setRefreshing(true);
      else setInitialLoading(true);

      try {
        setError(null);
        const res = await Api.getAudioFeed({
          limit: 10,
          last_id: cursor ?? undefined,
        });

        const mapped = res.posts
          .filter((post) => post.audio_url)
          .map(mapPostToReel);

        setReels((prev) => {
          if (!append) return mapped;

          const merged = [...prev];
          const existingIds = new Set(prev.map((r) => r.id));
          mapped.forEach((item) => {
            if (!existingIds.has(item.id)) {
              merged.push(item);
            }
          });
          return merged;
        });

        if (!append) {
          setCurrentIndex(0);
        }

        setNextCursor(res.next_cursor ?? null);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load audio feed";
        setError(message);
      } finally {
        setInitialLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchAudioFeed();
  }, [fetchAudioFeed]);

  // Single audio player instance for the entire page
  const currentReel = reels[currentIndex];
  const globalAudioPlayer = useGlobalAudioPlayer(currentReel?.audioUrl || null);

  // Debug logging for infinite scroll audio player
  useEffect(() => {
    console.log(" INFINITE SCROLL - Audio player state:", {
      currentIndex,
      currentReelTitle: currentReel?.title || "None",
      audioUrl: currentReel?.audioUrl || "None",
      isPlaying: globalAudioPlayer.isPlaying,
      timestamp: new Date().toLocaleTimeString(),
    });
  }, [currentIndex, currentReel, globalAudioPlayer.isPlaying]);

  useEffect(() => {
    if (reels.length > 0 && currentIndex >= reels.length) {
      setCurrentIndex(reels.length - 1);
    }
  }, [reels.length, currentIndex]);

  // Handle audio URL change when swiping to different reel
  useEffect(() => {
    console.log("📱 INFINITE SCROLL - Reel changed:", {
      newIndex: currentIndex,
      newReel: currentReel?.title,
      newAudioUrl: currentReel?.audioUrl,
      timestamp: new Date().toLocaleTimeString(),
    });
    // The useGlobalAudioPlayer hook will automatically handle stopping
    // previous audio and loading new audio when the URL changes
  }, [currentIndex]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: any) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        const newIndex = viewableItems[0].index;
        if (typeof newIndex === "number" && newIndex !== currentIndex) {
          setCurrentIndex(newIndex);
          // Auto-pause current audio when switching reels
          if (globalAudioPlayer.isPlaying) {
            globalAudioPlayer.pause();
          }
        }
      }
    },
    [currentIndex, globalAudioPlayer]
  );

  const handleRefresh = async () => {
    await fetchAudioFeed({ isRefresh: true });
  };

  const handleLoadMore = useCallback(() => {
    if (loadingMore || initialLoading || !nextCursor) return;
    fetchAudioFeed({ cursor: nextCursor, append: true });
  }, [fetchAudioFeed, initialLoading, loadingMore, nextCursor]);

  const handleGenreSelect = (genre: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedGenre(genre);
  };

  const viewabilityConfig = {
    viewAreaCoveragePercentThreshold: 50,
  };

  const handleLike = (reelId: string) => {
    setLikedReels((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(reelId)) {
        newSet.delete(reelId);
      } else {
        newSet.add(reelId);
      }
      return newSet;
    });
  };

  const handleReaction = (reelId: string) => {
    const reel = reels.find((r) => r.id === reelId);
    setSelectedReel(reel || null);
    setReactionsSheetOpen(true);
    reactionsSheetRef.current?.expand();
  };

  const handleSelectReaction = (emoji: string) => {
    if (!selectedReel) return;

    // Add haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newReaction: UserReaction = {
      reelId: selectedReel.id,
      emoji,
      timestamp: new Date().toISOString(),
    };

    setUserReactions((prev) => [...prev, newReaction]);

    // Close sheet after a short delay to show the selection
    setTimeout(() => {
      reactionsSheetRef.current?.close();
    }, 300);
  };

  const handleShare = (reelId: string) => {
    console.log("Share reel:", reelId);
  };

  const handleMore = (reel: AudioReel) => {
    setSelectedReel(reel);
    setMoreSheetOpen(true);
    moreSheetRef.current?.expand();
  };

  const renderReel = ({ item, index }: { item: AudioReel; index: number }) => (
    <AudioReelComponent
      reel={item}
      isActive={index === currentIndex}
      audioPlayer={globalAudioPlayer} // Pass the single player instance
      onLike={handleLike}
      onReaction={handleReaction}
      onShare={handleShare}
      onMore={handleMore}
    />
  );

  const reactions = selectedReel
    ? REACTIONS_DATA[selectedReel.id as keyof typeof REACTIONS_DATA] || []
    : [];

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      {initialLoading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : (
        <Text style={styles.emptyText}>No audio posts yet.</Text>
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  const renderFooter = () =>
    loadingMore ? (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#fff" />
      </View>
    ) : null;

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
        <View style={styles.headerActions}>
          <Pressable
            style={styles.headerButton}
            onPress={() => {
              router.push("/(core)/posts/create");
            }}
          >
            <Ionicons name="add-circle" size={24} color="white" />
          </Pressable>
        </View>
      </View>

      {/* Genre Filter Tabs */}
      <View style={styles.genreFilterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.genreFilterScroll}
        >
          {GENRE_FILTERS.map((genre) => (
            <Pressable
              key={genre}
              onPress={() => handleGenreSelect(genre)}
              style={[
                styles.genreFilterButton,
                selectedGenre === genre && styles.genreFilterButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.genreFilterText,
                  selectedGenre === genre && styles.genreFilterTextActive,
                ]}
              >
                {genre}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Reels List */}
      <FlatList
        data={reels}
        renderItem={renderReel}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
        bounces={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.6}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
      />

      {/* Reactions Bottom Sheet */}
      <BottomSheet
        ref={reactionsSheetRef}
        index={-1}
        snapPoints={["40%"]}
        enablePanDownToClose
        backdropComponent={BottomSheetBackdrop}
        onChange={(index: number) => setReactionsSheetOpen(index >= 0)}
      >
        <BottomSheetView style={styles.sheetContent}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>
              Reactions ({reactions.length})
            </Text>
          </View>

          {/* Add Reaction Picker */}
          <ReactionPicker onSelectReaction={handleSelectReaction} />

          {/* Show Current Reactions */}
          {reactions.length > 0 && (
            <>
              <View style={styles.sectionDivider}>
                <Text style={styles.sectionTitle}>Current Reactions</Text>
              </View>
              <FlatList
                data={reactions}
                renderItem={({ item }) => (
                  <ReactionItem
                    reaction={item}
                    onPress={handleSelectReaction}
                  />
                )}
                keyExtractor={(item, index) => `${item.emoji}-${index}`}
                style={styles.reactionsList}
                showsVerticalScrollIndicator={false}
              />
            </>
          )}
        </BottomSheetView>
      </BottomSheet>

      {/* More Options Bottom Sheet */}
      <BottomSheet
        ref={moreSheetRef}
        index={-1}
        snapPoints={["30%"]}
        enablePanDownToClose
        backdropComponent={BottomSheetBackdrop}
        onChange={(index: number) => setMoreSheetOpen(index >= 0)}
      >
        <BottomSheetView style={styles.sheetContent}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Options</Text>
            {/* <Pressable onPress={() => moreSheetRef.current?.close()}>
              <Ionicons name="close" size={24} color="#666" />
            </Pressable> */}
          </View>

          <View style={styles.moreOptions}>
            <Pressable style={styles.optionItem}>
              <Ionicons name="download-outline" size={24} color="#333" />
              <Text style={styles.optionText}>Download Audio</Text>
            </Pressable>

            <Pressable style={styles.optionItem}>
              <Ionicons name="share-outline" size={24} color="#333" />
              <Text style={styles.optionText}>Share</Text>
            </Pressable>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    zIndex: 1000,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  headerActions: {
    flexDirection: "row",
    gap: 20,
  },
  headerButton: {
    padding: 4,
  },
  reelContainer: {
    width,
    height,
  },
  backgroundGradient: {
    flex: 1,
    justifyContent: "space-between",
    paddingTop: 150,
    paddingBottom: 35,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  artistInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  typeBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  artistName: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  songTitle: {
    color: "white",
    fontSize: 14,
    opacity: 0.9,
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  centerSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 50,
  },
  waveformContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 200,
    gap: 4,
  },
  waveBar: {
    width: 4,
    borderRadius: 2,
    minHeight: 10,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  songInfo: {
    flex: 1,
  },
  duration: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  nowPlaying: {
    color: "white",
    fontSize: 12,
    opacity: 0.8,
    fontWeight: "500",
  },
  actionButtons: {
    alignItems: "center",
    gap: 24,
  },
  actionButton: {
    alignItems: "center",
    gap: 6,
  },
  actionCount: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  progressBarContainer: {
    position: "absolute",
    bottom: 80,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  progressBar: {
    height: "100%",
    borderRadius: 1.5,
  },
  // Bottom Sheet Styles
  sheetContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  currentTrack: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    gap: 12,
  },
  trackAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  trackArtist: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  commentsList: {
    flex: 1,
    marginTop: 16,
  },
  commentItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  commentUser: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  commentTime: {
    fontSize: 12,
    color: "#999",
  },
  commentText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    marginBottom: 8,
  },
  commentFooter: {
    flexDirection: "row",
  },
  commentLike: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  commentLikeCount: {
    fontSize: 12,
    color: "#666",
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  commentInput: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    marginRight: 12,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  moreOptions: {
    paddingVertical: 16,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    gap: 16,
  },
  optionText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  // Reaction Styles
  reactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginVertical: 6,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  reactionEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  reactionCount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginRight: 8,
  },
  reactionUsers: {
    fontSize: 12,
    color: "#666",
    flex: 1,
  },
  reactionPicker: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  reactionPickerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  reactionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  reactionButton: {
    width: Math.floor((width - 80) / 8) - 4, // 8 reactions per row with gaps
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    marginBottom: 8,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: "#e9ecef",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  reactionButtonEmoji: {
    fontSize: 20,
  },
  reactionButtonPressed: {
    backgroundColor: "#e9ecef",
    transform: [{ scale: 0.95 }],
  },
  sectionDivider: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  reactionsList: {
    flex: 1,
    paddingHorizontal: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
  },
  errorText: {
    color: "#FF6B6B",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  footerLoader: {
    paddingVertical: 16,
  },
  // Genre Filter Styles
  genreFilterContainer: {
    position: "absolute",
    top: 100,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  genreFilterScroll: {
    paddingHorizontal: 20,
    gap: 10,
  },
  genreFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  genreFilterButtonActive: {
    backgroundColor: "white",
  },
  genreFilterText: {
    fontSize: 14,
    fontWeight: "500",
    color: "white",
  },
  genreFilterTextActive: {
    color: "#000",
  },
});
