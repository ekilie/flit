import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useCurrentTheme } from "@/context/CentralTheme";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import Api from "@/lib/api";
import { CreatePodcastDto, UpdatePodcastDto, Podcast } from "@/lib/api/types";
import { alert, toast } from "yooo-native";

const PodcastFormScreen: React.FC = () => {
  const theme = useCurrentTheme();
  const params = useLocalSearchParams();
  const podcastId = params.id as string | undefined;
  const isEditing = !!podcastId;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreatePodcastDto>({
    title: "",
    host: "",
    description: "",
    artwork_url: "",
    category: "",
    color: "#45B7D1",
    release_frequency: "Weekly",
  });

  React.useEffect(() => {
    if (isEditing && podcastId) {
      loadPodcast(podcastId);
    }
  }, [podcastId]);

  const loadPodcast = async (id: string) => {
    try {
      setLoading(true);
      const podcast = await Api.getPodcast(id);
      setFormData({
        title: podcast.title,
        host: podcast.host,
        description: podcast.description,
        artwork_url: podcast.artwork,
        category: podcast.category,
        color: podcast.color,
        release_frequency: podcast.release_frequency,
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to load podcast");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      Alert.alert("Validation Error", "Please enter a podcast title");
      return;
    }

    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (isEditing && podcastId) {
        await Api.updatePodcast(podcastId, formData as UpdatePodcastDto);
        toast.success("Podcast updated successfully");
      } else {
        await Api.createPodcast(formData);
        toast.success("Podcast created successfully");
      }

      router.back();
    } catch (error: any) {
      toast.error(
        error.message || `Failed to ${isEditing ? "update" : "create"} podcast`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!podcastId) return;

    alert.dialog(
      "Delete Podcast",
      "Are you sure you want to delete this podcast? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await Api.deletePodcast(podcastId);
              toast.success("Podcast deleted successfully");
              router.back();
            } catch (error: any) {
              toast.error(error.message || "Failed to delete podcast");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading && isEditing) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text }]}>
          Loading podcast...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: theme.card, borderBottomColor: theme.border },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {isEditing ? "Edit Podcast" : "New Podcast"}
        </Text>
        <Pressable
          onPress={handleSave}
          disabled={loading}
          style={[styles.saveButton, { opacity: loading ? 0.5 : 1 }]}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#45B7D1" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </Pressable>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Title */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.text }]}>
            Title <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.card,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            placeholder="Enter podcast title"
            placeholderTextColor={theme.subtleText}
          />
        </View>

        {/* Host */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Host</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.card,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            value={formData.host}
            onChangeText={(text) => setFormData({ ...formData, host: text })}
            placeholder="Enter host name"
            placeholderTextColor={theme.subtleText}
          />
        </View>

        {/* Description */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Description</Text>
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: theme.card,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            value={formData.description}
            onChangeText={(text) =>
              setFormData({ ...formData, description: text })
            }
            placeholder="Enter podcast description"
            placeholderTextColor={theme.subtleText}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Artwork URL */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Artwork URL</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.card,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            value={formData.artwork_url}
            onChangeText={(text) =>
              setFormData({ ...formData, artwork_url: text })
            }
            placeholder="https://example.com/artwork.jpg"
            placeholderTextColor={theme.subtleText}
            autoCapitalize="none"
            keyboardType="url"
          />
        </View>

        {/* Category */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Category</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.card,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            value={formData.category}
            onChangeText={(text) =>
              setFormData({ ...formData, category: text })
            }
            placeholder="e.g., Technology, Business, Health"
            placeholderTextColor={theme.subtleText}
          />
        </View>

        {/* Color */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Theme Color</Text>
          <View style={styles.colorRow}>
            <TextInput
              style={[
                styles.input,
                styles.colorInput,
                {
                  backgroundColor: theme.card,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              value={formData.color}
              onChangeText={(text) => setFormData({ ...formData, color: text })}
              placeholder="#45B7D1"
              placeholderTextColor={theme.subtleText}
              autoCapitalize="none"
            />
            <View
              style={[
                styles.colorPreview,
                { backgroundColor: formData.color || "#45B7D1" },
              ]}
            />
          </View>
        </View>

        {/* Release Frequency */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.text }]}>
            Release Frequency
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.card,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            value={formData.release_frequency}
            onChangeText={(text) =>
              setFormData({ ...formData, release_frequency: text })
            }
            placeholder="e.g., Daily, Weekly, Bi-weekly"
            placeholderTextColor={theme.subtleText}
          />
        </View>

        {/* Delete Button (only when editing) */}
        {isEditing && (
          <Pressable
            onPress={handleDelete}
            disabled={loading}
            style={[styles.deleteButton, { opacity: loading ? 0.5 : 1 }]}
          >
            <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
            <Text style={styles.deleteButtonText}>Delete Podcast</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
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
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveButtonText: {
    color: "#45B7D1",
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  required: {
    color: "#FF6B6B",
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
  },
  colorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  colorInput: {
    flex: 1,
  },
  colorPreview: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#FF6B6B20",
    marginTop: 20,
  },
  deleteButtonText: {
    color: "#FF6B6B",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default PodcastFormScreen;
