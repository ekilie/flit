import ScreenLayout from "@/components/ScreenLayout";
import { Feather, Entypo } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
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
import { toast } from "yooo-native";
import { useAuth } from "../../context/ctx";
import Colors from "@/constants/Colors";

export default function Login() {
  const router = useRouter();
  const { signIn, isLoading, signInWithDummyUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await signIn({ email: email.trim(), password });
      toast.success("Welcome back! Login successful");
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.error("Please check your credentials and try again");
      console.error("Login failed:", error);
    }
  };

  const handleForgotPassword = () => {
    router.push("/(auth)/forgot");
  };

  const handleSignUp = () => {
    router.push("/(auth)/register");
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
                  source={require("@/assets/images/android/play_store_512.png")}
                />
                <Text style={styles.logoText}>flit</Text>
              </View>

              <Text style={styles.title}>
                Driver Login
              </Text>
              <Text style={styles.subtitle}>
                Sign in to start earning
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#999999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Enter your password"
                    placeholderTextColor="#999999"
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
                    <Feather
                      name={showPassword ? "eye-off" : "eye"}
                      size={20}
                      color="#666666"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Forgot Password Link */}
              <TouchableOpacity
                style={styles.forgotPasswordContainer}
                onPress={handleForgotPassword}
                disabled={isLoading}
              >
                <Text style={styles.forgotPasswordText}>
                  Forgot your password?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              {/* Login Button */}
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleLogin}
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
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Text>
                  {!isLoading && (
                    <View style={styles.buttonArrow}>
                      <Entypo name="chevron-right" size={20} color="#000" />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.divider} />
              </View>

              {/* Sign Up Link */}
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleSignUp}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <Text style={styles.secondaryButtonText}>
                  Don't have an account?{" "}
                  <Text style={styles.linkText}>Sign Up</Text>
                </Text>
              </TouchableOpacity>

              {/* Development: Dummy User Link */}
              <TouchableOpacity
                style={styles.dummyUserButton}
                onPress={() => {
                  signInWithDummyUser();
                  toast.success("Signed in as demo user");
                }}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <Text style={styles.dummyUserText}>
                  Continue as Demo User (Development)
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
  iconImage: {
    position: "absolute",
    width: 64,
    borderRadius: 32,
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
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginTop: 12,
  },
  forgotPasswordText: {
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
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: "#666666",
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
  dummyUserButton: {
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  dummyUserText: {
    fontSize: 13,
    color: "#999999",
    fontStyle: "italic",
    textDecorationLine: "underline",
  },
});
