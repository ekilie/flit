import ScreenLayout from "@/components/ScreenLayout";
import { ThemedText, ThemedView } from "@/components/Themed";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useAdaptiveColors } from "../../constants/Colors";
import { useAuth } from "../../context/ctx";
import { useContextualAdaptiveColors } from "../../context/ThemeProvider";
import { alert } from "yooo-native";

export default function Verify() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { verifyAccount, sendVerificationEmail, isLoading } = useAuth();
  const colors = useAdaptiveColors();
  const contextColors = useContextualAdaptiveColors();

  const [email, setEmail] = useState((params.email as string) || "");
  const [otp, setOtp] = useState("");

  const handleVerify = async () => {
    if (!email.trim() || !otp.trim()) {
      alert.dialog("Error", "Please fill in all fields");
      return;
    }

    try {
      await verifyAccount({ email: email.trim(), otp: otp.trim() });

      alert.dialog("Success!", "Your account has been verified successfully.", [
        {
          text: "Continue",
          onPress: () => router.replace("/(auth)/login"),
        },
      ]);
    } catch (error) {
      console.error("Verification failed:", error);
    }
  };

  const handleResendCode = async () => {
    if (!email.trim()) {
      alert.dialog("Error", "Please enter your email address");
      return;
    }

    try {
      await sendVerificationEmail(email.trim());
    } catch (error) {
      console.error("Failed to resend code:", error);
    }
  };

  const handleBackToLogin = () => {
    router.replace("/(auth)/login");
  };

  return (
    <ScreenLayout>
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
            <ThemedText style={[styles.title, { color: colors.text }]}>
              Verify Your Account
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: colors.subtleText }]}>
              We've sent a verification code to your email address. Please enter
              it below to verify your account.
            </ThemedText>
          </ThemedView>

          {/* Form */}
          <ThemedView style={styles.form}>
            {/* Email Input */}
            <ThemedView style={styles.inputContainer}>
              <ThemedText style={[styles.label, { color: colors.text }]}>
                Email Address
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.inputBorder,
                    color: colors.inputText,
                  },
                ]}
                placeholder="Enter your email address"
                placeholderTextColor={colors.inputPlaceholder}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </ThemedView>

            {/* OTP Input */}
            <ThemedView style={styles.inputContainer}>
              <ThemedText style={[styles.label, { color: colors.text }]}>
                Verification Code
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  styles.otpInput,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.inputBorder,
                    color: colors.inputText,
                  },
                ]}
                placeholder="Enter 6-digit code"
                placeholderTextColor={colors.inputPlaceholder}
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                editable={!isLoading}
                textAlign="center"
              />
            </ThemedView>

            {/* Resend Code */}
            <TouchableOpacity
              style={styles.resendContainer}
              onPress={handleResendCode}
              disabled={isLoading}
            >
              <ThemedText style={[styles.resendText, { color: colors.accent }]}>
                Didn't receive the code? Resend
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>

          {/* Actions */}
          <ThemedView style={styles.actions}>
            {/* Verify Button */}
            <TouchableOpacity
              style={[
                styles.primaryButton,
                {
                  backgroundColor: colors.buttonBackground,
                  shadowColor: contextColors.shadowColor,
                  shadowOpacity: contextColors.shadowOpacity,
                },
                isLoading && styles.disabledButton,
              ]}
              onPress={handleVerify}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <ThemedText
                style={[styles.primaryButtonText, { color: colors.buttonText }]}
              >
                {isLoading ? "Verifying..." : "Verify Account"}
              </ThemedText>
            </TouchableOpacity>

            {/* Back to Login */}
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleBackToLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <ThemedText
                style={[
                  styles.secondaryButtonText,
                  { color: colors.subtleText },
                ]}
              >
                Back to Sign In
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
  title: {
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
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
  otpInput: {
    fontSize: 24,
    fontWeight: "600",
    letterSpacing: 4,
  },
  resendContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  resendText: {
    fontSize: 14,
    fontWeight: "500",
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
    textDecorationLine: "underline",
  },
});
