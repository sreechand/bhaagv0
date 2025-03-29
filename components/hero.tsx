"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useAnimation } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"

interface HeroProps {
  onGetStartedClick: () => void
}

export default function Hero({ onGetStartedClick }: HeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const controls = useAnimation()
  const [currentStats, setCurrentStats] = useState({
    distance: 0,
    pace: "0'00\"",
    calories: 0,
    heartRate: 70,
  })

  // Animate the stats
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStats((prev) => {
        const newDistance = Math.min(5.0, prev.distance + 0.01)
        const newCalories = Math.floor(newDistance * 80)

        // Calculate pace (minutes per km)
        const totalMinutes = 10 - newDistance * 0.8
        const minutes = Math.floor(totalMinutes)
        const seconds = Math.floor((totalMinutes - minutes) * 60)
        const pace = `${minutes}'${seconds.toString().padStart(2, "0")}"`

        // Heart rate that increases slightly as run progresses
        const heartRate = Math.floor(70 + newDistance * 10)

        return {
          distance: Number.parseFloat(newDistance.toFixed(2)),
          pace,
          calories: newCalories,
          heartRate: Math.min(180, heartRate),
        }
      })
    }, 100)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const runners: Runner[] = []
    const runnerCount = Math.floor(window.innerWidth / 300)

    for (let i = 0; i < runnerCount; i++) {
      runners.push(new Runner(canvas))
    }

    let animationFrameId: number

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      runners.forEach((runner) => {
        runner.update()
        runner.draw(ctx)
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById("features")
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-30 pointer-events-none" />

      <div className="container mx-auto px-6 z-10 py-20 md:py-0">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 max-w-6xl mx-auto">
          <div className="md:w-1/2 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-4"
            >
              <motion.h1
                className="text-gradient mb-2"
                animate={{
                  scale: [1, 1.02, 1],
                  textShadow: [
                    "0 0 0px rgba(0,255,209,0)",
                    "0 0 10px rgba(0,255,209,0.5)",
                    "0 0 0px rgba(0,255,209,0)",
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              >
                TRAIN – ADAPT – CONQUER
              </motion.h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <p className="text-xl md:text-2xl font-barlow text-gray-300">
                Your personal AI-powered running coach that evolves with you.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-16"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={onGetStartedClick} className="btn-primary text-lg font-barlow">
                  Get Started
                </Button>
              </motion.div>
            </motion.div>
          </div>

          {/* Dynamic Running App Visualization */}
          <motion.div
            className="md:w-1/2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative mx-auto max-w-md">
              {/* Phone frame */}
              <div className="relative rounded-[2.5rem] border-8 border-gray-800 bg-gray-800 shadow-xl">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-24 bg-gray-800 rounded-b-xl"></div>

                {/* App screen */}
                <div className="h-[600px] w-full overflow-hidden rounded-[2rem] bg-gradient-to-b from-[#0A0A0A] to-[#1C1C2E] p-4 relative">
                  {/* App header */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-primary font-exo font-black text-2xl">BHAAG</div>
                    <div className="flex space-x-2">
                      <div className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-primary"
                        >
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-primary"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M12 8v4l3 3"></path>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Running map */}
                  <div className="relative h-64 rounded-xl overflow-hidden mb-4">
                    <div className="absolute inset-0 bg-black/20"></div>
                    <svg width="100%" height="100%" viewBox="0 0 400 250" className="absolute inset-0">
                      <defs>
                        <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#00FFD1" />
                          <stop offset="100%" stopColor="#9A00FF" />
                        </linearGradient>
                      </defs>

                      {/* Map background grid */}
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                      </pattern>
                      <rect width="100%" height="100%" fill="url(#grid)" />

                      {/* Running route */}
                      <motion.path
                        d="M 50,150 C 100,100 150,200 200,120 S 300,180 350,100"
                        fill="none"
                        stroke="url(#routeGradient)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray="400"
                        initial={{ strokeDashoffset: 400 }}
                        animate={{ strokeDashoffset: 0 }}
                        transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, repeatType: "loop" }}
                      />

                      {/* Runner position */}
                      <motion.circle
                        r="6"
                        fill="#00FFD1"
                        filter="drop-shadow(0 0 6px #00FFD1)"
                        initial={{
                          cx: 50,
                          cy: 150,
                          opacity: 0,
                        }}
                        animate={{
                          cx: [50, 100, 150, 200, 250, 300, 350],
                          cy: [150, 100, 200, 120, 150, 180, 100],
                          opacity: 1,
                        }}
                        transition={{
                          duration: 10,
                          repeat: Number.POSITIVE_INFINITY,
                          repeatType: "loop",
                          times: [0, 0.16, 0.33, 0.5, 0.66, 0.83, 1],
                        }}
                      />
                    </svg>

                    {/* Map overlay elements */}
                    <div className="absolute top-4 left-4 bg-black/60 rounded-lg px-3 py-2 text-sm font-barlow text-white">
                      <motion.div
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                        className="flex items-center"
                      >
                        <div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>
                        <span>Live Tracking</span>
                      </motion.div>
                    </div>

                    <div className="absolute bottom-4 right-4 bg-black/60 rounded-lg px-3 py-2 text-sm font-barlow text-white">
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-primary mr-1"
                        >
                          <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                          <path d="M2 17l10 5 10-5"></path>
                          <path d="M2 12l10 5 10-5"></path>
                        </svg>
                        <span>Elevation: 124m</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats section */}
                  <div ref={statsRef} className="grid grid-cols-2 gap-3 mb-4">
                    <motion.div
                      className="bg-black/30 rounded-xl p-3 border border-white/10"
                      whileHover={{ scale: 1.03, borderColor: "rgba(0, 255, 209, 0.3)" }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="text-gray-400 text-xs font-barlow mb-1">DISTANCE</div>
                      <div className="flex items-end">
                        <div className="text-2xl font-exo font-bold text-white">{currentStats.distance.toFixed(2)}</div>
                        <div className="text-gray-400 text-sm ml-1 mb-0.5 font-barlow">km</div>
                      </div>
                    </motion.div>

                    <motion.div
                      className="bg-black/30 rounded-xl p-3 border border-white/10"
                      whileHover={{ scale: 1.03, borderColor: "rgba(0, 255, 209, 0.3)" }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="text-gray-400 text-xs font-barlow mb-1">PACE</div>
                      <div className="flex items-end">
                        <div className="text-2xl font-exo font-bold text-white">{currentStats.pace}</div>
                        <div className="text-gray-400 text-sm ml-1 mb-0.5 font-barlow">min/km</div>
                      </div>
                    </motion.div>

                    <motion.div
                      className="bg-black/30 rounded-xl p-3 border border-white/10"
                      whileHover={{ scale: 1.03, borderColor: "rgba(0, 255, 209, 0.3)" }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="text-gray-400 text-xs font-barlow mb-1">CALORIES</div>
                      <div className="flex items-end">
                        <div className="text-2xl font-exo font-bold text-white">{currentStats.calories}</div>
                        <div className="text-gray-400 text-sm ml-1 mb-0.5 font-barlow">kcal</div>
                      </div>
                    </motion.div>

                    <motion.div
                      className="bg-black/30 rounded-xl p-3 border border-white/10"
                      whileHover={{ scale: 1.03, borderColor: "rgba(0, 255, 209, 0.3)" }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="text-gray-400 text-xs font-barlow mb-1">HEART RATE</div>
                      <div className="flex items-end">
                        <div className="text-2xl font-exo font-bold text-white">{currentStats.heartRate}</div>
                        <div className="text-gray-400 text-sm ml-1 mb-0.5 font-barlow">bpm</div>
                      </div>
                    </motion.div>
                  </div>

                  {/* AI Coach section */}
                  <motion.div
                    className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl p-4 border border-primary/30"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                  >
                    <div className="flex items-start">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3 mt-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-primary"
                        >
                          <path d="M12 2c5.5 0 10 4.5 10 10s-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2"></path>
                          <path d="M12 8v4l3 3"></path>
                        </svg>
                      </div>
                      <div>
                        <div className="font-exo font-bold text-white mb-1">AI Coach Tip</div>
                        <p className="text-sm text-gray-300 font-barlow">
                          Great pace! Try to maintain your current heart rate zone for the next 10 minutes to maximize
                          aerobic benefits.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Phone reflection/shadow */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[80%] h-[10px] bg-primary/20 blur-xl rounded-full"></div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <motion.button
            onClick={scrollToFeatures}
            className="text-white/70 hover:text-white transition-colors duration-300"
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
          >
            <ChevronDown size={32} />
            <span className="sr-only">Scroll down</span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}

class Runner {
  x: number
  y: number
  speed: number
  size: number
  color: string
  trail: { x: number; y: number; alpha: number }[]
  canvas: HTMLCanvasElement

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.x = -50
    this.y = Math.random() * canvas.height * 0.7 + canvas.height * 0.15
    this.speed = Math.random() * 2 + 1
    this.size = Math.random() * 10 + 15
    this.color = Math.random() > 0.5 ? "#00FFD1" : "#9A00FF"
    this.trail = []
  }

  update() {
    this.x += this.speed

    // Add current position to trail
    this.trail.push({ x: this.x, y: this.y, alpha: 1 })

    // Limit trail length
    if (this.trail.length > 20) {
      this.trail.shift()
    }

    // Decrease alpha of trail points
    this.trail.forEach((point) => {
      point.alpha -= 0.05
      if (point.alpha < 0) point.alpha = 0
    })

    // Reset runner when it goes off screen
    if (this.x > this.canvas.width + 50) {
      this.x = -50
      this.y = Math.random() * this.canvas.height * 0.7 + this.canvas.height * 0.15
      this.speed = Math.random() * 2 + 1
      this.trail = []
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    // Draw trail
    for (let i = 0; i < this.trail.length; i++) {
      const point = this.trail[i]
      ctx.beginPath()
      ctx.arc(point.x, point.y, this.size * 0.6, 0, Math.PI * 2)
      ctx.fillStyle = `${this.color}${Math.floor(point.alpha * 20).toString(16)}`
      ctx.fill()
    }

    // Draw runner
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fillStyle = this.color
    ctx.fill()
  }
}

