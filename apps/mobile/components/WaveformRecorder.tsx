import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

interface Theme {
  primary: string;
  cardBackground: string;
  text: string;
  subtleText: string;
}

interface WaveformRecorderProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  disabled?: boolean;
  theme: Theme;
  mode?: "recording" | "playback";
  isPlaying?: boolean;
  onPlayPress?: () => void;
  duration?: number;
}

export default function WaveformRecorder({
  isRecording,
  onStartRecording,
  onStopRecording,
  disabled = false,
  theme,
  mode = "recording",
  isPlaying = false,
  onPlayPress,
  duration = 0,
}: WaveformRecorderProps) {
  const animatedValues = useRef(
    Array.from({ length: 20 }, () => new Animated.Value(0.3))
  ).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isRecording) {
      // Pulse animation for the record button
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Glow effect
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Animate waveform bars with random heights
      const animations = animatedValues.map((anim, index) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: Math.random() * 0.7 + 0.3,
              duration: 300 + Math.random() * 400,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: Math.random() * 0.7 + 0.3,
              duration: 300 + Math.random() * 400,
              useNativeDriver: true,
            }),
          ])
        )
      );

      // Stagger the animations
      animations.forEach((anim, index) => {
        setTimeout(() => anim.start(), index * 50);
      });
    } else {
      // Stop all animations
      pulseAnim.stopAnimation();
      glowAnim.stopAnimation();
      animatedValues.forEach((anim) => anim.stopAnimation());

      // Reset to initial state
      Animated.parallel([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        ...animatedValues.map((anim) =>
          Animated.timing(anim, {
            toValue: 0.3,
            duration: 200,
            useNativeDriver: true,
          })
        ),
      ]).start();
    }
  }, [isRecording]);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <View style={styles.container}>
      <View
        style={[styles.waveformCard, { backgroundColor: theme.cardBackground }]}
      >
        {/* Waveform Visualization */}
        <View style={styles.waveformContainer}>
          {animatedValues.map((anim, index) => {
            const scaleY = anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.2, 1.5],
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.waveBar,
                  {
                    transform: [{ scaleY }],
                    backgroundColor: isRecording
                      ? theme.primary
                      : `${theme.primary}40`,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Record/Play Button */}
        <View style={styles.recordButtonContainer}>
          <Animated.View
            style={[
              styles.glowCircle,
              {
                backgroundColor: (
                  mode === "recording" ? isRecording : isPlaying
                )
                  ? "#FF4757"
                  : theme.primary,
                opacity: glowOpacity,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />
          <Animated.View
            style={{
              transform: [{ scale: pulseAnim }],
            }}
          >
            <Pressable
              onPress={
                mode === "recording"
                  ? isRecording
                    ? onStopRecording
                    : onStartRecording
                  : onPlayPress
              }
              disabled={disabled}
              style={({ pressed }) => [
                styles.recordButton,
                {
                  backgroundColor: (
                    mode === "recording" ? isRecording : isPlaying
                  )
                    ? "#FF4757"
                    : theme.primary,
                  opacity: pressed || disabled ? 0.7 : 1,
                },
              ]}
            >
              <View
                style={[
                  styles.recordButtonInner,
                  (mode === "recording" ? isRecording : isPlaying) &&
                    styles.recordButtonInnerStop,
                ]}
              >
                {mode === "recording" ? (
                  !isRecording ? (
                    <Ionicons name="mic" size={32} color="white" />
                  ) : (
                    <View style={styles.stopIcon} />
                  )
                ) : (
                  <Ionicons
                    name={isPlaying ? "pause" : "play"}
                    size={32}
                    color="white"
                    style={!isPlaying && { marginLeft: 3 }}
                  />
                )}
              </View>
            </Pressable>
          </Animated.View>
        </View>

        {/* Recording Status */}
        {isRecording && (
          <View style={styles.recordingStatus}>
            <View
              style={[styles.recordingDot, { backgroundColor: "#FF4757" }]}
            />
            <Text style={[styles.recordingText, { color: theme.text }]}>
              Recording...
            </Text>
          </View>
        )}

        {/* Instructions */}
        {!isRecording && (
          <Text style={[styles.instructions, { color: theme.subtleText }]}>
            Tap to start recording your voice
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  waveformCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    overflow: "hidden",
  },
  waveformContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 80,
    gap: 3,
    marginBottom: 32,
  },
  waveBar: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },
  recordButtonContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  glowCircle: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  recordButtonInner: {
    justifyContent: "center",
    alignItems: "center",
  },
  recordButtonInnerStop: {
    width: 24,
    height: 24,
  },
  stopIcon: {
    width: 24,
    height: 24,
    backgroundColor: "white",
    borderRadius: 4,
  },
  recordingStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  recordingText: {
    fontSize: 16,
    fontWeight: "600",
  },
  instructions: {
    fontSize: 14,
    textAlign: "center",
  },
});
