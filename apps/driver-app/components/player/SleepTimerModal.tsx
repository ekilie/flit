import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useAudioPlayerStore } from "@/stores/audioPlayer";

interface SleepTimerModalProps {
  visible: boolean;
  onClose: () => void;
}

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

export default function SleepTimerModal({ visible, onClose }: SleepTimerModalProps) {
  // Subscribe directly to the store instead of calling useAudioPlayer()
  // to avoid creating multiple audio player instances
  const sleepTimerEndTime = useAudioPlayerStore((state) => state.sleepTimerEndTime);
  const setSleepTimer = useAudioPlayerStore((state) => state.setSleepTimer);
  const clearSleepTimer = useAudioPlayerStore((state) => state.clearSleepTimer);
  const duration = useAudioPlayerStore((state) => state.duration);
  const position = useAudioPlayerStore((state) => state.position);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

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
    onClose();
  };

  const handleClearTimer = () => {
    clearSleepTimer();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <BlurView intensity={50} style={styles.container}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Sleep Timer</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#fff" />
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

          <ScrollView style={styles.optionsList}>
            {TIMER_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                style={styles.option}
                onPress={() => handleSetTimer(option.value)}
              >
                <Text style={styles.optionText}>{option.label}</Text>
                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
              </Pressable>
            ))}
          </ScrollView>

          {sleepTimerEndTime && (
            <Pressable style={styles.clearButton} onPress={handleClearTimer}>
              <Text style={styles.clearButtonText}>Clear Timer</Text>
            </Pressable>
          )}
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "rgba(0,0,0,0.95)",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },
  closeButton: {
    padding: 5,
  },
  activeTimer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 12,
    backgroundColor: "rgba(29, 185, 84, 0.1)",
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 12,
  },
  activeTimerText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1DB954",
  },
  optionsList: {
    paddingTop: 10,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  optionText: {
    fontSize: 17,
    fontWeight: "500",
    color: "#fff",
  },
  clearButton: {
    marginHorizontal: 20,
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
