import { useCurrentTheme } from "@/context/CentralTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface EmptyStateProps {
  title?: string;
  message?: string;
  onAction?: () => void;
  actionText?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  showActionButton?: boolean;
}

export default function EmptyState({
  title = "Nothing here yet",
  message = "Get started by creating your first item.",
  onAction,
  actionText = "Get Started",
  iconName = "add-circle-outline",
  showActionButton = true,
}: EmptyStateProps) {
  const theme = useCurrentTheme();

  return (
    <View style={styles.container}>
      <Ionicons name={iconName} size={64} color={theme.mutedText} />
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.message, { color: theme.mutedText }]}>
        {message}
      </Text>
      {showActionButton && onAction && (
        <Pressable
          style={[styles.actionButton, { backgroundColor: theme.primary }]}
          onPress={onAction}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.actionButtonText}>{actionText}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
