import ScreenLayout from "@/components/ScreenLayout";
import { ThemedText, ThemedView } from "@/components/Themed";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
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

export default function ResetPassword() {
  const router = useRouter();
  const { isLoading } = useAuth();
  const theme = useCurrentTheme();
  const { email } = useLocalSearchParams<{ email: string }>();

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    if (!code.trim()) {
      toast.error("Please enter the reset code");
      return false;
    }

    if (!newPassword) {
      toast.error("Please enter a new password");
      return false;
    }

    if (newPassword.length < 6) {
      toast.warning("Password must be at least 6 characters long");
      return false;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    try {
      //   await confirmResetPassword(email || "", code, newPassword);
      toast.success("Password reset successfully!");

      // Navigate to login after success
      setTimeout(() => {
        router.replace("/(auth)/login");
      }, 1500);
    } catch (error) {
      toast.error(
        "Failed to reset password. Please check your code and try again."
      );
      console.error("Reset password failed:", error);
    }
  };

  const handleBackToForgot = () => {
    router.push("/(auth)/forgot");
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
                Reset Password
              </ThemedText>
              <ThemedText
                style={[styles.subtitle, { color: theme.subtleText }]}
              >
                Enter the code from your email and new password
              </ThemedText>
            </ThemedView>

            {/* Form */}
            <ThemedView style={styles.form}>
              {/* Code Input */}
              <ThemedView style={styles.inputContainer}>
                <ThemedText style={[styles.label, { color: theme.text }]}>
                  Reset Code
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
                  placeholder="Enter the 6-digit code"
                  placeholderTextColor={theme.inputPlaceholder}
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </ThemedView>

              {/* New Password Input */}
              <ThemedView style={styles.inputContainer}>
                <ThemedText style={[styles.label, { color: theme.text }]}>
                  New Password
                </ThemedText>
                <ThemedView style={styles.passwordContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.passwordInput,
                      {
                        backgroundColor: theme.inputBackground,
                        borderColor: theme.inputBorder,
                        color: theme.inputText,
                      },
                    ]}
                    placeholder="Enter new password (min. 6 characters)"
                    placeholderTextColor={theme.inputPlaceholder}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showNewPassword}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    disabled={isLoading}
                  >
                    <ThemedText
                      style={[
                        styles.eyeButtonText,
                        { color: theme.subtleText },
                      ]}
                    >
                      {showNewPassword ? (
                        <Feather name="eye-off" size={24} color="black" />
                      ) : (
                        <Feather name="eye" size={24} color="black" />
                      )}
                    </ThemedText>
                  </TouchableOpacity>
                </ThemedView>
              </ThemedView>

              {/* Confirm Password Input */}
              <ThemedView style={styles.inputContainer}>
                <ThemedText style={[styles.label, { color: theme.text }]}>
                  Confirm New Password
                </ThemedText>
                <ThemedView style={styles.passwordContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.passwordInput,
                      {
                        backgroundColor: theme.inputBackground,
                        borderColor: theme.inputBorder,
                        color: theme.inputText,
                      },
                    ]}
                    placeholder="Confirm your new password"
                    placeholderTextColor={theme.inputPlaceholder}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    <ThemedText
                      style={[
                        styles.eyeButtonText,
                        { color: theme.subtleText },
                      ]}
                    >
                      {showConfirmPassword ? (
                        <Feather name="eye-off" size={24} color="black" />
                      ) : (
                        <Feather name="eye" size={24} color="black" />
                      )}
                    </ThemedText>
                  </TouchableOpacity>
                </ThemedView>
              </ThemedView>

              {/* Info Text */}
              <ThemedView style={styles.infoContainer}>
                <ThemedText
                  style={[styles.infoText, { color: theme.subtleText }]}
                >
                  Check your email for the reset code. If you didn't receive it,
                  make sure to check your spam folder.
                </ThemedText>
              </ThemedView>
            </ThemedView>

            {/* Actions */}
            <ThemedView style={styles.actions}>
              {/* Reset Password Button */}
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
                  {isLoading ? "Resetting..." : "Reset Password"}
                </ThemedText>
              </TouchableOpacity>

              {/* Back to Forgot Password Link */}
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleBackToForgot}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <ThemedText
                  style={[styles.secondaryButtonText, { color: theme.text }]}
                >
                  Back to{" "}
                  <ThemedText style={[styles.linkText]}>
                    Forgot Password
                  </ThemedText>
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
    marginBottom: 16,
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
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: "absolute",
    right: 16,
    top: 14,
    padding: 4,
  },
  eyeButtonText: {
    fontSize: 18,
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
