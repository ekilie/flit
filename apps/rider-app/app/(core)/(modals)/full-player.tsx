import { ThemeStatusBar } from "@/context/CentralTheme";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const { width, height } = Dimensions.get("window");

const TIMER_OPTIONS = [
  { label: "5 minutes", value: 5 },
  { label: "10 minutes", value: 10 },
  { label: "15 minutes", value: 15 },
  { label: "30 minutes", value: 30 },
  { label: "45 minutes", value: 45 },
  { label: "1 hour", value: 60 },
  { label: "End of track", value: -1 },
];

const formatTimeRemaining = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
};

const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const CustomSlider = ({
  value,
  maximumValue,
  onValueChange,
  minimumTrackTintColor = "#1DB954",
  maximumTrackTintColor = "rgba(255,255,255,0.2)",
}: {
  value: number;
  maximumValue: number;
  onValueChange: (value: number) => void;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
}) => {
  const [sliderWidth, setSliderWidth] = useState(0);
  const progress = maximumValue > 0 ? value / maximumValue : 0;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const locationX = evt.nativeEvent.locationX;
      const newValue = (locationX / sliderWidth) * maximumValue;
      onValueChange(Math.max(0, Math.min(maximumValue, newValue)));
    },
    onPanResponderMove: (evt) => {
      const locationX = evt.nativeEvent.locationX;
      const newValue = (locationX / sliderWidth) * maximumValue;
      onValueChange(Math.max(0, Math.min(maximumValue, newValue)));
    },
  });

  return (
    <View
      style={styles.customSlider}
      onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
      {...panResponder.panHandlers}
    >
      <View
        style={[styles.sliderTrack, { backgroundColor: maximumTrackTintColor }]}
      />
      <View
        style={[
          styles.sliderProgress,
          {
            width: `${progress * 100}%`,
            backgroundColor: minimumTrackTintColor,
          },
        ]}
      />
      <View
        style={[
          styles.sliderThumb,
          {
            left: `${progress * 100}%`,
            backgroundColor: minimumTrackTintColor,
          },
        ]}
      />
    </View>
  );
};

export default function FullPlayerScreen() {
  const router = useRouter();

  // Component mount/unmount logging
  useEffect(() => {
    console.log("🎵 FULL PLAYER - Component mounted");
    return () => {
      console.log("🎵 FULL PLAYER - Component unmounted");
    };
  }, []);

  const {
    currentItem,
    isPlaying,
    position,
    duration,
    volume,
    playbackRate,
    repeatMode,
    shuffleEnabled,
    queue,
    togglePlayPause,
    skipToNext,
    skipToPrevious,
    seekTo,
    setVolume,
    setPlaybackRate,
    toggleRepeat,
    toggleShuffle,
    skipToQueueItem,
    sleepTimerEndTime,
    setSleepTimer,
    clearSleepTimer,
  } = useAudioPlayer();

  // Debug logging for main audio player
  useEffect(() => {
    console.log("🎵 FULL PLAYER - Main Audio Player State:", {
      currentItem: currentItem?.title || "None",
      audioUrl: currentItem?.audioUrl || "None",
      isPlaying,
      position: Math.round(position),
      duration: Math.round(duration),
      timestamp: new Date().toLocaleTimeString(),
    });
  }, [currentItem, isPlaying, position]);

  useEffect(() => {
    if (isPlaying && currentItem) {
      console.log(
        "🎵 FULL PLAYER - PLAYING:",
        currentItem.title,
        "at",
        currentItem.audioUrl
      );
    } else if (!isPlaying && currentItem) {
      console.log("🎵 FULL PLAYER - PAUSED:", currentItem.title);
    }
  }, [isPlaying, currentItem]);

  const [showQueue, setShowQueue] = useState(false);
  const [showSpeedControl, setShowSpeedControl] = useState(false);
  const [showSleepTimer, setShowSleepTimer] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // Bottom sheet refs
  const queueSheetRef = useRef<BottomSheet>(null);
  const speedSheetRef = useRef<BottomSheet>(null);
  const sleepTimerSheetRef = useRef<BottomSheet>(null);

  // Track sleep timer remaining time
  useEffect(() => {
    if (!sleepTimerEndTime) {
      setTimeRemaining(null);
      return;
    }

    const interval = setInterval(() => {
      const remaining = sleepTimerEndTime - Date.now();
      if (remaining <= 0) {
        setTimeRemaining(null);
        clearInterval(interval);
      } else {
        setTimeRemaining(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimerEndTime]);

  const handleSetTimer = (minutes: number) => {
    if (minutes === -1) {
      const remainingSeconds = duration - position;
      if (remainingSeconds > 0) {
        setSleepTimer(remainingSeconds / 60);
      }
    } else {
      setSleepTimer(minutes);
    }
    sleepTimerSheetRef.current?.close();
  };

  const handleClearTimer = () => {
    clearSleepTimer();
    sleepTimerSheetRef.current?.close();
  };

  if (!currentItem) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-down" size={28} color="#fff" />
          </Pressable>
        </View>
        <View style={styles.emptyState}>
          <Ionicons
            name="musical-notes"
            size={80}
            color="rgba(255,255,255,0.3)"
          />
          <Text style={styles.emptyText}>No audio playing</Text>
        </View>
      </View>
    );
  }

  const currentIndex = queue.findIndex((item) => item.id === currentItem.id);
  const progress = duration > 0 ? position / duration : 0;

  return (
    <GestureHandlerRootView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
          animation: "slide_from_bottom",
        }}
      />
      <LinearGradient
        colors={["#1a1a2e", "#16213e", "#0f3460"]}
        style={StyleSheet.absoluteFill}
      />
      <ThemeStatusBar />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-down" size={28} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Now Playing</Text>
        <Pressable
          onPress={() => queueSheetRef.current?.expand()}
          style={styles.queueButton}
        >
          <Ionicons name="list" size={24} color="#fff" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.artworkContainer}>
          {currentItem.artwork ? (
            <Image
              source={{ uri: currentItem.artwork }}
              style={styles.artwork}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.artwork, styles.placeholderArtwork]}>
              <Ionicons
                name="musical-notes"
                size={80}
                color="rgba(255,255,255,0.3)"
              />
            </View>
          )}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {currentItem.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentItem.artist || "Unknown Artist"}
          </Text>
          {currentItem.metadata?.chapterNumber && (
            <Text style={styles.chapter}>
              Chapter {currentItem.metadata.chapterNumber}
            </Text>
          )}
          {currentItem.metadata?.episodeNumber && (
            <Text style={styles.episode}>
              Episode {currentItem.metadata.episodeNumber}
            </Text>
          )}
        </View>

        <View style={styles.progressContainer}>
          <CustomSlider
            value={position}
            maximumValue={duration}
            onValueChange={seekTo}
          />
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>

        <View style={styles.mainControls}>
          <Pressable
            onPress={toggleShuffle}
            style={[styles.iconButton, shuffleEnabled && styles.activeButton]}
          >
            <Ionicons
              name="shuffle"
              size={24}
              color={shuffleEnabled ? "#1DB954" : "#fff"}
            />
          </Pressable>

          <Pressable onPress={skipToPrevious} style={styles.iconButton}>
            <Ionicons name="play-skip-back" size={36} color="#fff" />
          </Pressable>

          <Pressable onPress={togglePlayPause} style={styles.playButton}>
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={42}
              color="#fff"
            />
          </Pressable>

          <Pressable onPress={skipToNext} style={styles.iconButton}>
            <Ionicons name="play-skip-forward" size={36} color="#fff" />
          </Pressable>

          <Pressable
            onPress={toggleRepeat}
            style={[
              styles.iconButton,
              repeatMode !== "off" && styles.activeButton,
            ]}
          >
            <Ionicons
              name={repeatMode === "one" ? "repeat" : "repeat-outline"}
              size={24}
              color={repeatMode !== "off" ? "#1DB954" : "#fff"}
            />
          </Pressable>
        </View>

        <View style={styles.secondaryControls}>
          <View style={styles.controlRow}>
            <Pressable
              onPress={() => speedSheetRef.current?.expand()}
              style={styles.secondaryButton}
            >
              <Ionicons name="speedometer" size={18} color="#fff" />
              <Text style={styles.speedText}>{playbackRate}x</Text>
            </Pressable>

            <Pressable
              onPress={() => sleepTimerSheetRef.current?.expand()}
              style={styles.secondaryButton}
            >
              <Ionicons name="timer-outline" size={18} color="#fff" />
              <Text style={styles.speedText}>Timer</Text>
            </Pressable>
          </View>

          <View style={styles.volumeControl}>
            <Ionicons name="volume-low" size={20} color="#fff" />
            <View style={{ flex: 1 }}>
              <CustomSlider
                value={volume}
                maximumValue={1}
                onValueChange={setVolume}
                minimumTrackTintColor="#fff"
                maximumTrackTintColor="rgba(255,255,255,0.2)"
              />
            </View>
            <Ionicons name="volume-high" size={20} color="#fff" />
          </View>
        </View>
      </ScrollView>

      {/* Queue Bottom Sheet */}
      <BottomSheet
        ref={queueSheetRef}
        index={-1}
        snapPoints={["70%"]}
        enablePanDownToClose
        backdropComponent={BottomSheetBackdrop}
        onChange={(index) => setShowQueue(index >= 0)}
      >
        <BottomSheetView style={styles.sheetContent}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Queue ({queue.length})</Text>
            <Pressable onPress={() => queueSheetRef.current?.close()}>
              <Ionicons name="close" size={28} color="#333" />
            </Pressable>
          </View>
          <FlatList
            data={queue}
            keyExtractor={(item) => item.id}
            style={styles.queueList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <Pressable
                style={[
                  styles.queueItem,
                  index === currentIndex && styles.currentQueueItem,
                ]}
                onPress={() => {
                  skipToQueueItem(index);
                  queueSheetRef.current?.close();
                }}
              >
                <View style={styles.queueItemInfo}>
                  <Text
                    style={[
                      styles.queueItemTitle,
                      index === currentIndex && styles.currentQueueItemText,
                    ]}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  <Text style={styles.queueItemArtist} numberOfLines={1}>
                    {item.artist || "Unknown"}
                  </Text>
                </View>
                {index === currentIndex && (
                  <Ionicons name="play" size={20} color="#1DB954" />
                )}
              </Pressable>
            )}
          />
        </BottomSheetView>
      </BottomSheet>

      {/* Speed Control Bottom Sheet */}
      <BottomSheet
        ref={speedSheetRef}
        index={-1}
        snapPoints={["40%"]}
        enablePanDownToClose
        backdropComponent={BottomSheetBackdrop}
        onChange={(index) => setShowSpeedControl(index >= 0)}
      >
        <BottomSheetView style={styles.sheetContent}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Playback Speed</Text>
            <Pressable onPress={() => speedSheetRef.current?.close()}>
              <Ionicons name="close" size={28} color="#333" />
            </Pressable>
          </View>
          <ScrollView style={styles.speedList}>
            {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((speed) => (
              <Pressable
                key={speed}
                style={[
                  styles.speedOption,
                  playbackRate === speed && styles.activeSpeedOption,
                ]}
                onPress={() => {
                  setPlaybackRate(speed);
                  speedSheetRef.current?.close();
                }}
              >
                <Text
                  style={[
                    styles.speedOptionText,
                    playbackRate === speed && styles.activeSpeedOptionText,
                  ]}
                >
                  {speed}x
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </BottomSheetView>
      </BottomSheet>

      {/* Sleep Timer Bottom Sheet */}
      <BottomSheet
        ref={sleepTimerSheetRef}
        index={-1}
        snapPoints={["60%"]}
        enablePanDownToClose
        backdropComponent={BottomSheetBackdrop}
        onChange={(index) => setShowSleepTimer(index >= 0)}
      >
        <BottomSheetView style={styles.sheetContent}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Sleep Timer</Text>
            <Pressable onPress={() => sleepTimerSheetRef.current?.close()}>
              <Ionicons name="close" size={28} color="#333" />
            </Pressable>
          </View>

          {timeRemaining !== null && (
            <View style={styles.activeTimer}>
              <Ionicons name="timer" size={32} color="#1DB954" />
              <Text style={styles.activeTimerText}>
                Timer active: {formatTimeRemaining(timeRemaining)}
              </Text>
            </View>
          )}

          <ScrollView style={styles.timerList}>
            {TIMER_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                style={styles.timerOption}
                onPress={() => handleSetTimer(option.value)}
              >
                <Text style={styles.timerOptionText}>{option.label}</Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color="rgba(51,51,51,0.5)"
                />
              </Pressable>
            ))}
          </ScrollView>

          {sleepTimerEndTime && (
            <Pressable style={styles.clearButton} onPress={handleClearTimer}>
              <Text style={styles.clearButtonText}>Clear Timer</Text>
            </Pressable>
          )}
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  queueButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  artworkContainer: {
    alignItems: "center",
    marginVertical: 40,
  },
  artwork: {
    width: width - 80,
    height: width - 80,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  placeholderArtwork: {
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  infoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  artist: {
    fontSize: 18,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
  },
  chapter: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    marginTop: 4,
  },
  episode: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    marginTop: 4,
  },
  progressContainer: {
    marginBottom: 30,
  },
  customSlider: {
    height: 40,
    justifyContent: "center",
    position: "relative",
  },
  sliderTrack: {
    height: 4,
    borderRadius: 2,
  },
  sliderProgress: {
    position: "absolute",
    height: 4,
    borderRadius: 2,
  },
  sliderThumb: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    marginLeft: -7,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 5,
  },
  timeText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },
  mainControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  iconButton: {
    padding: 10,
  },
  activeButton: {
    opacity: 1,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryControls: {
    marginTop: 20,
  },
  controlRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 20,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  speedText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  volumeControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "rgba(255,255,255,0.5)",
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  queueModal: {
    backgroundColor: "rgba(0,0,0,0.95)",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.7,
    paddingTop: 20,
  },
  queueHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  queueTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  queueList: {
    paddingTop: 10,
  },
  queueItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  currentQueueItem: {
    backgroundColor: "rgba(29, 185, 84, 0.1)",
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  queueItemInfo: {
    flex: 1,
    marginRight: 10,
  },
  queueItemTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  currentQueueItemText: {
    color: "#1DB954",
  },
  queueItemArtist: {
    fontSize: 14,
    color: "#666",
  },
  speedModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  speedModal: {
    backgroundColor: "#1a1a2e",
    borderRadius: 20,
    padding: 20,
    minWidth: 200,
  },
  speedModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 15,
  },
  speedOption: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 4,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  activeSpeedOption: {
    backgroundColor: "#1DB954",
    borderColor: "#1DB954",
  },
  speedOptionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
  },
  activeSpeedOptionText: {
    fontWeight: "700",
    color: "#fff",
  },
  // Bottom Sheet Styles
  sheetContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  speedList: {
    paddingTop: 10,
  },
  timerList: {
    paddingTop: 10,
  },
  timerOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  timerOptionText: {
    fontSize: 17,
    fontWeight: "500",
    color: "#333",
  },
  activeTimer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 12,
    backgroundColor: "rgba(29, 185, 84, 0.1)",
    marginHorizontal: 0,
    marginTop: 15,
    borderRadius: 12,
  },
  activeTimerText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1DB954",
  },
  clearButton: {
    marginHorizontal: 0,
    marginTop: 15,
    paddingVertical: 14,
    backgroundColor: "rgba(255, 59, 48, 0.15)",
    borderRadius: 12,
    alignItems: "center",
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF3B30",
  },
});
