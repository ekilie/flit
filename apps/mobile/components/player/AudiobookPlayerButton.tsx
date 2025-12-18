import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { Audiobook } from "@/lib/api/types";
import { useAudiobookPlayer } from "@/hooks/useAudiobookPlayer";
import { formatDuration } from "@/lib/audioUtils";

interface AudiobookPlayerButtonProps {
  audiobook: Audiobook;
  iconSize?: number;
  showLabel?: boolean;
}

export default function AudiobookPlayerButton({
  audiobook,
  iconSize = 36,
  showLabel = false,
}: AudiobookPlayerButtonProps) {
  const {
    playAudiobook,
    currentItem,
    isPlaying,
    togglePlayPause,
    chapters,
  } = useAudiobookPlayer();

  const [showChapters, setShowChapters] = useState(false);
  const [loading, setLoading] = useState(false);

  const isCurrentAudiobook =
    currentItem?.metadata?.audiobookId === audiobook.id;

  const handlePlayPress = async () => {
    if (isCurrentAudiobook) {
      togglePlayPause();
    } else {
      setLoading(true);
      try {
        await playAudiobook(audiobook);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChaptersPress = async () => {
    if (chapters.length === 0) {
      setLoading(true);
      try {
        await playAudiobook(audiobook);
      } finally {
        setLoading(false);
      }
    }
    setShowChapters(true);
  };

  return (
    <>
      <View style={styles.container}>
        <Pressable
          style={[
            styles.playButton,
            isCurrentAudiobook && styles.activeButton,
          ]}
          onPress={handlePlayPress}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Ionicons
              name={isCurrentAudiobook && isPlaying ? "pause" : "play"}
              size={iconSize}
              color="#fff"
            />
          )}
        </Pressable>

        {audiobook.chapters > 0 && (
          <Pressable
            style={styles.chaptersButton}
            onPress={handleChaptersPress}
          >
            <Ionicons name="list" size={20} color="#fff" />
            {showLabel && <Text style={styles.buttonLabel}>Chapters</Text>}
          </Pressable>
        )}
      </View>

      <Modal
        visible={showChapters}
        animationType="slide"
        transparent
        onRequestClose={() => setShowChapters(false)}
      >
        <BlurView intensity={50} style={styles.modalContainer}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <View style={styles.bookInfo}>
                <Image
                  source={{ uri: audiobook.cover }}
                  style={styles.smallCover}
                  contentFit="cover"
                />
                <View style={styles.bookDetails}>
                  <Text style={styles.bookTitle} numberOfLines={1}>
                    {audiobook.title}
                  </Text>
                  <Text style={styles.bookAuthor} numberOfLines={1}>
                    {audiobook.author}
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => setShowChapters(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={28} color="#fff" />
              </Pressable>
            </View>

            <ScrollView style={styles.chaptersList}>
              {chapters.map((chapter, index: number) => {
                const isCurrentChapter =
                  isCurrentAudiobook &&
                  currentItem?.metadata?.chapterNumber === chapter.chapter_number;

                return (
                  <Pressable
                    key={chapter.id}
                    style={[
                      styles.chapterItem,
                      isCurrentChapter && styles.currentChapter,
                    ]}
                    onPress={async () => {
                      await playAudiobook(audiobook, index);
                      setShowChapters(false);
                    }}
                  >
                    <View style={styles.chapterInfo}>
                      <Text
                        style={[
                          styles.chapterNumber,
                          isCurrentChapter && styles.currentChapterText,
                        ]}
                      >
                        {chapter.chapter_number}
                      </Text>
                      <View style={styles.chapterDetails}>
                        <Text
                          style={[
                            styles.chapterTitle,
                            isCurrentChapter && styles.currentChapterText,
                          ]}
                          numberOfLines={2}
                        >
                          {chapter.title}
                        </Text>
                        <Text style={styles.chapterDuration}>
                          {chapter.duration}
                        </Text>
                      </View>
                    </View>
                    {isCurrentChapter && (
                      <Ionicons name="play-circle" size={24} color="#1DB954" />
                    )}
                  </Pressable>
                );
              })}

              {chapters.length === 0 && !loading && (
                <View style={styles.emptyState}>
                  <Ionicons
                    name="book-outline"
                    size={48}
                    color="rgba(255,255,255,0.3)"
                  />
                  <Text style={styles.emptyText}>
                    No chapters available for this audiobook
                  </Text>
                </View>
              )}

              {loading && (
                <View style={styles.loadingState}>
                  <ActivityIndicator color="#1DB954" size="large" />
                  <Text style={styles.loadingText}>Loading chapters...</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </BlurView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  activeButton: {
    backgroundColor: "#1DB954",
  },
  chaptersButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "rgba(0,0,0,0.95)",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  bookInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  smallCover: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  bookDetails: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
  },
  closeButton: {
    padding: 5,
  },
  chaptersList: {
    paddingTop: 10,
  },
  chapterItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  currentChapter: {
    backgroundColor: "rgba(29, 185, 84, 0.1)",
  },
  chapterInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  chapterNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "rgba(255,255,255,0.5)",
    width: 30,
  },
  currentChapterText: {
    color: "#1DB954",
  },
  chapterDetails: {
    flex: 1,
  },
  chapterTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
    marginBottom: 4,
  },
  chapterDuration: {
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
    marginTop: 16,
  },
  loadingState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: "rgba(255,255,255,0.6)",
    marginTop: 16,
  },
});
