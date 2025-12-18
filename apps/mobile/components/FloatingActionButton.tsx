import { useCurrentTheme } from "@/context/CentralTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet } from "react-native";

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
  bottom?: number;
  right?: number;
}

export default function FloatingActionButton({
  onPress,
  icon = "add",
  size = 28,
  color,
  bottom = 20,
  right = 20,
}: FloatingActionButtonProps) {
  const theme = useCurrentTheme();
  const fabColor = color || theme.primary;

  return (
    <Pressable
      style={[
        styles.fab,
        {
          backgroundColor: fabColor,
          bottom,
          right,
        },
      ]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={size} color="white" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
});
