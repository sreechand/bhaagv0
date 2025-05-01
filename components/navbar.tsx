"use client"

import { useState, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import Link from "next/link"

interface NavbarProps {
  onLoginClick: () => void
}

export default function Navbar({ onLoginClick }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("home")
  const { scrollY } = useScroll()

  const backgroundColor = useTransform(scrollY, [0, 100], ["rgba(10, 10, 10, 0)", "rgba(10, 10, 10, 0.8)"])
  const backdropBlur = useTransform(scrollY, [0, 100], ["blur(0px)", "blur(8px)"])

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section[id]")
      const scrollPosition = window.scrollY + window.innerHeight / 4

      let currentSection = "home"
      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop - 100
        const sectionHeight = (section as HTMLElement).offsetHeight
        const sectionBottom = sectionTop + sectionHeight

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          currentSection = section.getAttribute("id") || ""
        }
      })
      setActiveSection(currentSection)
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() // Call once on mount
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId)
    if (section) {
      section.scrollIntoView({ 
        behavior: "smooth",
        block: "start"
      })
      setActiveSection(sectionId)
      setIsOpen(false)
    }
  }

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300"
      style={{
        backgroundColor,
        backdropFilter: backdropBlur,
      }}
    >
      <div className="container mx-auto flex items-center justify-between">
        <motion.div
          className="flex items-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button onClick={() => scrollToSection("home")} className="flex items-center">
            <span className="text-4xl font-exo font-black tracking-wider text-primary">BHAAG</span>
          </button>
        </motion.div>

        {/* Desktop Navigation */}
        <motion.nav
          className="hidden md:flex items-center space-x-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <NavLink
            href="#why-bhaag"
            label="How it Works"
            active={activeSection === "why-bhaag"}
            onClick={() => scrollToSection("why-bhaag")}
          />
          <NavLink 
            href="#faq" 
            label="FAQ" 
            active={activeSection === "faq"} 
            onClick={() => scrollToSection("faq")} 
          />
          <NavLink
            href="#sample"
            label="Try a Sample Plan"
            active={activeSection === "sample"}
            onClick={() => scrollToSection("sample")}
          />
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/auth/login">
              <Button className="btn-primary">Login</Button>
            </Link>
          </motion.div>
        </motion.nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="text-white">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <motion.div
          className="md:hidden absolute top-full left-0 right-0 bg-black/90 backdrop-blur-md py-4"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="container mx-auto flex flex-col space-y-4 px-6">
            <MobileNavLink href="#why-bhaag" label="How it Works" onClick={() => scrollToSection("why-bhaag")} />
            <MobileNavLink href="#faq" label="FAQ" onClick={() => scrollToSection("faq")} />
            <MobileNavLink href="#sample" label="Try a Sample Plan" onClick={() => scrollToSection("sample")} />
            <Link href="/auth/login">
              <Button className="w-full btn-primary">Login</Button>
            </Link>
          </div>
        </motion.div>
      )}
    </motion.header>
  )
}

interface NavLinkProps {
  href: string
  label: string
  active?: boolean
  onClick: () => void
}

function NavLink({ href, label, active, onClick }: NavLinkProps) {
  return (
    <button
      onClick={onClick}
      className={`relative font-barlow font-semibold transition-colors duration-300 ${
        active ? "text-primary" : "text-white hover:text-primary/80"
      }`}
    >
      {label}
      {active && (
        <motion.span
          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
          layoutId="activeSection"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
    </button>
  )
}

function MobileNavLink({ href, label, onClick }: NavLinkProps) {
  return (
    <button
      onClick={onClick}
      className="block w-full py-2 text-lg font-barlow font-medium text-left text-white hover:text-primary transition-colors duration-300"
    >
      {label}
    </button>
  )
}

