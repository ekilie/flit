import FormHeader from "@/components/FormHeader";
import LoadingState from "@/components/LoadingState";
import ScreenLayout from "@/components/ScreenLayout";
import { useCurrentTheme } from "@/context/CentralTheme";
import Api from "@/lib/api";
import { Post, UpdatePostDto } from "@/lib/api/types";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { toast } from "yooo-native";

type Visibility = "public" | "private";

export default function EditPost() {
  const theme = useCurrentTheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Form state
  const [post, setPost] = useState<Post | null>(null);
  const [text, setText] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs
  const textInputRef = useRef<TextInput>(null);

  useEffect(() => {
    loadPost();
  }, [id]);

  const loadPost = async () => {
    if (!id) {
      toast.error("Invalid post ID");
      router.back();
      return;
    }

    try {
      setIsLoading(true);
      const postData = await Api.getPost(parseInt(id));
      setPost(postData);
      setText(postData.text || "");
      setVisibility(postData.visibility as Visibility);
    } catch (error) {
      console.error("Failed to load post:", error);
      toast.error("Failed to load post");
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    if (post?.type === "text" && !text.trim()) {
      toast.error("Please enter some text for your post");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !post) return;

    setIsSubmitting(true);

    try {
      const updateData: UpdatePostDto = {
        text: text.trim() || undefined,
        visibility,
      };

      console.log("Updating post with data:", updateData);

      const updatedPost = await Api.updatePost(post.id, updateData);

      toast.success("Post updated successfully!");

      // Navigate back
      router.back();
    } catch (error) {
      console.error("Failed to update post:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update post"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!post) return;

    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await Api.deletePost(post.id);
              toast.success("Post deleted successfully");
              router.back();
            } catch (error) {
              console.error("Failed to delete post:", error);
              toast.error("Failed to delete post");
            }
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <ScreenLayout>
        <Stack.Screen options={{ presentation: "modal" }} />
        <LoadingState
          message="Loading your creation..."
          type="orbital"
          showIcon
          iconName="create-outline"
        />
      </ScreenLayout>
    );
  }

  if (!post) {
    return (
      <ScreenLayout>
        <Stack.Screen options={{ presentation: "modal" }} />
        <View style={[styles.centerContainer, ,]}>
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={theme.mutedText}
          />
          <Text style={[styles.errorTitle, { color: theme.text }]}>
            Post Not Found
          </Text>
          <Text style={[styles.errorDescription, { color: theme.mutedText }]}>
            The post you're trying to edit could not be found.
          </Text>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <Stack.Screen options={{ presentation: "modal" }} />
      <ScrollView
        style={[styles.container]}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <FormHeader
          title="Edit Post"
          onCancel={handleCancel}
          onSubmit={handleSubmit}
          submitText="Save"
          isSubmitting={isSubmitting}
        />

        {/* Post Type Info */}
        <View style={styles.section}>
          <View style={styles.postTypeInfo}>
            <Ionicons
              name={post.type === "audio" ? "musical-note" : "document-text"}
              size={20}
              color={theme.primary}
            />
            <Text style={[styles.postTypeText, { color: theme.text }]}>
              {post.type === "audio" ? "Audio Post" : "Text Post"}
            </Text>
            {post.duration && (
              <Text style={[styles.durationText, { color: theme.mutedText }]}>
                • {Math.floor(post.duration / 60)}:
                {Math.floor(post.duration % 60)
                  .toString()
                  .padStart(2, "0")}
              </Text>
            )}
          </View>
        </View>

        {/* Audio Preview (if audio post) */}
        {post.type === "audio" && post.audio_url && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Audio Content
            </Text>
            <View
              style={[
                styles.audioPreview,
                { backgroundColor: theme.cardBackground },
              ]}
            >
              <Ionicons name="musical-note" size={24} color={theme.primary} />
              <Text style={[styles.audioText, { color: theme.text }]}>
                Audio file attached
              </Text>
              <Text style={[styles.audioNote, { color: theme.mutedText }]}>
                Audio content cannot be edited
              </Text>
            </View>
          </View>
        )}

        {/* Text Input */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {post.type === "audio" ? "Description" : "Content"}
          </Text>
          <TextInput
            ref={textInputRef}
            style={[
              styles.textInput,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.divider,
                color: theme.text,
              },
            ]}
            placeholder={
              post.type === "audio"
                ? "What's this audio about?"
                : "Share your thoughts..."
            }
            placeholderTextColor={theme.mutedText}
            value={text}
            onChangeText={setText}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Visibility Selector */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Visibility
          </Text>
          <View style={styles.visibilitySelector}>
            <Pressable
              onPress={() => setVisibility("public")}
              style={[
                styles.visibilityButton,
                {
                  backgroundColor:
                    visibility === "public"
                      ? theme.primary
                      : theme.cardBackground,
                  borderColor:
                    visibility === "public" ? theme.primary : theme.divider,
                },
              ]}
            >
              <Ionicons
                name="globe"
                size={20}
                color={visibility === "public" ? "white" : theme.text}
              />
              <View>
                <Text
                  style={[
                    styles.visibilityButtonTitle,
                    { color: visibility === "public" ? "white" : theme.text },
                  ]}
                >
                  Public
                </Text>
                <Text
                  style={[
                    styles.visibilityButtonSubtitle,
                    {
                      color:
                        visibility === "public"
                          ? "rgba(255,255,255,0.8)"
                          : theme.mutedText,
                    },
                  ]}
                >
                  Anyone can see this
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => setVisibility("private")}
              style={[
                styles.visibilityButton,
                {
                  backgroundColor:
                    visibility === "private"
                      ? theme.primary
                      : theme.cardBackground,
                  borderColor:
                    visibility === "private" ? theme.primary : theme.divider,
                },
              ]}
            >
              <Ionicons
                name="lock-closed"
                size={20}
                color={visibility === "private" ? "white" : theme.text}
              />
              <View>
                <Text
                  style={[
                    styles.visibilityButtonTitle,
                    { color: visibility === "private" ? "white" : theme.text },
                  ]}
                >
                  Private
                </Text>
                <Text
                  style={[
                    styles.visibilityButtonSubtitle,
                    {
                      color:
                        visibility === "private"
                          ? "rgba(255,255,255,0.8)"
                          : theme.mutedText,
                    },
                  ]}
                >
                  Only you can see this
                </Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* Delete Button */}
        <View style={styles.section}>
          <Pressable
            onPress={handleDelete}
            style={[styles.deleteButton, { borderColor: theme.error }]}
          >
            <Ionicons name="trash-outline" size={20} color={theme.error} />
            <Text style={[styles.deleteButtonText, { color: theme.error }]}>
              Delete Post
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    fontWeight: "500",
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  errorDescription: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  postTypeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  postTypeText: {
    fontSize: 16,
    fontWeight: "600",
  },
  durationText: {
    fontSize: 14,
  },
  audioPreview: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
  },
  audioText: {
    fontSize: 16,
    fontWeight: "600",
  },
  audioNote: {
    fontSize: 14,
    textAlign: "center",
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
  },
  visibilitySelector: {
    gap: 12,
  },
  visibilityButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  visibilityButtonTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  visibilityButtonSubtitle: {
    fontSize: 14,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
