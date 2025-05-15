"use client"

import { motion } from "framer-motion"
import { AlertTriangle, HelpCircle } from "lucide-react"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface StrengthSetupStepProps {
  formData: any
  updateFormData: (data: any) => void
  runDays: string[]
}

const strengthLevels = [
  {
    value: "beginner",
    label: "Beginner",
    description: "New to strength training",
  },
  {
    value: "intermediate",
    label: "Intermediate",
    description: "Some strength training experience",
  },
  {
    value: "advanced",
    label: "Advanced",
    description: "Experienced with strength training",
  },
]

const trainingEnvironments = [
  {
    value: "home",
    label: "Home",
    description: "Train with minimal equipment at home",
  },
  {
    value: "gym",
    label: "Gym",
    description: "Access to full gym equipment",
  },
]

const weekdays = [
  { value: "mon", label: "Mon" },
  { value: "tue", label: "Tue" },
  { value: "wed", label: "Wed" },
  { value: "thu", label: "Thu" },
  { value: "fri", label: "Fri" },
  { value: "sat", label: "Sat" },
  { value: "sun", label: "Sun" },
]

const homeEquipment = [
  { id: "bands", label: "Resistance Bands" },
  { id: "dumbbells", label: "Dumbbells" },
  { id: "kettlebells", label: "Kettlebells" },
  { id: "bodyweight", label: "Bodyweight Only" },
  { id: "yoga-mat", label: "Yoga Mat" },
  { id: "step-platform", label: "Step Platform" },
  { id: "trx", label: "TRX/Suspension Trainer" },
]

const gymEquipment = [
  { id: "machines", label: "Weight Machines" },
  { id: "barbells", label: "Barbells" },
  { id: "cable-stations", label: "Cable Stations" },
  { id: "free-weights", label: "Free Weights" },
  { id: "smith-machine", label: "Smith Machine" },
  { id: "row-machine", label: "Rowing Machine" },
]

export default function StrengthSetupStep({ formData, updateFormData, runDays }: StrengthSetupStepProps) {
  const handleDayToggle = (day: string) => {
    const currentDays = [...formData.strengthDays]
    if (currentDays.includes(day)) {
      updateFormData({ strengthDays: currentDays.filter((d) => d !== day) })
    } else {
      updateFormData({ strengthDays: [...currentDays, day] })
    }
  }

  const handleEquipmentToggle = (item: string) => {
    const currentEquipment = [...formData.equipment]
    if (currentEquipment.includes(item)) {
      updateFormData({ equipment: currentEquipment.filter((e) => e !== item) })
    } else {
      updateFormData({ equipment: [...currentEquipment, item] })
    }
  }

  // Check for potential conflicts between running and strength days
  const getConflictWarning = (day: string) => {
    // Hard run days are typically Tuesday (intervals), Thursday (tempo), and Sunday (long run)
    const hardRunDays = ["tue", "thu", "sun"]
    if (runDays.includes(day) && hardRunDays.includes(day)) {
      return "Potential conflict with hard run day"
    }
    return null
  }

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-8"
      >
        <div>
          <h3 className="text-xl font-exo font-bold mb-4">Strength Training Setup</h3>
          <p className="text-gray-300 font-barlow mb-6">
            Configure your strength training to complement your running plan.
          </p>
        </div>

        {/* Strength Level */}
        <div className="space-y-4">
          <div className="flex items-center">
            <Label className="text-lg font-barlow font-semibold">Strength Level</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-gray-400 ml-2 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Select the option that best describes your current strength training experience.</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <RadioGroup
            value={formData.strengthLevel}
            onValueChange={(value) => updateFormData({ strengthLevel: value })}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {strengthLevels.map((level) => (
              <div key={level.value} className="relative">
                <RadioGroupItem value={level.value} id={`strength-level-${level.value}`} className="peer sr-only" />
                <Label
                  htmlFor={`strength-level-${level.value}`}
                  className="flex flex-col p-4 bg-black/30 rounded-lg border border-white/10 peer-data-[state=checked]:border-primary peer-data-[state=checked]:glow cursor-pointer hover:bg-black/40 transition-all duration-200"
                >
                  <span className="font-exo font-bold text-lg mb-1">{level.label}</span>
                  <span className="text-sm text-gray-300 font-barlow">{level.description}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Training Environment */}
        <div className="space-y-4">
          <Label className="text-lg font-barlow font-semibold">Training Environment</Label>
          <RadioGroup
            value={formData.trainingEnvironment}
            onValueChange={(value) => updateFormData({ trainingEnvironment: value, equipment: [] })}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {trainingEnvironments.map((env) => (
              <div key={env.value} className="relative">
                <RadioGroupItem value={env.value} id={`training-env-${env.value}`} className="peer sr-only" />
                <Label
                  htmlFor={`training-env-${env.value}`}
                  className="flex flex-col p-4 bg-black/30 rounded-lg border border-white/10 peer-data-[state=checked]:border-primary peer-data-[state=checked]:glow cursor-pointer hover:bg-black/40 transition-all duration-200"
                >
                  <span className="font-exo font-bold text-lg mb-1">{env.label}</span>
                  <span className="text-sm text-gray-300 font-barlow">{env.description}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Strength Days */}
        <div className="space-y-4">
          <Label className="text-lg font-barlow font-semibold">Preferred Strength Days</Label>
          <div className="flex flex-wrap gap-3">
            {weekdays.map((day) => {
              const conflict = getConflictWarning(day.value)
              return (
                <Tooltip key={day.value}>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => handleDayToggle(day.value)}
                        className={`w-12 h-12 rounded-full font-barlow font-medium flex items-center justify-center transition-all duration-200 ${
                          formData.strengthDays.includes(day.value)
                            ? conflict
                              ? "bg-yellow-500 text-black"
                              : "bg-primary text-black glow"
                            : "bg-black/30 border border-white/10 hover:border-primary/50"
                        }`}
                      >
                        {day.label}
                      </button>
                      {conflict && formData.strengthDays.includes(day.value) && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                          <AlertTriangle className="w-3 h-3 text-black" />
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  {conflict && (
                    <TooltipContent side="top">
                      <p className="text-yellow-500">{conflict}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              )
            })}
          </div>
          <p className="text-sm text-gray-400 font-barlow">
            Select 2-3 days for optimal strength training. Try to avoid scheduling strength on hard run days.
          </p>
        </div>

        {/* Equipment */}
        <div className="space-y-4">
          <Label className="text-lg font-barlow font-semibold">Available Equipment</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(formData.trainingEnvironment === "home" ? homeEquipment : gymEquipment).map((item) => (
              <div key={item.id} className="flex items-center space-x-2">
                <Checkbox
                  id={item.id}
                  checked={formData.equipment.includes(item.id)}
                  onCheckedChange={() => handleEquipmentToggle(item.id)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <label
                  htmlFor={item.id}
                  className="text-sm font-barlow leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {item.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Recovery Sessions */}
        <div className="space-y-4 border-t border-white/10 pt-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-recovery"
              checked={formData.includeRecovery}
              onCheckedChange={(checked) => updateFormData({ includeRecovery: checked })}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="include-recovery"
                className="text-md font-barlow font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Include strength recovery sessions
              </label>
              <p className="text-sm text-gray-400 font-barlow">
                Add light recovery sessions to improve mobility and prevent injuries
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </TooltipProvider>
  )
}
