import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useCurrentTheme } from "@/context/CentralTheme";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import Api from "@/lib/api";
import { VoiceMemo } from "@/lib/api/types";
import { formatDuration } from "@/lib/utils";
import { toast, alert } from "yooo-native";
import { LinearGradient } from "expo-linear-gradient";
import ScreenLayout from "@/components/ScreenLayout";

const VoiceMemoDetailScreen: React.FC = () => {
  const theme = useCurrentTheme();
  const params = useLocalSearchParams();
  const memoId = params.id ? parseInt(params.id as string) : undefined;

  const [loading, setLoading] = useState(true);
  const [memo, setMemo] = useState<VoiceMemo | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (memoId) {
      loadVoiceMemo(memoId);
    }
  }, [memoId]);

  const loadVoiceMemo = async (id: number) => {
    try {
      setLoading(true);
      const data = await Api.getVoiceMemo(id);
      setMemo(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load voice memo");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = async () => {
    if (!memo) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsPlaying(!isPlaying);
      await Api.playVoiceMemo(memo.id, memo.duration);
      // TODO: Integrate with actual audio player
    } catch (error: any) {
      toast.error("Failed to play voice memo");
      setIsPlaying(false);
    }
  };

  const handleFavorite = async () => {
    if (!memo) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const updated = await Api.toggleVoiceMemoFavorite(memo.id);
      setMemo(updated);
      toast.success(
        updated.is_favorite
          ? "Added to favorites"
          : "Removed from favorites"
      );
    } catch (error: any) {
      toast.error("Failed to update favorite");
    }
  };

  const handleEdit = () => {
    if (!memo) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/(core)/(modals)/voice-memo-form?id=${memo.id}` as any);
  };

  const handleDelete = async () => {
    if (!memo) return;

    alert.dialog(
      "Delete Voice Memo",
      "Are you sure you want to delete this voice memo? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await Api.deleteVoiceMemo(memo.id);
              toast.success("Voice memo deleted successfully");
              router.back();
            } catch (error: any) {
              toast.error(error.message || "Failed to delete voice memo");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text }]}>
          Loading voice memo...
        </Text>
      </View>
    );
  }

  if (!memo) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: theme.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={theme.mutedText} />
        <Text style={[styles.loadingText, { color: theme.text }]}>
          Voice memo not found
        </Text>
      </View>
    );
  }

  const memoColor = "#FFA726";

  return (
    <ScreenLayout>
      <View style={[styles.container]}>
        {/* Header */}
        <View style={[styles.header]}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="close" size={24} color={theme.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Voice Memo
          </Text>
          <Pressable onPress={handleEdit} style={styles.editButton}>
            <Ionicons name="create-outline" size={24} color={theme.text} />
          </Pressable>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View
              style={styles.heroGradient}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: `${memoColor}30` },
                ]}
              >
                <Ionicons name="mic" size={64} color={memoColor} />
              </View>
            </View>
          </View>

          {/* Title and Category */}
          <View style={styles.titleSection}>
            <Text style={[styles.title, { color: theme.text }]}>
              {memo.title}
            </Text>
            <View style={styles.categoryBadge}>
              <Ionicons name="pricetag" size={14} color={memoColor} />
              <Text style={[styles.categoryText, { color: memoColor }]}>
                {memo.category}
              </Text>
            </View>
          </View>

          {/* Description */}
          {memo.description && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Description
              </Text>
              <Text style={[styles.description, { color: theme.subtleText }]}>
                {memo.description}
              </Text>
            </View>
          )}

          {/* Metadata */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Details
            </Text>
            <View style={styles.metadataGrid}>
              <View
                style={[
                  styles.metadataCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <Ionicons name="time-outline" size={24} color={memoColor} />
                <Text
                  style={[styles.metadataLabel, { color: theme.subtleText }]}
                >
                  Duration
                </Text>
                <Text style={[styles.metadataValue, { color: theme.text }]}>
                  {formatDuration(memo.duration)}
                </Text>
              </View>
              <View
                style={[
                  styles.metadataCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <Ionicons name="calendar-outline" size={24} color={memoColor} />
                <Text
                  style={[styles.metadataLabel, { color: theme.subtleText }]}
                >
                  Created
                </Text>
                <Text style={[styles.metadataValue, { color: theme.text }]}>
                  {new Date(memo.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsSection}>
            <Pressable
              onPress={handlePlay}
              style={[styles.playButton, { backgroundColor: memoColor }]}
            >
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={24}
                color="white"
              />
              <Text style={styles.playButtonText}>
                {isPlaying ? "Pause" : "Play"}
              </Text>
            </Pressable>

            <View style={styles.actionButtons}>
              <Pressable
                onPress={handleFavorite}
                style={[
                  styles.actionButton,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <Ionicons
                  name={memo.is_favorite ? "heart" : "heart-outline"}
                  size={24}
                  color={memo.is_favorite ? "#FF6B6B" : theme.text}
                />
                <Text style={[styles.actionButtonText, { color: theme.text }]}>
                  {memo.is_favorite ? "Favorited" : "Favorite"}
                </Text>
              </Pressable>

              <Pressable
                onPress={handleDelete}
                style={[
                  styles.actionButton,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <Ionicons name="trash-outline" size={24} color="#FF6B6B" />
                <Text style={[styles.actionButtonText, { color: "#FF6B6B" }]}>
                  Delete
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  editButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  heroSection: {
    marginBottom: 24,
  },
  heroGradient: {
    padding: 40,
    alignItems: "center",
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  titleSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFA72620",
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  metadataGrid: {
    flexDirection: "row",
    gap: 12,
  },
  metadataCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  metadataLabel: {
    fontSize: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  metadataValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  actionsSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  playButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
  },
  playButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export default VoiceMemoDetailScreen;
