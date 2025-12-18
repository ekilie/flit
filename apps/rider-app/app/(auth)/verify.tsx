import ScreenLayout from "@/components/ScreenLayout";
import { Entypo } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
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
import { useAuth } from "../../context/ctx";
import { alert } from "yooo-native";
import Colors from "@/constants/Colors";

export default function Verify() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { verifyAccount, sendVerificationEmail, isLoading } = useAuth();

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
                  style={{ position: "absolute", width: 64, height: 64 }}
                  source={require("@/assets/images/icon.png")}
                />
                <Text style={styles.logoText}>flit</Text>
              </View>

              <Text style={styles.title}>Verify Account</Text>
              <Text style={styles.subtitle}>
                Enter the code sent to your email to start booking rides
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email address"
                  placeholderTextColor="#999999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>

              {/* OTP Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Verification Code</Text>
                <TextInput
                  style={[styles.input, styles.otpInput]}
                  placeholder="Enter 6-digit code"
                  placeholderTextColor="#999999"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!isLoading}
                  textAlign="center"
                />
              </View>

              {/* Resend Code */}
              <TouchableOpacity
                style={styles.resendContainer}
                onPress={handleResendCode}
                disabled={isLoading}
              >
                <Text style={styles.resendText}>
                  Didn't receive the code? Resend
                </Text>
              </TouchableOpacity>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              {/* Verify Button */}
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleVerify}
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
                    {isLoading ? "Verifying..." : "Verify Account"}
                  </Text>
                  {!isLoading && (
                    <View style={styles.buttonArrow}>
                      <Entypo name="chevron-right" size={20} color="#000" />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Back to Login */}
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleBackToLogin}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <Text style={styles.secondaryButtonText}>
                  Back to Sign In
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
    top: "40%",
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
    marginBottom: 48,
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
    lineHeight: 22,
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
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
  otpInput: {
    fontSize: 24,
    fontWeight: "600",
    letterSpacing: 8,
  },
  resendContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  resendText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
    textDecorationLine: "underline",
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
    textDecorationLine: "underline",
  },
});
