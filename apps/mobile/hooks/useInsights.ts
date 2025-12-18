import Api from "@/lib/api";
import { UserInsights } from "@/lib/api/types";
import { useEffect, useState } from "react";
import { toast } from "yooo-native";

export function useInsights() {
  const [insights, setInsights] = useState<UserInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    try {
      setError(null);
      const data = await Api.getUserInsights();
      setInsights(data);
    } catch (error) {
      console.error("Failed to fetch insights:", error);
      toast.error(
        "Failed to fetch insights. Please check your connection and try again."
      );
      setError(
        error instanceof Error ? error.message : "Failed to fetch insights"
      );

      // For development, return mock data if API fails
      if (__DEV__) {
        setInsights(getMockInsights());
      }
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    await fetchInsights();
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return {
    insights,
    loading,
    error,
    refresh,
  };
}

// Mock data for development/testing
function getMockInsights(): UserInsights {
  return {
    total_posts: 24,
    total_plays: 1847,
    total_likes: 326,
    total_comments: 89,
    total_listening_time: 12540, // in seconds
    engagement_stats: {
      average_plays_per_post: 76.9,
      average_likes_per_post: 13.6,
      average_comments_per_post: 3.7,
    },
    monthly_stats: [
      { month: "August", posts: 3, plays: 245, likes: 52, comments: 18 },
      { month: "September", posts: 8, plays: 612, likes: 89, comments: 23 },
      { month: "October", posts: 13, plays: 990, likes: 185, comments: 48 },
    ],
    recent_posts: [
      {
        id: 1,
        created_at: "2024-10-26T10:30:00Z",
        updated_at: "2024-10-26T10:30:00Z",
        user_id: 1,
        type: "audio",
        text: "My latest thoughts on productivity and mindfulness in the digital age.",
        audio_url: "https://example.com/audio1.mp3",
        duration: 180,
        visibility: "public",
        like_count: 45,
        comment_count: 12,
        play_count: 289,
        user: {
          id: 1,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-10-26T10:30:00Z",
          name: "John Doe",
          email: "john@example.com",
          is_active: true,
          role: "user",
          metadata: {
            id: 1,
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-10-26T10:30:00Z",
            user_id: 1,
            total_listens: 1000,
            total_likes: 200,
            total_uploads: 50,
          },
        },
      },
      {
        id: 2,
        created_at: "2024-10-25T15:45:00Z",
        updated_at: "2024-10-25T15:45:00Z",
        user_id: 1,
        type: "audio",
        text: "Quick voice note about morning routines and their impact on daily success.",
        audio_url: "https://example.com/audio2.mp3",
        duration: 95,
        visibility: "public",
        like_count: 23,
        comment_count: 7,
        play_count: 156,
        user: {
          id: 1,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-10-26T10:30:00Z",
          name: "John Doe",
          email: "john@example.com",
          is_active: true,
          role: "user",
          metadata: {
            id: 1,
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-10-26T10:30:00Z",
            user_id: 1,
            total_listens: 1000,
            total_likes: 200,
            total_uploads: 50,
          },
        },
      },
    ],
    top_posts: [
      {
        id: 3,
        created_at: "2024-10-20T09:15:00Z",
        updated_at: "2024-10-20T09:15:00Z",
        user_id: 1,
        type: "audio",
        text: "Deep dive into the psychology of habit formation and breaking bad patterns.",
        audio_url: "https://example.com/audio3.mp3",
        duration: 420,
        visibility: "public",
        like_count: 89,
        comment_count: 34,
        play_count: 567,
        user: {
          id: 1,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-10-26T10:30:00Z",
          name: "John Doe",
          email: "john@example.com",
          is_active: true,
          role: "user",
          metadata: {
            id: 1,
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-10-26T10:30:00Z",
            user_id: 1,
            total_listens: 1000,
            total_likes: 200,
            total_uploads: 50,
          },
        },
      },
    ],
  };
}
