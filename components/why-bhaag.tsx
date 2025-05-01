"use client"

import type React from "react"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Activity, Calendar, Dumbbell, Zap } from "lucide-react"

const features = [
  {
    title: "Personalized AI Plans",
    description: "Custom training plans that adapt to your goals, fitness level, and schedule.",
    icon: Activity,
    align: "left",
  },
  {
    title: "Adjusts to Your Life",
    description: "Missed a run? No problem. Your plan automatically recalibrates based on your progress.",
    icon: Calendar,
    align: "right",
  },
  {
    title: "Strength Training Built-In",
    description: "Complete workout routines that include strength exercises to improve your running.",
    icon: Dumbbell,
    align: "left",
  },
  {
    title: "Beginner to Ultra Ready",
    description: "Whether you're just starting or training for an ultramarathon, BHAAG grows with you.",
    icon: Zap,
    align: "right",
  },
]

export default function WhyBhaag() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, amount: 0.2 })

  return (
    <section id="why-bhaag" className="py-20 relative">
      <div className="container mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="mb-4">Why Choose BHAAG?</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto font-barlow">
            Our AI-powered running coach adapts to your unique needs and goals.
          </p>
        </motion.div>

        <div className="space-y-16 md:space-y-24">
          {features.map((feature, index) => (
            <FeatureRow
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              align={feature.align as "left" | "right"}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

interface FeatureRowProps {
  title: string
  description: string
  icon: React.ElementType
  align: "left" | "right"
  index: number
}

function FeatureRow({ title, description, icon: Icon, align, index }: FeatureRowProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, amount: 0.3 })

  const variants = {
    hidden: {
      opacity: 0,
      x: align === "left" ? -50 : 50,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        delay: 0.2,
      },
    },
  }

  const iconVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      x: align === "left" ? 50 : -50,
    },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: {
        duration: 0.6,
        delay: 0.4,
      },
    },
  }

  return (
    <div ref={ref} className="relative">
      <div
        className={`flex flex-col ${align === "right" ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-8 md:gap-16`}
      >
        <motion.div
          className="w-full md:w-1/2"
          variants={variants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <div className={`text-center md:text-${align === "right" ? "right" : "left"}`}>
            <h3 className="text-3xl mb-4 text-gradient inline-block font-exo font-black">{title}</h3>
            <p className="text-lg text-gray-300 font-barlow">{description}</p>
          </div>
        </motion.div>

        <motion.div
          className="w-full md:w-1/2 flex justify-center"
          variants={iconVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <div className="relative w-48 h-48 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full animate-pulse"></div>
            <div className="relative z-10 bg-black/50 p-8 rounded-full border border-white/10">
              <Icon size={64} className="text-primary" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

