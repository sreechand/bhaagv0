"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Award, Calendar, LineChartIcon as ChartLineUp, Clock, Dumbbell, Flame, Zap, ArrowLeft, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import Navbar from "@/components/navbar"
import { Database } from "@/types/supabase"
import { VoiceCoach } from "@/components/milkha/voice-coach"

type Profile = Database['public']['Tables']['profiles']['Row']

export default function DashboardPage() {
  const { scrollYProgress } = useScroll()
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<Profile | null>(null)
  const [showVoiceCoach, setShowVoiceCoach] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.replace('/auth/login')
          return
        }

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
      } catch (error) {
        console.error('Session check error:', error)
        router.replace('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace('/auth/login')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      localStorage.removeItem('userProfile')
      router.replace('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  // Canvas background animation (similar to landing page)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = 500 // Hero section height

    const particles: Particle[] = []
    const particleCount = Math.floor(window.innerWidth / 100)

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(canvas))
    }

    let animationFrameId: number

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        particle.update()
        particle.draw(ctx)
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = 500
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar onLoginClick={() => {}} />
      
      {/* Hero Section */}
      <div className="relative h-[500px] overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-30 pointer-events-none" />
        <motion.div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ y: backgroundY }}>
          <div className="absolute inset-0 bg-[url('/background-grid.svg')] bg-repeat opacity-10"></div>
        </motion.div>

        <div className="relative z-10 container mx-auto px-6 h-full flex flex-col justify-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-5xl md:text-6xl font-exo font-black mb-4">
              Welcome back, <span className="text-gradient">{userProfile?.name || 'Runner'}</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 font-barlow mb-8">
              Every step counts. Let's keep pushing forward.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button asChild className="btn-primary text-lg font-barlow">
                <Link href="/dashboard/plan">
                  View Your Plan
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0A0A0A] to-transparent z-10"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/10 filter blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-secondary/10 filter blur-3xl"></div>
      </div>

      {/* Feature Boxes */}
      <div className="container mx-auto px-6 -mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Workout Box */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="card-glow group"
            whileHover={{
              y: -10,
              transition: { duration: 0.2 },
            }}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-full bg-black/50 mr-3 text-primary">
                  <Calendar size={24} />
                </div>
                <h3 className="text-2xl font-exo font-bold">Next Workout</h3>
              </div>

              <div className="flex-1 mb-6">
                <div className="flex items-center mb-2">
                  <Dumbbell className="text-primary mr-2 h-5 w-5" />
                  <span className="text-lg font-barlow font-semibold">5K Easy Run</span>
                </div>
                <div className="flex items-center text-gray-300 font-barlow">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>Tomorrow, 7:00 AM</span>
                </div>
                <div className="mt-4 p-3 bg-black/30 rounded-lg border border-white/10">
                  <p className="text-sm text-gray-300 font-barlow">
                    Focus on maintaining a comfortable pace in Zone 2. This is a recovery run.
                  </p>
                </div>
              </div>

              <Button 
                asChild
                className="w-full bg-black/50 border border-primary/50 text-primary hover:bg-primary/10 group"
              >
                <Link href="/dashboard/workouts">
                  Go to Workouts
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Progress Box */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="card-glow group"
            whileHover={{
              y: -10,
              transition: { duration: 0.2 },
            }}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-full bg-black/50 mr-3 text-primary">
                  <ChartLineUp size={24} />
                </div>
                <h3 className="text-2xl font-exo font-bold">Your Progress</h3>
              </div>

              <div className="flex-1 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/30 rounded-lg p-3 border border-white/10">
                    <div className="text-gray-400 text-xs font-barlow mb-1">AVERAGE PACE</div>
                    <div className="flex items-end">
                      <div className="text-2xl font-exo font-bold text-white">5'24"</div>
                      <div className="text-gray-400 text-sm ml-1 mb-0.5 font-barlow">/km</div>
                    </div>
                  </div>

                  <div className="bg-black/30 rounded-lg p-3 border border-white/10">
                    <div className="text-gray-400 text-xs font-barlow mb-1">DISTANCE THIS WEEK</div>
                    <div className="flex items-end">
                      <div className="text-2xl font-exo font-bold text-white">18.5</div>
                      <div className="text-gray-400 text-sm ml-1 mb-0.5 font-barlow">km</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-barlow text-gray-300">Weekly Goal Progress</span>
                    <span className="text-sm font-barlow text-primary">62%</span>
                  </div>
                  <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: "62%" }}></div>
                  </div>
                </div>
              </div>

              <Button
                asChild
                className="w-full bg-black/50 border border-primary/50 text-primary hover:bg-primary/10 group"
              >
                <Link href="/dashboard/progress">
                  View Progress
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Plan Summary Box */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="card-glow group"
            whileHover={{
              y: -10,
              transition: { duration: 0.2 },
            }}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-full bg-black/50 mr-3 text-primary">
                  <Zap size={24} />
                </div>
                <h3 className="text-2xl font-exo font-bold">Active Plan</h3>
              </div>

              <div className="flex-1 mb-6">
                <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg p-4 border border-primary/30 mb-4">
                  <h4 className="font-exo font-bold text-lg mb-1">10K Training Plan</h4>
                  <p className="text-sm text-gray-300 font-barlow">Week 3 of 8</p>
                </div>

                <div className="flex justify-between mb-1">
                  <span className="text-sm font-barlow text-gray-300">Distance Completed</span>
                  <span className="text-sm font-barlow text-primary">25 / 50 km</span>
                </div>
                <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-primary" style={{ width: "50%" }}></div>
                </div>

                <div className="flex items-center text-gray-300 font-barlow">
                  <Flame className="text-primary mr-2 h-4 w-4" />
                  <span>3 day streak</span>
                </div>
              </div>

              <Button
                asChild
                className="w-full bg-black/50 border border-primary/50 text-primary hover:bg-primary/10 group"
              >
                <Link href="/dashboard/plan">
                  Open Plan
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="container mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-exo font-black mb-2">Recent Achievements</h2>
          <p className="text-gray-300 font-barlow">Your latest milestones and accomplishments</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement, index) => (
            <AchievementCard key={index} achievement={achievement} index={index} />
          ))}
        </div>
      </div>

      {/* Voice Coach Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-6 right-6 z-[100] group"
      >
        {/* Tooltip */}
        <div className={`absolute bottom-full right-0 mb-2 pointer-events-none transition-opacity duration-200 ${!showVoiceCoach ? 'opacity-100' : 'opacity-0'}`}>
          <div className="bg-black/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-primary/20 shadow-lg">
            <p className="text-sm text-gray-200 whitespace-nowrap">Meet Milkha, AI coach</p>
          </div>
          <div className="absolute bottom-0 right-6 transform translate-y-1/2 rotate-45 w-2 h-2 bg-black/90 border-r border-b border-primary/20"></div>
        </div>

        <motion.button
          className="relative h-16 w-16 rounded-full flex items-center justify-center bg-black/40 border border-primary/30 backdrop-blur-sm shadow-lg transition-all duration-300 hover:border-primary/50"
          onClick={() => setShowVoiceCoach(!showVoiceCoach)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* AI Core */}
          <div className="absolute inset-2 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
          </div>

          {/* Central Orb */}
          <div className="relative z-10 h-8 w-8 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-lg">
            <motion.div
              className="h-6 w-6 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm"
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <div className="h-3 w-3 rounded-full bg-primary/80" />
            </motion.div>
          </div>

          {/* Ripple Effect */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/20"
            animate={{
              scale: [1, 1.2],
              opacity: [0.2, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
        </motion.button>

        {/* Pulse Indicator for First-time Users */}
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* Voice Coach Component */}
      <VoiceCoach 
        isOpen={showVoiceCoach} 
        onClose={() => setShowVoiceCoach(false)} 
      />
    </div>
  )
}

interface Achievement {
  title: string
  description: string
  date: string
  icon: React.ElementType
  color: string
}

const achievements: Achievement[] = [
  {
    title: "7-Day Streak",
    description: "Completed workouts for 7 consecutive days",
    date: "Today",
    icon: Flame,
    color: "from-orange-500 to-red-500",
  },
  {
    title: "Distance Record",
    description: "Ran your longest distance of 15km",
    date: "2 days ago",
    icon: Award,
    color: "from-primary to-blue-500",
  },
  {
    title: "Speed Demon",
    description: "New personal best pace of 4'45\"/km",
    date: "Last week",
    icon: Zap,
    color: "from-yellow-500 to-amber-500",
  },
  {
    title: "Early Bird",
    description: "Completed 5 morning workouts",
    date: "Last week",
    icon: Clock,
    color: "from-purple-500 to-secondary",
  },
  {
    title: "Strength Master",
    description: "Completed all strength workouts for 2 weeks",
    date: "2 weeks ago",
    icon: Dumbbell,
    color: "from-green-500 to-emerald-500",
  },
]

interface AchievementCardProps {
  achievement: Achievement
  index: number
}

function AchievementCard({ achievement, index }: AchievementCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
      className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-primary/30 transition-all duration-300"
    >
      <div className="flex items-start">
        <div className={`p-3 rounded-full bg-gradient-to-br ${achievement.color} mr-4 shadow-glow`}>
          <achievement.icon className="text-white" size={20} />
        </div>
        <div>
          <h3 className="font-exo font-bold text-xl mb-1">{achievement.title}</h3>
          <p className="text-gray-300 font-barlow text-sm mb-2">{achievement.description}</p>
          <span className="text-xs text-gray-400 font-barlow">{achievement.date}</span>
        </div>
      </div>
    </motion.div>
  )
}

// Particle class for background animation
class Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  color: string
  canvas: HTMLCanvasElement

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.x = Math.random() * canvas.width
    this.y = Math.random() * canvas.height
    this.size = Math.random() * 3 + 1
    this.speedX = (Math.random() - 0.5) * 0.5
    this.speedY = (Math.random() - 0.5) * 0.5
    this.color = Math.random() > 0.5 ? "#00FFD1" : "#9A00FF"
  }

  update() {
    this.x += this.speedX
    this.y += this.speedY

    // Wrap around edges
    if (this.x > this.canvas.width) this.x = 0
    else if (this.x < 0) this.x = this.canvas.width
    if (this.y > this.canvas.height) this.y = 0
    else if (this.y < 0) this.y = this.canvas.height
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fillStyle = this.color + "40" // Add transparency
    ctx.fill()
  }
}
