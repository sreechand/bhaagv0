import type React from "react"
import "./globals.css"
import { Inter, Barlow, Exo_2 } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const exo = Exo_2({
  subsets: ["latin"],
  variable: "--font-exo",
  display: "swap",
})

const barlow = Barlow({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-barlow",
  display: "swap",
})

export const metadata = {
  title: "BHAAG - AI-Powered Running Coach",
  description: "Your personal AI-powered running coach that evolves with you.",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.variable} ${barlow.variable} ${exo.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'