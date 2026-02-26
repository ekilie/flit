import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { jwtDecode } from "jwt-decode"
import { User } from "@/lib/api/types"

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

export function filterUsersByRole(users: User[], roleName: string): User[] {
  return users.filter(
    (u) => u.role === roleName || u.roles?.some((r) => r.name === roleName)
  )
}
