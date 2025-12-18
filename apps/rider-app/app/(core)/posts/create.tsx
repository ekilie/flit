import FormHeader from "@/components/FormHeader";
import ScreenLayout from "@/components/ScreenLayout";
import TagInput from "@/components/TagInput";
import WaveformRecorder from "@/components/WaveformRecorder";
import { useCurrentTheme } from "@/context/CentralTheme";
import { useGlobalAudioPlayer } from "@/hooks/use-global-audio-player";
import Api from "@/lib/api";
import { CreatePostDto } from "@/lib/api/types";
import { Ionicons } from "@expo/vector-icons";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import * as DocumentPicker from "expo-document-picker";
import { router, Stack } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { alert, toast } from "yooo-native";
import { useAuth } from "@/context/ctx";

const { width } = Dimensions.get("window");

type Visibility = "public" | "private";

interface AudioFile {
  uri: string;
  name: string;
  size: number;
  mimeType: string;
}

export default function CreatePost() {
  const theme = useCurrentTheme();
  const { user, refreshUserData } = useAuth();

  const [text, setText] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [hasPermission, setHasPermission] = useState(false);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const audioPlayer = useGlobalAudioPlayer(audioFile?.uri || null);

  const textInputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Requesting recording permissions on mount
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        toast.error("Microphone permission is required to record audio");
      } else {
        setHasPermission(true);
      }

      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
    })();
  }, []);

  useEffect(() => {
    if (recorderState.isRecording) {
      setIsRecording(true);
    } else {
      setIsRecording(false);
    }
  }, [recorderState.isRecording]);

  const startRecording = async () => {
    if (!hasPermission) {
      toast.error("Microphone permission is required");
      return;
    }

    try {
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start recording", err);
      toast.error("Failed to start recording");
    }
  };

  const stopRecording = async () => {
    try {
      await audioRecorder.stop();
      setIsRecording(false);

      const uri = audioRecorder.uri;
      if (uri) {
        const duration = recorderState.durationMillis / 1000;
        setAudioDuration(duration);

        setAudioFile({
          uri,
          name: `recording_${Date.now()}.m4a`,
          size: 0,
          mimeType: "audio/m4a",
        });
      }
    } catch (err) {
      console.error("Failed to stop recording", err);
      toast.error("Failed to stop recording");
    }
  };

  useEffect(() => {
    // Track player state
    setIsPlaying(audioPlayer.isPlaying);
  }, [audioPlayer.isPlaying]);

  useEffect(() => {
    // Update duration when player loads audio
    if (audioPlayer.duration > 0 && audioDuration === 0) {
      setAudioDuration(audioPlayer.duration);
    }
  }, [audioPlayer.duration]);

  const playRecording = async () => {
    if (!audioFile) return;

    try {
      await audioPlayer.togglePlayPause();
    } catch (error) {
      console.error("Error playing sound:", error);
      toast.error("Failed to play recording");
    }
  };

  const deleteRecording = () => {
    audioPlayer.stop();
    setAudioFile(null);
    setAudioDuration(0);
    setIsPlaying(false);
  };

  const pickAudioFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        setAudioFile({
          uri: file.uri,
          name: file.name,
          size: file.size || 0,
          mimeType: file.mimeType || "audio/*",
        });

        // Duration will be set once the player loads the audio
        // It will be available via player.duration after loading
        setAudioDuration(0);
      }
    } catch (error) {
      console.error("Error picking audio file:", error);
      toast.error("Failed to pick audio file");
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const validateForm = () => {
    if (!text.trim() && !audioFile) {
      toast.error("Please add some text or audio to your post");
      return false;
    }
    return true;
  };

  const uploadAudioFile = async (file: AudioFile): Promise<string> => {
    console.log("Uploading audio file:", file.name);
    console.log("File details:", { uri: file.uri, mimeType: file.mimeType });
    setIsUploading(true);

    try {
      const uploadResponse = await Api.uploadFile(
        file.uri,
        file.name,
        file.mimeType
      );

      console.log("Upload response:", uploadResponse);

      // Check if the response has a successful status and URL
      if (uploadResponse.url && uploadResponse.status !== "error") {
        console.log("Upload successful:", uploadResponse.url);
        toast.success("Audio uploaded successfully!");
        return uploadResponse.url;
      } else {
        const errorMessage =
          uploadResponse.message || "Failed to upload file - no URL returned";
        console.error("Upload failed - server response:", uploadResponse);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Upload failed:", error);

      // Handle different types of errors
      let errorMessage = "Failed to upload audio";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "object" && error !== null) {
        const axiosError = error as any;
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        } else if (axiosError.message) {
          errorMessage = axiosError.message;
        }
      }

      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      let audioUrl = "";
      let duration = 0;
      let postType = "text";

      // Upload audio file first if present
      if (audioFile) {
        try {
          audioUrl = await uploadAudioFile(audioFile);
          duration = audioDuration;
          postType = "audio";
        } catch (uploadError) {
          // If upload fails, stop the submission process
          console.error("Audio upload failed:", uploadError);
          return; // Exit early, uploadAudioFile already shows error toast
        }
      }

      // Ensure we have an authenticated user; try to refresh if missing
      if (!user) {
        try {
          await refreshUserData();
        } catch (err) {
          // ignore refresh errors here
        }
      }

      const authenticatedUser = user;
      console.log("Auth user",user)

      if (!authenticatedUser) {
        toast.error("You must be signed in to create a post");
        return;
      }

      const postData: CreatePostDto = {
        type: postType,
        text: text.trim() || undefined,
        audio_url: audioUrl || undefined,
        duration: duration || undefined,
        visibility,
      };

      const newPost = await Api.createPost(postData);

      // Add tags to post if any are selected
      if (tags.length > 0 && newPost.id) {
        try {
          await Api.addTagsToPost(newPost.id.toString(), { tags });
        } catch (tagError) {
          console.error("Failed to add tags:", tagError);
          // Don't fail the whole post creation if tags fail
        }
      }

      toast.success("Post created successfully!");
      router.back();
    } catch (error) {
      console.error("Failed to create post:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create post"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isRecording) {
      alert.dialog("Recording in Progress", "Stop recording before leaving?", [
        { text: "Continue Recording", style: "cancel" },
        {
          text: "Stop & Leave",
          onPress: async () => {
            if (recorderState.isRecording) {
              await audioRecorder.stop();
            }
            router.back();
          },
        },
      ]);
    } else {
      router.back();
    }
  };

  return (
    <ScreenLayout>
      <Stack.Screen options={{ animation: "slide_from_bottom" }} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          style={[styles.scrollView]}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <FormHeader
            title="Create Post"
            onCancel={handleCancel}
            onSubmit={handleSubmit}
            submitText={isUploading ? "Uploading..." : "Publish"}
            isSubmitting={isSubmitting || isUploading}
          />

          <View style={styles.mainContent}>
            {/* Text Input Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Share your thoughts
                </Text>
                <Text
                  style={[styles.sectionSubtitle, { color: theme.subtleText }]}
                >
                  Write something, add audio, or both
                </Text>
              </View>

              <View
                style={[
                  styles.textInputContainer,
                  { backgroundColor: theme.cardBackground },
                ]}
              >
                <TextInput
                  ref={textInputRef}
                  style={[styles.textInput, { color: theme.text }]}
                  placeholder="What's on your mind? Share your thoughts, ideas, or stories..."
                  placeholderTextColor={theme.mutedText}
                  value={text}
                  onChangeText={setText}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
                <View style={styles.textInputFooter}>
                  <Text style={[styles.charCount, { color: theme.mutedText }]}>
                    {text.length}/1000
                  </Text>
                </View>
              </View>
            </View>

            {/* Audio Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Add Audio
                </Text>
                <Text
                  style={[styles.sectionSubtitle, { color: theme.subtleText }]}
                >
                  Record your voice or upload an audio file
                </Text>
              </View>

              {!audioFile ? (
                <View style={styles.audioActions}>
                  <WaveformRecorder
                    isRecording={isRecording}
                    onStartRecording={startRecording}
                    onStopRecording={stopRecording}
                    disabled={isSubmitting || isUploading}
                    theme={theme}
                  />

                  <View style={styles.divider}>
                    <View
                      style={[
                        styles.dividerLine,
                        { backgroundColor: theme.divider },
                      ]}
                    />
                    <Text
                      style={[styles.dividerText, { color: theme.mutedText }]}
                    >
                      or
                    </Text>
                    <View
                      style={[
                        styles.dividerLine,
                        { backgroundColor: theme.divider },
                      ]}
                    />
                  </View>

                  <Pressable
                    onPress={pickAudioFile}
                    disabled={isSubmitting || isUploading}
                    style={({ pressed }) => [
                      styles.uploadButton,
                      {
                        backgroundColor: theme.cardBackground,
                        borderColor: theme.divider,
                        opacity:
                          pressed || isSubmitting || isUploading ? 0.6 : 1,
                      },
                    ]}
                  >
                    <View style={styles.uploadIconContainer}>
                      <Ionicons
                        name="cloud-upload"
                        size={24}
                        color={theme.primary}
                      />
                    </View>
                    <View style={styles.uploadTextContainer}>
                      <Text
                        style={[styles.uploadButtonText, { color: theme.text }]}
                      >
                        Upload Audio File
                      </Text>
                      <Text
                        style={[
                          styles.uploadButtonSubtext,
                          { color: theme.subtleText },
                        ]}
                      >
                        MP3, M4A, WAV files
                      </Text>
                    </View>
                  </Pressable>
                </View>
              ) : (
                <View
                  style={[
                    styles.audioPreview,
                    { backgroundColor: theme.cardBackground },
                  ]}
                >
                  <View style={styles.audioInfo}>
                    <View
                      style={[
                        styles.audioIcon,
                        { backgroundColor: `${theme.primary}15` },
                      ]}
                    >
                      <Ionicons
                        name="musical-notes"
                        size={24}
                        color={theme.primary}
                      />
                    </View>
                    <View style={styles.audioDetails}>
                      <Text
                        style={[styles.audioName, { color: theme.text }]}
                        numberOfLines={1}
                      >
                        {audioFile.name}
                      </Text>
                      {audioDuration > 0 && (
                        <Text
                          style={[
                            styles.audioDuration,
                            { color: theme.mutedText },
                          ]}
                        >
                          {formatDuration(audioDuration)}
                        </Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.audioControls}>
                    <Pressable
                      onPress={playRecording}
                      style={({ pressed }) => [
                        styles.audioControlButton,
                        {
                          backgroundColor: `${theme.primary}15`,
                          opacity: pressed ? 0.6 : 1,
                        },
                      ]}
                    >
                      <Ionicons
                        name={isPlaying ? "pause" : "play"}
                        size={20}
                        color={theme.primary}
                      />
                    </Pressable>
                    <Pressable
                      onPress={deleteRecording}
                      style={({ pressed }) => [
                        styles.audioControlButton,
                        {
                          backgroundColor: "#FF475715",
                          opacity: pressed ? 0.6 : 1,
                        },
                      ]}
                    >
                      <Ionicons name="trash" size={20} color="#FF4757" />
                    </Pressable>
                  </View>
                </View>
              )}
            </View>

            {/* Tags */}
            {/* <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Tags
                </Text>
              </View>
              <TagInput 
                selectedTags={tags} 
                onTagsChange={setTags} 
                maxTags={5} 
              />
            </View> */}

            {/* Visibility Selector */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Visibility
                </Text>
                <Text
                  style={[styles.sectionSubtitle, { color: theme.subtleText }]}
                >
                  Choose who can see this post
                </Text>
              </View>

              <View style={styles.visibilitySelector}>
                <Pressable
                  onPress={() => setVisibility("public")}
                  style={({ pressed }) => [
                    styles.visibilityCard,
                    {
                      backgroundColor:
                        visibility === "public"
                          ? theme.primary
                          : theme.cardBackground,
                      borderColor:
                        visibility === "public" ? theme.primary : theme.divider,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    },
                  ]}
                >
                  <View style={styles.visibilityIconContainer}>
                    <Ionicons
                      name="globe"
                      size={24}
                      color={visibility === "public" ? "white" : theme.primary}
                    />
                  </View>
                  <View style={styles.visibilityContent}>
                    <Text
                      style={[
                        styles.visibilityTitle,
                        {
                          color: visibility === "public" ? "white" : theme.text,
                        },
                      ]}
                    >
                      Public
                    </Text>
                    <Text
                      style={[
                        styles.visibilityDescription,
                        {
                          color:
                            visibility === "public"
                              ? "rgba(255,255,255,0.8)"
                              : theme.mutedText,
                        },
                      ]}
                    >
                      Anyone can see this post
                    </Text>
                  </View>
                </Pressable>

                <Pressable
                  onPress={() => setVisibility("private")}
                  style={({ pressed }) => [
                    styles.visibilityCard,
                    {
                      backgroundColor:
                        visibility === "private"
                          ? theme.primary
                          : theme.cardBackground,
                      borderColor:
                        visibility === "private"
                          ? theme.primary
                          : theme.divider,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    },
                  ]}
                >
                  <View style={styles.visibilityIconContainer}>
                    <Ionicons
                      name="lock-closed"
                      size={24}
                      color={visibility === "private" ? "white" : theme.primary}
                    />
                  </View>
                  <View style={styles.visibilityContent}>
                    <Text
                      style={[
                        styles.visibilityTitle,
                        {
                          color:
                            visibility === "private" ? "white" : theme.text,
                        },
                      ]}
                    >
                      Private
                    </Text>
                    <Text
                      style={[
                        styles.visibilityDescription,
                        {
                          color:
                            visibility === "private"
                              ? "rgba(255,255,255,0.8)"
                              : theme.mutedText,
                        },
                      ]}
                    >
                      Only you can see this post
                    </Text>
                  </View>
                </Pressable>
              </View>
            </View>

            {/* Form Status */}
            <View style={styles.statusSection}>
              <View
                style={[
                  styles.statusCard,
                  { backgroundColor: theme.cardBackground },
                ]}
              >
                <Ionicons
                  name="information-circle"
                  size={20}
                  color={theme.primary}
                />
                <Text style={[styles.statusText, { color: theme.text }]}>
                  {isUploading
                    ? "Uploading audio file..."
                    : isSubmitting
                    ? "Creating your post..."
                    : !text && !audioFile
                    ? "Add some text or audio to create your post"
                    : text && audioFile
                    ? "Post will include both text and audio"
                    : text
                    ? "Post will be text only"
                    : "Post will be audio only"}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  mainContent: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
  },
  textInputContainer: {
    borderRadius: 16,
    overflow: "hidden",
  },
  textInput: {
    padding: 20,
    fontSize: 16,
    minHeight: 160,
    textAlignVertical: "top",
  },
  textInputFooter: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    alignItems: "flex-end",
  },
  charCount: {
    fontSize: 12,
    fontWeight: "500",
  },
  audioActions: {
    gap: 16,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 14,
    fontWeight: "600",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
    gap: 16,
  },
  uploadIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadTextContainer: {
    flex: 1,
  },
  uploadButtonText: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 2,
  },
  uploadButtonSubtext: {
    fontSize: 14,
  },
  audioPreview: {
    padding: 20,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  audioInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 16,
  },
  audioIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  audioDetails: {
    flex: 1,
  },
  audioName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  audioDuration: {
    fontSize: 14,
  },
  audioControls: {
    flexDirection: "row",
    gap: 12,
  },
  audioControlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  visibilitySelector: {
    gap: 12,
  },
  visibilityCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    gap: 16,
  },
  visibilityIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  visibilityContent: {
    flex: 1,
  },
  visibilityTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  visibilityDescription: {
    fontSize: 14,
  },
  statusSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  statusText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
});
