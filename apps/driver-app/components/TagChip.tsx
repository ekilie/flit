import { useCurrentTheme } from "@/context/CentralTheme";
import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

interface TagChipProps {
  label: string;
  size?: "small" | "medium";
  variant?: "default" | "outlined";
  color?: string;
  onPress?: () => void;
}

export default function TagChip({
  label,
  size = "medium",
  variant = "default",
  color,
  onPress,
}: TagChipProps) {
  const theme = useCurrentTheme();
  const chipColor = color || theme.primary;

  const isOutlined = variant === "outlined";

  return (
    <Pressable
      style={({ pressed }) => [
        styles.chip,
        styles[size],
        {
          backgroundColor: isOutlined ? "transparent" : `${chipColor}20`,
          borderColor: isOutlined ? chipColor : "transparent",
          borderWidth: isOutlined ? 1 : 0,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <Text
        style={[
          styles.label,
          styles[`${size}Text`],
          { color: chipColor },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 10,
  },
  small: {
    height: 24,
    paddingHorizontal: 8,
  },
  medium: {
    height: 28,
    paddingHorizontal: 10,
  },
  label: {
    fontWeight: "500",
  },
  smallText: {
    fontSize: 11,
  },
  mediumText: {
    fontSize: 13,
  },
});
