"use client"

import dynamic from 'next/dynamic'

const AuthProvider = dynamic(
  () => import('@/lib/auth/auth-context').then(mod => ({ default: mod.AuthProvider })),
  { ssr: false }
)

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}