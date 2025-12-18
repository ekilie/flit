import ScreenLayout from "@/components/ScreenLayout";
import { ThemedText, ThemedView } from "@/components/Themed";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { toast } from "yooo-native";
import { useCurrentTheme } from "../../context/CentralTheme";
import { useAuth } from "../../context/ctx";
import Colors from "@/constants/Colors";

export default function Register() {
  const router = useRouter();
  const { signUp, isLoading } = useAuth();
  const theme = useCurrentTheme();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const validateForm = () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return false;
    }

    if (!email.trim()) {
      toast.error("Please enter your email");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    if (!password) {
      toast.error("Please enter a password");
      return false;
    }

    if (password.length < 6) {
      toast.warning("Password must be at least 6 characters long");
      return false;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    if (!agreeToTerms) {
      toast.warning("Please agree to the Terms of Service and Privacy Policy");
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      await signUp({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      // Show success message and navigate to verification
      toast.success(
        "Registration successful! Please check your email for verification instructions"
      );

      // Navigate to login after a brief delay
      setTimeout(() => {
        router.replace("/(auth)/login");
      }, 1500);
    } catch (error) {
      // Error alert handled in API class, but we can add custom handling
      toast.error("Registration failed. Please try again or contact support");
      console.error("Registration failed:", error);
    }
  };

  const handleSignIn = () => {
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
          showsVerticalScrollIndicator={false}
        >
          <ThemedView style={styles.content}>
            {/* Header */}
            <ThemedView style={styles.header}>
              <Image
                style={[styles.logoCircle]}
                source={require("@/assets/images/icon-black-and-white.png")}
              />
              <ThemedText style={[styles.title, { color: theme.text }]}>
                Create Account
              </ThemedText>
              <ThemedText
                style={[styles.subtitle, { color: theme.subtleText }]}
              >
                Join the audio sharing community
              </ThemedText>
            </ThemedView>

            {/* Form */}
            <ThemedView style={styles.form}>
              {/* Name Input */}
              <ThemedView style={styles.inputContainer}>
                <ThemedText style={[styles.label, { color: theme.text }]}>
                  Full Name
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
                  placeholder="Enter your full name"
                  placeholderTextColor={theme.inputPlaceholder}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  editable={!isLoading}
                />
              </ThemedView>

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

              {/* Password Input */}
              <ThemedView style={styles.inputContainer}>
                <ThemedText style={[styles.label, { color: theme.text }]}>
                  Password
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
                    placeholder="Create a password (min. 6 characters)"
                    placeholderTextColor={theme.inputPlaceholder}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    <ThemedText
                      style={[
                        styles.eyeButtonText,
                        { color: theme.subtleText },
                      ]}
                    >
                      {showPassword ? (
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
                  Confirm Password
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
                    placeholder="Confirm your password"
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

              {/* Terms and Conditions Checkbox */}
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setAgreeToTerms(!agreeToTerms)}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <ThemedView
                  style={[
                    styles.checkbox,
                    {
                      borderColor: theme.inputBorder,
                      backgroundColor: agreeToTerms
                        ? theme.primary
                        : "transparent",
                    },
                  ]}
                >
                  {agreeToTerms && (
                    <ThemedText
                      style={[styles.checkmark, { color: theme.background }]}
                    >
                      ✓
                    </ThemedText>
                  )}
                </ThemedView>
                <ThemedView style={styles.checkboxTextContainer}>
                  <ThemedText
                    style={[styles.checkboxText, { color: theme.text }]}
                  >
                    I agree to the{" "}
                  </ThemedText>
                  <Pressable
                    onPress={() => router.push("/(auth)/terms")}
                    style={styles.linkPressable}
                  >
                    <ThemedText style={[styles.linkText]}>
                      Terms of Service
                    </ThemedText>
                  </Pressable>
                  <ThemedText
                    style={[styles.checkboxText, { color: theme.text }]}
                  >
                    {" "}
                    and{" "}
                  </ThemedText>
                  <Pressable
                    onPress={() => router.push("/(auth)/terms")}
                    style={styles.linkPressable}
                  >
                    <ThemedText style={[styles.linkText]}>
                      Privacy Policy
                    </ThemedText>
                  </Pressable>
                </ThemedView>
              </TouchableOpacity>
            </ThemedView>

            {/* Actions */}
            <ThemedView style={styles.actions}>
              {/* Register Button */}
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
                onPress={handleRegister}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <ThemedText
                  style={[
                    styles.primaryButtonText,
                    { color: theme.buttonText },
                  ]}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </ThemedText>
              </TouchableOpacity>

              {/* Divider */}
              <ThemedView style={styles.dividerContainer}>
                <ThemedView
                  style={[styles.divider, { backgroundColor: theme.divider }]}
                />
                <ThemedText
                  style={[styles.dividerText, { color: theme.subtleText }]}
                >
                  or
                </ThemedText>
                <ThemedView
                  style={[styles.divider, { backgroundColor: theme.divider }]}
                />
              </ThemedView>

              {/* Sign In Link */}
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleSignIn}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <ThemedText
                  style={[styles.secondaryButtonText, { color: theme.text }]}
                >
                  Already have an account?{" "}
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
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
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
    marginBottom: 24,
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
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 12,
    marginTop: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    fontSize: 12,
    fontWeight: "bold",
  },
  checkboxTextContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  checkboxText: {
    fontSize: 14,
    lineHeight: 20,
  },
  linkPressable: {
    marginHorizontal: 2,
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
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
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
