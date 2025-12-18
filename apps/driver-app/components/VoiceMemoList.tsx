import { useCurrentTheme } from "@/context/CentralTheme";
import { VoiceMemo } from "@/lib/api/types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import VoiceMemoCard from "./VoiceMemoCard";

interface VoiceMemoListProps {
  voiceMemos: VoiceMemo[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onPlay: (memo: VoiceMemo) => void;
  onFavorite: (id: number) => void;
  onDelete: (id: number) => void;
  currentPlayingId?: number;
  emptyStateMessage?: string;
  emptyStateSubtitle?: string;
}

const VoiceMemoList: React.FC<VoiceMemoListProps> = ({
  voiceMemos,
  loading,
  refreshing,
  onRefresh,
  onPlay,
  onFavorite,
  onDelete,
  currentPlayingId,
  emptyStateMessage = "No voice memos yet",
  emptyStateSubtitle = "Tap the + button to create your first voice memo",
}) => {
  const theme = useCurrentTheme();

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <View
        style={[
          styles.emptyIconContainer,
          { backgroundColor: theme.primary + "15" },
        ]}
      >
        <Ionicons name="mic-outline" size={48} color={theme.primary} />
      </View>

      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        {emptyStateMessage}
      </Text>

      <Text style={[styles.emptySubtitle, { color: theme.subtleText }]}>
        {emptyStateSubtitle}
      </Text>
    </View>
  );

  const renderVoiceMemo = ({ item }: { item: VoiceMemo }) => (
    <VoiceMemoCard
      voiceMemo={item}
      onPlay={onPlay}
      onFavorite={onFavorite}
      onDelete={onDelete}
      isPlaying={currentPlayingId === item.id}
    />
  );

  return (
    <FlatList
      data={voiceMemos}
      renderItem={renderVoiceMemo}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={[
        styles.container,
        voiceMemos.length === 0 && styles.emptyContentContainer,
      ]}
      ListEmptyComponent={!loading ? EmptyState : null}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.primary}
          colors={[theme.primary]}
        />
      }
      showsVerticalScrollIndicator={false}
      style={{ flex: 1 }}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 0,
  },
  emptyContentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});

export default VoiceMemoList;
