import { useCurrentTheme } from "@/context/CentralTheme";
import { VoiceMemo } from "@/lib/api/types";
import { formatDuration } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface VoiceMemoCardProps {
  voiceMemo: VoiceMemo;
  onPlay: (memo: VoiceMemo) => void;
  onFavorite: (id: number) => void;
  onDelete: (id: number) => void;
  isPlaying?: boolean;
}

const VoiceMemoCard: React.FC<VoiceMemoCardProps> = ({
  voiceMemo,
  onPlay,
  onFavorite,
  onDelete,
  isPlaying = false,
}) => {
  const theme = useCurrentTheme();
  const [pressed, setPressed] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], {
        weekday: "short",
      });
    } else {
      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
    }
  };

  const getCategoryIcon = (
    category: string
  ): keyof typeof Ionicons.glyphMap => {
    const icons: { [key: string]: keyof typeof Ionicons.glyphMap } = {
      general: "mic-outline",
      personal: "person-outline",
      work: "briefcase-outline",
      ideas: "bulb-outline",
      reminders: "alarm-outline",
      meetings: "people-outline",
    };
    return icons[category] || "mic-outline";
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      general: "#007AFF",
      personal: "#34C759",
      work: "#FF9500",
      ideas: "#FF2D92",
      reminders: "#FF3B30",
      meetings: "#5856D6",
    };
    return colors[category] || theme.primary;
  };

  const handleLongPress = () => {
    Alert.alert("Voice Memo Options", `"${voiceMemo.title}"`, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: voiceMemo.is_favorite
          ? "Remove from Favorites"
          : "Add to Favorites",
        onPress: () => onFavorite(voiceMemo.id),
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          Alert.alert(
            "Delete Voice Memo",
            "Are you sure you want to delete this voice memo? This action cannot be undone.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete",
                style: "destructive",
                onPress: () => onDelete(voiceMemo.id),
              },
            ]
          );
        },
      },
    ]);
  };

  return (
    <Pressable
      onPress={() => onPlay(voiceMemo)}
      onLongPress={handleLongPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.container,
        {
          backgroundColor: pressed ? theme.card + "CC" : theme.card,
          borderColor: isPlaying ? theme.primary : theme.border,
          borderWidth: isPlaying ? 2 : 1,
        },
      ]}
    >
      {/* Category Indicator */}
      <View
        style={[
          styles.categoryIndicator,
          { backgroundColor: getCategoryColor(voiceMemo.category) },
        ]}
      />

      {/* Main Content */}
      <View style={styles.content}>
        {/* Header Row */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.title,
                { color: theme.text },
                isPlaying && { color: theme.primary },
              ]}
              numberOfLines={1}
            >
              {voiceMemo.title}
            </Text>
            {voiceMemo.is_favorite && (
              <Ionicons
                name="heart"
                size={14}
                color={theme.accent}
                style={styles.favoriteIcon}
              />
            )}
          </View>

          <Text style={[styles.date, { color: theme.subtleText }]}>
            {formatDate(voiceMemo.created_at)}
          </Text>
        </View>

        {/* Description */}
        {voiceMemo.description && (
          <Text
            style={[styles.description, { color: theme.subtleText }]}
            numberOfLines={2}
          >
            {voiceMemo.description}
          </Text>
        )}

        {/* Metadata Row */}
        <View style={styles.metadata}>
          <View style={styles.metadataItem}>
            <Ionicons
              name={getCategoryIcon(voiceMemo.category)}
              size={14}
              color={getCategoryColor(voiceMemo.category)}
            />
            <Text
              style={[
                styles.metadataText,
                { color: getCategoryColor(voiceMemo.category) },
              ]}
            >
              {voiceMemo.category}
            </Text>
          </View>

          <View style={styles.metadataItem}>
            <Ionicons name="time-outline" size={14} color={theme.subtleText} />
            <Text style={[styles.metadataText, { color: theme.subtleText }]}>
              {formatDuration(voiceMemo.duration)}
            </Text>
          </View>

          {voiceMemo.play_count > 0 && (
            <View style={styles.metadataItem}>
              <Ionicons
                name="play-outline"
                size={14}
                color={theme.subtleText}
              />
              <Text style={[styles.metadataText, { color: theme.subtleText }]}>
                {voiceMemo.play_count}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Play Button */}
      <View style={styles.playButton}>
        <View
          style={[
            styles.playButtonCircle,
            {
              backgroundColor: isPlaying ? theme.primary : theme.background,
              borderColor: theme.primary,
            },
          ]}
        >
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={20}
            color={isPlaying ? "white" : theme.primary}
          />
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    position: "relative",
  },
  categoryIndicator: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  content: {
    flex: 1,
    padding: 16,
    paddingLeft: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  titleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  favoriteIcon: {
    marginLeft: 6,
  },
  date: {
    fontSize: 12,
    fontWeight: "500",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  metadata: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  metadataItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metadataText: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  playButton: {
    position: "absolute",
    right: 16,
    top: "50%",
    transform: [{ translateY: -22 }],
  },
  playButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default VoiceMemoCard;
