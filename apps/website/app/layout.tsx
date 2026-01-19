import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { ClientWrapper } from '@/components/client-wrapper'
import './globals.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'FLIT - Special Hire Vehicle Platform',
  description: 'FLIT is a special hire vehicle platform that allows you to book a ride with a driver.',
  generator: "ekilie.com",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <ClientWrapper>
          {children}
        </ClientWrapper>
        <Analytics />
      </body>
    </html>
  )
}
