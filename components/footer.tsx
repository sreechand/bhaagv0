"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Instagram, Twitter, Facebook } from "lucide-react"
import Logo from "@/components/ui/logo"

export default function Footer() {
  return (
    <footer className="py-12 bg-black/50 border-t border-white/10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Logo className="text-4xl mb-4" />
              <p className="text-gray-300 mb-6 font-barlow">
                Your personal AI-powered running coach that evolves with you.
              </p>
              <div className="flex space-x-4">
                <SocialLink href="#" icon={Instagram} />
                <SocialLink href="#" icon={Twitter} />
                <SocialLink href="#" icon={Facebook} />
              </div>
            </motion.div>
          </div>

          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h4 className="text-xl font-exo font-bold mb-4">Links</h4>
              <ul className="space-y-2">
                <FooterLink href="#why-bhaag">How it Works</FooterLink>
                <FooterLink href="#faq">FAQ</FooterLink>
                <FooterLink href="#sample">Try a Sample Plan</FooterLink>
                <FooterLink href="#">Privacy Policy</FooterLink>
                <FooterLink href="#">Terms of Service</FooterLink>
              </ul>
            </motion.div>
          </div>

          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h4 className="text-xl font-exo font-bold mb-4">Contact</h4>
              <ul className="space-y-2">
                <li className="text-gray-300 font-barlow">support@bhaag.ai</li>
                <li className="text-gray-300 font-barlow">+1 (555) 123-4567</li>
              </ul>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 pt-6 border-t border-white/10 text-center"
        >
          <p className="text-gray-400 text-sm font-barlow">© {new Date().getFullYear()} BHAAG. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  )
}

interface SocialLinkProps {
  href: string
  icon: React.ElementType
}

function SocialLink({ href, icon: Icon }: SocialLinkProps) {
  return (
    <a
      href={href}
      className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center 
      hover:bg-primary/20 hover:text-primary transition-all duration-300"
    >
      <Icon size={20} />
    </a>
  )
}

interface FooterLinkProps {
  href: string
  children: React.ReactNode
}

function FooterLink({ href, children }: FooterLinkProps) {
  return (
    <li>
      <a href={href} className="text-gray-300 hover:text-primary transition-colors duration-300 font-raleway">
        {children}
      </a>
    </li>
  )
}

