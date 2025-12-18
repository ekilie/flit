// This audio player hook uses expo-audio (migrated from expo-av)
import { QueueItem, useAudioPlayerStore } from "@/stores/audioPlayer";
import { useSettingsStore } from "@/stores/settings";
import {
  setAudioModeAsync,
  useAudioPlayer as useExpoAudioPlayer,
} from "expo-audio";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef } from "react";
import {
  getSharedGlobalPlayer,
  setSharedGlobalPlayer,
} from "./use-global-audio-player";

// Debug function to log all active players
function logAllActivePlayers(context: string) {
  const { player: sharedPlayer, uri: sharedUri } = getSharedGlobalPlayer();
  console.log(` ALL PLAYERS SUMMARY (${context}):`, {
    sharedGlobalPlayer: {
      hasPlayer: !!sharedPlayer,
      uri: sharedUri || "None",
      isPlaying: sharedPlayer?.playing || false,
    },
    timestamp: new Date().toLocaleTimeString(),
  });
}

// Constants
const TRACK_END_THRESHOLD_SECONDS = 0.1; // Threshold for detecting track completion

// Generate unique instance ID for debugging
let instanceCounter = 0;

// Configure audio mode for background playbook and lock screen controls
const configureAudioMode = async () => {
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionModeAndroid: "duckOthers",
      interruptionMode: "mixWithOthers",
    });
    console.log(
      "🎵 Audio mode configured for background playback and lock screen controls"
    );
  } catch (error) {
    console.error("Failed to configure audio mode:", error);
  }
};

export function useAudioPlayer() {
  const instanceId = useRef(++instanceCounter);
  const store = useAudioPlayerStore();
  const hapticsEnabled = useSettingsStore((state) => state.hapticsEnabled);
  const sleepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentUri = store.currentItem?.audioUrl || null;

  // Always create the player (hooks must be called unconditionally)
  const player = useExpoAudioPlayer(currentUri ? { uri: currentUri } : null);

  // Log instance creation and configure audio mode
  useEffect(() => {
    console.log(
      `🎼 AUDIO PLAYER HOOK [Instance ${instanceId.current}] - Created with URI:`,
      currentUri || "None"
    );

    // Configure audio mode for background playback and lock screen controls
    configureAudioMode();

    return () => {
      // Cleanup lock screen controls when component unmounts
      if (player) {
        try {
          player.clearLockScreenControls();
        } catch (error) {
          console.warn(
            "Failed to clear lock screen controls on cleanup:",
            error
          );
        }
      }

      console.log(
        `🎼 AUDIO PLAYER HOOK [Instance ${instanceId.current}] - Destroyed`
      );
    };
  }, []);

  // Debug logging for main audio player hook
  useEffect(() => {
    console.log(
      `🎼 MAIN AUDIO PLAYER HOOK [Instance ${instanceId.current}] - State:`,
      {
        currentUri: currentUri || "None",
        hasPlayer: !!player,
        isPlaying: player?.playing || false,
        storeIsPlaying: store.isPlaying,
        currentTime: player?.currentTime || 0,
        timestamp: new Date().toLocaleTimeString(),
      }
    );
    logAllActivePlayers(
      `Main Audio Player State Change [Instance ${instanceId.current}]`
    );
  }, [currentUri, player, store.isPlaying]);

  // Monitor store vs player state mismatches
  useEffect(() => {
    if (player && store.isPlaying !== player.playing) {
      console.log(
        `⚠️ MAIN AUDIO PLAYER [Instance ${instanceId.current}] - State mismatch:`,
        {
          storeIsPlaying: store.isPlaying,
          playerIsPlaying: player.playing,
          currentUri,
          timestamp: new Date().toLocaleTimeString(),
        }
      );
    }
  }, [player, store.isPlaying, currentUri]);

  const triggerHaptic = useCallback(() => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [hapticsEnabled]);

  // Update lock screen controls with metadata
  const updateLockScreenControls = useCallback(() => {
    if (!player || !store.currentItem) {
      // Remove lock screen controls if no item is playing
      if (player) {
        try {
          player.clearLockScreenControls();
        } catch (error) {
          console.error("Failed to remove lock screen controls:", error);
        }
      }
      return;
    }

    const { currentItem } = store;
    try {
      player.setActiveForLockScreen(
        true,
        {
          title: currentItem.title,
          artist: currentItem.artist || "Unknown Artist",
          albumTitle: currentItem.metadata?.podcastId
            ? "Podcast"
            : currentItem.metadata?.audiobookId
            ? "Audiobook"
            : "",
          artworkUrl: currentItem.artwork || "",
        },
        {
          showSeekForward: true,
          showSeekBackward: true,
        }
      );
      console.log(`🔒 Lock screen controls updated for: ${currentItem.title}`);
    } catch (error) {
      console.error("Failed to set lock screen controls:", error);
    }
  }, [player, store.currentItem]);

  // Update lock screen controls when current item changes
  useEffect(() => {
    updateLockScreenControls();
  }, [updateLockScreenControls]);

  // Update lock screen metadata when playback state changes
  useEffect(() => {
    if (player && store.currentItem) {
      try {
        player.updateLockScreenMetadata({
          title: store.currentItem.title,
          artist: store.currentItem.artist || "Unknown Artist",
          albumTitle: store.currentItem.metadata?.podcastId
            ? "Podcast"
            : store.currentItem.metadata?.audiobookId
            ? "Audiobook"
            : "",
          artworkUrl: store.currentItem.artwork || "",
        });
      } catch (error) {
        console.error("Failed to update lock screen metadata:", error);
      }
    }
  }, [player, store.currentItem, store.isPlaying]);

  const handleTrackEnd = useCallback(() => {
    const { repeatMode, currentItem } = store;

    if (currentItem?.id) {
      store.saveProgress(currentItem.id, store.duration, store.duration);
    }

    if (repeatMode === "one") {
      store.seekTo(0);
      if (player) {
        player.seekTo(0);
        player.play();
      }
    } else if (repeatMode === "all" || store.queue.length > 1) {
      store.skipToNext();
    } else {
      store.pause();
      store.seekTo(0);
    }
  }, [player, store]);

  // Monitor playback progress and update store
  useEffect(() => {
    if (!player) return;

    const interval = setInterval(() => {
      if (player.playing) {
        const currentTime = player.currentTime || 0;
        const duration = player.duration || 0;

        store.setPosition(currentTime);
        store.setDuration(duration);
        store.setIsLoading(false);

        // Check if playback finished
        if (
          duration > 0 &&
          currentTime >= duration - TRACK_END_THRESHOLD_SECONDS
        ) {
          handleTrackEnd();
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [player, player?.playing, handleTrackEnd, store]);

  // Ensure only one audio plays at a time - stop other players when this one starts
  useEffect(() => {
    console.log(
      `🔗 MAIN AUDIO PLAYER [Instance ${instanceId.current}] - Coordination effect triggered for URI:`,
      currentUri
    );

    // Don't run if there's no URI or player
    if (!currentUri || !player) return;

    const { player: globalPlayer, uri: globalPlayerUri } =
      getSharedGlobalPlayer();

    // Only proceed if this is a different URI than what's currently shared
    if (globalPlayerUri !== currentUri) {
      // Stop any existing global player
      if (globalPlayer && globalPlayerUri) {
        try {
          console.log(
            `🔇 MAIN AUDIO PLAYER [Instance ${instanceId.current}] - Stopping global player:`,
            {
              currentUri,
              globalPlayerUri,
              timestamp: new Date().toLocaleTimeString(),
            }
          );
          if (globalPlayer && typeof globalPlayer.pause === "function") {
            globalPlayer.pause();
          }
        } catch (error) {
          console.warn(
            `🔇 MAIN AUDIO PLAYER [Instance ${instanceId.current}] - Failed to pause global player:`,
            error
          );
        }
      }

      // Set this player as the new shared player
      console.log(
        `🔗 MAIN AUDIO PLAYER [Instance ${instanceId.current}] - Setting shared player:`,
        {
          currentUri,
          hasPlayer: !!player,
          timestamp: new Date().toLocaleTimeString(),
        }
      );
      setSharedGlobalPlayer(player, currentUri);
      logAllActivePlayers(
        `Main Audio Player Set Shared [Instance ${instanceId.current}]`
      );
    } else {
      console.log(
        `🔗 MAIN AUDIO PLAYER [Instance ${instanceId.current}] - Skipping coordination, same URI already shared`
      );
    }
  }, [currentUri]); // Removed 'player' dependency to prevent multiple runs for same URI

  // Control playback based on store state
  useEffect(() => {
    if (!player || !currentUri) return;

    const handlePlayback = async () => {
      try {
        // Only handle actual state changes to avoid unnecessary operations
        const shouldPlay = store.isPlaying && !player.playing;
        const shouldPause = !store.isPlaying && player.playing;

        if (shouldPlay) {
          // Stop any other player before starting this one
          const { player: globalPlayer } = getSharedGlobalPlayer();
          if (globalPlayer && globalPlayer !== player) {
            await globalPlayer.pause();
          }
          setSharedGlobalPlayer(player, currentUri);
          await player.play();
        } else if (shouldPause) {
          await player.pause();
        }
      } catch (error) {
        console.error("Playback control error:", error);
      }
    };

    handlePlayback();
  }, [store.isPlaying, player, currentUri]);

  // Set volume
  useEffect(() => {
    if (player && store.volume !== undefined) {
      try {
        player.volume = store.volume;
      } catch (error) {
        console.error("Failed to set volume:", error);
      }
    }
  }, [player, store.volume]);

  // Set playback rate
  useEffect(() => {
    if (player && store.playbackRate !== undefined) {
      try {
        // Note: expo-audio playback rate support varies by platform
        // Check if setPlaybackRate method exists before calling
        if (typeof (player as any).setPlaybackRate === "function") {
          (player as any).setPlaybackRate(store.playbackRate);
        } else {
          // Fallback: Try setting via property (may not work on all platforms)
          console.warn(
            "Playback rate control not fully supported by expo-audio"
          );
        }
      } catch (error) {
        console.error("Failed to set playback rate:", error);
      }
    }
  }, [player, store.playbackRate]);

  useEffect(() => {
    if (!store.sleepTimerEndTime) {
      if (sleepTimerRef.current) {
        clearInterval(sleepTimerRef.current);
        sleepTimerRef.current = null;
      }
      return;
    }

    sleepTimerRef.current = setInterval(() => {
      if (store.sleepTimerEndTime && Date.now() >= store.sleepTimerEndTime) {
        store.pause();
        store.clearSleepTimer();
        if (sleepTimerRef.current) {
          clearInterval(sleepTimerRef.current);
          sleepTimerRef.current = null;
        }
      }
    }, 1000);

    return () => {
      if (sleepTimerRef.current) {
        clearInterval(sleepTimerRef.current);
        sleepTimerRef.current = null;
      }
    };
  }, [store.sleepTimerEndTime]);

  const playItem = useCallback(
    async (item: QueueItem, queue?: QueueItem[]) => {
      triggerHaptic();

      if (queue) {
        store.setQueue(queue);
      }

      store.setCurrentItem(item);
      store.play();
    },
    [triggerHaptic]
  );

  const togglePlayPause = useCallback(() => {
    triggerHaptic();
    store.togglePlayPause();
  }, [triggerHaptic]);

  const skipToNext = useCallback(() => {
    triggerHaptic();
    store.skipToNext();
  }, [triggerHaptic]);

  const skipToPrevious = useCallback(() => {
    triggerHaptic();
    store.skipToPrevious();
  }, [triggerHaptic]);

  const seekTo = useCallback(
    async (positionSeconds: number) => {
      if (player) {
        try {
          player.seekTo(positionSeconds);
          store.seekTo(positionSeconds);
        } catch (error) {
          console.error("Failed to seek:", error);
        }
      }
    },
    [player, store]
  );

  const setVolume = useCallback((volume: number) => {
    store.setVolume(volume);
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    store.setPlaybackRate(rate);
  }, []);

  return {
    currentItem: store.currentItem,
    queue: store.queue,
    isPlaying: store.isPlaying,
    isLoading: store.isLoading,
    position: store.position,
    duration: store.duration,
    volume: store.volume,
    playbackRate: store.playbackRate,
    repeatMode: store.repeatMode,
    shuffleEnabled: store.shuffleEnabled,
    sleepTimerEndTime: store.sleepTimerEndTime,

    playItem,
    togglePlayPause,
    skipToNext,
    skipToPrevious,
    seekTo,
    setVolume,
    setPlaybackRate,

    addToQueue: store.addToQueue,
    addMultipleToQueue: store.addMultipleToQueue,
    removeFromQueue: store.removeFromQueue,
    clearQueue: store.clearQueue,
    skipToQueueItem: store.skipToQueueItem,
    moveQueueItem: store.moveQueueItem,

    toggleRepeat: store.toggleRepeat,
    toggleShuffle: store.toggleShuffle,

    setSleepTimer: store.setSleepTimer,
    clearSleepTimer: store.clearSleepTimer,

    getProgress: store.getProgress,
    reset: store.reset,
  };
}
