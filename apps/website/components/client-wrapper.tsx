"use client"

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import AuthProvider with no SSR to prevent prerendering issues
const AuthProvider = dynamic(
    () => import('@/lib/auth/auth-context').then((mod) => ({ default: mod.AuthProvider })),
    { ssr: false }
)

export function ClientWrapper({ children }: { children: React.ReactNode }) {
    const [isClientMounted, setIsClientMounted] = useState(false)
    
    useEffect(() => {
        setIsClientMounted(true)
    }, [])
    
    // During SSR/prerendering, render children without AuthProvider to prevent hydration issues
    // This ensures error pages and other routes can be properly pre-rendered.
    // Note: AuthProvider is only used in /console routes, which are client-rendered,
    // so there's minimal hydration mismatch in practice.
    if (!isClientMounted) {
        return <>{children}</>
    }
    
    // Once mounted on client, wrap with AuthProvider
    return <AuthProvider>{children}</AuthProvider>
}