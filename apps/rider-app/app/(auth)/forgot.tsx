import ScreenLayout from "@/components/ScreenLayout";
import { ThemedText, ThemedView } from "@/components/Themed";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { toast } from "yooo-native";
import { useCurrentTheme } from "../../context/CentralTheme";
import { useAuth } from "../../context/ctx";
import { Colors } from "@/constants/Colors";

export default function ForgotPassword() {
  const router = useRouter();
  const { resetPassword, isLoading } = useAuth();
  const theme = useCurrentTheme();

  const [email, setEmail] = useState("");

  const handleResetPassword = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
    //   await resetPassword(email.trim());
      toast.success("Reset instructions sent to your email!");

      setTimeout(() => {
        router.push({
          pathname: "/(auth)/reset",
          params: { email: email.trim() },
        });
      }, 1000);
    } catch (error) {
      toast.error("Failed to send reset instructions. Please try again.");
      console.error("Reset password failed:", error);
    }
  };

  const handleBackToLogin = () => {
    router.push("/(auth)/login");
  };

  return (
    <ScreenLayout styles={{ backgroundColor: Colors.light.background }}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <ThemedView style={styles.content}>
            {/* Header */}
            <ThemedView style={styles.header}>
              <Image
                style={styles.logoCircle}
                source={require("@/assets/images/icon-black-and-white.png")}
              />
              <ThemedText style={[styles.title, { color: theme.text }]}>
                Reset Your Password
              </ThemedText>
              <ThemedText
                style={[styles.subtitle, { color: theme.subtleText }]}
              >
                We'll help you get back on the road. Enter your email to receive reset instructions
              </ThemedText>
            </ThemedView>

            {/* Form */}
            <ThemedView style={styles.form}>
              {/* Email Input */}
              <ThemedView style={styles.inputContainer}>
                <ThemedText style={[styles.label, { color: theme.text }]}>
                  Email Address
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.inputBackground,
                      borderColor: theme.inputBorder,
                      color: theme.inputText,
                    },
                  ]}
                  placeholder="Enter your email address"
                  placeholderTextColor={theme.inputPlaceholder}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </ThemedView>

              {/* Info Text */}
              <ThemedView style={styles.infoContainer}>
                <ThemedText
                  style={[styles.infoText, { color: theme.subtleText }]}
                >
                  We'll send you a link to reset your password. Make sure to
                  check your spam folder if you don't see it in your inbox.
                </ThemedText>
              </ThemedView>
            </ThemedView>

            {/* Actions */}
            <ThemedView style={styles.actions}>
              {/* Send Instructions Button */}
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  {
                    backgroundColor: theme.buttonBackground,
                    shadowColor: theme.shadowColor,
                    shadowOpacity: theme.shadowOpacity,
                  },
                  isLoading && styles.disabledButton,
                ]}
                onPress={handleResetPassword}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <ThemedText
                  style={[
                    styles.primaryButtonText,
                    { color: theme.buttonText },
                  ]}
                >
                  {isLoading ? "Sending..." : "Send Reset Instructions"}
                </ThemedText>
              </TouchableOpacity>

              {/* Back to Login Link */}
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleBackToLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <ThemedText
                  style={[styles.secondaryButtonText, { color: theme.text }]}
                >
                  Back to{" "}
                  <ThemedText style={[styles.linkText]}>Sign In</ThemedText>
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  infoContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.03)",
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  actions: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: "#000",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 14,
  },
  linkText: {
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
