import * as React from 'react'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { AuthProvider } from '@/lib/auth/auth-context'

export const Route = createRootRoute({
  component: () => (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  ),
})
