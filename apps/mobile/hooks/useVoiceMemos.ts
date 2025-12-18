import { useCallback, useEffect, useState, useMemo } from "react";
import { Alert } from "react-native";

import Api from "@/lib/api";
import {
  VoiceMemo,
  VoiceMemoCategory,
  VoiceMemoListParams,
  VoiceMemoStats,
} from "@/lib/api/types";

interface UseVoiceMemosResult {
  // Data
  voiceMemos: VoiceMemo[];
  categories: VoiceMemoCategory[];
  stats: VoiceMemoStats | null;

  // Loading states
  loading: boolean;
  categoriesLoading: boolean;
  statsLoading: boolean;

  // Error states
  error: string | null;

  // Actions
  fetchVoiceMemos: (params?: VoiceMemoListParams) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchStats: () => Promise<void>;
  toggleFavorite: (id: number) => Promise<void>;
  deleteVoiceMemo: (id: number) => Promise<void>;
  playVoiceMemo: (id: number, duration: number) => Promise<void>;
  searchVoiceMemos: (query: string) => Promise<void>;
  getVoiceMemosByCategory: (category: string) => Promise<void>;

  // Refresh
  refresh: () => Promise<void>;
  refreshing: boolean;
}

export function useVoiceMemos(
  initialParams?: VoiceMemoListParams
): UseVoiceMemosResult {
  const defaultParams: VoiceMemoListParams = useMemo(() => ({
    limit: 20,
    offset: 0,
    sort_by: "created_at",
    sort_order: "desc",
    ...initialParams,
  }), [initialParams]);

  const [voiceMemos, setVoiceMemos] = useState<VoiceMemo[]>([]);
  const [categories, setCategories] = useState<VoiceMemoCategory[]>([]);
  const [stats, setStats] = useState<VoiceMemoStats | null>(null);

  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const fetchVoiceMemos = useCallback(async (params?: VoiceMemoListParams) => {
    try {
      setLoading(true);
      setError(null);
      const data = await Api.getVoiceMemos(params);
      setVoiceMemos(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch voice memos";
      setError(errorMessage);
      console.error("Error fetching voice memos:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      const data = await Api.getVoiceMemoCategories();
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
      // Don't set error for categories as it's not critical
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const data = await Api.getVoiceMemoStats();
      setStats(data);
    } catch (err) {
      console.error("Error fetching stats:", err);
      // Don't set error for stats as it's not critical
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const toggleFavorite = useCallback(async (id: number) => {
    try {
      const updatedMemo = await Api.toggleVoiceMemoFavorite(id);
      setVoiceMemos((prev) =>
        prev.map((memo) => (memo.id === id ? updatedMemo : memo))
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to toggle favorite";
      Alert.alert("Error", errorMessage);
    }
  }, []);

  const deleteVoiceMemo = useCallback(async (id: number) => {
    try {
      await Api.deleteVoiceMemo(id);
      setVoiceMemos((prev) => prev.filter((memo) => memo.id !== id));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete voice memo";
      Alert.alert("Error", errorMessage);
    }
  }, []);

  const playVoiceMemo = useCallback(async (id: number, duration: number) => {
    try {
      await Api.playVoiceMemo(id, duration);
      // Update play count locally
      setVoiceMemos((prev) =>
        prev.map((memo) =>
          memo.id === id ? { ...memo, play_count: memo.play_count + 1 } : memo
        )
      );
    } catch (err) {
      console.error("Error recording play:", err);
      // Don't show error to user as this is background functionality
    }
  }, []);

  const searchVoiceMemos = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await Api.searchVoiceMemos(query);
      setVoiceMemos(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to search voice memos";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getVoiceMemosByCategory = useCallback(async (category: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await Api.getVoiceMemosByCategory(category);
      setVoiceMemos(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch voice memos by category";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchVoiceMemos(defaultParams),
        fetchCategories(),
        fetchStats(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [fetchVoiceMemos, fetchCategories, fetchStats, defaultParams]);

  // Initial load
  useEffect(() => {
    fetchVoiceMemos(defaultParams);
    fetchCategories();
    fetchStats();
  }, [fetchVoiceMemos, fetchCategories, fetchStats, defaultParams]);

  return {
    // Data
    voiceMemos,
    categories,
    stats,

    // Loading states
    loading,
    categoriesLoading,
    statsLoading,

    // Error states
    error,

    // Actions
    fetchVoiceMemos,
    fetchCategories,
    fetchStats,
    toggleFavorite,
    deleteVoiceMemo,
    playVoiceMemo,
    searchVoiceMemos,
    getVoiceMemosByCategory,

    // Refresh
    refresh,
    refreshing,
  };
}
