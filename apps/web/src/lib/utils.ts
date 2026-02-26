import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { jwtDecode } from "jwt-decode"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isJwtExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<{ exp: number }>(token)
    if (!decoded.exp) return true
    return Date.now() >= decoded.exp * 1000
  } catch {
    return true
  }
}
