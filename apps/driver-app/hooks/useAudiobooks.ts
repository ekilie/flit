import { useState, useEffect, useCallback } from "react";
import Api from "@/lib/api";
import { Audiobook, AudiobookFilters, AudiobookProgressDto } from "@/lib/api/types";
import Toast from "react-native-toast-message";

interface UseAudiobooksReturn {
  audiobooks: Audiobook[];
  recommendations: Audiobook[];
  libraryBooks: Audiobook[];
  favoriteBooks: Audiobook[];
  continueReadingBooks: Audiobook[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  fetchAudiobooks: (filters?: AudiobookFilters) => Promise<void>;
  fetchRecommendations: () => Promise<void>;
  fetchLibrary: (filters?: AudiobookFilters) => Promise<void>;
  fetchFavorites: () => Promise<void>;
  fetchContinueReading: () => Promise<void>;
  toggleFavorite: (audiobookId: string, currentStatus: boolean) => Promise<void>;
  toggleDownload: (audiobookId: string, currentStatus: boolean) => Promise<void>;
  updateProgress: (audiobookId: string, progressData: Omit<AudiobookProgressDto, "audiobook_id">) => Promise<void>;
  refresh: () => Promise<void>;
}

export const useAudiobooks = (): UseAudiobooksReturn => {
  const [audiobooks, setAudiobooks] = useState<Audiobook[]>([]);
  const [recommendations, setRecommendations] = useState<Audiobook[]>([]);
  const [libraryBooks, setLibraryBooks] = useState<Audiobook[]>([]);
  const [favoriteBooks, setFavoriteBooks] = useState<Audiobook[]>([]);
  const [continueReadingBooks, setContinueReadingBooks] = useState<Audiobook[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAudiobooks = useCallback(async (filters?: AudiobookFilters) => {
    try {
      setLoading(true);
      setError(null);
      const response = await Api.getAudiobooks(filters);
      setAudiobooks(response.data || []);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch audiobooks";
      setError(errorMessage);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: errorMessage,
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRecommendations = useCallback(async () => {
    try {
      const recs = await Api.getAudiobookRecommendations();
      setRecommendations(recs || []);
    } catch (err: any) {
      console.error("Failed to fetch recommendations:", err.message);
    }
  }, []);

  const fetchLibrary = useCallback(async (filters?: AudiobookFilters) => {
    try {
      const library = await Api.getUserAudiobookLibrary(filters);
      setLibraryBooks(library || []);
    } catch (err: any) {
      console.error("Failed to fetch library:", err.message);
    }
  }, []);

  const fetchFavorites = useCallback(async () => {
    try {
      const favorites = await Api.getUserFavoriteAudiobooks();
      setFavoriteBooks(favorites || []);
    } catch (err: any) {
      console.error("Failed to fetch favorites:", err.message);
    }
  }, []);

  const fetchContinueReading = useCallback(async () => {
    try {
      const continueReading = await Api.getContinueReadingAudiobooks();
      setContinueReadingBooks(continueReading || []);
    } catch (err: any) {
      console.error("Failed to fetch continue reading:", err.message);
    }
  }, []);

  const toggleFavorite = useCallback(
    async (audiobookId: string, currentStatus: boolean) => {
      const newStatus = !currentStatus;

      // Optimistic update for all relevant lists
      const updateBook = (book: Audiobook) =>
        book.id === audiobookId ? { ...book, is_favorite: newStatus } : book;

      setAudiobooks((prev) => prev.map(updateBook));
      setLibraryBooks((prev) => prev.map(updateBook));
      setRecommendations((prev) => prev.map(updateBook));

      try {
        await Api.toggleAudiobookFavorite(audiobookId, newStatus);
        Toast.show({
          type: "success",
          text1: newStatus ? "Added to Favorites" : "Removed from Favorites",
          text2: newStatus
            ? "Book added to your favorites"
            : "Book removed from favorites",
          position: "top",
        });
        // Refresh favorites list
        await fetchFavorites();
      } catch (err: any) {
        // Revert optimistic update
        setAudiobooks((prev) => prev.map(updateBook));
        setLibraryBooks((prev) => prev.map(updateBook));
        setRecommendations((prev) => prev.map(updateBook));

        const errorMessage = err.message || "Failed to update favorite status";
        Toast.show({
          type: "error",
          text1: "Error",
          text2: errorMessage,
          position: "top",
        });
      }
    },
    [fetchFavorites]
  );

  const toggleDownload = useCallback(
    async (audiobookId: string, currentStatus: boolean) => {
      const newStatus = !currentStatus;

      // Optimistic update for all relevant lists
      const updateBook = (book: Audiobook) =>
        book.id === audiobookId ? { ...book, is_downloaded: newStatus } : book;

      setAudiobooks((prev) => prev.map(updateBook));
      setLibraryBooks((prev) => prev.map(updateBook));
      setFavoriteBooks((prev) => prev.map(updateBook));
      setContinueReadingBooks((prev) => prev.map(updateBook));

      try {
        await Api.toggleAudiobookDownload(audiobookId, newStatus);
        Toast.show({
          type: "success",
          text1: newStatus ? "Download Started" : "Download Removed",
          text2: newStatus
            ? "Audiobook is being downloaded"
            : "Download removed from device",
          position: "top",
        });
      } catch (err: any) {
        // Revert optimistic update
        const revertBook = (book: Audiobook) =>
          book.id === audiobookId ? { ...book, is_downloaded: currentStatus } : book;

        setAudiobooks((prev) => prev.map(revertBook));
        setLibraryBooks((prev) => prev.map(revertBook));
        setFavoriteBooks((prev) => prev.map(revertBook));
        setContinueReadingBooks((prev) => prev.map(revertBook));

        const errorMessage = err.message || "Failed to update download status";
        Toast.show({
          type: "error",
          text1: "Error",
          text2: errorMessage,
          position: "top",
        });
      }
    },
    []
  );

  const updateProgress = useCallback(
    async (
      audiobookId: string,
      progressData: Omit<AudiobookProgressDto, "audiobook_id">
    ) => {
      try {
        await Api.updateAudiobookProgress(audiobookId, progressData);
        
        // Optimistically update local state
        const updateBook = (book: Audiobook) =>
          book.id === audiobookId
            ? {
                ...book,
                progress: progressData.progress,
                current_chapter: progressData.current_chapter,
              }
            : book;

        setAudiobooks((prev) => prev.map(updateBook));
        setLibraryBooks((prev) => prev.map(updateBook));
        setContinueReadingBooks((prev) => prev.map(updateBook));
        setFavoriteBooks((prev) => prev.map(updateBook));
      } catch (err: any) {
        console.error("Failed to update progress:", err.message);
      }
    },
    []
  );

  const refresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await Promise.all([
        fetchAudiobooks(),
        fetchRecommendations(),
        fetchLibrary(),
        fetchFavorites(),
        fetchContinueReading(),
      ]);
    } catch (err: any) {
      console.error("Failed to refresh:", err.message);
    } finally {
      setRefreshing(false);
    }
  }, [
    fetchAudiobooks,
    fetchRecommendations,
    fetchLibrary,
    fetchFavorites,
    fetchContinueReading,
  ]);

  // Initial fetch
  useEffect(() => {
    fetchAudiobooks();
    fetchRecommendations();
    fetchLibrary();
    fetchContinueReading();
  }, [fetchAudiobooks, fetchRecommendations, fetchLibrary, fetchContinueReading]);

  return {
    audiobooks,
    recommendations,
    libraryBooks,
    favoriteBooks,
    continueReadingBooks,
    loading,
    refreshing,
    error,
    fetchAudiobooks,
    fetchRecommendations,
    fetchLibrary,
    fetchFavorites,
    fetchContinueReading,
    toggleFavorite,
    toggleDownload,
    updateProgress,
    refresh,
  };
};
