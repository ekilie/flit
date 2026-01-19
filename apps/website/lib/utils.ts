import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'


import * as Haptics from "expo-haptics";
import { Platform, Vibration } from "react-native";
import { jwtDecode } from "jwt-decode";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
type JwtPayload = {
  exp: number; // expiration time in seconds
  [key: string]: any;
};

/**
 * Check if the jwt token is expired
 * @param token string
 * @returns True if the token has expired
 */
export function isJwtExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<JwtPayload>(token);

    if (!decoded.exp) return true; // if no exp, i assume expired

    const now = Math.floor(Date.now() / 1000); // current time in seconds
    return decoded.exp < now;
  } catch (_e) {
    return true; // if decoding fails, i treat it as expired
  }
}

/**
 * Format duration in seconds to human readable format
 * @param seconds number
 * @returns Formatted duration string (e.g., "2:30", "1:23:45")
 */
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }
}