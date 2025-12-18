import Colors from "@/constants/Colors";
import { ThemeStatusBar } from "@/context/CentralTheme";
import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MiniPlayer from "./player/MiniPlayer";

interface ScreenLayoutProps {
  children: React.ReactNode;
  styles?: object;
}

export default function ScreenLayout({ children, styles }: ScreenLayoutProps) {
  return (
    <SafeAreaView
      style={[
        screenLayoutStyles.container,
        ...(styles ? [styles] : []),
      ]}
    >
      <ThemeStatusBar />
      {children}
      <MiniPlayer />
    </SafeAreaView>
  );
}

const screenLayoutStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
