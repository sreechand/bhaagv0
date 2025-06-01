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
import StravaRunModal from "@/components/Modal/StravaRunModal"

type Profile = Database['public']['Tables']['profiles']['Row']
type TrainingPlan = Database['public']['Tables']['training_plans']['Row']
type TrainingPlanUpdate = Database['public']['Tables']['training_plans']['Update']
type PlanWeek = Database['public']['Tables']['plan_weeks']['Row']
type PlanSession = Database['public']['Tables']['plan_sessions']['Row']

// Define the expected plan summary structure from plan_data
type PlanSummary = {
  estimated_total_plan_mileage: number;
  estimated_plan_duration_weeks: number;
  block_run_mileage: number;
  strength_focus_summary: string;
}

// Type guard to check if an object matches PlanSummary structure
function isPlanSummary(obj: unknown): obj is PlanSummary {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'estimated_total_plan_mileage' in obj &&
    'estimated_plan_duration_weeks' in obj &&
    'block_run_mileage' in obj &&
    'strength_focus_summary' in obj
  )
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
  const [pendingAction, setPendingAction] = useState<null | 'restart' | 'new'>(null)
  const [planSummary, setPlanSummary] = useState<PlanSummary | null>(null)
  const [weeks, setWeeks] = useState<PlanWeek[]>([])
  const [sessions, setSessions] = useState<PlanSession[]>([])
  const [workoutLogs, setWorkoutLogs] = useState<any[]>([])
  const [showStravaRunModal, setShowStravaRunModal] = useState(false)

  useEffect(() => {
    const fetchPlan = async () => {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.id) {
        router.replace('/auth/login')
        return
      }
      // 1. Get most recent active plan
      const userId = session.user.id
      if (!userId) {
        setPlanSummary(null)
        setWeeks([])
        setSessions([])
        setLoading(false)
        return
      }
      const { data: plan, error: planError } = await supabase
        .from('training_plans')
        .select('*')
        .eq('user_id', userId as string)
        .eq('status', 'active' as string)
        .order('generated_at', { ascending: false })
        .limit(1)
        .single()

      if (planError) {
        console.error('Supabase planError:', planError)
      }
      if (!plan || typeof plan !== 'object' || !('plan_data' in plan) || !('id' in plan) || !plan.id) {
        setPlanSummary(null)
        setWeeks([])
        setSessions([])
        setLoading(false)
        return
      }
      const typedPlan = plan as TrainingPlan

      // Extract plan summary from plan_data
      const planData = typedPlan.plan_data as { plan_summary?: PlanSummary }
      const summary = planData?.plan_summary && isPlanSummary(planData.plan_summary)
        ? planData.plan_summary
        : null

      // 2. Fetch weeks and sessions for this plan
      const planId = typedPlan.id
      if (!planId) {
        setPlanSummary(summary)
        setWeeks([])
        setSessions([])
        setLoading(false)
        return
      }
      const { data: weeks, error: weeksError } = await supabase
        .from('plan_weeks')
        .select('*')
        .eq('plan_id', planId as string)
        .order('week_number', { ascending: true })

      if (weeksError) {
        console.error('Supabase weeksError:', weeksError)
      }
      if (!weeks || !Array.isArray(weeks)) {
        setPlanSummary(summary)
        setWeeks([])
        setSessions([])
        setLoading(false)
        return
      }
      // Only use week ids that are strings (filter out nulls)
      const validWeeks = (weeks as PlanWeek[]).filter(w => w && typeof w.id === 'string')
      const weekIds = validWeeks.map(w => w.id).filter((id): id is string => !!id) as string[]
      if (weekIds.length === 0) {
        setPlanSummary(summary)
        setWeeks(validWeeks)
        setSessions([])
        setLoading(false)
        return
      }
      const { data: sessions, error: sessionsError } = await supabase
        .from('plan_sessions')
        .select('*')
        .in('week_id', weekIds as string[])

      if (sessionsError) {
        console.error('Supabase sessionsError:', sessionsError)
      }
      if (!sessions || !Array.isArray(sessions)) {
        setPlanSummary(summary)
        setWeeks(validWeeks)
        setSessions([])
        setLoading(false)
        return
      }
      // Filter out any error objects or nulls
      const validSessions = (sessions as PlanSession[]).filter(s => s && typeof s.id === 'string')

      // Fetch workout logs for these sessions and user
      let logs: any[] = [];
      if (validSessions.length > 0) {
        const sessionIds = validSessions.map(s => s.id);
        const { data: logsData, error: logsError } = await supabase
          .from('workout_logs')
          .select('*')
          .in('session_id', sessionIds)
          .eq('user_id', userId);
        if (logsError) {
          console.error('Supabase workoutLogs error:', logsError);
        }
        if (logsData && Array.isArray(logsData)) {
          logs = logsData;
        }
      }
      setWorkoutLogs(logs);

      setPlanSummary(summary)
      setWeeks(validWeeks)
      setSessions(validSessions)
      setLoading(false)
    }
    fetchPlan()
  }, [])

  const handlePlanAction = (action: 'restart' | 'new') => {
    setPendingAction(action)
    setShowConfirmModal(true)
  }

  const handleConfirmPlanAction = async () => {
    if (pendingAction === 'new') {
      if (currentPlan && currentPlan.id) {
        const { error } = await supabase
          .from('training_plans')
          .update({ status: 'cancelled' } as any)
          .eq('id', currentPlan.id as any)
        if (error) {
          console.error('Error cancelling plan:', error)
          setShowConfirmModal(false)
          setPendingAction(null)
          return
        }
        setCurrentPlan(null)
      }
      setShowOnboarding(true)
    }
    setShowConfirmModal(false)
    setPendingAction(null)
  }

  const handleWizardClose = (newPlan: any) => {
    setShowOnboarding(false)
    if (newPlan) {
      setCurrentPlan(newPlan);
      setPlanSummary(newPlan.planSummary || null);
      setWeeks(newPlan.weeks || []);
      setSessions(newPlan.sessions || []);
      setWorkoutLogs([]); // No logs for a new plan yet
      router.refresh();   // Force a full data refresh
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

    

      {/* Background elements */}
      <motion.div className="fixed inset-0 z-0 opacity-20 pointer-events-none" style={{ y: backgroundY }}>
        <div className="absolute inset-0 bg-[url('/background-grid.svg')] bg-repeat opacity-10"></div>
      </motion.div>
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/10 filter blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-secondary/10 filter blur-3xl"></div>
<br></br>
<br></br>
<br></br>
<br></br>
      <div className="container mx-auto px-6 py-12 relative z-10">
        {planSummary && weeks.length > 0 ? (
          <WeeklyPlan 
            planSummary={planSummary}
            weeks={weeks}
            sessions={sessions}
            workoutLogs={workoutLogs}
            onNewPlan={() => handlePlanAction('new')}
            onActiveWeekDoubleClick={() => setShowStravaRunModal(true)}
          />
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

      {/* Strava Run Modal */}
      {showStravaRunModal && (
        <StravaRunModal
          isOpen={showStravaRunModal}
          onClose={() => setShowStravaRunModal(false)}
          onImport={() => setShowStravaRunModal(false)}
          onManualLog={() => setShowStravaRunModal(false)}
          onSkip={() => setShowStravaRunModal(false)}
        />
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




/* add this  code


{showSamplePlanModal && (
<SamplePlanModal onClose={() => setShowSamplePlanModal(false)} />
)}
{showStravaRunModal && (
<StravaRunModal
isOpen={showStravaRunModal}
onClose={() => setShowStravaRunModal(false)}
onImport={() => { setShowStravaRunModal(false); }}
onManualLog={() => { setShowStravaRunModal(false); }}
onSkip={() => { setShowStravaRunModal(false); }}
/>
)}
*/