import { View, Text, Animated, Pressable, StyleSheet } from "react-native";
import React, { useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useAudioPlayerStore } from "@/stores/audioPlayer";
import { useRouter } from "expo-router";
import { stopAllAudio } from "@/hooks/use-global-audio-player";

export default function MiniPlayer() {
  const currentItem = useAudioPlayerStore((state) => state.currentItem);
  const isPlaying = useAudioPlayerStore((state) => state.isPlaying);
  const togglePlayPause = useAudioPlayerStore((state) => state.togglePlayPause);
  const skipToNext = useAudioPlayerStore((state) => state.skipToNext);
  const skipToPrevious = useAudioPlayerStore((state) => state.skipToPrevious);
  const reset = useAudioPlayerStore((state) => state.reset);
  
  const router = useRouter();
  const miniPlayerAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(miniPlayerAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: false,
          }),
          Animated.timing(waveAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      waveAnim.stopAnimation();
      waveAnim.setValue(0);
    }
  }, [isPlaying]);

  if (!currentItem) return null;

  const barHeights = [14, 18, 22, 16, 20];

  const handleClose = () => {
    stopAllAudio();
    reset();
  };

  const handlePress = () => {
    console.log("MiniPlayer pressed - navigations diabled for now");
    // router.push("/(core)/(modals)/full-player");
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: miniPlayerAnim,
          transform: [
            {
              translateY: miniPlayerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [80, 0],
              }),
            },
          ],
        },
      ]}
    >
      <BlurView intensity={70} tint="light" style={styles.blurBg}>
        <LinearGradient
          colors={["rgba(255,255,255,0.7)", "rgba(255,255,255,0.95)"]}
          style={styles.content}
        >
          <Pressable onPress={handlePress} style={styles.infoSection}>
            <View style={styles.waveform}>
              {barHeights.map((h, i) => {
                const animatedHeight = waveAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [h, h + 6],
                });
                return (
                  <Animated.View
                    key={i}
                    style={[
                      styles.waveBar,
                      { height: animatedHeight, opacity: 0.8 - i * 0.1 },
                    ]}
                  />
                );
              })}
            </View>

            <View style={styles.textSection}>
              <Text style={styles.title} numberOfLines={1}>
                {currentItem.title}
              </Text>
              <Text style={styles.artist} numberOfLines={1}>
                {currentItem.artist || "Unknown Artist"}
              </Text>
            </View>
          </Pressable>

          <View style={styles.controls}>
            <Pressable style={styles.button} onPress={skipToPrevious}>
              <Ionicons name="play-skip-back" size={22} color="#111" />
            </Pressable>
            <Pressable style={[styles.playButton]} onPress={togglePlayPause}>
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={26}
                color="#fff"
              />
            </Pressable>
            <Pressable style={styles.button} onPress={skipToNext}>
              <Ionicons name="play-skip-forward" size={22} color="#111" />
            </Pressable>
            <Pressable style={styles.button} onPress={handleClose}>
              <Ionicons name="close" size={20} color="#444" />
            </Pressable>
          </View>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#0000007d",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 1000,
  },
  blurBg: {
    borderRadius: 16,
    overflow: "hidden",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  infoSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  waveform: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
    height: 26,
  },
  waveBar: {
    width: 3,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 2,
  },
  textSection: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
  },
  artist: {
    fontSize: 12,
    color: "rgba(0,0,0,0.55)",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  button: {
    padding: 6,
  },
  playButton: {
    backgroundColor: "#111",
    borderRadius: 24,
    padding: 8,
  },
});
