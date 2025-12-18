import { useCurrentTheme } from "@/context/CentralTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  Animated,
  Easing,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

interface LoadingStateProps {
  message?: string;
  size?: "small" | "large";
  showIcon?: boolean;
  iconName?: keyof typeof Ionicons.glyphMap;
  type?: "default" | "pulse" | "wave" | "orbital" | "modern";
}

export default function LoadingState({
  message = "Loading...",
  size = "large",
  showIcon = false,
  iconName = "hourglass-outline",
  type = "modern",
}: LoadingStateProps) {
  const theme = useCurrentTheme();

  // Animation values
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Wave animation
    Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    ).start();

    // Scale animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const waveTranslate = waveAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -15, 0],
  });

  // Modern Orbital Loader
  const ModernOrbitalLoader = () => {
    const orbits = [0, 1, 2];

    return (
      <View style={styles.orbitalContainer}>
        {orbits.map((orbit) => {
          const orbitRotate = rotateAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [`${orbit * 120}deg`, `${orbit * 120 + 360}deg`],
          });

          return (
            <Animated.View
              key={orbit}
              style={[
                styles.orbit,
                {
                  transform: [{ rotate: orbitRotate }],
                  borderColor: theme.primary,
                },
              ]}
            >
              <View
                style={[
                  styles.orbitalDot,
                  {
                    backgroundColor: theme.primary,
                    transform: [{ scale: 1 - orbit * 0.2 }],
                  },
                ]}
              />
            </Animated.View>
          );
        })}
        <View style={[styles.centerDot, { backgroundColor: theme.primary }]} />
      </View>
    );
  };

  // Pulse Wave Loader
  const PulseWaveLoader = () => {
    const dots = [0, 1, 2, 3, 4];

    return (
      <View style={styles.waveContainer}>
        {dots.map((dot) => {
          const dotScale = waveAnim.interpolate({
            inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
            outputRange: [1, 1.5, 1, 0.8, 1, 1].map((val, index) =>
              index === dot ? 1.5 : val
            ),
          });

          const dotOpacity = waveAnim.interpolate({
            inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
            outputRange: [0.3, 1, 0.8, 0.6, 0.4, 0.3].map((val, index) =>
              index === dot ? 1 : val
            ),
          });

          return (
            <Animated.View
              key={dot}
              style={[
                styles.waveDot,
                {
                  backgroundColor: theme.primary,
                  transform: [{ scale: dotScale }],
                  opacity: dotOpacity,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  // Floating Particles Loader
  const FloatingParticlesLoader = () => {
    const particles = [0, 1, 2, 3, 4, 5];

    return (
      <View style={styles.particlesContainer}>
        {particles.map((particle) => {
          const particleAnim = new Animated.Value(0);

          useEffect(() => {
            Animated.loop(
              Animated.sequence([
                Animated.timing(particleAnim, {
                  toValue: 1,
                  duration: 1200 + particle * 200,
                  easing: Easing.inOut(Easing.ease),
                  useNativeDriver: true,
                }),
                Animated.timing(particleAnim, {
                  toValue: 0,
                  duration: 1200 + particle * 200,
                  easing: Easing.inOut(Easing.ease),
                  useNativeDriver: true,
                }),
              ])
            ).start();
          }, []);

          const translateY = particleAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -30],
          });

          const opacity = particleAnim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0.3, 1, 0.3],
          });

          const scale = particleAnim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0.8, 1.2, 0.8],
          });

          return (
            <Animated.View
              key={particle}
              style={[
                styles.particle,
                {
                  backgroundColor: theme.primary,
                  transform: [{ translateY }, { scale }, { rotate: rotate }],
                  opacity,
                  left: 20 + particle * 15,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  const renderLoader = () => {
    switch (type) {
      case "pulse":
        return (
          <Animated.View
            style={[
              styles.pulseContainer,
              {
                opacity: pulseOpacity,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {showIcon && (
              <Ionicons
                name={iconName}
                size={48}
                color={theme.primary}
                style={styles.icon}
              />
            )}
            <ActivityIndicator size={size} color={theme.primary} />
          </Animated.View>
        );

      case "wave":
        return (
          <Animated.View
            style={[
              styles.waveLoaderContainer,
              {
                transform: [{ translateY: waveTranslate }],
              },
            ]}
          >
            <PulseWaveLoader />
            {showIcon && (
              <Ionicons
                name={iconName}
                size={32}
                color={theme.primary}
                style={styles.waveIcon}
              />
            )}
          </Animated.View>
        );

      case "orbital":
        return (
          <View style={styles.orbitalWrapper}>
            <ModernOrbitalLoader />
            {showIcon && (
              <Ionicons
                name={iconName}
                size={24}
                color={theme.primary}
                style={styles.orbitalIcon}
              />
            )}
          </View>
        );

      case "modern":
        return (
          <View style={styles.modernContainer}>
            <FloatingParticlesLoader />
            <Animated.View
              style={[
                styles.modernContent,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              {showIcon && (
                <Ionicons
                  name={iconName}
                  size={36}
                  color={theme.primary}
                  style={styles.modernIcon}
                />
              )}
              <ActivityIndicator size={size} color={theme.primary} />
            </Animated.View>
          </View>
        );

      default:
        return (
          <Animated.View
            style={[
              styles.defaultContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {showIcon && (
              <Animated.View style={{ opacity: pulseOpacity }}>
                <Ionicons
                  name={iconName}
                  size={48}
                  color={theme.primary}
                  style={styles.icon}
                />
              </Animated.View>
            )}
            <ActivityIndicator size={size} color={theme.primary} />
          </Animated.View>
        );
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      {renderLoader()}

      <Animated.Text
        style={[
          styles.message,
          {
            color: theme.text,
            opacity: pulseOpacity,
            transform: [{ translateY: waveTranslate }],
          },
        ]}
      >
        {message}
      </Animated.Text>

      {/* Subtle background pattern for modern type */}
      {type === "modern" && (
        <View style={styles.backgroundPattern}>
          {[...Array(20)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.patternDot,
                {
                  backgroundColor: `${theme.primary}15`,
                  left: Math.random() * width,
                  top: Math.random() * 200,
                },
              ]}
            />
          ))}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  icon: {
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    marginTop: 24,
    fontWeight: "500",
    textAlign: "center",
  },
  // Pulse styles
  pulseContainer: {
    alignItems: "center",
  },
  // Wave styles
  waveLoaderContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  waveContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  waveDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  waveIcon: {
    marginTop: 12,
  },
  // Orbital styles
  orbitalWrapper: {
    alignItems: "center",
    marginBottom: 20,
  },
  orbitalContainer: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  orbit: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  orbitalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: "absolute",
    top: -4,
  },
  centerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  orbitalIcon: {
    position: "absolute",
  },
  // Modern styles
  modernContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  modernContent: {
    alignItems: "center",
  },
  modernIcon: {
    marginBottom: 12,
  },
  particlesContainer: {
    position: "absolute",
    width: 120,
    height: 60,
    marginBottom: 40,
  },
  particle: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    bottom: 0,
  },
  // Default styles
  defaultContainer: {
    alignItems: "center",
  },
  // Background pattern
  backgroundPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  patternDot: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
