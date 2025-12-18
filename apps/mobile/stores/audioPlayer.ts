import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type AudioType = "post" | "podcast" | "audiobook" | "voicememo";
export type RepeatMode = "off" | "one" | "all";

export interface QueueItem {
  id: string;
  type: AudioType;
  title: string;
  artist?: string;
  artwork?: string;
  audioUrl: string;
  duration: number;
  metadata?: {
    podcastId?: string;
    audiobookId?: string;
    chapterId?: string;
    episodeNumber?: number;
    chapterNumber?: number;
    [key: string]: any;
  };
}

export interface PlaybackProgress {
  itemId: string;
  position: number;
  duration: number;
  timestamp: number;
}

interface AudioPlayerState {
  currentItem: QueueItem | null;
  queue: QueueItem[];
  isPlaying: boolean;
  isLoading: boolean;
  position: number;
  duration: number;
  volume: number;
  playbackRate: number;
  repeatMode: RepeatMode;
  shuffleEnabled: boolean;
  originalQueue: QueueItem[];
  sleepTimerEndTime: number | null;
  progressHistory: Record<string, PlaybackProgress>;

  setCurrentItem: (item: QueueItem | null) => void;
  setQueue: (queue: QueueItem[]) => void;
  addToQueue: (item: QueueItem) => void;
  addMultipleToQueue: (items: QueueItem[]) => void;
  removeFromQueue: (itemId: string) => void;
  clearQueue: () => void;
  moveQueueItem: (fromIndex: number, toIndex: number) => void;
  
  play: () => void;
  pause: () => void;
  stop: () => void;
  togglePlayPause: () => void;
  
  seekTo: (position: number) => void;
  skipToNext: () => void;
  skipToPrevious: () => void;
  skipToQueueItem: (index: number) => void;
  
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  setPosition: (position: number) => void;
  setDuration: (duration: number) => void;
  setIsLoading: (loading: boolean) => void;
  
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  
  setSleepTimer: (minutes: number) => void;
  clearSleepTimer: () => void;
  
  saveProgress: (itemId: string, position: number, duration: number) => void;
  getProgress: (itemId: string) => PlaybackProgress | null;
  
  reset: () => void;
}

const initialState = {
  currentItem: null,
  queue: [],
  isPlaying: false,
  isLoading: false,
  position: 0,
  duration: 0,
  volume: 1.0,
  playbackRate: 1.0,
  repeatMode: "off" as RepeatMode,
  shuffleEnabled: false,
  originalQueue: [],
  sleepTimerEndTime: null,
  progressHistory: {},
};

export const useAudioPlayerStore = create<AudioPlayerState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCurrentItem: (item) => {
        const state = get();
        if (state.currentItem?.id) {
          get().saveProgress(state.currentItem.id, state.position, state.duration);
        }
        
        const progress = item ? get().getProgress(item.id) : null;
        set({
          currentItem: item,
          position: progress?.position || 0,
          duration: item?.duration ?? 0,
          isLoading: false,
        });
      },

      setQueue: (queue) => set({ queue, originalQueue: queue }),

      addToQueue: (item) =>
        set((state) => {
          const newQueue = [...state.queue, item];
          return {
            queue: newQueue,
            originalQueue: state.shuffleEnabled
              ? [...state.originalQueue, item]
              : newQueue,
          };
        }),

      addMultipleToQueue: (items) =>
        set((state) => {
          const newQueue = [...state.queue, ...items];
          return {
            queue: newQueue,
            originalQueue: state.shuffleEnabled
              ? [...state.originalQueue, ...items]
              : newQueue,
          };
        }),

      removeFromQueue: (itemId) =>
        set((state) => ({
          queue: state.queue.filter((item) => item.id !== itemId),
          originalQueue: state.originalQueue.filter((item) => item.id !== itemId),
        })),

      clearQueue: () => set({ queue: [], originalQueue: [] }),

      moveQueueItem: (fromIndex, toIndex) =>
        set((state) => {
          const newQueue = [...state.queue];
          const [removed] = newQueue.splice(fromIndex, 1);
          newQueue.splice(toIndex, 0, removed);
          return { queue: newQueue };
        }),

      play: () => set({ isPlaying: true }),

      pause: () => set({ isPlaying: false }),

      stop: () => {
        const state = get();
        if (state.currentItem?.id) {
          get().saveProgress(state.currentItem.id, state.position, state.duration);
        }
        set({ isPlaying: false, position: 0 });
      },

      togglePlayPause: () =>
        set((state) => ({ isPlaying: !state.isPlaying })),

      seekTo: (position) => set({ position }),

      skipToNext: () => {
        const state = get();
        const currentIndex = state.queue.findIndex(
          (item) => item.id === state.currentItem?.id
        );

        if (currentIndex === -1 || currentIndex === state.queue.length - 1) {
          if (state.repeatMode === "all" && state.queue.length > 0) {
            get().setCurrentItem(state.queue[0]);
          }
          return;
        }

        get().setCurrentItem(state.queue[currentIndex + 1]);
      },

      skipToPrevious: () => {
        const state = get();
        
        if (state.position > 3) {
          get().seekTo(0);
          return;
        }

        const currentIndex = state.queue.findIndex(
          (item) => item.id === state.currentItem?.id
        );

        if (currentIndex <= 0) {
          if (state.repeatMode === "all" && state.queue.length > 0) {
            get().setCurrentItem(state.queue[state.queue.length - 1]);
          } else {
            get().seekTo(0);
          }
          return;
        }

        get().setCurrentItem(state.queue[currentIndex - 1]);
      },

      skipToQueueItem: (index) => {
        const state = get();
        if (index >= 0 && index < state.queue.length) {
          get().setCurrentItem(state.queue[index]);
        }
      },

      setVolume: (volume) =>
        set({ volume: Math.max(0, Math.min(1, volume)) }),

      setPlaybackRate: (rate) =>
        set({ playbackRate: Math.max(0.25, Math.min(3, rate)) }),

      setPosition: (position) => set({ position }),

      setDuration: (duration) => set({ duration }),

      setIsLoading: (loading) => set({ isLoading: loading }),

      toggleRepeat: () =>
        set((state) => {
          const modes: RepeatMode[] = ["off", "all", "one"];
          const currentIndex = modes.indexOf(state.repeatMode);
          const nextIndex = (currentIndex + 1) % modes.length;
          return { repeatMode: modes[nextIndex] };
        }),

      toggleShuffle: () =>
        set((state) => {
          if (state.shuffleEnabled) {
            return {
              shuffleEnabled: false,
              queue: state.originalQueue,
            };
          }

          const shuffledQueue = [...state.queue];
          const currentIndex = shuffledQueue.findIndex(
            (item) => item.id === state.currentItem?.id
          );

          if (currentIndex > 0) {
            [shuffledQueue[0], shuffledQueue[currentIndex]] = [
              shuffledQueue[currentIndex],
              shuffledQueue[0],
            ];
          }

          for (let i = 1; i < shuffledQueue.length; i++) {
            const j = Math.floor(Math.random() * (shuffledQueue.length - i)) + i;
            [shuffledQueue[i], shuffledQueue[j]] = [
              shuffledQueue[j],
              shuffledQueue[i],
            ];
          }

          return {
            shuffleEnabled: true,
            queue: shuffledQueue,
          };
        }),

      setSleepTimer: (minutes) => {
        const endTime = Date.now() + minutes * 60 * 1000;
        set({ sleepTimerEndTime: endTime });
      },

      clearSleepTimer: () => set({ sleepTimerEndTime: null }),

      saveProgress: (itemId, position, duration) =>
        set((state) => ({
          progressHistory: {
            ...state.progressHistory,
            [itemId]: {
              itemId,
              position,
              duration,
              timestamp: Date.now(),
            },
          },
        })),

      getProgress: (itemId) => {
        const state = get();
        return state.progressHistory[itemId] || null;
      },

      reset: () => {
        const state = get();
        if (state.currentItem?.id) {
          get().saveProgress(state.currentItem.id, state.position, state.duration);
        }
        set({
          ...initialState,
          progressHistory: state.progressHistory,
        });
      },
    }),
    {
      name: "listen-audio-player",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        volume: state.volume,
        playbackRate: state.playbackRate,
        repeatMode: state.repeatMode,
        progressHistory: state.progressHistory,
      }),
    }
  )
);
