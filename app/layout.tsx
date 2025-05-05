import type { Metadata } from "next"
import { Inter, Barlow, Exo_2 } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  preload: true,
})

const barlow = Barlow({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-barlow",
  preload: true,
})

const exo = Exo_2({
  subsets: ["latin"],
  variable: "--font-exo",
  preload: true,
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
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${barlow.variable} ${exo.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'