"use client"

import Link from "next/link"
import { motion } from "framer-motion"

interface LogoProps {
  className?: string
  showGlow?: boolean
  href?: string | null
}

export default function Logo({ className = "", showGlow = true, href = "/" }: LogoProps) {
  const LogoContent = () => (
    <motion.span
      className={`font-exo font-black tracking-wider text-primary
        transition-all duration-300 hover:text-primary/90
        ${showGlow ? 'drop-shadow-[0_0_8px_rgba(0,255,209,0.5)]' : ''}
        hover:drop-shadow-[0_0_10px_rgba(0,255,209,0.7)]
        ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      BHAAG
    </motion.span>
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