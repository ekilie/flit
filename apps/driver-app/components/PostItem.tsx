import { useCurrentTheme } from "@/context/CentralTheme";
import { useGlobalAudioPlayer } from "@/hooks/use-global-audio-player";
import { usePostInteractions } from "@/hooks/usePostInteractions";
import { Post } from "@/lib/api/types";
import Api from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRef, useState, useEffect, useCallback } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
  Alert,
  Share,
} from "react-native";
import { toast } from "yooo-native";

const { width } = Dimensions.get("window");

interface PostItemProps {
  post: Post;
  onPress?: () => void;
  showStats?: boolean;
  onLikeUpdate?: (
    postId: number,
    newLikeCount: number,
    isLiked: boolean
  ) => void;
  onPlayUpdate?: (postId: number, newPlayCount: number) => void;
  onShare?: (post: Post) => void;
  onBookmark?: (post: Post) => void;
}

export default function PostItem({
  post,
  onPress,
  showStats = true,
  onLikeUpdate,
  onPlayUpdate,
  onShare,
  onBookmark,
}: PostItemProps) {
  const theme = useCurrentTheme();

  // State management
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [playCount, setPlayCount] = useState(post.play_count || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [playStartTime, setPlayStartTime] = useState<number | null>(null);
  const [hasRecordedPlay, setHasRecordedPlay] = useState(false);

  // Fixed: Use useRef for animated values to prevent recreation on every render
  const likeAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const glowAnimation = useRef(new Animated.Value(0)).current;

  // Audio player hook
  const {
    isPlaying,
    isCurrentPlayer,
    currentPosition,
    duration,
    togglePlayPause,
    seekTo,
    playExclusive,
    pause,
  } = useGlobalAudioPlayer(post.audio_url || null, {
    onPlaybackStatusUpdate: (status) => {
      // Track play progress for analytics
      if (isCurrentPlayer && isPlaying && !playStartTime) {
        setPlayStartTime(Date.now());
      }
    },
    onComplete: () => {
      // Record play when audio completes
      handlePlayComplete();
    },
    onError: (error) => {
      console.error("Audio playback error:", error);
    },
  });

  // Initialize like state from post data (you might want to check user's actual like status from backend)
  useEffect(() => {
    setLikeCount(post.like_count || 0);
    setPlayCount(post.play_count || 0);
    // TODO: Check if current user has liked this post
    // setIsLiked(checkUserLikeStatus(post.id));
  }, [post.like_count, post.play_count]);

  // Handle recording play when audio stops or user seeks significantly
  const recordPlaySession = useCallback(
    async (playDuration: number) => {
      if (playDuration < 3) return; // I Only record if played for at least 3 seconds

      try {
        await Api.playPost(post.id, { duration: playDuration });
        const newPlayCount = playCount + 1;
        setPlayCount(newPlayCount);
        onPlayUpdate?.(post.id, newPlayCount);
        setHasRecordedPlay(true);
      } catch (error) {
        console.error("Failed to record play:", error);
      }
    },
    [post.id, playCount, onPlayUpdate]
  );

  const handlePlayComplete = useCallback(() => {
    if (playStartTime && !hasRecordedPlay) {
      const playDuration = (Date.now() - playStartTime) / 1000;
      recordPlaySession(playDuration);
      setPlayStartTime(null);
    }
  }, [playStartTime, hasRecordedPlay, recordPlaySession]);

  // Record play session when switching to different audio or pausing after significant play
  useEffect(() => {
    return () => {
      // Cleanup: record play session when component unmounts or audio changes
      if (playStartTime && !hasRecordedPlay) {
        const playDuration = (Date.now() - playStartTime) / 1000;
        if (playDuration >= 3) {
          recordPlaySession(playDuration);
        }
      }
    };
  }, [playStartTime, hasRecordedPlay, recordPlaySession]);

  // Pan responder for waveform seeking
  const waveformRef = useRef<View>(null);
  const [waveformLayout, setWaveformLayout] = useState({ width: 0, x: 0 });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        handleSeek(evt.nativeEvent.locationX);
      },
      onPanResponderMove: (evt) => {
        handleSeek(evt.nativeEvent.locationX);
      },
      onPanResponderRelease: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
    })
  ).current;

  const handleSeek = (locationX: number) => {
    if (waveformLayout.width > 0 && duration > 0) {
      const relativeX = Math.max(0, Math.min(locationX, waveformLayout.width));
      const seekPercentage = relativeX / waveformLayout.width;
      const newPosition = seekPercentage * duration;
      seekTo(newPosition);
    }
  };

  const handlePlayPause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Glow animation
    Animated.sequence([
      Animated.timing(glowAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Handle play/pause logic with play tracking
    if (isCurrentPlayer && isPlaying) {
      // Pausing - record play session if significant time has passed
      if (playStartTime && !hasRecordedPlay) {
        const playDuration = (Date.now() - playStartTime) / 1000;
        if (playDuration >= 3) {
          recordPlaySession(playDuration);
        }
      }
      pause();
    } else {
      // Starting to play
      setPlayStartTime(Date.now());
      setHasRecordedPlay(false);
      playExclusive();
    }
  };

  const handleLike = async () => {
    if (isLiking) return; // Prevent double-tapping

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLiking(true);

    // Optimistic update
    const newIsLiked = !isLiked;
    const newLikeCount = newIsLiked ? likeCount + 1 : likeCount - 1;

    setIsLiked(newIsLiked);
    setLikeCount(newLikeCount);

    // Heart animation
    Animated.sequence([
      Animated.timing(likeAnimation, {
        toValue: 1,
        duration: 300,
        easing: Easing.elastic(1.2),
        useNativeDriver: true,
      }),
      Animated.timing(likeAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      await Api.likePost(post.id);
      onLikeUpdate?.(post.id, newLikeCount, newIsLiked);
    } catch (error) {
      // Revert optimistic update on error
      setIsLiked(!newIsLiked);
      setLikeCount(likeCount);
      console.error("Failed to like post:", error);
      toast.error("Failed to like post. Please try again.");
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const shareContent = {
        title: `Check out this ${post.type} post`,
        message: post.text
          ? `"${post.text}" by ${getUserDisplayName()}`
          : `A ${post.type} post by ${getUserDisplayName()}`,
        url: post.audio_url || undefined, // Share audio URL if available
      };

      const result = await Share.share(shareContent);

      if (result.action === Share.sharedAction) {
        // User shared successfully
        onShare?.(post);
        toast.success("Post shared successfully!");
      }
    } catch (error) {
      console.error("Error sharing post:", error);
      toast.error("Failed to share post. Please try again.");
    }
  };

  const handleBookmark = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBookmark?.(post);
    // TODO: Implement actual bookmark functionality
    toast.info("Bookmark functionality coming soon!");
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);

    // Scale animation
    Animated.sequence([
      Animated.timing(scaleAnimation, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: 200,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      }),
    ]).start();

    onPress?.();
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60 * 60)
      );

      if (diffInHours < 1) return "Just now";
      if (diffInHours < 24) return `${diffInHours}h ago`;
      if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;

      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    } catch {
      return "Recently";
    }
  };

  const formatDuration = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getUserInitials = (name?: string) => {
    if (!name) return "👤";
    const words = name.trim().split(" ");
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (
      words[0].charAt(0) + words[words.length - 1].charAt(0)
    ).toUpperCase();
  };

  const getUserDisplayName = () => {
    return post.user?.display_name || post.user?.name || "Anonymous Creator";
  };

  const heartScale = likeAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  const glowOpacity = glowAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6],
  });

  const getTypeColor = () => {
    return post.type === "audio" ? "#FF6B6B" : "#4ECDC4";
  };

  const generateWaveform = () => {
    const bars = 15;
    return Array.from({ length: bars }, () => Math.random() * 30 + 10);
  };

  const waveform = generateWaveform();
  const progressPercentage =
    duration > 0 ? (currentPosition / duration) * 100 : 0;
  const activeBars = Math.floor((progressPercentage / 100) * waveform.length);

  // Fixed: Determine the correct icon based on playing state
  const getPlayPauseIcon = () => {
    // Only show pause if this is the current player AND it's playing
    if (isCurrentPlayer && isPlaying) {
      return "pause";
    }
    // Otherwise show play
    return "play";
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnimation }] }}>
      <Pressable
        style={({ pressed }) => [
          styles.container,
          {
            backgroundColor: theme.cardBackground,
            borderColor: theme.divider,
            shadowColor: getTypeColor(),
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.1,
            shadowRadius: 16,
            elevation: 8,
          },
        ]}
        onPress={handlePress}
      >
        {/* Background Glow Effect */}
        <Animated.View
          style={[
            styles.glowEffect,
            {
              backgroundColor: getTypeColor(),
              opacity: glowOpacity,
            },
          ]}
        />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View
              style={[styles.avatarContainer, { shadowColor: getTypeColor() }]}
            >
              <View
                style={[styles.avatar, { backgroundColor: getTypeColor() }]}
              >
                <Text style={styles.avatarText}>
                  {getUserInitials(post.user?.name)}
                </Text>
              </View>
              <View
                style={[styles.onlineIndicator, { backgroundColor: "#4CD964" }]}
              />
            </View>

            <View style={styles.userDetails}>
              <Text style={[styles.userName, { color: theme.text }]}>
                {getUserDisplayName()}
              </Text>
              <View style={styles.metaContainer}>
                <View
                  style={[
                    styles.typeBadge,
                    { backgroundColor: `${getTypeColor()}20` },
                  ]}
                >
                  <Ionicons
                    name={post.type === "audio" ? "musical-notes" : "text"}
                    size={10}
                    color={getTypeColor()}
                  />
                  <Text style={[styles.typeText, { color: getTypeColor() }]}>
                    {post.type === "audio" ? "AUDIO" : "TEXT"}
                  </Text>
                </View>
                <Text style={[styles.date, { color: theme.mutedText }]}>
                  {formatDate(post.created_at)}
                </Text>
              </View>
            </View>
          </View>

          <Pressable
            onPress={handleLike}
            style={[styles.likeButton, isLiking && { opacity: 0.5 }]}
            disabled={isLiking}
            hitSlop={10}
          >
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={20}
                color={isLiked ? "#FF4757" : theme.mutedText}
              />
            </Animated.View>
          </Pressable>
        </View>

        {post.text && (
          <View style={styles.textContainer}>
            <Text
              style={[styles.text, { color: theme.text }]}
              numberOfLines={4}
              ellipsizeMode="tail"
            >
              {post.text}
            </Text>
          </View>
        )}

        {/* Audio Player */}
        {post.type === "audio" && (
          <View style={styles.audioContainer}>
            <Pressable
              style={[styles.playButton, { backgroundColor: getTypeColor() }]}
              onPress={handlePlayPause}
              hitSlop={10}
            >
              {/* Fixed: Use the correct icon based on playing state */}
              <Ionicons name={getPlayPauseIcon()} size={16} color="white" />
            </Pressable>

            {/* Waveform with seek functionality */}
            <View
              style={styles.waveformContainer}
              ref={waveformRef}
              onLayout={(event) => {
                const { width, x } = event.nativeEvent.layout;
                setWaveformLayout({ width, x });
              }}
              {...panResponder.panHandlers}
            >
              {waveform.map((height, index) => (
                <View
                  key={index}
                  style={[
                    styles.waveBar,
                    {
                      height,
                      backgroundColor:
                        index < activeBars
                          ? getTypeColor()
                          : `${getTypeColor()}40`,
                    },
                  ]}
                />
              ))}

              {/* Progress indicator line */}
              <View
                style={[
                  styles.progressIndicator,
                  {
                    left: `${progressPercentage}%`,
                    backgroundColor: getTypeColor(),
                  },
                ]}
              />
            </View>

            <Text style={[styles.duration, { color: theme.mutedText }]}>
              {formatDuration(currentPosition)} /{" "}
              {formatDuration(Number(duration) || Number(post?.duration) || 0)}
            </Text>
          </View>
        )}

        {/* Stats & Actions */}
        {showStats && (
          <View style={styles.footer}>
            <View style={styles.stats}>
              <View style={styles.stat}>
                <Ionicons name="play" size={14} color={theme.mutedText} />
                <Text style={[styles.statText, { color: theme.mutedText }]}>
                  {playCount}
                </Text>
              </View>
              <View style={styles.stat}>
                <Ionicons
                  name={isLiked ? "heart" : "heart-outline"}
                  size={14}
                  color={isLiked ? "#FF4757" : theme.mutedText}
                />
                <Text style={[styles.statText, { color: theme.mutedText }]}>
                  {likeCount}
                </Text>
              </View>
              <View style={styles.stat}>
                <Ionicons
                  name="chatbubble-outline"
                  size={14}
                  color={theme.mutedText}
                />
                <Text style={[styles.statText, { color: theme.mutedText }]}>
                  {post.comment_count || 0}
                </Text>
              </View>
            </View>

            <View style={styles.actions}>
              <Pressable
                style={[styles.actionButton, isLiking && { opacity: 0.5 }]}
                onPress={handleLike}
                disabled={isLiking}
              >
                <Ionicons
                  name={isLiked ? "heart" : "heart-outline"}
                  size={16}
                  color={isLiked ? "#FF4757" : theme.mutedText}
                />
              </Pressable>
              <Pressable style={styles.actionButton} onPress={handleShare}>
                <Ionicons
                  name="share-outline"
                  size={16}
                  color={theme.mutedText}
                />
              </Pressable>
              <Pressable style={styles.actionButton} onPress={handleBookmark}>
                <Ionicons
                  name="bookmark-outline"
                  size={16}
                  color={theme.mutedText}
                />
              </Pressable>
            </View>
          </View>
        )}

        {/* Progress Bar for Audio */}
        {post.type === "audio" && (
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBackground,
                { backgroundColor: `${getTypeColor()}20` },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: getTypeColor(),
                    width: `${progressPercentage}%`,
                  },
                ]}
              />
            </View>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    position: "relative",
    overflow: "hidden",
  },
  glowEffect: {
    position: "absolute",
    top: -20,
    left: -20,
    right: -20,
    height: 60,
    borderRadius: 30,
    opacity: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  avatarContainer: {
    position: "relative",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.8)",
  },
  avatarText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "white",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  date: {
    fontSize: 12,
    fontWeight: "500",
  },
  likeButton: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.03)",
  },
  textContainer: {
    marginBottom: 16,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "400",
    letterSpacing: -0.2,
  },
  audioContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.03)",
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  waveformContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 30,
    gap: 2,
    position: "relative",
  },
  waveBar: {
    width: 3,
    borderRadius: 1.5,
    minHeight: 4,
  },
  progressIndicator: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 2,
    borderRadius: 1,
    zIndex: 1,
  },
  duration: {
    fontSize: 12,
    fontWeight: "600",
    minWidth: 80,
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stats: {
    flexDirection: "row",
    gap: 16,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 13,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.03)",
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBackground: {
    height: 3,
    borderRadius: 1.5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 1.5,
  },
});
