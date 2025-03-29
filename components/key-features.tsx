"use client"

import type React from "react"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Activity, Brain, Home, BarChart } from "lucide-react"

const features = [
  {
    title: "Syncs with Strava",
    description: "Automatically imports your runs and adjusts your plan.",
    icon: Activity,
  },
  {
    title: "Real-Time Fatigue Adjustment",
    description: "AI detects when you need rest or can push harder.",
    icon: Brain,
  },
  {
    title: "Train Anywhere",
    description: "Home or gym workouts that fit your available equipment.",
    icon: Home,
  },
  {
    title: "Smart Progress Insights",
    description: "Visual analytics that show your improvement over time.",
    icon: BarChart,
  },
]

export default function KeyFeatures() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, amount: 0.2 })

  return (
    <section className="py-20 relative bg-black/30">
      <div className="container mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="mb-4">Key Features That Set Us Apart</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto font-barlow">
            BHAAG combines cutting-edge AI with sports science to deliver a truly personalized running experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

interface FeatureCardProps {
  title: string
  description: string
  icon: React.ElementType
  index: number
}

function FeatureCard({ title, description, icon: Icon, index }: FeatureCardProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, amount: 0.3 })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="card-glow group"
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
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/30 transition-all duration-300"></div>
          <div className="relative bg-black/50 p-4 rounded-full border border-primary/30 group-hover:border-primary/50 transition-all duration-300">
            <Icon size={40} className="text-primary" />
          </div>
        </motion.div>
        <h3 className="text-2xl mb-2 font-exo font-black tracking-wide">{title}</h3>
        <p className="text-gray-300 font-barlow">{description}</p>
      </div>
    </motion.div>
  )
}

