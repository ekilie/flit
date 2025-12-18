import Api from "@/lib/api";
import { CreatePostDto, Post } from "@/lib/api/types";
import { useState } from "react";

export function useCreatePost() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPost = async (postData: CreatePostDto): Promise<Post | null> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const newPost = await Api.createPost(postData);
      return newPost;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create post";
      setError(errorMessage);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setError(null);
    setIsSubmitting(false);
  };

  return {
    createPost,
    isSubmitting,
    error,
    reset,
  };
}
