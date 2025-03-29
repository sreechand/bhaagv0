"use client"

import type React from "react"

import { useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Watch, MessageSquare, Users } from "lucide-react"

const upcomingFeatures = [
  {
    title: "Smartwatch Integration",
    description: "Connect with Garmin, Apple Watch, and more for real-time feedback.",
    icon: Watch,
  },
  {
    title: "AI Coach Chat",
    description: "Ask questions and get personalized advice from your AI running coach.",
    icon: MessageSquare,
  },
  {
    title: "Group Challenges",
    description: "Compete with friends and the BHAAG community in virtual challenges.",
    icon: Users,
  },
]

interface FeatureCardProps {
  title: string
  description: string
  icon: React.ComponentType<any>
  index: number
}

export default function ComingSoon() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, amount: 0.2 })
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showRunner, setShowRunner] = useState(false)
  const runnerRef = useRef<HTMLDivElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setIsSubmitted(true)
      // In a real app, you would send this to your backend
      console.log("Email submitted:", email)

      // Show runner animation after a short delay
      setTimeout(() => {
        setShowRunner(true)
      }, 500)
    }
  }

  return (
    <section className="py-20 relative bg-black/30 overflow-hidden" id="coming-soon">
      <div className="container mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="mb-4">What's Coming to BHAAG?</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto font-barlow">
            We're constantly improving. Here's what's on our roadmap.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          {upcomingFeatures.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              index={index}
            />
          ))}
        </div>

        <div className="max-w-md mx-auto relative">
          {!isSubmitted ? (
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 20 }}
              transition={{ duration: 2.0, delay: 0.3 }}
            >
              <h3 className="text-xl text-center font-exo font-bold mb-2">Stay in the loop</h3>
              <div className="flex space-x-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-black/50 border-white/20 focus:border-primary font-barlow"
                />
                <Button type="submit" className="bg-primary text-black font-bold hover:glow font-barlow">
                  Subscribe
                </Button>
              </div>
            </motion.form>
          ) : (
            <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-4 relative">
                <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                  <motion.div
                    className="w-4 h-12 bg-primary rounded-full"
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.2,
                    }}
                  />
                </div>
              </div>
              <h3 className="text-2xl font-exo font-bold mb-2">You're on the list!</h3>
              <p className="text-gray-300 font-barlow">We'll keep you updated on all the exciting new features.</p>
            </motion.div>
          )}

          {/* Runner animation */}
          {showRunner && (
            <div className="absolute top-full left-0 right-0 mt-8 overflow-hidden h-20" ref={runnerRef}>
              <motion.div
                className="runner-animation"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  duration: 2,
                  ease: "easeInOut",
                }}
                onAnimationComplete={() => {
                  // Optional: do something when animation completes
                }}
              >
                <RunnerAnimation />
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// Add this new component for the runner animation
function RunnerAnimation() {
  return (
    <div className="relative">
      <motion.div
        className="absolute top-0 left-0"
        animate={{
          x: ["0%", "100%"],
        }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeat: 0,
        }}
      >
        <div className="flex items-center">
          <motion.div
            className="w-8 h-16 bg-primary rounded-full relative"
            animate={{
              y: [0, -10, 0],
              rotate: [0, 10, 0, -10, 0],
              scaleY: [1, 0.9, 1],
            }}
            transition={{
              duration: 0.5,
              repeat: 4,
              repeatType: "loop",
            }}
          >
            {/* Head */}
            <div className="absolute w-6 h-6 bg-primary rounded-full -top-6 left-1"></div>

            {/* Arms */}
            <motion.div
              className="absolute w-4 h-1.5 bg-primary rounded-full top-2 -left-3"
              animate={{
                rotate: [0, 30, 0, -30, 0],
              }}
              transition={{
                duration: 0.5,
                repeat: 4,
                repeatType: "loop",
              }}
            ></motion.div>

            <motion.div
              className="absolute w-4 h-1.5 bg-primary rounded-full top-2 -right-3"
              animate={{
                rotate: [0, -30, 0, 30, 0],
              }}
              transition={{
                duration: 0.5,
                repeat: 4,
                repeatType: "loop",
              }}
            ></motion.div>

            {/* Legs */}
            <motion.div
              className="absolute w-1.5 h-5 bg-primary rounded-full bottom-0 left-1"
              animate={{
                rotate: [0, 45, 0, -45, 0],
                y: [0, -2, 0, -2, 0],
              }}
              transition={{
                duration: 0.5,
                repeat: 4,
                repeatType: "loop",
              }}
            ></motion.div>

            <motion.div
              className="absolute w-1.5 h-5 bg-primary rounded-full bottom-0 right-1"
              animate={{
                rotate: [0, -45, 0, 45, 0],
                y: [0, -2, 0, -2, 0],
              }}
              transition={{
                duration: 0.5,
                repeat: 4,
                repeatType: "loop",
              }}
            ></motion.div>
          </motion.div>

          {/* Trail effect */}
          <motion.div
            className="h-0.5 bg-gradient-to-r from-primary to-transparent"
            initial={{ width: 0 }}
            animate={{ width: "50vw" }}
            transition={{
              duration: 2,
              ease: "easeOut",
            }}
          ></motion.div>
        </div>
      </motion.div>
    </div>
  )
}

// Update in FeatureCard function
function FeatureCard({ title, description, icon: Icon, index }: FeatureCardProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, amount: 0.3 })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="card-glow-purple group"
      whileHover={{
        y: -10,
        transition: { duration: 0.2 },
      }}
    >
      <div className="flex flex-col items-center text-center">
        <motion.div
          className="mb-6 relative"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          <div className="absolute inset-0 bg-secondary/20 rounded-full blur-xl group-hover:bg-secondary/30 transition-all duration-300"></div>
          <div className="relative bg-black/50 p-4 rounded-full border border-secondary/30 group-hover:border-secondary/50 transition-all duration-300">
            <Icon size={40} className="text-secondary" />
          </div>
        </motion.div>
        <h3 className="text-2xl mb-2 font-exo font-black tracking-wide">{title}</h3>
        <p className="text-gray-300 font-barlow">{description}</p>
      </div>
    </motion.div>
  )
}

