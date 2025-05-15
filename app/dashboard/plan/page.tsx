"use client"

import { useState, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { AlertCircle, ArrowRight, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import OnboardingWizard from "@/components/plan/onboarding-wizard"
import WeeklyPlan from "@/components/plan/weekly-plan"
import ConfirmationModal from "@/components/plan/confirmation-modal"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { Database } from "@/types/supabase"
import Navbar from "@/components/navbar"
import Logo from "@/components/ui/logo"

type Profile = Database['public']['Tables']['profiles']['Row']

interface TrainingPlan {
  id: string
  user_id: string
  block_number: number
  start_date: string
  end_date: string
  plan_data: any
  status: 'active' | 'completed' | 'cancelled'
  generated_at: string
  inputs_json: any
}

export default function PlanPage() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<Profile | null>(null)
  const [currentPlan, setCurrentPlan] = useState<TrainingPlan | null>(null)
  const { scrollYProgress } = useScroll()
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"])
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.replace('/auth/login')
          return
        }

        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id as any)
          .single()

        if (profileError) {
          console.error('Error fetching profile:', profileError)
          return
        }

        if (profile) {
          setUserProfile(profile as unknown as Profile)
        }

        // Get current training plan
        const { data: plan, error: planError } = await supabase
          .from('training_plans')
          .select('*')
          .eq('user_id', session.user.id as any)
          .eq('status', 'active' as any)
          .order('generated_at', { ascending: false })
          .limit(1)
          .single()

        if (planError && planError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          console.error('Error fetching plan:', planError)
        }

        if (plan) {
          setCurrentPlan(plan as unknown as TrainingPlan)
        }
      } catch (error) {
        console.error('Session check error:', error)
        router.replace('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [router])

  const handleRestartPlan = async () => {
    if (!currentPlan) return

    try {
      // Update the current plan status to cancelled
      const { error } = await supabase
        .from('training_plans')
        .update({ status: 'cancelled' })
        .eq('id', currentPlan.id)

      if (error) {
        console.error('Error cancelling plan:', error)
        return
      }

      // Refresh the page to show the onboarding wizard
      setShowConfirmModal(false)
      window.location.reload()
    } catch (error) {
      console.error('Error restarting plan:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-6 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded w-1/4 mb-8"></div>
            <div className="h-64 bg-gray-800 rounded mb-8"></div>
            <div className="h-32 bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Persistent Navbar */}
      <Navbar onLoginClick={() => {}} />

      {/* Dashboard Button */}
      <div className="container mx-auto px-6 pt-24 pb-2 flex items-center">
        <Button
          variant="outline"
          className="flex items-center gap-2 bg-black/50 border-white/20 hover:bg-white/5 text-white"
          onClick={() => router.push('/dashboard')}
        >
          <Logo className="text-xl" showGlow={false} href={null} />
          <span className="font-barlow font-semibold">Dashboard</span>
        </Button>
      </div>

      {/* Background elements */}
      <motion.div className="fixed inset-0 z-0 opacity-20 pointer-events-none" style={{ y: backgroundY }}>
        <div className="absolute inset-0 bg-[url('/background-grid.svg')] bg-repeat opacity-10"></div>
      </motion.div>
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/10 filter blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-secondary/10 filter blur-3xl"></div>

      <div className="container mx-auto px-6 py-12 relative z-10">
        {currentPlan ? (
          <WeeklyPlan />
        ) : (
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-5xl font-exo font-black mb-4">How would you like to begin?</h1>
              <p className="text-xl text-gray-300 font-barlow">
                Create a personalized training plan tailored to your goals and schedule.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                whileHover={{ y: -10 }}
              >
                <Button
                  onClick={() => setShowOnboarding(true)}
                  className="w-full h-48 bg-gradient-to-br from-primary/20 to-primary/5 hover:from-primary/30 hover:to-primary/10 border border-primary/30 hover:border-primary/50 rounded-xl flex flex-col items-center justify-center gap-4 group hover:glow transition-all duration-300"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <ArrowRight className="h-8 w-8 text-primary" />
                  </div>
                  <span className="text-2xl font-exo font-bold text-white">Generate New Plan</span>
                </Button>
              </motion.div>

              {currentPlan && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  whileHover={{ y: -10 }}
                >
                  <Button
                    onClick={() => setShowConfirmModal(true)}
                    className="w-full h-48 bg-gradient-to-br from-secondary/20 to-secondary/5 hover:from-secondary/30 hover:to-secondary/10 border border-secondary/30 hover:border-secondary/50 rounded-xl flex flex-col items-center justify-center gap-4 group hover:glow-purple transition-all duration-300"
                  >
                    <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <RefreshCw className="h-8 w-8 text-secondary" />
                    </div>
                    <span className="text-2xl font-exo font-bold text-white">Restart Plan</span>
                  </Button>
                </motion.div>
              )}
            </div>

            {!currentPlan && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-12 p-4 bg-black/30 border border-yellow-500/30 rounded-lg flex items-start gap-3"
              >
                <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-300 font-barlow">
                    You don't have an active training plan yet. Generate a new plan to get started with your running
                    journey.
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Onboarding Wizard Modal */}
      {showOnboarding && <OnboardingWizard onClose={() => setShowOnboarding(false)} />}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <ConfirmationModal
          title="Restart Plan"
          message="This will erase your current progress and start fresh. Are you sure you want to continue?"
          confirmText="Confirm and Restart"
          cancelText="Cancel"
          onConfirm={handleRestartPlan}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}
    </div>
  )
}
