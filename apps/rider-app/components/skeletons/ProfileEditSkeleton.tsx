import FormHeader from "@/components/FormHeader";
import ScreenLayout from "@/components/ScreenLayout";
import { SkeletonItem } from "@/components/SkeletonLoader";
import { useCurrentTheme } from "@/context/CentralTheme";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const ProfileEditSkeleton: React.FC = () => {
  const theme = useCurrentTheme();

  return (
    <ScreenLayout>
      <KeyboardAvoidingView
        style={[styles.container]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <FormHeader
          title="Edit Profile"
          onCancel={() => {}}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Basic Information Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Basic Information
            </Text>

            {/* Full Name Field */}
            <View style={styles.inputContainer}>
              <SkeletonItem
                width={100}
                height={14}
                style={{ marginBottom: 8 }}
              />
              <View
                style={[
                  styles.inputSkeleton,
                  {
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.inputBorder,
                  },
                ]}
              >
                <SkeletonItem width="60%" height={16} />
              </View>
            </View>

            {/* Display Name Field */}
            <View style={styles.inputContainer}>
              <SkeletonItem
                width={120}
                height={14}
                style={{ marginBottom: 8 }}
              />
              <View
                style={[
                  styles.inputSkeleton,
                  {
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.inputBorder,
                  },
                ]}
              >
                <SkeletonItem width="45%" height={16} />
              </View>
            </View>

            {/* Email Field */}
            <View style={styles.inputContainer}>
              <SkeletonItem
                width={140}
                height={14}
                style={{ marginBottom: 8 }}
              />
              <View
                style={[
                  styles.inputSkeleton,
                  {
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.inputBorder,
                  },
                ]}
              >
                <SkeletonItem width="70%" height={16} />
              </View>
            </View>
          </View>

          {/* Profile Details Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Profile Details
            </Text>

            {/* Username Field */}
            <View style={styles.inputContainer}>
              <SkeletonItem
                width={80}
                height={14}
                style={{ marginBottom: 8 }}
              />
              <View
                style={[
                  styles.inputSkeleton,
                  {
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.inputBorder,
                  },
                ]}
              >
                <SkeletonItem width="50%" height={16} />
              </View>
            </View>

            {/* Location Field */}
            <View style={styles.inputContainer}>
              <SkeletonItem
                width={70}
                height={14}
                style={{ marginBottom: 8 }}
              />
              <View
                style={[
                  styles.inputSkeleton,
                  {
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.inputBorder,
                  },
                ]}
              >
                <SkeletonItem width="55%" height={16} />
              </View>
            </View>

            {/* Website Field */}
            <View style={styles.inputContainer}>
              <SkeletonItem
                width={60}
                height={14}
                style={{ marginBottom: 8 }}
              />
              <View
                style={[
                  styles.inputSkeleton,
                  {
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.inputBorder,
                  },
                ]}
              >
                <SkeletonItem width="75%" height={16} />
              </View>
            </View>
          </View>

          {/* Helper Text */}
          <View style={styles.helperContainer}>
            <SkeletonItem width={150} height={12} style={{ marginBottom: 8 }} />
            <SkeletonItem width="90%" height={12} style={{ marginBottom: 4 }} />
            <SkeletonItem width="70%" height={12} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputSkeleton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 50,
    justifyContent: "center",
  },
  helperContainer: {
    marginTop: 16,
    paddingHorizontal: 4,
  },
});

export default ProfileEditSkeleton;
