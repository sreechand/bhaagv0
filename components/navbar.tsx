"use client"

import { useState, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import Logo from "@/components/ui/logo"
import UserAvatar from "@/components/user-avatar"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { usePathname, useRouter } from "next/navigation"
import { Database } from "@/types/supabase"

type Profile = Database['public']['Tables']['profiles']['Row']

interface NavbarProps {
  onLoginClick: () => void
}

export default function Navbar({ onLoginClick }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userProfile, setUserProfile] = useState<Profile | null>(null)
  const { scrollY } = useScroll()
  const pathname = usePathname()
  const router = useRouter()
  const isDashboard = pathname?.startsWith('/dashboard')
  
  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    ["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.8)"]
  )
  const backdropBlur = useTransform(
    scrollY,
    [0, 100],
    ["blur(0px)", "blur(10px)"]
  )

  const [activeSection, setActiveSection] = useState("home")
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)

      if (session) {
        // Get user profile from localStorage or fetch it
        const storedProfile = localStorage.getItem('userProfile')
        if (storedProfile) {
          setUserProfile(JSON.parse(storedProfile))
        } else {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('id, created_at, email, name, phone')
            .eq('id', session.user.id)
            .single()

          if (error) {
            console.error('Error fetching profile:', error)
            return
          }

          if (profile) {
            const typedProfile = profile as Profile
            localStorage.setItem('userProfile', JSON.stringify(typedProfile))
            setUserProfile(typedProfile)
          }
        }
      }
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsLoggedIn(!!session)
      if (!session) {
        setUserProfile(null)
        localStorage.removeItem('userProfile')
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      localStorage.removeItem('userProfile')
      router.replace('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  useEffect(() => {
    if (!isDashboard) {
    const handleScroll = () => {
      const sections = ["home", "why-bhaag", "faq", "sample"]
      const scrollPosition = window.scrollY + 100

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
    }
  }, [isDashboard])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const offset = 80 // Height of the navbar
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
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
          <button onClick={() => !isDashboard && scrollToSection("home")} className="flex items-center">
            <Logo className="text-4xl" href={isDashboard ? "/dashboard" : "/"} />
          </button>
        </motion.div>

        {/* Desktop Navigation */}
        <motion.nav
          className="hidden md:flex items-center space-x-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {!isDashboard && (
            <>
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
            </>
          )}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            {isLoggedIn ? (
              <UserAvatar onSignOut={handleSignOut} />
            ) : (
              <Link href="/auth/login">
                <Button variant="default">Login</Button>
              </Link>
            )}
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
            {!isDashboard && (
              <>
            <MobileNavLink href="#why-bhaag" label="How it Works" onClick={() => scrollToSection("why-bhaag")} />
            <MobileNavLink href="#faq" label="FAQ" onClick={() => scrollToSection("faq")} />
            <MobileNavLink href="#sample" label="Try a Sample Plan" onClick={() => scrollToSection("sample")} />
              </>
            )}
            {isLoggedIn ? (
              <div className="flex items-center space-x-2">
                <UserAvatar onSignOut={handleSignOut} />
                <span className="text-white">User Menu</span>
              </div>
            ) : (
              <Link href="/auth/login">
                <Button variant="default" className="w-full">Login</Button>
              </Link>
            )}
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
  onClick?: () => void
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

