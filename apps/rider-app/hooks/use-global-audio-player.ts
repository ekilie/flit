import { useAudioPlayer } from "expo-audio";
import { useCallback, useEffect } from "react";

// Import shared global player state from useAudioPlayer
// This ensures coordination between the main audio player and global audio player
let sharedGlobalPlayer: any = null;
let sharedGlobalPlayerUri: string | null = null;

// Export setters to allow coordination between hooks
export function setSharedGlobalPlayer(player: any, uri: string | null) {
  console.log(" SHARED PLAYER - Setting shared player:", {
    hasPlayer: !!player,
    uri: uri || "None",
    previousUri: sharedGlobalPlayerUri || "None",
    timestamp: new Date().toLocaleTimeString(),
  });
  sharedGlobalPlayer = player;
  sharedGlobalPlayerUri = uri;
}

export function getSharedGlobalPlayer() {
  const result = { player: sharedGlobalPlayer, uri: sharedGlobalPlayerUri };
  console.log("🔗 SHARED PLAYER - Getting shared player:", {
    hasPlayer: !!result.player,
    uri: result.uri || "None",
    timestamp: new Date().toLocaleTimeString(),
  });
  return result;
}

// Helper function to check if player is still valid (exported for use in stopAllAudio)
function isPlayerValid(player: any): boolean {
  if (!player) return false;
  try {
    // Try to access a property to see if player is still valid
    const _ = player.playing;
    return true;
  } catch (error) {
    return false;
  }
}

// Utility function to stop all audio without needing the hook
export function stopAllAudio() {
  if (sharedGlobalPlayer && isPlayerValid(sharedGlobalPlayer)) {
    try {
      sharedGlobalPlayer.pause();
      sharedGlobalPlayer = null;
      sharedGlobalPlayerUri = null;
    } catch (error) {
      console.error("Failed to stop all audio:", error);
      // Clear references even if pause failed
      sharedGlobalPlayer = null;
      sharedGlobalPlayerUri = null;
    }
  } else {
    // Clear references even if player is invalid
    sharedGlobalPlayer = null;
    sharedGlobalPlayerUri = null;
  }
}

export interface GlobalAudioPlayerOptions {
  autoPlay?: boolean;
  loop?: boolean;
  volume?: number;
  onPlaybackStatusUpdate?: (status: any) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

// Helper function to safely access player properties
function safeGetPlayerProperty<T>(
  player: any,
  property: string,
  defaultValue: T
): T {
  if (!player) return defaultValue;
  try {
    return player[property] ?? defaultValue;
  } catch (error) {
    // Player has been released
    return defaultValue;
  }
}

export function useGlobalAudioPlayer(
  uri: string | null,
  options: GlobalAudioPlayerOptions = {}
) {
  const {
    autoPlay = false,
    loop = false,
    volume = 1.0,
    onPlaybackStatusUpdate,
    onComplete,
    onError,
  } = options;

  const player = useAudioPlayer(uri ? { uri } : null);
  // player.setActiveForLockScreen(true);
  // Debug logging for global audio player
  useEffect(() => {
    const isPlaying = safeGetPlayerProperty(player, "playing", false);
    const currentTime = safeGetPlayerProperty(player, "currentTime", 0);
    
    console.log("🎧 GLOBAL PLAYER - Instance created/updated:", {
      uri: uri || "None",
      hasPlayer: !!player,
      isPlaying,
      currentTime,
      timestamp: new Date().toLocaleTimeString(),
    });

    // Log all active players for debugging
    const timeoutId = setTimeout(() => {
      const playerIsPlaying = safeGetPlayerProperty(player, "playing", false);
      const sharedIsPlaying = safeGetPlayerProperty(
        sharedGlobalPlayer,
        "playing",
        false
      );
      
      console.log(`🎵🎧 ALL PLAYERS SUMMARY (Global Player Updated):`, {
        globalPlayer: {
          uri: uri || "None",
          hasPlayer: !!player,
          isPlaying: playerIsPlaying,
        },
        sharedGlobalPlayer: {
          hasPlayer: !!sharedGlobalPlayer,
          uri: sharedGlobalPlayerUri || "None",
          isPlaying: sharedIsPlaying,
        },
        timestamp: new Date().toLocaleTimeString(),
      });
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [uri, player]);

  useEffect(() => {
    if (!player || !uri) return;
    
    try {
      const isPlaying = safeGetPlayerProperty(player, "playing", false);
      if (isPlaying) {
        console.log("GLOBAL PLAYER - PLAYING:", uri);
      } else {
        console.log("GLOBAL PLAYER - PAUSED:", uri);
      }
    } catch (error) {
      // Player released, ignore
    }
  }, [uri, player]);

  // Stop any currently playing audio when a new player is created
  useEffect(() => {
    if (uri && sharedGlobalPlayer && sharedGlobalPlayerUri !== uri) {
      try {
        console.log("🔇 GLOBAL PLAYER - Stopping previous player:", {
          previousUri: sharedGlobalPlayerUri,
          newUri: uri,
          timestamp: new Date().toLocaleTimeString(),
        });

        // Check if the player is still valid before calling pause
        if (
          sharedGlobalPlayer &&
          isPlayerValid(sharedGlobalPlayer) &&
          typeof sharedGlobalPlayer.pause === "function"
        ) {
          sharedGlobalPlayer.pause();
          console.log("🔇 GLOBAL PLAYER - Successfully paused previous player");
        }
      } catch (error) {
        console.warn(
          "🔇 GLOBAL PLAYER - Failed to pause previous player:",
          error
        );
      } finally {
        sharedGlobalPlayer = null;
        sharedGlobalPlayerUri = null;
        console.log("🔇 GLOBAL PLAYER - Cleared shared player references");
      }
    }

    // Update the current player reference when URI changes
    if (uri && player && isPlayerValid(player)) {
      console.log("🔗 GLOBAL PLAYER - Updating shared player reference:", {
        uri,
        hasPlayer: !!player,
        timestamp: new Date().toLocaleTimeString(),
      });
      sharedGlobalPlayer = player;
      sharedGlobalPlayerUri = uri;
    }
  }, [uri, player]);

  // playback monitoring
  useEffect(() => {
    if (!player) return;

    const interval = setInterval(() => {
      // Check if player is still valid before accessing properties
      if (!isPlayerValid(player)) {
        clearInterval(interval);
        return;
      }

      try {
        const isPlaying = safeGetPlayerProperty(player, "playing", false);
        if (isPlaying) {
          const currentTime = safeGetPlayerProperty(player, "currentTime", 0);
          const duration = safeGetPlayerProperty(player, "duration", 0);
          
          onPlaybackStatusUpdate?.({
            isLoaded: true,
            isPlaying: true,
            currentTime,
            duration,
          });

          // Check if playback finished
          if (duration > 0 && currentTime >= duration) {
            onComplete?.();
            if (sharedGlobalPlayer === player) {
              sharedGlobalPlayer = null;
              sharedGlobalPlayerUri = null;
            }

            // Handle loop
            if (loop && isPlayerValid(player)) {
              try {
                player.seekTo(0);
                player.play();
              } catch (error) {
                console.warn("Failed to loop audio:", error);
              }
            }
          }
        }
      } catch (error) {
        // Player was released during access, clear interval
        console.warn("Player released during playback monitoring:", error);
        clearInterval(interval);
      }
    }, 100); // Update every 100ms

    return () => clearInterval(interval);
  }, [player, onPlaybackStatusUpdate, onComplete, loop]);

  // Set volume when player is ready
  useEffect(() => {
    if (player && isPlayerValid(player) && volume !== undefined) {
      try {
        player.volume = volume;
      } catch (error) {
        console.warn("Failed to set volume:", error);
      }
    }
  }, [player, volume]);

  // Auto play if enabled
  useEffect(() => {
    if (autoPlay && uri && player && isPlayerValid(player)) {
      playExclusive();
    }
  }, [autoPlay, uri, player]);

  const playExclusive = useCallback(async () => {
    if (!player || !uri || !isPlayerValid(player)) return;

    try {
      // Stop any currently playing audio
      if (
        sharedGlobalPlayer &&
        sharedGlobalPlayer !== player &&
        isPlayerValid(sharedGlobalPlayer)
      ) {
        try {
          await sharedGlobalPlayer.pause();
        } catch (error) {
          // Previous player was released, just clear reference
          console.warn("Previous player was released:", error);
        }
      }

      // Set this as the current player
      sharedGlobalPlayer = player;
      sharedGlobalPlayerUri = uri;

      // Start playing
      player.play();
    } catch (error) {
      console.error("Failed to play audio:", error);
      onError?.(
        error instanceof Error ? error.message : "Failed to play audio"
      );
    }
  }, [player, uri, onError]);

  const pause = useCallback(async () => {
    if (!player || !isPlayerValid(player)) return;

    try {
      player.pause();
      if (sharedGlobalPlayer === player) {
        sharedGlobalPlayer = null;
        sharedGlobalPlayerUri = null;
      }
    } catch (error) {
      console.error("Failed to pause audio:", error);
      // Clear references even if pause failed (player might be released)
      if (sharedGlobalPlayer === player) {
        sharedGlobalPlayer = null;
        sharedGlobalPlayerUri = null;
      }
      onError?.(
        error instanceof Error ? error.message : "Failed to pause audio"
      );
    }
  }, [player, onError]);

  const stop = () => {
    try {
      if (
        sharedGlobalPlayer &&
        isPlayerValid(sharedGlobalPlayer) &&
        typeof sharedGlobalPlayer.pause === "function"
      ) {
        sharedGlobalPlayer.pause();
      }
    } catch (error) {
      console.warn("Failed to stop player:", error);
    } finally {
      if (uri === sharedGlobalPlayerUri) {
        sharedGlobalPlayer = null;
        sharedGlobalPlayerUri = null;
      }
    }
  };

  const seekTo = useCallback(
    (positionSeconds: number) => {
      if (!player || !isPlayerValid(player)) return;

      try {
        player.seekTo(positionSeconds);
      } catch (error) {
        console.error("Failed to seek audio:", error);
        onError?.(
          error instanceof Error ? error.message : "Failed to seek audio"
        );
      }
    },
    [player, onError]
  );

  const setPlayerVolume = useCallback(
    (newVolume: number) => {
      if (!player || !isPlayerValid(player)) return;

      try {
        player.volume = Math.max(0, Math.min(1, newVolume));
      } catch (error) {
        console.error("Failed to set volume:", error);
        onError?.(
          error instanceof Error ? error.message : "Failed to set volume"
        );
      }
    },
    [player, onError]
  );

  const replay = useCallback(async () => {
    if (!player || !isPlayerValid(player)) return;

    try {
      player.seekTo(0);
      player.play();
      sharedGlobalPlayer = player;
      sharedGlobalPlayerUri = uri;
    } catch (error) {
      console.error("Failed to replay audio:", error);
      onError?.(
        error instanceof Error ? error.message : "Failed to replay audio"
      );
    }
  }, [player, uri, onError]);

  const togglePlayPause = async () => {
    if (!player || !isPlayerValid(player)) return;

    try {
      if (isPlaying) {
        player.pause();
      } else {
        // Stop any other player before starting this one
        playExclusive();
        if (isPlayerValid(player)) {
          player.play();
        }
      }
    } catch (error) {
      console.error("Error toggling playback:", error);
    }
  };

  // Check if this is the currently playing audio
  const isCurrentPlayer =
    sharedGlobalPlayer === player && sharedGlobalPlayerUri === uri;
  const isPlaying =
    isCurrentPlayer && isPlayerValid(player)
      ? safeGetPlayerProperty(player, "playing", false)
      : false;

  // Global controls to stop all audio
  const stopAll = useCallback(() => {
    if (sharedGlobalPlayer && isPlayerValid(sharedGlobalPlayer)) {
      try {
        sharedGlobalPlayer.pause();
        sharedGlobalPlayer = null;
        sharedGlobalPlayerUri = null;
      } catch (error) {
        console.error("Failed to stop all audio:", error);
      }
    } else {
      // Clear references even if player is invalid
      sharedGlobalPlayer = null;
      sharedGlobalPlayerUri = null;
    }
  }, []);

  // Get playback rate control
  const setPlaybackRate = useCallback(
    (rate: number) => {
      if (!player || !isPlayerValid(player)) return;

      try {
        // Clamp rate between 0.25x and 3x
        const clampedRate = Math.max(0.25, Math.min(3, rate));
        if ("setRate" in player) {
          (player as any).setRate(clampedRate);
        }
      } catch (error) {
        console.error("Failed to set playback rate:", error);
        onError?.(
          error instanceof Error ? error.message : "Failed to set playback rate"
        );
      }
    },
    [player, onError]
  );

  // Safely get player properties for return values
  const currentPosition = isPlayerValid(player)
    ? safeGetPlayerProperty(player, "currentTime", 0)
    : 0;
  const duration = isPlayerValid(player)
    ? safeGetPlayerProperty(player, "duration", 0)
    : 0;
  const playerVolume = isPlayerValid(player)
    ? safeGetPlayerProperty(player, "volume", 1)
    : 1;

  return {
    player,
    // Basic controls
    playExclusive,
    pause,
    stop,
    togglePlayPause,
    replay,
    stopAll,

    // Seek and volume controls
    seekTo,
    setVolume: setPlayerVolume,
    setPlaybackRate,

    // Status
    isPlaying,
    isCurrentPlayer,
    currentPosition,
    duration,
    volume: playerVolume,

    // Utilities
    getCurrentPlayerUri: () => sharedGlobalPlayerUri,
    isAnyAudioPlaying: () => sharedGlobalPlayer !== null && isPlayerValid(sharedGlobalPlayer),
  };
}
