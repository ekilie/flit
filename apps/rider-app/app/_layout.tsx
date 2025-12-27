import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Toaster } from "yooo-native";
import { ThemeStatusBar } from "../context/CentralTheme";
import { SessionProvider, useSession } from "../context/ctx";
import { ThemeProvider } from "../context/ThemeProvider";
import { SplashScreenController } from "../components/splash";

export default function Root() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <ThemeStatusBar />
        <SessionProvider>
          <SplashScreenController />
          <RootNavigator />
        </SessionProvider>
      </ThemeProvider>
      <Toaster /> {/* yooo native*/}
    </GestureHandlerRootView>
  );
}

function RootNavigator() {
  const { session, isOnboarded, isOnboardingLoading } = useSession();

  if (isOnboardingLoading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(core)/" />
      </Stack.Protected>

      <Stack.Protected guard={!session}>
        <Stack.Protected guard={!isOnboarded}>
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
