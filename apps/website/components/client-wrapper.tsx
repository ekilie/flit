"use client"

import { useState, useEffect } from 'react'
import { AuthProvider } from '@/lib/auth/auth-context'

export function ClientWrapper({ children }: { children: React.ReactNode }) {
    const [isClientMounted, setIsClientMounted] = useState(false)
    
    useEffect(() => {
        setIsClientMounted(true)
    }, [])
    
    // During SSR, render children without AuthProvider to prevent hydration issues
    // This ensures error pages and other routes can be properly pre-rendered
    if (!isClientMounted) {
        return <>{children}</>
    }
    
    // Once mounted on client, wrap with AuthProvider
    return <AuthProvider>{children}</AuthProvider>
}