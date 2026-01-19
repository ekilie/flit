import { useColorScheme } from "react-native";

const tintColorLight = "#98a75e";
const tintColorDark = "#fff";

export const Colors = {
  tabColors: {
    ride: "#178764ff", // Green for ride booking (rider app)
    home: "#10b981", // Green for driver home/online status
    earnings: "#98a75e", // Green accent for earnings
    profile: "#98a75e", // Flit green accent for profile
    feed: "#178764ff", // Spotify-like green for listening/audio
    insights: "#6366f1", // Purple for analytics/data
    "voice-memory": "#FFA726", // Amber for memories/nostalgia
    me: "#FF6B6B", // Violet for personal/profile
  },
  light: {
    text: "#000",
    background: "#fff",
    tint: tintColorLight,
    tabIconDefault: "#ccc",
    tabIconSelected: tintColorLight,
    primary: "#98a75e",
    secondary: "#666666",
    surface: "#f5f5f5",
    border: "#e0e0e0",
    card: "#fff",
    notification: "#ff3b30",
    success: "#34c759",
    warning: "#ff9500",
    error: "#ff3b30",
    // Button colors
    buttonBackground: "#98a75e",
    buttonText: "#000",
    // Input colors
    inputBackground: "#f9f9f9",
    inputBorder: "#ddd",
    inputText: "#000",
    inputPlaceholder: "#999",
  },
  dark: {
    text: "#ffffff",
    background: "#000000",
    tint: "#98a75e",
    tabIconDefault: "#cccccc",
    tabIconSelected: "#98a75e",
    primary: "#98a75e",
    secondary: "#aaaaaa", // Lighter gray for secondary text
    surface: "#111111", // Slightly lighter than background for cards/surfaces
    border: "#333333",
    card: "#111111",
    notification: "#ff453a",
    success: "#30d158",
    warning: "#ff9f0a",
    error: "#ff453a",
    // Button colors - flit accent color
    buttonBackground: "#ad8d19ff",
    buttonText: "#000000",
    // Input colors - dark inputs with white text
    inputBackground: "#111111",
    inputBorder: "#333333",
    inputText: "#ffffff",
    inputPlaceholder: "#888888",
    // Link colors
    link: "#98a75e",
  },
};

// Type definitions
export type ColorScheme = "light" | "dark";
export type ThemeColors = typeof Colors.light;
export type ColorKey = keyof ThemeColors;

// Simple hook to get current color scheme - forced to light mode for development
// @deprecated Use useCurrentTheme()  from context/CentralTheme instead
export function useCurrentColorScheme(): ColorScheme {
  return "light"; // Force light mode - ignore system theme
}

// Hook to get theme colors based on current scheme
export function useThemeColors(): ThemeColors {
  const colorScheme = useCurrentColorScheme();
  return Colors[colorScheme];
}

// Hook to get specific theme color with optional overrides
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: ColorKey
): string {
  const colorScheme = useCurrentColorScheme();
  const colors = Colors[colorScheme];
  const colorFromProps = props[colorScheme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return colors[colorName];
  }
}

// Hook for adaptive colors (automatically switches based on theme)
// @deprecated Use useCurrentTheme()  from context/CentralTheme instead
export function useAdaptiveColors() {
  const colorScheme = useCurrentColorScheme();
  const colors = Colors[colorScheme];
  const isDark = colorScheme === "dark";

  return {
    // Basic colors
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
    accent: "#98a75e",
  };
}

// Helper function to get colors without hooks (for use in StyleSheet.create)
export function getThemeColors(
  colorScheme: ColorScheme = "light"
): ThemeColors {
  return Colors[colorScheme];
}

// Helper function to create theme-aware styles
export function createThemedStyles<T extends Record<string, any>>(
  styleCreator: (colors: ThemeColors, isDark: boolean) => T
) {
  return (colorScheme: ColorScheme = "light") => {
    const colors = getThemeColors(colorScheme);
    const isDark = colorScheme === "dark";
    return styleCreator(colors, isDark);
  };
}

// Utility function to get adaptive color value
export function getAdaptiveColor(
  lightColor: string,
  darkColor: string,
  colorScheme?: ColorScheme
): string {
  const scheme = colorScheme ?? useColorScheme() ?? "light";
  return scheme === "dark" ? darkColor : lightColor;
}

// Export default for backward compatibility
export default Colors;
