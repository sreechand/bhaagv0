"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import RunningProfileStep from "./wizard-steps/running-profile-step"
import StrengthSetupStep from "./wizard-steps/strength-setup-step"

interface OnboardingWizardProps {
  onClose: (plan: any) => void
}

export default function OnboardingWizard({ onClose }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Running Profile
    runningLevel: "",
    primaryGoal: "",
    trainingDays: [] as string[],
    recentRaceTime: { hours: "", minutes: "", seconds: "" },
    recentRaceDistance: "",
    goalRaceTime: { hours: "", minutes: "", seconds: "" },
    goalRaceDistance: "",
    weeklyMileage: "",
    longestRun: "",
    planStartDate: "",
    raceDate: "",
    // Strength Setup
    strengthLevel: "",
    trainingEnvironment: "",
    strengthDays: [] as string[],
    equipment: [] as string[],
    includeRecovery: false,
  })
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const totalSteps = 2

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setErrorMsg(null)
    // Map formData to API payload for hybrid plan
    const payload = {
      // Running
      proficiency: formData.runningLevel,
      goal: formData.primaryGoal,
      weeklyMileage: Number(formData.weeklyMileage),
      preferredDays: formData.trainingDays,
      longestRun: Number(formData.longestRun),
      planStartDate: formData.planStartDate,
      raceDate: formData.raceDate,
      recentRace: formData.recentRaceDistance && (formData.recentRaceTime.hours || formData.recentRaceTime.minutes || formData.recentRaceTime.seconds)
        ? `${formData.recentRaceDistance} ${formData.recentRaceTime.hours || '00'}:${formData.recentRaceTime.minutes || '00'}:${formData.recentRaceTime.seconds || '00'}`
        : '',
      goalTime: formData.goalRaceDistance && (formData.goalRaceTime.hours || formData.goalRaceTime.minutes || formData.goalRaceTime.seconds)
        ? `${formData.goalRaceDistance} ${formData.goalRaceTime.hours || '00'}:${formData.goalRaceTime.minutes || '00'}:${formData.goalRaceTime.seconds || '00'}`
        : '',
      paceZones: formData.paceZones || '',
      longRunDay: formData.longRunDay || '',
      // Strength
      strengthLevel: formData.strengthLevel,
      strengthEnvironment: formData.trainingEnvironment,
      strengthDays: formData.strengthDays,
      availableEquipment: formData.equipment,
      includeRecovery: formData.includeRecovery,
    }
    try {
      const response = await fetch('/api/generatePlan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData?.error || 'Failed to generate plan')
      }
      const data = await response.json()
      console.log('Generated plan data:', data)
      if (!data.plan) {
        throw new Error('No plan data received from server')
      }
      // Close the wizard and let the parent component handle the plan update
      onClose(data.plan)
    } catch (error: any) {
      console.error('Plan generation error:', error)
      setErrorMsg(error.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative bg-gradient-to-b from-[#0A0A0A] to-[#1C1C2E] rounded-xl max-w-4xl w-full border border-white/10 overflow-hidden max-h-[90vh] flex flex-col"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary"></div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
          >
            <X size={20} />
            <span className="sr-only">Close</span>
          </Button>

          {/* Progress indicator */}
          <div className="p-6 border-b border-white/10">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-exo font-black">Create Your Training Plan</h2>
              <div className="text-sm text-gray-400 font-barlow">
                Step {currentStep} of {totalSteps}
              </div>
            </div>
            <div className="mt-4 h-1 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-secondary"
                initial={{ width: `${((currentStep - 1) / totalSteps) * 100}%` }}
                animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                transition={{ duration: 0.3 }}
              ></motion.div>
            </div>
          </div>

          <div className="overflow-y-auto p-6 flex-grow">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <RunningProfileStep key="step1" formData={formData} updateFormData={updateFormData} />
              )}
              {currentStep === 2 && (
                <StrengthSetupStep
                  key="step2"
                  formData={formData}
                  updateFormData={updateFormData}
                  runDays={formData.trainingDays}
                />
              )}
            </AnimatePresence>
          </div>

          <div className="p-6 border-t border-white/10 flex justify-between">
            {/* Error message display */}
            {errorMsg && (
              <div className="mb-4 text-red-500 text-center font-barlow w-full">{errorMsg}</div>
            )}
            <Button
              variant="outline"
              onClick={currentStep === 1 ? onClose : handleBack}
              className="bg-black/50 border-white/20 hover:bg-white/5 text-white"
            >
              {currentStep === 1 ? "Cancel" : "Back"}
            </Button>
            <Button
              onClick={currentStep === totalSteps ? handleSubmit : handleNext}
              className="btn-primary font-barlow"
              disabled={loading}
            >
              {loading
                ? "Generating..."
                : currentStep === totalSteps
                ? "Generate Plan"
                : "Continue"}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
