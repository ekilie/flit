import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform } from "react-native";
import { useTheme } from "./ThemeProvider";

/**
 * Central hook for all theme-related needs
 * This replaces useAdaptiveColors, useContextualAdaptiveColors, etc.
 *
 * Usage:
 * const theme = useCurrentTheme() ;
 * const textColor = theme.text;
 * const isDark = theme.isDark;
 */
export function useCurrentTheme() {
  const { colors, colorScheme, isDark, isLight } = useTheme();

  return {
    // Theme state
    colorScheme,
    isDark,
    isLight,

    // Basic colors - direct from theme
    text: colors.text,
    background: colors.background,
    primary: colors.primary,
    secondary: colors.secondary,
    tint: colors.tint,

    // Semantic colors
    surface: colors.surface,
    border: colors.border,
    card: colors.card,

    // Status colors
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    notification: colors.notification,

    // Interactive colors
    buttonBackground: colors.buttonBackground,
    buttonText: colors.buttonText,

    // Input colors
    inputBackground: colors.inputBackground,
    inputBorder: colors.inputBorder,
    inputText: colors.inputText,
    inputPlaceholder: colors.inputPlaceholder,

    // Extended colors for better UX
    subtleText: isDark ? "#cccccc" : "#666666",
    mutedText: isDark ? "#999999" : "#888888",
    accent: isDark ? "#4dabf7" : "#1c7ed6",

    // Layout colors
    cardBackground: isDark ? "#1a1a1a" : "#ffffff",
    divider: isDark ? "#333333" : "#e0e0e0",
    highlight: isDark ? "#2d2d2d" : "#f0f0f0",

    // Shadow and overlay
    shadowColor: isDark ? "#000000" : "#000000",
    shadowOpacity: isDark ? 0.3 : 0.1,
    overlayBackground: isDark ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.5)",

    // Status bar style
    statusBarStyle: isDark ? ("light" as const) : ("dark" as const),
  };
}

/**
 * Hook that automatically manages status bar based on theme
 * Use this in your root component or screens that need status bar control
 */
export function useThemeStatusBar() {
  const theme = useCurrentTheme();

  useEffect(() => {
    // Auto-configure status bar based on theme
    if (Platform.OS === "ios") {
      // iOS uses the StatusBar component from expo-status-bar
      // The component will handle this automatically
    }
  }, [theme.isDark]);

  return theme;
}

/**
 * Status Bar Component that automatically adapts to theme
 * Use this instead of manual StatusBar configuration
 */
export function ThemeStatusBar() {
  const theme = useCurrentTheme();

  return (
    <StatusBar
      style={theme.statusBarStyle}
      backgroundColor={theme.background}
      translucent={false}
    />
  );
}
