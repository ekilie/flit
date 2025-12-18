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
import { CreatePodcastEpisodeDto } from "@/lib/api/types";
import Toast from "react-native-toast-message";

const PodcastEpisodeFormScreen: React.FC = () => {
  const theme = useCurrentTheme();
  const params = useLocalSearchParams();
  const podcastId = params.podcast_id as string;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreatePodcastEpisodeDto>({
    podcast_id: podcastId,
    title: "",
    description: "",
    duration: "",
    audio_url: "",
    episode_number: 1,
  });

  const handleSave = async () => {
    if (!formData.title.trim()) {
      Alert.alert("Validation Error", "Please enter an episode title");
      return;
    }
    if (!formData.episode_number) {
      Alert.alert("Validation Error", "Please enter an episode number");
      return;
    }

    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      await Api.createPodcastEpisode(formData);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Episode created successfully",
        position: "top",
      });

      router.back();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to create episode",
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          New Episode
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
        {/* Episode Number */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.text }]}>
            Episode Number <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
            value={formData.episode_number.toString()}
            onChangeText={(text) => setFormData({ ...formData, episode_number: parseInt(text) || 1 })}
            placeholder="1"
            placeholderTextColor={theme.subtleText}
            keyboardType="numeric"
          />
        </View>

        {/* Title */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.text }]}>
            Title <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            placeholder="Enter episode title"
            placeholderTextColor={theme.subtleText}
          />
        </View>

        {/* Description */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Description</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="Enter episode description"
            placeholderTextColor={theme.subtleText}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Duration */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Duration</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
            value={formData.duration}
            onChangeText={(text) => setFormData({ ...formData, duration: text })}
            placeholder="e.g., 45:30"
            placeholderTextColor={theme.subtleText}
          />
        </View>

        {/* Audio URL */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Audio URL</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
            value={formData.audio_url}
            onChangeText={(text) => setFormData({ ...formData, audio_url: text })}
            placeholder="https://example.com/episode.mp3"
            placeholderTextColor={theme.subtleText}
            autoCapitalize="none"
            keyboardType="url"
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});

export default PodcastEpisodeFormScreen;
