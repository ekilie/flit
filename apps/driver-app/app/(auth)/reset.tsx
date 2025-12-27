import ScreenLayout from "@/components/ScreenLayout";
import { Feather, Entypo } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StatusBar,
} from "react-native";
import { toast } from "yooo-native";
import { useAuth } from "../../context/ctx";
import { Colors } from "@/constants/Colors";

export default function ResetPassword() {
  const router = useRouter();
  const { isLoading } = useAuth();
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
    <ScreenLayout>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Background Pattern */}
      <View style={styles.backgroundPattern}>
        <View style={styles.patternCircle1} />
        <View style={styles.patternCircle2} />
        <View style={styles.patternCircle3} />
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={["#00000003", "#53535306"]}
                  style={styles.logoCircle}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <Image
                  style={styles.iconImage}
                  source={require("@/assets/images/icon.png")}
                />
                <Text style={styles.logoText}>flit</Text>
              </View>

              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                Enter the code from your email and create a new password
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Code Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Reset Code</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter the 6-digit code"
                  placeholderTextColor="#999999"
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>

              {/* New Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>New Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Enter new password (min. 6 characters)"
                    placeholderTextColor="#999999"
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
                    <Feather 
                      name={showNewPassword ? "eye-off" : "eye"} 
                      size={20} 
                      color="#666666" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm New Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Confirm your new password"
                    placeholderTextColor="#999999"
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
                    <Feather 
                      name={showConfirmPassword ? "eye-off" : "eye"} 
                      size={20} 
                      color="#666666" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Info Text */}
              <View style={styles.infoContainer}>
                <Text style={styles.infoText}>
                  Check your email for the reset code. If you didn't receive it,
                  make sure to check your spam folder.
                </Text>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              {/* Reset Password Button */}
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleResetPassword}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[Colors.light.primary, Colors.light.buttonBackground]}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.primaryButtonText}>
                    {isLoading ? "Resetting..." : "Reset Password"}
                  </Text>
                  {!isLoading && (
                    <View style={styles.buttonArrow}>
                      <Entypo name="chevron-right" size={20} color="#000" />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Back to Forgot Password Link */}
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleBackToForgot}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <Text style={styles.secondaryButtonText}>
                  Back to <Text style={styles.linkText}>Forgot Password</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  backgroundPattern: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  patternCircle1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#f5f5f5",
    top: -100,
    right: -50,
  },
  patternCircle2: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#f5f5f5",
    bottom: 100,
    left: -75,
  },
  patternCircle3: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fafafa",
    top: "35%",
    right: 30,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconImage: {
    position: "absolute",
    width: 64,
    height: 64,
  },
  logoText: {
    fontSize: 24,
    fontWeight: "200",
    letterSpacing: 6,
    color: "#1a1a1a",
    textTransform: "uppercase",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    fontWeight: "400",
  },
  form: {
    marginBottom: 28,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: "#1a1a1a",
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
    top: 16,
    padding: 4,
  },
  infoContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(245, 199, 36, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(245, 199, 36, 0.2)",
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    color: "#666666",
  },
  actions: {
    gap: 20,
  },
  primaryButton: {
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    letterSpacing: 1,
    marginRight: 12,
  },
  buttonArrow: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 14,
    color: "#666666",
  },
  linkText: {
    color: "#1a1a1a",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
