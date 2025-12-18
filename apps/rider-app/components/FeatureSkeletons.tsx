import { SkeletonCard, SkeletonItem } from "@/components/SkeletonLoader";
import { useCurrentTheme } from "@/context/CentralTheme";
import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";

const { width } = Dimensions.get("window");

export const VoiceMemoryCapsulesSkeletonCard: React.FC = () => {
  const theme = useCurrentTheme();

  return (
    <View
      style={[
        styles.capsuleCard,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
    >
      <SkeletonItem
        width={60}
        height={60}
        borderRadius={30}
        style={{ marginRight: 12 }}
      />
      <View style={styles.capsuleContent}>
        <SkeletonItem width="80%" height={18} style={{ marginBottom: 6 }} />
        <SkeletonItem width="60%" height={14} style={{ marginBottom: 8 }} />
        <View style={styles.capsuleInfo}>
          <SkeletonItem width={80} height={12} />
          <SkeletonItem width={50} height={12} />
        </View>
      </View>
      <SkeletonItem width={40} height={40} borderRadius={20} />
    </View>
  );
};

export const PlaylistMixSkeletonCard: React.FC = () => {
  const theme = useCurrentTheme();

  return (
    <View
      style={[
        styles.mixCard,
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
        <SkeletonItem width="85%" height={18} style={{ marginBottom: 6 }} />
        <SkeletonItem width="65%" height={14} style={{ marginBottom: 8 }} />
        <View style={styles.mixInfo}>
          <SkeletonItem width={60} height={12} />
          <SkeletonItem width={80} height={12} />
        </View>
      </View>
      <SkeletonItem width={40} height={40} borderRadius={20} />
    </View>
  );
};

export const MicroStorySkeletonCard: React.FC = () => {
  const theme = useCurrentTheme();

  return (
    <View
      style={[
        styles.storyCard,
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
        <SkeletonItem width="90%" height={18} style={{ marginBottom: 6 }} />
        <SkeletonItem width="75%" height={14} style={{ marginBottom: 8 }} />
        <View style={styles.storyInfo}>
          <SkeletonItem width={70} height={12} />
          <SkeletonItem width={50} height={12} />
        </View>
      </View>
      <SkeletonItem width={36} height={36} borderRadius={18} />
    </View>
  );
};

export const PodcastEpisodeSkeletonCard: React.FC = () => {
  const theme = useCurrentTheme();

  return (
    <View
      style={[
        styles.episodeCard,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
    >
      <SkeletonItem
        width={80}
        height={80}
        borderRadius={8}
        style={{ marginRight: 16 }}
      />
      <View style={styles.episodeContent}>
        <SkeletonItem width="90%" height={16} style={{ marginBottom: 4 }} />
        <SkeletonItem width="75%" height={18} style={{ marginBottom: 6 }} />
        <SkeletonItem width="60%" height={14} style={{ marginBottom: 8 }} />
        <View style={styles.episodeInfo}>
          <SkeletonItem width={60} height={12} />
          <SkeletonItem width={80} height={12} />
        </View>
      </View>
      <SkeletonItem width={40} height={40} borderRadius={20} />
    </View>
  );
};

interface FeatureSkeletonListProps {
  type: "voice-memory" | "playlist-mixes" | "micro-stories" | "podcasts";
  itemCount?: number;
}

export const FeatureSkeletonList: React.FC<FeatureSkeletonListProps> = ({
  type,
  itemCount = 5,
}) => {
  const renderSkeletonCard = () => {
    switch (type) {
      case "voice-memory":
        return <VoiceMemoryCapsulesSkeletonCard />;
      case "playlist-mixes":
        return <PlaylistMixSkeletonCard />;
      case "micro-stories":
        return <MicroStorySkeletonCard />;
      case "podcasts":
        return <PodcastEpisodeSkeletonCard />;
      default:
        return <SkeletonCard />;
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length: itemCount }).map((_, index) => (
        <View key={index} style={styles.listItem}>
          {renderSkeletonCard()}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listItem: {
    marginBottom: 12,
  },
  capsuleCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  capsuleContent: {
    flex: 1,
  },
  capsuleInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  mixCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  mixContent: {
    flex: 1,
  },
  mixInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  storyCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  storyContent: {
    flex: 1,
  },
  storyInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  episodeCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  episodeContent: {
    flex: 1,
  },
  episodeInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
