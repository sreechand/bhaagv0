"use client"

import { useState, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { AlertCircle, ArrowRight, RefreshCw, Zap } from "lucide-react"
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
type TrainingPlan = Database['public']['Tables']['training_plans']['Row']
type TrainingPlanUpdate = Database['public']['Tables']['training_plans']['Update']

export default function PlanPage() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<Profile | null>(null)
  const [currentPlan, setCurrentPlan] = useState<TrainingPlan | null>(null)
  const { scrollYProgress } = useScroll()
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"])
  const router = useRouter()
  const [pendingAction, setPendingAction] = useState<null | 'restart' | 'new'>(null)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session || !session.user.id) {
          router.replace('/auth/login')
          return
        }

        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
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
          .eq('user_id', session.user.id)
          .eq('status', 'active')
          .order('generated_at', { ascending: false })
          .limit(1)
          .single()

        if (planError) {
          if (planError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
            console.error('Error fetching plan:', planError)
          }
        } else if (plan) {
          console.log('Fetched plan:', plan) // Add logging
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

  const handlePlanAction = (action: 'restart' | 'new') => {
    setPendingAction(action)
    setShowConfirmModal(true)
  }

  const handleConfirmPlanAction = async () => {
    if (!currentPlan) return;
    // Only cancel plan for 'new' action
    if (pendingAction === 'new') {
      if (!currentPlan?.id) throw new Error('Current plan ID is null');
      const { error } = await (supabase
        .from('training_plans')
        .update({ status: 'cancelled' } as TrainingPlanUpdate)
        .eq('id', currentPlan.id));
      if (error) {
        console.error('Error cancelling plan:', error);
        setShowConfirmModal(false);
        setPendingAction(null);
        return;
      }
      setCurrentPlan(null);
      setShowOnboarding(true);
    }
    setShowConfirmModal(false);
    setPendingAction(null);
  }

  const handleWizardClose = (newPlan: TrainingPlan | null) => {
    setShowOnboarding(false)
    if (newPlan) {
      console.log('Setting new plan:', newPlan)
      // Ensure plan_data is properly structured
      const planData = {
        ...newPlan,
        plan_data: typeof newPlan.plan_data === 'object' && newPlan.plan_data !== null
          ? newPlan.plan_data
          : {
              choices: [{
                message: {
                  content: typeof newPlan.plan_data === 'object' && newPlan.plan_data !== null
                    ? (newPlan.plan_data as any).text || ''
                    : ''
                }
              }],
              text: typeof newPlan.plan_data === 'object' && newPlan.plan_data !== null
                ? (newPlan.plan_data as any).text || ''
                : ''
            }
      }
      setCurrentPlan(planData)
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
          <>
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => handlePlanAction('new')}
              >
                New Plan
              </Button>
            </div>
            <WeeklyPlan 
              planData={currentPlan.plan_data} 
              planStartDate={(currentPlan.inputs_json as any)?.planStartDate || ''} 
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] relative w-full">
            <h1 className="text-4xl md:text-5xl font-exo font-black mb-4 text-center">
              HOW WOULD YOU LIKE TO BEGIN?
            </h1>
            <p className="text-xl text-gray-300 font-barlow mb-8 text-center max-w-xl">
              Create a personalized training plan tailored to your goals and schedule.
            </p>
            <Button
              onClick={() => setShowOnboarding(true)}
              className="px-8 py-4 text-xl font-exo font-bold rounded-lg bg-primary text-black hover:bg-primary/80 transition-all duration-200 shadow-lg"
            >
              Generate New Plan
            </Button>
            {/* Warning box at the bottom */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-full max-w-2xl">
              <div className="mt-16 p-4 bg-black/30 border border-yellow-500/30 rounded-lg flex items-start gap-3 justify-center">
                <span className="text-yellow-500 text-xl mr-2">⚠️</span>
                <span className="text-gray-300 font-barlow">
                  You don't have an active training plan yet. Generate a new plan to get started with your running journey.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Onboarding Wizard Modal */}
      {showOnboarding && (
        <OnboardingWizard onClose={handleWizardClose} />
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <ConfirmationModal
          onConfirm={handleConfirmPlanAction}
          onCancel={() => {
            setShowConfirmModal(false)
            setPendingAction(null)
          }}
          title={pendingAction === 'restart' ? 'Restart Plan' : 'New Plan'}
          message="This will erase your current progress and start fresh. Are you sure you want to continue?"
          confirmText={pendingAction === 'restart' ? 'Confirm and Restart' : 'Confirm and Start New Plan'}
          cancelText="Cancel"
        />
      )}
    </div>
  )
}
