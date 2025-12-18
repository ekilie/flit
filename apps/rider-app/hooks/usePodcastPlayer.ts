import { useCallback, useEffect, useState } from "react";
import { useAudioPlayer } from "./useAudioPlayer";
import { usePodcasts } from "./usePodcasts";
import { Podcast, PodcastEpisode } from "@/lib/api/types";
import { podcastEpisodeToQueueItem, podcastEpisodesToQueue } from "@/lib/audioUtils";
import Api from "@/lib/api";
import Toast from "react-native-toast-message";

export const usePodcastPlayer = () => {
  const audioPlayer = useAudioPlayer();
  const { updateProgress: updateApiProgress } = usePodcasts();
  const [currentPodcast, setCurrentPodcast] = useState<Podcast | null>(null);
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);

  const fetchEpisodes = useCallback(async (podcastId: string) => {
    try {
      const response = await Api.getPodcastEpisodes(podcastId);
      const fetchedEpisodes = response.data || [];
      setEpisodes(fetchedEpisodes);
      return fetchedEpisodes;
    } catch (error) {
      console.error("Failed to fetch episodes:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load episodes",
        position: "top",
      });
      return [];
    }
  }, []);

  const playPodcastEpisode = useCallback(
    async (episode: PodcastEpisode, podcast?: Podcast, allEpisodes?: PodcastEpisode[]) => {
      if (podcast) {
        setCurrentPodcast(podcast);
      }

      let episodeList = allEpisodes;
      if (!episodeList && podcast) {
        episodeList = await fetchEpisodes(podcast.id);
      }

      if (episodeList && episodeList.length > 0) {
        const queue = podcastEpisodesToQueue(episodeList, podcast);
        const currentIndex = episodeList.findIndex((ep) => ep.id === episode.id);
        const startItem = currentIndex >= 0 ? queue[currentIndex] : queue[0];
        
        await audioPlayer.playItem(startItem, queue);
      } else {
        const item = podcastEpisodeToQueueItem(episode, podcast);
        await audioPlayer.playItem(item, [item]);
      }
    },
    [audioPlayer, fetchEpisodes]
  );

  const playPodcast = useCallback(
    async (podcast: Podcast, episodeIndex?: number) => {
      setCurrentPodcast(podcast);
      
      const fetchedEpisodes = await fetchEpisodes(podcast.id);
      
      if (fetchedEpisodes.length > 0) {
        const queue = podcastEpisodesToQueue(fetchedEpisodes, podcast);
        const startIndex = episodeIndex ?? 0;
        const startItem = queue[startIndex] || queue[0];
        
        await audioPlayer.playItem(startItem, queue);
      } else {
        Toast.show({
          type: "info",
          text1: "No Episodes",
          text2: "This podcast has no episodes yet",
          position: "top",
        });
      }
    },
    [audioPlayer, fetchEpisodes]
  );

  const nextEpisode = useCallback(() => {
    audioPlayer.skipToNext();
  }, [audioPlayer]);

  const previousEpisode = useCallback(() => {
    audioPlayer.skipToPrevious();
  }, [audioPlayer]);

  useEffect(() => {
    let lastSyncedProgress = 0;
    
    const interval = setInterval(() => {
      if (
        audioPlayer.isPlaying &&
        audioPlayer.currentItem?.type === "podcast" &&
        audioPlayer.currentItem.metadata?.podcastId &&
        audioPlayer.currentItem.id
      ) {
        const currentProgress = audioPlayer.duration > 0
          ? (audioPlayer.position / audioPlayer.duration) * 100
          : 0;

        if (Math.abs(currentProgress - lastSyncedProgress) >= 1) {
          updateApiProgress({
            podcast_id: audioPlayer.currentItem.metadata.podcastId,
            episode_id: audioPlayer.currentItem.id,
            progress: currentProgress,
            current_position: audioPlayer.position,
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
    updateApiProgress,
  ]);

  return {
    ...audioPlayer,
    episodes,
    currentPodcast,
    playPodcastEpisode,
    playPodcast,
    nextEpisode,
    previousEpisode,
  };
};
