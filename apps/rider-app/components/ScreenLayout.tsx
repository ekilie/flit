import Colors from "@/constants/Colors";
import { ThemeStatusBar } from "@/context/CentralTheme";
import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MiniPlayer from "./player/MiniPlayer";

interface ScreenLayoutProps {
  children: React.ReactNode;
  styles?: object;
  fullScreen?: boolean;
}

export default function ScreenLayout({ children, styles, fullScreen = false }: ScreenLayoutProps) {
  if (fullScreen) {
    return (
      <View
        style={[
          screenLayoutStyles.container,
          screenLayoutStyles.fullScreen,
          ...(styles ? [styles] : []),
        ]}
      >
        <ThemeStatusBar />
        {children}
        <MiniPlayer />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[
        screenLayoutStyles.container,
        { backgroundColor: Colors.light.background },
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
  fullScreen: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
  },
});
