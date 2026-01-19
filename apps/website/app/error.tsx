'use client'

import { useEffect } from 'react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <h2 className="text-4xl">Something went wrong!</h2>
            <button
                className="mt-4 rounded bg-primary px-4 py-2 text-white"
                onClick={() => reset()}
            >
                Try again
            </button>
        </div>
    )
}