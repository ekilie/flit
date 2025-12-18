import ScreenLayout from "@/components/ScreenLayout";
import Colors from "@/constants/Colors";
import { useHaptics } from "@/hooks/useHaptics";
import { Entypo } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function Step1() {
  const router = useRouter();
  const { trigger:haptics } = useHaptics();

  return (
    <ScreenLayout>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Background Pattern */}
      <View style={styles.backgroundPattern}>
        <View style={styles.patternCircle1} />
        <View style={styles.patternCircle2} />
        <View style={styles.patternCircle3} />
      </View>

      <View style={styles.content}>
        {/* Header with Logo */}
        <View style={styles.headerSection}>
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
              // source={require("@/assets/images/icon-black-and-white.png")}
            />
            <Text style={styles.logoText}>flit</Text>
          </View>

          <View style={styles.decorativeLines}>
            <View style={styles.line} />
            <View style={[styles.line, styles.lineShort]} />
            <View style={[styles.line, styles.lineLong]} />
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <Text style={styles.title}>
            Your Journey{"\n"}
            <Text style={styles.titleAccent}>Starts Here</Text>{"\n"}
            with flit
          </Text>

          <Text style={styles.subtitle}>
            Book rides seamlessly. Whether you're a guest, visitor, or need special hire vehicles - flit connects you with reliable drivers instantly.
          </Text>
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => {
              haptics("light");
              router.push("./step2");
            }}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.light.primary, Colors.light.buttonBackground]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>Continue</Text>
              <View style={styles.buttonArrow}>
                <Text style={styles.arrowText}>
                  <Entypo name="chevron-right" size={24} />
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
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
    backgroundColor: "#e4e4e4ff",
    top: -100,
    right: -50,
  },
  patternCircle2: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#e4e4e4ff",
    bottom: 100,
    left: -75,
  },
  patternCircle3: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#e8eaed",
    top: "60%",
    right: 30,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: "space-between",
  },
  headerSection: {
    alignItems: "center",
    marginTop: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "200",
    letterSpacing: 6,
    color: "#1a1a1a",
    textTransform: "uppercase",
  },
  decorativeLines: {
    alignItems: "center",
    gap: 8,
  },
  line: {
    height: 1,
    backgroundColor: "#e0e0e0",
    width: 60,
  },
  lineShort: {
    width: 40,
  },
  lineLong: {
    width: 80,
  },
  mainContent: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: "300",
    textAlign: "center",
    lineHeight: 50,
    color: "#1a1a1a",
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  titleAccent: {
    fontWeight: "700",
    color: "#000000",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 26,
    color: "#666666",
    marginBottom: 48,
    fontWeight: "400",
    maxWidth: 320,
  },
  featureHighlights: {
    alignItems: "flex-start",
    gap: 16,
  },
  highlight: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  highlightDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#000000",
    marginRight: 16,
  },
  highlightText: {
    fontSize: 14,
    color: "#333333",
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  bottomSection: {
    alignItems: "center",
    paddingBottom: 50,
  },
  continueButton: {
    width: "85%",
    marginBottom: 32,
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
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    letterSpacing: 1,
    marginRight: 12,
  },
  buttonArrow: {
    backgroundColor: "rgba(255, 255, 255, 0.32)",
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowText: {
    fontSize: 24,
    color: "#000",
    fontWeight: "600",
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e0e0e0",
  },
  paginationActive: {
    width: 32,
    backgroundColor: "#000000",
  },
});
