'use client'

import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <h1 className="text-6xl font-bold">404</h1>
            <p className="mt-4 text-xl">Page not found</p>
            <Link href="/" className="mt-8 text-primary hover:underline">
                Go home
            </Link>
        </div>
    )
}