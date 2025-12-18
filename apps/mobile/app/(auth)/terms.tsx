import ScreenLayout from "@/components/ScreenLayout";
import { ThemedText } from "@/components/Themed";
import { useCurrentTheme } from "@/context/CentralTheme";
import { useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

export default function Terms() {
  const theme = useCurrentTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  return (
    <ScreenLayout>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={[styles.title, { color: theme.text }]}>
            Terms of Service
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.subtleText }]}>
            Please read our terms and conditions
          </ThemedText>
        </View>

        {/* WebView Container */}
        <View style={styles.webviewContainer}>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
              <ThemedText
                style={[styles.loadingText, { color: theme.subtleText }]}
              >
                Loading terms and conditions...
              </ThemedText>
            </View>
          )}

          {error ? (
            <View style={styles.errorContainer}>
              <ThemedText style={[styles.errorText, { color: theme.text }]}>
                Failed to load terms and conditions.
              </ThemedText>
              <ThemedText
                style={[styles.errorSubtext, { color: theme.subtleText }]}
              >
                Please check your internet connection and try again.
              </ThemedText>
            </View>
          ) : (
            <WebView
              source={{ uri: "https://ekilie.com" }}
              style={styles.webview}
              onLoadEnd={handleLoadEnd}
              onError={handleError}
              startInLoadingState={true}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              allowsFullscreenVideo={false}
              scalesPageToFit={true}
            />
          )}
        </View>
      </SafeAreaView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
  },
  webviewContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    textAlign: "center",
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: "center",
  },
});
