import { useState, useEffect, useCallback } from "react";
import Api from "@/lib/api";
import {
  Podcast,
  PodcastEpisode,
  PodcastFilters,
  PodcastProgressDto,
} from "@/lib/api/types";
import Toast from "react-native-toast-message";
import { toast } from "yooo-native";

interface UsePodcastsReturn {
  podcasts: Podcast[];
  trendingPodcasts: Podcast[];
  subscribedPodcasts: Podcast[];
  recentEpisodes: PodcastEpisode[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  fetchPodcasts: (filters?: PodcastFilters) => Promise<void>;
  fetchTrendingPodcasts: () => Promise<void>;
  fetchSubscribedPodcasts: () => Promise<void>;
  fetchRecentEpisodes: () => Promise<void>;
  subscribeToPodcast: (podcastId: string) => Promise<void>;
  unsubscribeFromPodcast: (podcastId: string) => Promise<void>;
  updateProgress: (progressData: PodcastProgressDto) => Promise<void>;
  refresh: () => Promise<void>;
}

export const usePodcasts = (): UsePodcastsReturn => {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [trendingPodcasts, setTrendingPodcasts] = useState<Podcast[]>([]);
  const [subscribedPodcasts, setSubscribedPodcasts] = useState<Podcast[]>([]);
  const [recentEpisodes, setRecentEpisodes] = useState<PodcastEpisode[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPodcasts = useCallback(async (filters?: PodcastFilters) => {
    try {
      setLoading(true);
      setError(null);
      const response = await Api.getPodcasts(filters);
      setPodcasts(response.data || []);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch podcasts";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTrendingPodcasts = useCallback(async () => {
    try {
      const trending = await Api.getTrendingPodcasts();
      setTrendingPodcasts(trending || []);
    } catch (err: any) {
      console.error("Failed to fetch trending podcasts:", err.message);
    }
  }, []);

  const fetchSubscribedPodcasts = useCallback(async () => {
    try {
      const subscribed = await Api.getUserPodcastSubscriptions();
      setSubscribedPodcasts(subscribed || []);
    } catch (err: any) {
      console.error("Failed to fetch subscribed podcasts:", err.message);
    }
  }, []);

  const fetchRecentEpisodes = useCallback(async () => {
    try {
      const episodes = await Api.getRecentPodcastEpisodes();
      setRecentEpisodes(episodes || []);
    } catch (err: any) {
      console.error("Failed to fetch recent episodes:", err.message);
    }
  }, []);

  const subscribeToPodcast = useCallback(
    async (podcastId: string) => {
      // Optimistic update
      setPodcasts((prev) =>
        prev.map((p) =>
          p.id === podcastId ? { ...p, is_subscribed: true } : p
        )
      );

      try {
        await Api.subscribeToPodcast(podcastId);
        toast.success("Successfully subscribed to podcast");
        // Refresh subscribed podcasts
        await fetchSubscribedPodcasts();
      } catch (err: any) {
        // Revert optimistic update
        setPodcasts((prev) =>
          prev.map((p) =>
            p.id === podcastId ? { ...p, is_subscribed: false } : p
          )
        );
        const errorMessage = err.message || "Failed to subscribe";
        toast.error(errorMessage);
      }
    },
    [fetchSubscribedPodcasts]
  );

  const unsubscribeFromPodcast = useCallback(
    async (podcastId: string) => {
      // Optimistic update
      setPodcasts((prev) =>
        prev.map((p) =>
          p.id === podcastId ? { ...p, is_subscribed: false } : p
        )
      );

      try {
        await Api.unsubscribeFromPodcast(podcastId);
        toast.success("Successfully unsubscribed from podcast");
        // Refresh subscribed podcasts
        await fetchSubscribedPodcasts();
      } catch (err: any) {
        // Revert optimistic update
        setPodcasts((prev) =>
          prev.map((p) =>
            p.id === podcastId ? { ...p, is_subscribed: true } : p
          )
        );
        const errorMessage = err.message || "Failed to unsubscribe";
        toast.error(errorMessage);
      }
    },
    [fetchSubscribedPodcasts]
  );

  const updateProgress = useCallback(async (progressData: PodcastProgressDto) => {
    try {
      await Api.updatePodcastProgress(progressData);
      // Optimistically update local state
      setPodcasts((prev) =>
        prev.map((p) =>
          p.id === progressData.podcast_id
            ? { ...p, progress: progressData.progress }
            : p
        )
      );
    } catch (err: any) {
      console.error("Failed to update progress:", err.message);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await Promise.all([
        fetchPodcasts(),
        fetchTrendingPodcasts(),
        fetchSubscribedPodcasts(),
        fetchRecentEpisodes(),
      ]);
    } catch (err: any) {
      console.error("Failed to refresh:", err.message);
    } finally {
      setRefreshing(false);
    }
  }, [
    fetchPodcasts,
    fetchTrendingPodcasts,
    fetchSubscribedPodcasts,
    fetchRecentEpisodes,
  ]);

  // Initial fetch
  useEffect(() => {
    fetchPodcasts();
    fetchTrendingPodcasts();
    fetchRecentEpisodes();
  }, [fetchPodcasts, fetchTrendingPodcasts, fetchRecentEpisodes]);

  return {
    podcasts,
    trendingPodcasts,
    subscribedPodcasts,
    recentEpisodes,
    loading,
    refreshing,
    error,
    fetchPodcasts,
    fetchTrendingPodcasts,
    fetchSubscribedPodcasts,
    fetchRecentEpisodes,
    subscribeToPodcast,
    unsubscribeFromPodcast,
    updateProgress,
    refresh,
  };
};
