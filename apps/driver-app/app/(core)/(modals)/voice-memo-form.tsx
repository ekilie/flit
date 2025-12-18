import React, { useState, useEffect } from "react";
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
import { CreateVoiceMemoDto, UpdateVoiceMemoDto, VoiceMemo } from "@/lib/api/types";
import { toast, alert } from "yooo-native";
import * as DocumentPicker from "expo-document-picker";
import ScreenLayout from "@/components/ScreenLayout";

const VoiceMemoFormScreen: React.FC = () => {
  const theme = useCurrentTheme();
  const params = useLocalSearchParams();
  const memoId = params.id ? parseInt(params.id as string) : undefined;
  const isEditing = !!memoId;

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState<CreateVoiceMemoDto>({
    title: "",
    description: "",
    category: "",
    audio_url: "",
    duration: 0,
  });
  const [audioFile, setAudioFile] = useState<any>(null);

  useEffect(() => {
    loadCategories();
    if (isEditing && memoId) {
      loadVoiceMemo(memoId);
    }
  }, [memoId]);

  const loadCategories = async () => {
    try {
      const cats = await Api.getVoiceMemoCategories();
      setCategories(cats.map((c) => c.name));
    } catch (error: any) {
      console.error("Failed to load categories:", error);
    }
  };

  const loadVoiceMemo = async (id: number) => {
    try {
      setLoading(true);
      const memo = await Api.getVoiceMemo(id);
      setFormData({
        title: memo.title,
        description: memo.description || "",
        category: memo.category,
        audio_url: memo.audio_url,
        duration: memo.duration,
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to load voice memo");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handlePickAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setAudioFile(file);
        toast.success("Audio file selected");
      }
    } catch (error: any) {
      toast.error("Failed to pick audio file");
    }
  };

  const uploadAudioFile = async (): Promise<string | null> => {
    if (!audioFile) return null;

    try {
      const uploadResponse = await Api.uploadFile(
        audioFile.uri,
        audioFile.name,
        audioFile.mimeType || "audio/mpeg"
      );

      if (uploadResponse.url) {
        return uploadResponse.url;
      }

      throw new Error("No URL in upload response");
    } catch (error: any) {
      throw new Error("Failed to upload audio file: " + error.message);
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      Alert.alert("Validation Error", "Please enter a title");
      return;
    }

    if (!formData.category || !formData.category.trim()) {
      Alert.alert("Validation Error", "Please select a category");
      return;
    }

    if (!isEditing && !audioFile) {
      Alert.alert("Validation Error", "Please select an audio file");
      return;
    }

    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      let audioUrl = formData.audio_url;
      
      // Upload new audio file if selected
      if (audioFile) {
        const uploadedUrl = await uploadAudioFile();
        if (uploadedUrl) {
          audioUrl = uploadedUrl;
        }
      }

      const payload = {
        ...formData,
        audio_url: audioUrl,
      };

      if (isEditing && memoId) {
        await Api.updateVoiceMemo(memoId, payload as UpdateVoiceMemoDto);
        toast.success("Voice memo updated successfully");
      } else {
        await Api.createVoiceMemo(payload);
        toast.success("Voice memo created successfully");
      }

      router.back();
    } catch (error: any) {
      toast.error(
        error.message || `Failed to ${isEditing ? "update" : "create"} voice memo`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!memoId) return;

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
              await Api.deleteVoiceMemo(memoId);
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

  if (loading && isEditing) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text }]}>
          Loading voice memo...
        </Text>
      </View>
    );
  }

  return (
    <ScreenLayout>
      <View style={[styles.container]}>
        {/* Header */}
        <View
          style={[
            styles.header,
          ]}
        >
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="close" size={24} color={theme.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {isEditing ? "Edit Voice Memo" : "New Voice Memo"}
          </Text>
          <Pressable
            onPress={handleSave}
            disabled={loading}
            style={[styles.saveButton, { opacity: loading ? 0.5 : 1 }]}
          >
            <Text style={[styles.saveButtonText, { color: "#FFA726" }]}>
              Save
            </Text>
          </Pressable>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Audio File Picker */}
          {!isEditing && (
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.text }]}>
                Audio File
              </Text>
              <Pressable
                onPress={handlePickAudio}
                style={[
                  styles.audioPickerButton,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <Ionicons
                  name="cloud-upload-outline"
                  size={24}
                  color="#FFA726"
                />
                <Text style={[styles.audioPickerText, { color: theme.text }]}>
                  {audioFile ? audioFile.name : "Select Audio File"}
                </Text>
              </Pressable>
            </View>
          )}

          {/* Title */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.text }]}>
              Title <Text style={{ color: "#FF6B6B" }}>*</Text>
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
              placeholder="Enter title"
              placeholderTextColor={theme.subtleText}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.text }]}>
              Description
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: theme.card,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder="Enter description (optional)"
              placeholderTextColor={theme.subtleText}
              value={formData.description}
              onChangeText={(text) =>
                setFormData({ ...formData, description: text })
              }
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.text }]}>
              Category <Text style={{ color: "#FF6B6B" }}>*</Text>
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}
            >
              {categories.map((category) => (
                <Pressable
                  key={category}
                  onPress={() => setFormData({ ...formData, category })}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor:
                        formData.category === category ? "#FFA726" : theme.card,
                      borderColor:
                        formData.category === category
                          ? "#FFA726"
                          : theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      {
                        color:
                          formData.category === category ? "white" : theme.text,
                      },
                    ]}
                  >
                    {category}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Duration (for editing) */}
          {isEditing && (
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.text }]}>
                Duration (seconds)
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
                placeholder="Enter duration"
                placeholderTextColor={theme.subtleText}
                value={formData.duration.toString()}
                onChangeText={(text) =>
                  setFormData({ ...formData, duration: parseInt(text) || 0 })
                }
                keyboardType="numeric"
              />
            </View>
          )}

          {/* Delete Button (for editing) */}
          {isEditing && (
            <View style={styles.section}>
              <Pressable
                onPress={handleDelete}
                disabled={loading}
                style={[styles.deleteButton, { opacity: loading ? 0.5 : 1 }]}
              >
                <Ionicons name="trash-outline" size={20} color="white" />
                <Text style={styles.deleteButtonText}>Delete Voice Memo</Text>
              </Pressable>
            </View>
          )}
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
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  audioPickerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  audioPickerText: {
    fontSize: 16,
    flex: 1,
  },
  categoryScroll: {
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FF6B6B",
    padding: 16,
    borderRadius: 12,
  },
  deleteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default VoiceMemoFormScreen;
