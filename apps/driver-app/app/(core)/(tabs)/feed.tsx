import FloatingActionButton from "@/components/FloatingActionButton";
import ScreenLayout from "@/components/ScreenLayout";
import { useCurrentTheme } from "@/context/CentralTheme";
import { useHaptics } from "@/hooks/useHaptics";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

interface FeatureCardProps {
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  onPress: () => void;
  index: number;
  size: "small" | "medium" | "large" | "xLarge";
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  subtitle,
  icon,
  color,
  onPress,
  index,
  size,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getCardStyle = () => {
    switch (size) {
      case "small":
        return styles.smallCard;
      case "medium":
        return styles.mediumCard;
      case "large":
        return styles.largeCard;
      case "xLarge":
        return styles.xLargeCard;
      default:
        return styles.mediumCard;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case "small":
        return 20;
      case "medium":
        return 24;
      case "large":
        return 32;
      default:
        return 24;
    }
  };

  const getTitleSize = () => {
    switch (size) {
      case "small":
        return 14;
      case "medium":
        return 16;
      case "large":
        return 20;
      default:
        return 16;
    }
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim,
      }}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.featureCard,
          getCardStyle(),
          {
            backgroundColor: color,
            transform: [{ scale: pressed ? 0.97 : 1 }],
          },
        ]}
      >
        <View
          style={[
            styles.featureIconContainer,
            size === "large" && styles.largeIconContainer,
          ]}
        >
          <Ionicons name={icon as any} size={getIconSize()} color="white" />
        </View>

        <View style={styles.featureTextContainer}>
          <Text style={[styles.featureTitle, { fontSize: getTitleSize() }]}>
            {title}
          </Text>
          <Text
            style={[
              styles.featureSubtitle,
              size === "small" && styles.smallSubtitle,
            ]}
          >
            {subtitle}
          </Text>
        </View>

        <View style={styles.featureArrow}>
          <Ionicons name="chevron-forward" size={16} color="white" />
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default function Feed() {
  const theme = useCurrentTheme();
  const router = useRouter();
  const haptics = useHaptics();

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const flipAnim = React.useRef(new Animated.Value(0)).current;
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const [isFlipped, setIsFlipped] = React.useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Subtle pulse animation to hint at interactivity
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleFlip = () => {
    haptics.medium(); // Provide haptic feedback for the flip
    const toValue = isFlipped ? 0 : 1;
    Animated.timing(flipAnim, {
      toValue,
      duration: 600,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const handleSettingsPress = () => {
    haptics.selection();
    router.push("/(core)/settings" as any);
  };

  const features = [
    {
      title: "Create",
      subtitle: "Share audio",
      icon: "mic",
      color: "#FF6B6B",
      route: "/(core)/posts/create",
      size: "large" as const,
    },
    {
      title: "Feed",
      subtitle: "Discover",
      icon: "infinite",
      color: "#4ECDC4",
      route: "/(core)/scroll/infinite",
      size: "small" as const,
    },
    {
      title: "Podcasts",
      subtitle: "Latest shows",
      icon: "radio",
      color: "#45B7D1",
      route: "/(core)/podcasts",
      size: "medium" as const,
    },
    {
      title: "Music",
      subtitle: "Audio clips",
      icon: "musical-notes",
      color: "#96CEB4",
      route: "/(core)/scroll/infinite",
      size: "small" as const,
    },
    {
      title: "Audiobooks",
      subtitle: "Stories",
      icon: "book",
      color: "#6C5CE7",
      route: "/(core)/audiobooks",
      size: "xLarge" as const,
    },
    {
      title: "Voice Notes",
      subtitle: "Quick thoughts",
      icon: "chatbubble",
      color: "#FFA726",
      route: "/(core)/scroll/infinite",
      size: "large" as const,
    },
  ];

  const organizeColumns = () => {
    const leftColumn: typeof features = [];
    const rightColumn: typeof features = [];

    let leftHeight = 0;
    let rightHeight = 0;

    // Card heights including gap
    const cardHeights = {
      small: 120 + 12, // height + gap
      medium: 160 + 12,
      large: 200 + 12,
      xLarge: 240 + 12,
    };

    features.forEach((feature) => {
      const featureHeight = cardHeights[feature.size];

      // I Assign to column with less total height to balance columns
      if (leftHeight <= rightHeight) {
        leftColumn.push(feature);
        leftHeight += featureHeight;
      } else {
        rightColumn.push(feature);
        rightHeight += featureHeight;
      }
    });

    return { leftColumn, rightColumn };
  };

  const { leftColumn, rightColumn } = organizeColumns();

  return (
    <ScreenLayout>
      <View style={[styles.container]}>
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[styles.headerContainer, { opacity: fadeAnim }]}
          >
            {/* Hero Section */}
            <View style={styles.heroSection}>
              <View style={styles.heroContent}>
                <View style={styles.titleRow}>
                  <Text style={[styles.title, { color: theme.text }]}>
                    Listen
                  </Text>
                  <View
                    style={[
                      styles.statusIndicator,
                      { backgroundColor: theme.primary },
                    ]}
                  />
                </View>
                <Text style={[styles.subtitle, { color: theme.subtleText }]}>
                  Audio Social Network
                </Text>
                <Text style={[styles.description, { color: theme.mutedText }]}>
                  Share and discover voice notes, podcasts, music, and
                  audiobooks
                </Text>
                {!isFlipped && (
                  <Text style={[styles.hint, { color: theme.mutedText }]}>
                    Tap the icon to access settings →
                  </Text>
                )}
              </View>
              <Animated.View
                style={{
                  transform: [{ scale: pulseAnim }],
                }}
              >
                <Pressable
                  style={({ pressed }) => [
                    styles.heroGraphic,
                    {
                      backgroundColor: `${theme.primary}15`,
                      transform: [{ scale: pressed ? 0.95 : 1 }],
                    },
                  ]}
                  onPress={handleFlip}
                >
                  {/* Front Side - App Icon */}
                  <Animated.View
                    style={[
                      styles.flipSide,
                      {
                        opacity: flipAnim.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [1, 0, 0],
                        }),
                        transform: [
                          { perspective: 1000 },
                          {
                            rotateY: flipAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: ["0deg", "180deg"],
                            }),
                          },
                        ],
                      },
                    ]}
                    pointerEvents={isFlipped ? "none" : "auto"}
                  >
                    <Image
                      style={{ width: 64, height: 64, borderRadius: 12 }}
                      source={require("@/assets/images/icon.png")}
                    />
                  </Animated.View>

                  {/* Back Side - Settings Icon */}
                  <Animated.View
                    style={[
                      styles.flipSide,
                      {
                        opacity: flipAnim.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [0, 0, 1],
                        }),
                        transform: [
                          { perspective: 1000 },
                          {
                            rotateY: flipAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: ["-180deg", "0deg"],
                            }),
                          },
                        ],
                      },
                    ]}
                    pointerEvents={isFlipped ? "auto" : "none"}
                  >
                    <Pressable
                      style={styles.settingsButton}
                      onPress={handleSettingsPress}
                    >
                      <Ionicons
                        name="settings-outline"
                        size={64}
                        color={theme.primary}
                      />
                    </Pressable>
                  </Animated.View>
                </Pressable>
              </Animated.View>
            </View>

            <View style={styles.featuresSection}>
              <View style={styles.masonryGrid}>
                {/* Left Column */}
                <View style={styles.masonryColumn}>
                  {leftColumn.map((feature, index) => (
                    <FeatureCard
                      key={feature.title}
                      title={feature.title}
                      subtitle={feature.subtitle}
                      icon={feature.icon}
                      color={feature.color}
                      onPress={() => router.push(feature.route as any)}
                      index={index}
                      size={feature.size}
                    />
                  ))}
                </View>

                {/* Right Column */}
                <View style={styles.masonryColumn}>
                  {rightColumn.map((feature, index) => (
                    <FeatureCard
                      key={feature.title}
                      title={feature.title}
                      subtitle={feature.subtitle}
                      icon={feature.icon}
                      color={feature.color}
                      onPress={() => router.push(feature.route as any)}
                      index={index + leftColumn.length} // Continue animation sequence
                      size={feature.size}
                    />
                  ))}
                </View>
              </View>
            </View>
          </Animated.View>
        </ScrollView>

        <FloatingActionButton
          icon="mic"
          onPress={() => router.push("/(core)/posts/create")}
        />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  headerContainer: {
    paddingTop: 8,
  },
  heroSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  heroContent: {
    flex: 1,
    marginRight: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    marginRight: 12,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  hint: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 8,
    fontStyle: "italic",
    opacity: 0.7,
  },
  heroGraphic: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  featuresSection: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  masonryGrid: {
    flexDirection: "row",
    gap: 12,
  },
  masonryColumn: {
    flex: 1,
    gap: 12,
  },
  featureCard: {
    borderRadius: 20,
    borderWidth: 0.25,
    padding: 16,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  smallCard: {
    height: 120,
  },
  mediumCard: {
    height: 160,
  },
  largeCard: {
    height: 200,
  },
  xLargeCard: {
    height: 240,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  largeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  featureTextContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  featureTitle: {
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  featureSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  smallSubtitle: {
    fontSize: 10,
  },
  featureArrow: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  flipSide: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backfaceVisibility: "hidden",
  },
  settingsButton: {
    width: 64,
    height: 64,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 32,
  },
});
