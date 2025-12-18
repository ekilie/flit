export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface VerifyOtpDto {
  email: string;
  otp: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface VerifyResetCodeDto {
  email: string;
  otp: string;
}

export interface ResetPasswordDto {
  email: string;
  otp: string;
  new_password: string;
}

export interface UpdateUserDto {
  name?: string;
  display_name?: string;
  email?: string;
  metadata?: {
    username?: string;
    location?: string;
    website?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
}

export interface UserMetadata {
  id: number;
  created_at: string;
  updated_at: string;
  user_id: number;
  username?: string;
  location?: string;
  website?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  total_listens: number;
  total_likes: number;
  total_uploads: number;
  last_device?: string;
  last_ip?: string;
  last_location?: string;
  extra?: Record<string, any>;
}

export interface Role {
  id: number;
  name: string;
  is_active: boolean;
}

export interface User {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  display_name?: string;
  email: string;
  is_active: boolean;
  last_login?: string;
  roles?: Role[];
  role: string;
  metadata: UserMetadata;
}

export interface AuthResponse {
  message: string;
  user: User;
  token?: string;
  refresh_token?: string;
  metadata?: any;
}

export interface RefreshTokenResponse {
  token: string;
  refresh_token: string;
  refresh_token_expires_at: string;
}

export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Post-related types
export interface Tag {
  id: string;
  name: string;
  slug: string;
  color?: string;
  description?: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTagDto {
  name: string;
  color?: string;
  description?: string;
}

export interface UpdateTagDto {
  name?: string;
  color?: string;
  description?: string;
}

export interface AddTagsToPostDto {
  tags: string[]; // Array of tag IDs or names
}

export interface RemoveTagsFromPostDto {
  tags: string[]; // Array of tag IDs to remove
}

export interface ReplacePostTagsDto {
  tags: string[]; // Array of tag IDs or names
}

export interface Post {
  id: number;
  created_at: string;
  updated_at: string;
  user_id: number;
  type: string;
  text?: string;
  audio_url?: string;
  duration?: number;
  visibility: string;
  like_count: number;
  comment_count: number;
  play_count: number;
  user: User;
  tags?: Tag[];
}

export interface AudioFeedResponse {
  posts: Post[];
  next_cursor?: number | null;
}

export interface PostComment {
  id: number;
  created_at: string;
  post_id: number;
  user_id: number;
  text: string;
  post: Post;
  user: User;
}

export interface PostLike {
  id: number;
  created_at: string;
  post_id: number;
  user_id: number;
  post: Post;
  user: User;
}

export interface PostPlay {
  id: number;
  created_at: string;
  post_id: number;
  user_id: number;
  duration: number;
  post: Post;
  user: User;
}

// DTOs for creating/updating posts
export interface CreatePostDto {
  user_id: number; // Required: ID of the user creating the post
  type?: string; // Optional: "audio" or "text" (defaults to "audio")
  text?: string; // Optional: Post description/content
  audio_url?: string; // Optional: URL to audio file (for audio posts)
  duration?: number; // Optional: Audio duration in seconds (float)
  visibility?: string; // Optional: "public" or "private" (defaults to "public")
}

export interface UpdatePostDto {
  type?: string;
  text?: string;
  audio_url?: string;
  duration?: number;
  visibility?: string;
}

export interface AddCommentDto {
  text: string;
}

export interface PlayPostDto {
  duration: number;
}

// Analytics/Insights types
export interface UserInsights {
  total_posts: number;
  total_plays: number;
  total_likes: number;
  total_comments: number;
  total_listening_time: number;
  recent_posts: Post[];
  top_posts: Post[];
  engagement_stats: {
    average_plays_per_post: number;
    average_likes_per_post: number;
    average_comments_per_post: number;
  };
  monthly_stats: {
    month: string;
    posts: number;
    plays: number;
    likes: number;
    comments: number;
  }[];
}

export interface UploadResponse {
  id?: number;
  status?: string;
  url?: string;
  message?: string;
  metadata?: {
    original_name: string;
    file_type: string;
    file_size: number;
    upload_time: string;
  };
}

// Voice Memo Types
export interface VoiceMemo {
  id: number;
  created_at: string;
  updated_at: string;
  user_id: number;
  title: string;
  description?: string;
  audio_url: string;
  duration: number;
  category: string;
  file_size?: number;
  original_name?: string;
  is_private: boolean;
  is_favorite: boolean;
  play_count: number;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

export interface VoiceMemoCategory {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  is_default: boolean;
}

export interface CreateVoiceMemoDto {
  title: string;
  description?: string;
  audio_url: string;
  duration: number;
  category?: string;
  file_size?: number;
  original_name?: string;
  is_private?: boolean;
  is_favorite?: boolean;
}

export interface UpdateVoiceMemoDto {
  title?: string;
  description?: string;
  category?: string;
  is_private?: boolean;
  is_favorite?: boolean;
}

export interface VoiceMemoListParams {
  limit?: number;
  offset?: number;
  category?: string;
  search?: string;
  is_favorite?: boolean;
  sort_by?: "created_at" | "title" | "duration" | "play_count";
  sort_order?: "asc" | "desc";
}

export interface PlayVoiceMemoDto {
  duration: number;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface VoiceMemoStats {
  total_memos: number;
  total_duration: number;
  total_plays: number;
  favorite_memos: number;
  categories_used: number;
  memos_by_category: { [key: string]: number };
  recent_activity: Array<{
    date: string;
    count: number;
  }>;
}

// Podcast Types
export interface Podcast {
  id: string;
  title: string;
  host: string;
  description: string;
  artwork: string;
  episodes: number;
  subscribers: string;
  category: string;
  is_subscribed: boolean;
  progress: number;
  last_episode?: string;
  duration?: string;
  color: string;
  rating: number;
  release_frequency: string;
}

export interface PodcastEpisode {
  id: string;
  title: string;
  duration: string;
  date: string;
  podcast: string;
  podcast_id: string;
  color: string;
  audio_url: string;
  description: string;
  episode_number: number;
}

export interface PodcastFilters {
  genre?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface PodcastProgressDto {
  podcast_id: string;
  episode_id: string;
  progress: number;
  current_position: number;
}

export interface CreatePodcastDto {
  title: string;
  host?: string;
  description?: string;
  artwork_url?: string;
  category?: string;
  color?: string;
  release_frequency?: string;
}

export interface UpdatePodcastDto {
  title?: string;
  host?: string;
  description?: string;
  artwork_url?: string;
  category?: string;
  color?: string;
  release_frequency?: string;
}

export interface CreatePodcastEpisodeDto {
  podcast_id: string;
  title: string;
  description?: string;
  duration?: string;
  audio_url?: string;
  episode_number: number;
}

// Audiobook Types
export interface Audiobook {
  id: string;
  title: string;
  author: string;
  narrator: string;
  duration: string;
  chapters: number;
  progress: number;
  current_chapter: number;
  rating: number;
  cover: string;
  genre: string;
  color: string;
  is_favorite: boolean;
  is_downloaded: boolean;
  release_year: number;
  publisher: string;
  description: string;
  audio_url: string;
  language: string;
}

export interface AudiobookChapter {
  id: string;
  title: string;
  chapter_number: number;
  start_time: number;
  end_time: number;
  duration: string;
}

export interface AudiobookFilters {
  genre?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface AudiobookProgressDto {
  audiobook_id: string;
  progress: number;
  current_chapter: number;
  current_position: number;
  playback_speed: number;
}

export interface AudiobookFavoriteDto {
  audiobook_id: string;
  is_favorite: boolean;
}

export interface AudiobookDownloadDto {
  audiobook_id: string;
  is_downloaded: boolean;
}

export interface CreateAudiobookDto {
  title: string;
  author: string;
  narrator?: string;
  description?: string;
  cover_url?: string;
  genre?: string;
  color?: string;
  duration?: string;
  release_year?: number;
  publisher?: string;
  audio_url?: string;
  language?: string;
}

export interface UpdateAudiobookDto {
  title?: string;
  author?: string;
  narrator?: string;
  description?: string;
  cover_url?: string;
  genre?: string;
  color?: string;
  duration?: string;
  release_year?: number;
  publisher?: string;
  audio_url?: string;
  language?: string;
}

export interface CreateAudiobookChapterDto {
  audiobook_id: string;
  title: string;
  chapter_number: number;
  start_time?: number;
  end_time?: number;
  duration?: string;
}

// Follow System Types
export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  is_muted: boolean;
  is_blocked: boolean;
  created_at: string;
}

export interface FollowerUser {
  id: string;
  name: string;
  username: string;
  email: string;
  bio?: string;
  profile_picture_url?: string;
  is_following: boolean;
}

export interface FollowersResponse {
  followers: FollowerUser[];
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
}

export interface FollowingResponse {
  following: FollowerUser[];
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
}

export interface FollowStats {
  followers_count: number;
  following_count: number;
}

// Search Types
export interface SearchFilters {
  query?: string;
  type?: 'all' | 'users' | 'posts' | 'voice_memos' | 'podcasts' | 'audiobooks';
  category?: string;
  tags?: string[];
  userId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'relevance' | 'date' | 'popularity';
  page?: number;
  limit?: number;
}

export interface SearchResult {
  type: 'user' | 'post' | 'voice_memo' | 'podcast' | 'audiobook';
  item: User | Post | VoiceMemo | Podcast | Audiobook;
  relevance_score?: number;
}

export interface RecentSearch {
  id: string;
  query: string;
  timestamp: string;
  result_count: number;
}
