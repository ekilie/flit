import { Stack } from "expo-router";
import MiniPlayer from "@/components/player/MiniPlayer";
import { View, StyleSheet } from "react-native";

export default function AppLayout() {
  const screenOptions = { headerShown: false };

  return (
    <View style={styles.container}>
      <Stack screenOptions={screenOptions} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
