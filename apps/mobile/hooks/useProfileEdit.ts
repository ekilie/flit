import Api from "@/lib/api";
import { UpdateUserDto, User } from "@/lib/api/types";
import { useState } from "react";

export function useProfileEdit() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = async (
    updateData: UpdateUserDto
  ): Promise<User | null> => {
    try {
      setLoading(true);
      setError(null);

      const updatedUser = await Api.updateCurrentUser(updateData);
      return updatedUser;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update profile";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentUser = async (): Promise<User | null> => {
    try {
      setLoading(true);
      setError(null);

      const user = await Api.getCurrentUser();
      return user;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load user data";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateProfile,
    loadCurrentUser,
    loading,
    error,
  };
}
