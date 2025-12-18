import FormHeader from "@/components/FormHeader";
import ScreenLayout from "@/components/ScreenLayout";
import ProfileEditSkeleton from "@/components/skeletons/ProfileEditSkeleton";
import { useCurrentTheme } from "@/context/CentralTheme";
import Api from "@/lib/api";
import { UpdateUserDto, User } from "@/lib/api/types";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { toast } from "yooo-native";

interface FormData {
  name: string;
  display_name: string;
  email: string;
  username: string;
  location: string;
  website: string;
  instagram: string;
  twitter: string;
  linkedin: string;
}

const ProfileEdit: React.FC = () => {
  const theme = useCurrentTheme();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    display_name: "",
    email: "",
    username: "",
    location: "",
    website: "",
    instagram: "",
    twitter: "",
    linkedin: "",
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const userData = await Api.getCurrentUser();
      setUser(userData);

      // Populate form with existing data
      setFormData({
        name: userData.name || "",
        display_name: userData.display_name || "",
        email: userData.email || "",
        username: userData.metadata?.username || "",
        location: userData.metadata?.location || "",
        website: userData.metadata?.website || "",
        instagram: userData.metadata?.instagram || "",
        twitter: userData.metadata?.twitter || "",
        linkedin: userData.metadata?.linkedin || "",
      });
    } catch (error) {
      console.error("Failed to load user data:", error);
      toast.error("Failed to load profile data");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      Keyboard.dismiss();

      // Validate required fields
      if (!formData.name.trim()) {
        toast.error("Name is required");
        return;
      }

      if (!formData.email.trim()) {
        toast.error("Email is required");
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error("Please enter a valid email address");
        return;
      }

      // Validate website URL if provided
      if (formData.website && !isValidUrl(formData.website)) {
        toast.error("Please enter a valid website URL");
        return;
      }

      // Prepare update payload
      const updatePayload: UpdateUserDto = {
        name: formData.name.trim(),
        display_name: formData.display_name.trim() || undefined,
        email: formData.email.trim(),
        metadata: {
          username: formData.username.trim() || undefined,
          location: formData.location.trim() || undefined,
          website: formData.website.trim() || undefined,
          instagram: formData.instagram.trim() || undefined,
          twitter: formData.twitter.trim() || undefined,
          linkedin: formData.linkedin.trim() || undefined,
        },
      };

      // Remove empty metadata fields
      Object.keys(updatePayload.metadata!).forEach((key) => {
        if (
          !updatePayload.metadata![key as keyof typeof updatePayload.metadata]
        ) {
          delete updatePayload.metadata![
            key as keyof typeof updatePayload.metadata
          ];
        }
      });

      const updatedUser = await Api.updateCurrentUser(updatePayload);
      setUser(updatedUser);

      toast.success("Profile updated successfully");
      router.back();
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleCancel = () => {
    Alert.alert(
      "Discard Changes",
      "Are you sure you want to discard your changes?",
      [
        { text: "Keep Editing", style: "cancel" },
        { text: "Discard", style: "destructive", onPress: () => router.back() },
      ]
    );
  };

  if (loading) {
    return <ProfileEditSkeleton />;
  }

  return (
    <ScreenLayout>
      <KeyboardAvoidingView
        style={[styles.container]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <FormHeader
          title="Edit Profile"
          onCancel={handleCancel}
          onSubmit={handleSave}
          isSubmitting={saving}
          submitText="Save"
          showSubmitButton={true}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Basic Information
            </Text>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.subtleText }]}>
                Full Name *
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
                placeholder="Enter your full name"
                placeholderTextColor={theme.mutedText}
                autoCapitalize="words"
                editable={!saving}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.subtleText }]}>
                Display Name
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                value={formData.display_name}
                onChangeText={(text) =>
                  setFormData({ ...formData, display_name: text })
                }
                placeholder="How others see your name"
                placeholderTextColor={theme.mutedText}
                autoCapitalize="words"
                editable={!saving}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.subtleText }]}>
                Email Address *
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                value={formData.email}
                onChangeText={(text) =>
                  setFormData({ ...formData, email: text })
                }
                placeholder="Enter your email address"
                placeholderTextColor={theme.mutedText}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!saving}
              />
            </View>
          </View>

          {/* Profile Details */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Profile Details
            </Text>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.subtleText }]}>
                Username
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                value={formData.username}
                onChangeText={(text) =>
                  setFormData({ ...formData, username: text })
                }
                placeholder="@username"
                placeholderTextColor={theme.mutedText}
                autoCapitalize="none"
                editable={!saving}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.subtleText }]}>
                Location
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                value={formData.location}
                onChangeText={(text) =>
                  setFormData({ ...formData, location: text })
                }
                placeholder="City, Country"
                placeholderTextColor={theme.mutedText}
                autoCapitalize="words"
                editable={!saving}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.subtleText }]}>
                Website
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                value={formData.website}
                onChangeText={(text) =>
                  setFormData({ ...formData, website: text })
                }
                placeholder="https://your-website.com"
                placeholderTextColor={theme.mutedText}
                keyboardType="url"
                autoCapitalize="none"
                autoComplete="url"
                editable={!saving}
              />
            </View>
          </View>

          {/* Helper Text */}
          <View style={styles.helperContainer}>
            <Text style={[styles.helperText, { color: theme.mutedText }]}>
              * Required fields
            </Text>
            <Text style={[styles.helperText, { color: theme.mutedText }]}>
              Your profile information helps others discover and connect with
              you.
            </Text>
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

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 8,
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600",
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
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    minHeight: 50,
  },
  socialInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 50,
  },
  socialInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    borderWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  helperContainer: {
    marginTop: 16,
    paddingHorizontal: 4,
  },
  helperText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
});

export default ProfileEdit;
