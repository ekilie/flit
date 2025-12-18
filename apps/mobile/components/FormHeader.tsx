import { useCurrentTheme } from "@/context/CentralTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface FormHeaderProps {
  title: string;
  onCancel: () => void;
  onSubmit?: () => void;
  submitText?: string;
  isSubmitting?: boolean;
  canSubmit?: boolean;
  showSubmitButton?: boolean;
}

export default function FormHeader({
  title,
  onCancel,
  onSubmit,
  submitText = "Save",
  isSubmitting = false,
  canSubmit = true,
  showSubmitButton = true,
}: FormHeaderProps) {
  const theme = useCurrentTheme();

  return (
    <View style={[styles.header, { borderBottomColor: theme.divider }]}>
      <Pressable onPress={onCancel} style={styles.button}>
        <Ionicons name="close" size={24} color={theme.text} />
      </Pressable>

      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>

      {showSubmitButton ? (
        <Pressable
          onPress={onSubmit}
          disabled={isSubmitting || !canSubmit}
          style={[
            styles.button,
            styles.submitButton,
            {
              backgroundColor: canSubmit ? theme.primary : theme.mutedText,
              opacity: isSubmitting ? 0.7 : 1,
            },
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.submitButtonText}>{submitText}</Text>
          )}
        </Pressable>
      ) : (
        <View style={styles.button} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  button: {
    padding: 8,
    minWidth: 44,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  submitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
