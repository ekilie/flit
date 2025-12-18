import { QueueItem } from "@/stores/audioPlayer";
import { Audiobook, AudiobookChapter, Podcast, PodcastEpisode } from "@/lib/api/types";

export const audiobookToQueueItem = (
  audiobook: Audiobook,
  chapter?: AudiobookChapter
): QueueItem => {
  return {
    id: chapter ? `${audiobook.id}-chapter-${chapter.id}` : audiobook.id,
    type: "audiobook",
    title: chapter ? chapter.title : audiobook.title,
    artist: audiobook.author,
    artwork: audiobook.cover,
    audioUrl: audiobook.audio_url,
    duration: chapter
      ? parseDuration(chapter.duration)
      : parseDuration(audiobook.duration),
    metadata: {
      audiobookId: audiobook.id,
      chapterId: chapter?.id,
      chapterNumber: chapter?.chapter_number,
      narrator: audiobook.narrator,
      genre: audiobook.genre,
    },
  };
};

export const audiobookToQueue = (
  audiobook: Audiobook,
  chapters: AudiobookChapter[]
): QueueItem[] => {
  if (chapters.length === 0) {
    return [audiobookToQueueItem(audiobook)];
  }

  return chapters.map((chapter) => audiobookToQueueItem(audiobook, chapter));
};

export const podcastEpisodeToQueueItem = (
  episode: PodcastEpisode,
  podcast?: Podcast
): QueueItem => {
  return {
    id: episode.id,
    type: "podcast",
    title: episode.title,
    artist: podcast?.host || episode.podcast,
    artwork: podcast?.artwork,
    audioUrl: episode.audio_url,
    duration: parseDuration(episode.duration),
    metadata: {
      podcastId: episode.podcast_id || podcast?.id,
      episodeNumber: episode.episode_number,
      description: episode.description,
    },
  };
};

export const podcastEpisodesToQueue = (
  episodes: PodcastEpisode[],
  podcast?: Podcast
): QueueItem[] => {
  return episodes.map((episode) => podcastEpisodeToQueueItem(episode, podcast));
};

export const postAudioToQueueItem = (
  postId: number,
  title: string,
  audioUrl: string,
  duration: number,
  userName?: string,
  userAvatar?: string
): QueueItem => {
  return {
    id: `post-${postId}`,
    type: "post",
    title: title || "Audio Post",
    artist: userName || "Unknown User",
    artwork: userAvatar,
    audioUrl,
    duration,
    metadata: {
      postId,
    },
  };
};

export const voiceMemoToQueueItem = (
  memoId: number,
  title: string,
  audioUrl: string,
  duration: number,
  category?: string
): QueueItem => {
  return {
    id: `memo-${memoId}`,
    type: "voicememo",
    title,
    artist: category || "Voice Memo",
    audioUrl,
    duration,
    metadata: {
      memoId,
      category,
    },
  };
};

const parseDuration = (duration: string | number): number => {
  if (typeof duration === "number") return duration;
  if (!duration) return 0;

  const parts = duration.split(":");
  if (parts.length === 2) {
    const [minutes, seconds] = parts.map(Number);
    if (isNaN(minutes) || isNaN(seconds)) return 0;
    return minutes * 60 + seconds;
  } else if (parts.length === 3) {
    const [hours, minutes, seconds] = parts.map(Number);
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) return 0;
    return hours * 3600 + minutes * 60 + seconds;
  }

  return 0;
};

export const formatDuration = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return "0:00";
  
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const calculateProgress = (position: number, duration: number): number => {
  if (!duration || duration === 0) return 0;
  return Math.min(100, Math.max(0, (position / duration) * 100));
};
