"use client"

import { useState, useEffect } from 'react'
import { AuthProvider } from '@/lib/auth/auth-context'

export function ClientWrapper({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false)
    
    useEffect(() => {
        setMounted(true)
    }, [])
    
    // During SSR or initial render, just render children without AuthProvider
    if (!mounted) {
        return <>{children}</>
    }
    
    // Once mounted on client, wrap with AuthProvider
    return <AuthProvider>{children}</AuthProvider>
}