import { Geist, Geist_Mono } from "next/font/google"
import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import ClientLayout from "./client-layout"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SkillSwap - Learn and Share Skills Together",
  description: "Interactive platform to offer and request skills with real-time chat",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased ${_geist.className} ${_geistMono.className}`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
