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
import { CreateAudiobookChapterDto } from "@/lib/api/types";
import Toast from "react-native-toast-message";

const AudiobookChapterFormScreen: React.FC = () => {
  const theme = useCurrentTheme();
  const params = useLocalSearchParams();
  const audiobookId = params.audiobook_id as string;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateAudiobookChapterDto>({
    audiobook_id: audiobookId,
    title: "",
    chapter_number: 1,
    start_time: 0,
    end_time: 0,
    duration: "",
  });

  const handleSave = async () => {
    if (!formData.title.trim()) {
      Alert.alert("Validation Error", "Please enter a chapter title");
      return;
    }
    if (!formData.chapter_number) {
      Alert.alert("Validation Error", "Please enter a chapter number");
      return;
    }

    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      await Api.createAudiobookChapter(formData);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Chapter created successfully",
        position: "top",
      });

      router.back();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to create chapter",
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
          New Chapter
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
        {/* Chapter Number */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.text }]}>
            Chapter Number <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
            value={formData.chapter_number.toString()}
            onChangeText={(text) => setFormData({ ...formData, chapter_number: parseInt(text) || 1 })}
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
            placeholder="Enter chapter title"
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
            placeholder="e.g., 25:30"
            placeholderTextColor={theme.subtleText}
          />
        </View>

        <View style={styles.row}>
          {/* Start Time */}
          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={[styles.label, { color: theme.text }]}>Start Time (seconds)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
              value={formData.start_time?.toString() || "0"}
              onChangeText={(text) => setFormData({ ...formData, start_time: parseInt(text) || 0 })}
              placeholder="0"
              placeholderTextColor={theme.subtleText}
              keyboardType="numeric"
            />
          </View>

          {/* End Time */}
          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={[styles.label, { color: theme.text }]}>End Time (seconds)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
              value={formData.end_time?.toString() || "0"}
              onChangeText={(text) => setFormData({ ...formData, end_time: parseInt(text) || 0 })}
              placeholder="0"
              placeholderTextColor={theme.subtleText}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={[styles.infoBox, { backgroundColor: `${theme.primary}10`, borderColor: `${theme.primary}40` }]}>
          <Ionicons name="information-circle-outline" size={20} color={theme.primary} />
          <Text style={[styles.infoText, { color: theme.text }]}>
            Start and end times help define chapter boundaries in the audiobook.
          </Text>
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
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});

export default AudiobookChapterFormScreen;
