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
import { CreateAudiobookDto, UpdateAudiobookDto } from "@/lib/api/types";
import Toast from "react-native-toast-message";

const AudiobookFormScreen: React.FC = () => {
  const theme = useCurrentTheme();
  const params = useLocalSearchParams();
  const audiobookId = params.id as string | undefined;
  const isEditing = !!audiobookId;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateAudiobookDto>({
    title: "",
    author: "",
    narrator: "",
    description: "",
    cover_url: "",
    genre: "",
    color: "#6C5CE7",
    duration: "",
    release_year: new Date().getFullYear(),
    publisher: "",
    audio_url: "",
    language: "English",
  });

  React.useEffect(() => {
    if (isEditing && audiobookId) {
      loadAudiobook(audiobookId);
    }
  }, [audiobookId]);

  const loadAudiobook = async (id: string) => {
    try {
      setLoading(true);
      const audiobook = await Api.getAudiobook(id);
      setFormData({
        title: audiobook.title,
        author: audiobook.author,
        narrator: audiobook.narrator,
        description: audiobook.description,
        cover_url: audiobook.cover,
        genre: audiobook.genre,
        color: audiobook.color,
        duration: audiobook.duration,
        release_year: audiobook.release_year,
        publisher: audiobook.publisher,
        audio_url: audiobook.audio_url,
        language: audiobook.language,
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to load audiobook",
        position: "top",
      });
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      Alert.alert("Validation Error", "Please enter an audiobook title");
      return;
    }
    if (!formData.author.trim()) {
      Alert.alert("Validation Error", "Please enter an author name");
      return;
    }

    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (isEditing && audiobookId) {
        await Api.updateAudiobook(audiobookId, formData as UpdateAudiobookDto);
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Audiobook updated successfully",
          position: "top",
        });
      } else {
        await Api.createAudiobook(formData);
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Audiobook created successfully",
          position: "top",
        });
      }

      router.back();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || `Failed to ${isEditing ? "update" : "create"} audiobook`,
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!audiobookId) return;

    Alert.alert(
      "Delete Audiobook",
      "Are you sure you want to delete this audiobook? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await Api.deleteAudiobook(audiobookId);
              Toast.show({
                type: "success",
                text1: "Success",
                text2: "Audiobook deleted successfully",
                position: "top",
              });
              router.back();
            } catch (error: any) {
              Toast.show({
                type: "error",
                text1: "Error",
                text2: error.message || "Failed to delete audiobook",
                position: "top",
              });
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
          Loading audiobook...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {isEditing ? "Edit Audiobook" : "New Audiobook"}
        </Text>
        <Pressable
          onPress={handleSave}
          disabled={loading}
          style={[styles.saveButton, { opacity: loading ? 0.5 : 1 }]}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#6C5CE7" />
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
            style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            placeholder="Enter audiobook title"
            placeholderTextColor={theme.subtleText}
          />
        </View>

        {/* Author */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.text }]}>
            Author <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
            value={formData.author}
            onChangeText={(text) => setFormData({ ...formData, author: text })}
            placeholder="Enter author name"
            placeholderTextColor={theme.subtleText}
          />
        </View>

        {/* Narrator */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Narrator</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
            value={formData.narrator}
            onChangeText={(text) => setFormData({ ...formData, narrator: text })}
            placeholder="Enter narrator name"
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
            placeholder="Enter audiobook description"
            placeholderTextColor={theme.subtleText}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Cover URL */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Cover URL</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
            value={formData.cover_url}
            onChangeText={(text) => setFormData({ ...formData, cover_url: text })}
            placeholder="https://example.com/cover.jpg"
            placeholderTextColor={theme.subtleText}
            autoCapitalize="none"
            keyboardType="url"
          />
        </View>

        {/* Audio URL */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Audio URL</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
            value={formData.audio_url}
            onChangeText={(text) => setFormData({ ...formData, audio_url: text })}
            placeholder="https://example.com/audio.mp3"
            placeholderTextColor={theme.subtleText}
            autoCapitalize="none"
            keyboardType="url"
          />
        </View>

        {/* Genre */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Genre</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
            value={formData.genre}
            onChangeText={(text) => setFormData({ ...formData, genre: text })}
            placeholder="e.g., Fiction, Self-Help, Sci-Fi"
            placeholderTextColor={theme.subtleText}
          />
        </View>

        {/* Duration */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Duration</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
            value={formData.duration}
            onChangeText={(text) => setFormData({ ...formData, duration: text })}
            placeholder="e.g., 8h 30m"
            placeholderTextColor={theme.subtleText}
          />
        </View>

        <View style={styles.row}>
          {/* Release Year */}
          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={[styles.label, { color: theme.text }]}>Release Year</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
              value={formData.release_year?.toString() || ""}
              onChangeText={(text) => setFormData({ ...formData, release_year: parseInt(text) || undefined })}
              placeholder="2024"
              placeholderTextColor={theme.subtleText}
              keyboardType="numeric"
            />
          </View>

          {/* Language */}
          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={[styles.label, { color: theme.text }]}>Language</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
              value={formData.language}
              onChangeText={(text) => setFormData({ ...formData, language: text })}
              placeholder="English"
              placeholderTextColor={theme.subtleText}
            />
          </View>
        </View>

        {/* Publisher */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Publisher</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
            value={formData.publisher}
            onChangeText={(text) => setFormData({ ...formData, publisher: text })}
            placeholder="Enter publisher name"
            placeholderTextColor={theme.subtleText}
          />
        </View>

        {/* Color */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Theme Color</Text>
          <View style={styles.colorRow}>
            <TextInput
              style={[styles.input, styles.colorInput, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
              value={formData.color}
              onChangeText={(text) => setFormData({ ...formData, color: text })}
              placeholder="#6C5CE7"
              placeholderTextColor={theme.subtleText}
              autoCapitalize="none"
            />
            <View style={[styles.colorPreview, { backgroundColor: formData.color || "#6C5CE7" }]} />
          </View>
        </View>

        {/* Delete Button (only when editing) */}
        {isEditing && (
          <Pressable
            onPress={handleDelete}
            disabled={loading}
            style={[styles.deleteButton, { opacity: loading ? 0.5 : 1 }]}
          >
            <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
            <Text style={styles.deleteButtonText}>Delete Audiobook</Text>
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
    color: "#6C5CE7",
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
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
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

export default AudiobookFormScreen;
