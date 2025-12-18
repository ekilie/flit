import React, {
  createContext,
  useContext,
  type PropsWithChildren,
} from "react";
import { useColorScheme } from "react-native";
import {
  Colors,
  type ColorScheme,
  type ThemeColors,
} from "../constants/Colors";
import { ENABLE_DYNAMIC_THEME } from "../constants/constants";

// Theme context interface
interface ThemeContextType {
  colors: ThemeColors;
  colorScheme: ColorScheme;
  isDark: boolean;
  isLight: boolean;
}

// Create the theme context
const ThemeContext = createContext<ThemeContextType | null>(null);

// Theme Provider Component
export function ThemeProvider({ children }: PropsWithChildren) {
  // Use system theme only if dynamic theme is enabled, otherwise force light mode
  const systemColorScheme = useColorScheme() ?? "light";
  const colorScheme: ColorScheme = ENABLE_DYNAMIC_THEME
    ? systemColorScheme
    : "light";
  const colors = Colors[colorScheme];

  const contextValue: ThemeContextType = {
    colors,
    colorScheme,
    isDark: ENABLE_DYNAMIC_THEME ? colorScheme === "dark" : false,
    isLight: ENABLE_DYNAMIC_THEME ? colorScheme === "light" : true,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// Main hook to get theme context
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    // Fallback if provider is not available
    const systemColorScheme = useColorScheme() ?? "light";
    const colorScheme: ColorScheme = ENABLE_DYNAMIC_THEME
      ? systemColorScheme
      : "light";
    return {
      colors: Colors[colorScheme],
      colorScheme,
      isDark: ENABLE_DYNAMIC_THEME ? colorScheme === "dark" : false,
      isLight: ENABLE_DYNAMIC_THEME ? colorScheme === "light" : true,
    };
  }
  return context;
}

// @deprecated Use useCurrentTheme()  from ./CentralTheme instead
export function useContextualAdaptiveColors() {
  const { colors, isDark, colorScheme } = useTheme();

  return {
    // Basic colors from context
    text: colors.text,
    background: colors.background,
    primary: colors.primary,
    secondary: colors.secondary,

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

    // Utility
    isDark,
    isLight: !isDark,
    colorScheme,
    tint: colors.tint,

    // Custom adaptive colors
    inversePrimary: isDark ? Colors.light.primary : Colors.dark.primary,
    inverseBackground: isDark
      ? Colors.light.background
      : Colors.dark.background,
    subtleText: isDark ? "#cccccc" : "#666666",
    mutedText: isDark ? "#999999" : "#888888",
    accent: isDark ? "#4dabf7" : "#1c7ed6",

    // Enhanced adaptive colors
    cardBackground: isDark ? "#1a1a1a" : "#ffffff",
    shadowColor: isDark ? "#000000" : "#000000",
    shadowOpacity: isDark ? 0.3 : 0.1,
    overlayBackground: isDark ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.5)",
    divider: isDark ? "#333333" : "#e0e0e0",
    highlight: isDark ? "#2d2d2d" : "#f0f0f0",
  };
}
