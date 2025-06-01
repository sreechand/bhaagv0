"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"

interface LogoProps {
  className?: string
  showGlow?: boolean
  href?: string | null
}

export default function Logo({ className = "", showGlow = true, href = "/" }: LogoProps) {
  const LogoContent = () => (
    <motion.div
      className={`relative transition-all duration-300
        ${showGlow ? 'drop-shadow-[0_0_8px_rgba(0,255,209,0.5)]' : ''}
        hover:drop-shadow-[0_0_10px_rgba(0,255,209,0.7)]
        ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Image
        src="/BHAAG_strava.png"
        alt="BHAAG Logo"
        width={90}
        height={30}
        className="object-contain"
        priority
      />
    </motion.div>
  )

  if (href) {
    return (
      <Link href={href} className="outline-none focus:ring-0">
        <LogoContent />
      </Link>
    )
  }

  return <LogoContent />
} 