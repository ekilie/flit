import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PodcastEpisode, Podcast } from "@/lib/api/types";
import { usePodcastPlayer } from "@/hooks/usePodcastPlayer";

interface PodcastEpisodePlayerButtonProps {
  episode: PodcastEpisode;
  podcast?: Podcast;
  allEpisodes?: PodcastEpisode[];
  iconSize?: number;
  variant?: "icon" | "full";
}

export default function PodcastEpisodePlayerButton({
  episode,
  podcast,
  allEpisodes,
  iconSize = 32,
  variant = "icon",
}: PodcastEpisodePlayerButtonProps) {
  const {
    playPodcastEpisode,
    currentItem,
    isPlaying,
    togglePlayPause,
  } = usePodcastPlayer();

  const [loading, setLoading] = useState(false);

  const isCurrentEpisode = currentItem?.id === episode.id;

  const handlePlayPress = async () => {
    if (isCurrentEpisode) {
      togglePlayPause();
    } else {
      setLoading(true);
      try {
        await playPodcastEpisode(episode, podcast, allEpisodes);
      } finally {
        setLoading(false);
      }
    }
  };

  if (variant === "full") {
    return (
      <Pressable
        style={[
          styles.fullButton,
          isCurrentEpisode && isPlaying && styles.activeFullButton,
        ]}
        onPress={handlePlayPress}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Ionicons
            name={isCurrentEpisode && isPlaying ? "pause" : "play"}
            size={20}
            color="#fff"
          />
        )}
        <Text style={styles.fullButtonText}>
          {isCurrentEpisode && isPlaying ? "Pause" : "Play Episode"}
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={[
        styles.iconButton,
        isCurrentEpisode && isPlaying && styles.activeIconButton,
      ]}
      onPress={handlePlayPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <Ionicons
          name={isCurrentEpisode && isPlaying ? "pause" : "play"}
          size={iconSize}
          color="#fff"
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  activeIconButton: {
    backgroundColor: "#1DB954",
  },
  fullButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  activeFullButton: {
    backgroundColor: "#1DB954",
  },
  fullButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
