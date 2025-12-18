import { useCallback, useEffect, useState } from "react";
import { useAudioPlayer } from "./useAudioPlayer";
import { useAudiobooks } from "./useAudiobooks";
import { Audiobook, AudiobookChapter } from "@/lib/api/types";
import { audiobookToQueue, audiobookToQueueItem } from "@/lib/audioUtils";
import Api from "@/lib/api";
import Toast from "react-native-toast-message";

export const useAudiobookPlayer = () => {
  const audioPlayer = useAudioPlayer();
  const { updateProgress: updateApiProgress } = useAudiobooks();
  const [chapters, setChapters] = useState<AudiobookChapter[]>([]);
  const [currentAudiobook, setCurrentAudiobook] = useState<Audiobook | null>(null);

  const fetchChapters = useCallback(async (audiobookId: string) => {
    try {
      const fetchedChapters = await Api.getAudiobookChapters(audiobookId);
      setChapters(fetchedChapters);
      return fetchedChapters;
    } catch (error) {
      console.error("Failed to fetch chapters:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load chapters",
        position: "top",
      });
      return [];
    }
  }, []);

  const playAudiobook = useCallback(
    async (audiobook: Audiobook, chapterIndex?: number) => {
      setCurrentAudiobook(audiobook);
      
      const fetchedChapters = await fetchChapters(audiobook.id);
      
      if (fetchedChapters.length > 0) {
        const queue = audiobookToQueue(audiobook, fetchedChapters);
        const startIndex = chapterIndex ?? audiobook.current_chapter ?? 0;
        const startItem = queue[startIndex] || queue[0];
        
        await audioPlayer.playItem(startItem, queue);
      } else {
        const item = audiobookToQueueItem(audiobook);
        await audioPlayer.playItem(item, [item]);
      }
    },
    [audioPlayer, fetchChapters]
  );

  const skipToChapter = useCallback(
    (chapterIndex: number) => {
      audioPlayer.skipToQueueItem(chapterIndex);
    },
    [audioPlayer]
  );

  const nextChapter = useCallback(() => {
    audioPlayer.skipToNext();
  }, [audioPlayer]);

  const previousChapter = useCallback(() => {
    audioPlayer.skipToPrevious();
  }, [audioPlayer]);

  useEffect(() => {
    let lastSyncedProgress = 0;
    
    const interval = setInterval(() => {
      if (
        audioPlayer.isPlaying &&
        audioPlayer.currentItem?.type === "audiobook" &&
        audioPlayer.currentItem.metadata?.audiobookId
      ) {
        const currentProgress = audioPlayer.duration > 0
          ? (audioPlayer.position / audioPlayer.duration) * 100
          : 0;

        if (Math.abs(currentProgress - lastSyncedProgress) >= 1) {
          const audiobookId = audioPlayer.currentItem.metadata.audiobookId;
          const chapterNumber = audioPlayer.currentItem.metadata?.chapterNumber || 0;

          updateApiProgress(audiobookId, {
            progress: currentProgress,
            current_chapter: chapterNumber,
            current_position: audioPlayer.position,
            playback_speed: audioPlayer.playbackRate,
          });

          lastSyncedProgress = currentProgress;
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [
    audioPlayer.isPlaying,
    audioPlayer.currentItem,
    audioPlayer.position,
    audioPlayer.duration,
    audioPlayer.playbackRate,
    updateApiProgress,
  ]);

  return {
    ...audioPlayer,
    chapters,
    currentAudiobook,
    playAudiobook,
    skipToChapter,
    nextChapter,
    previousChapter,
  };
};
