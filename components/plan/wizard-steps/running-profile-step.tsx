"use client"
import { motion } from "framer-motion"
import { HelpCircle } from "lucide-react"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface RunningProfileStepProps {
  formData: any
  updateFormData: (data: any) => void
}

const runningLevels = [
  {
    value: "beginner",
    label: "Beginner",
    description: "New to running or running less than 6 months",
  },
  {
    value: "intermediate",
    label: "Intermediate",
    description: "Running regularly for 6+ months",
  },
  {
    value: "advanced",
    label: "Advanced",
    description: "Experienced runner with multiple races completed",
  },
]

const primaryGoals = [
  { value: "fitness", label: "Fitness" },
  { value: "5k", label: "5K" },
  { value: "10k", label: "10K" },
  { value: "half_marathon", label: "Half Marathon" },
  { value: "marathon", label: "Marathon" },
  { value: "ultra", label: "Ultra" },
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

const raceDistances = [
  { value: "5k", label: "5K" },
  { value: "10k", label: "10K" },
  { value: "half_marathon", label: "Half Marathon" },
  { value: "marathon", label: "Marathon" },
  { value: "ultra", label: "Ultra" },
]

export default function RunningProfileStep({ formData, updateFormData }: RunningProfileStepProps) {
  const handleDayToggle = (day: string) => {
    const currentDays = [...formData.trainingDays]
    if (currentDays.includes(day)) {
      updateFormData({ trainingDays: currentDays.filter((d) => d !== day) })
    } else {
      updateFormData({ trainingDays: [...currentDays, day] })
    }
  }

  const handleTimeChange = (
    field: "recentRaceTime" | "goalRaceTime",
    unit: "hours" | "minutes" | "seconds",
    value: string,
  ) => {
    // Ensure value is numeric and within range
    const numValue = value === "" ? "" : Math.min(Number.parseInt(value), unit === "hours" ? 99 : 59).toString()

    updateFormData({
      [field]: {
        ...formData[field],
        [unit]: numValue,
      },
    })
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
          <h3 className="text-xl font-exo font-bold mb-4">Running Profile</h3>
          <p className="text-gray-300 font-barlow mb-6">
            Tell us about your running experience and goals so we can create a personalized plan.
          </p>
        </div>

        {/* Running Level */}
        <div className="space-y-4">
          <div className="flex items-center">
            <Label className="text-lg font-barlow font-semibold">Running Proficiency</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-gray-400 ml-2 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Select the option that best describes your current running experience.</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <RadioGroup
            value={formData.runningLevel}
            onValueChange={(value) => updateFormData({ runningLevel: value })}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {runningLevels.map((level) => (
              <div key={level.value} className="relative">
                <RadioGroupItem value={level.value} id={`running-level-${level.value}`} className="peer sr-only" />
                <Label
                  htmlFor={`running-level-${level.value}`}
                  className="flex flex-col p-4 bg-black/30 rounded-lg border border-white/10 peer-data-[state=checked]:border-primary peer-data-[state=checked]:glow cursor-pointer hover:bg-black/40 transition-all duration-200"
                >
                  <span className="font-exo font-bold text-lg mb-1">{level.label}</span>
                  <span className="text-sm text-gray-300 font-barlow">{level.description}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Primary Goal */}
        <div className="space-y-4">
          <Label className="text-lg font-barlow font-semibold">Primary Goal</Label>
          <div className="flex flex-wrap gap-3">
            {primaryGoals.map((goal) => (
              <button
                key={goal.value}
                type="button"
                onClick={() => updateFormData({ primaryGoal: goal.value })}
                className={`px-4 py-2 rounded-full font-barlow font-medium transition-all duration-200 ${
                  formData.primaryGoal === goal.value
                    ? "bg-primary text-black glow"
                    : "bg-black/30 border border-white/10 hover:border-primary/50"
                }`}
              >
                {goal.label}
              </button>
            ))}
          </div>
        </div>

        {/* Training Days */}
        <div className="space-y-4">
          <Label className="text-lg font-barlow font-semibold">Preferred Training Days</Label>
          <div className="flex flex-wrap gap-3">
            {weekdays.map((day) => (
              <button
                key={day.value}
                type="button"
                onClick={() => handleDayToggle(day.value)}
                className={`w-12 h-12 rounded-full font-barlow font-medium flex items-center justify-center transition-all duration-200 ${
                  formData.trainingDays.includes(day.value)
                    ? "bg-primary text-black glow"
                    : "bg-black/30 border border-white/10 hover:border-primary/50"
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-400 font-barlow">
            Select {formData.primaryGoal === "fitness" || formData.primaryGoal === "5k" ? "3-4" : "4-6"} days for
            optimal training.
          </p>
        </div>

        {/* Optional Race Times */}
        <div className="space-y-6 border-t border-white/10 pt-6">
          <h4 className="text-lg font-exo font-semibold">Optional Information</h4>

          {/* Recent Race Time */}
          <div className="space-y-3">
            <Label className="text-md font-barlow">Recent Race Time (if any)</Label>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  min="0"
                  max="99"
                  placeholder="HH"
                  value={formData.recentRaceTime.hours}
                  onChange={(e) => handleTimeChange("recentRaceTime", "hours", e.target.value)}
                  className="w-16 bg-black/30 border-white/20"
                />
                <span className="text-xl">:</span>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  placeholder="MM"
                  value={formData.recentRaceTime.minutes}
                  onChange={(e) => handleTimeChange("recentRaceTime", "minutes", e.target.value)}
                  className="w-16 bg-black/30 border-white/20"
                />
                <span className="text-xl">:</span>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  placeholder="SS"
                  value={formData.recentRaceTime.seconds}
                  onChange={(e) => handleTimeChange("recentRaceTime", "seconds", e.target.value)}
                  className="w-16 bg-black/30 border-white/20"
                />
              </div>

              <Select
                value={formData.recentRaceDistance}
                onValueChange={(value) => updateFormData({ recentRaceDistance: value })}
              >
                <SelectTrigger className="w-40 bg-black/30 border-white/20">
                  <SelectValue placeholder="Distance" />
                </SelectTrigger>
                <SelectContent>
                  {raceDistances.map((distance) => (
                    <SelectItem key={distance.value} value={distance.value}>
                      {distance.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Goal Race Time */}
          <div className="space-y-3">
            <Label className="text-md font-barlow">Goal Race Time (if any)</Label>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  min="0"
                  max="99"
                  placeholder="HH"
                  value={formData.goalRaceTime.hours}
                  onChange={(e) => handleTimeChange("goalRaceTime", "hours", e.target.value)}
                  className="w-16 bg-black/30 border-white/20"
                />
                <span className="text-xl">:</span>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  placeholder="MM"
                  value={formData.goalRaceTime.minutes}
                  onChange={(e) => handleTimeChange("goalRaceTime", "minutes", e.target.value)}
                  className="w-16 bg-black/30 border-white/20"
                />
                <span className="text-xl">:</span>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  placeholder="SS"
                  value={formData.goalRaceTime.seconds}
                  onChange={(e) => handleTimeChange("goalRaceTime", "seconds", e.target.value)}
                  className="w-16 bg-black/30 border-white/20"
                />
              </div>

              <Select
                value={formData.goalRaceDistance}
                onValueChange={(value) => updateFormData({ goalRaceDistance: value })}
              >
                <SelectTrigger className="w-40 bg-black/30 border-white/20">
                  <SelectValue placeholder="Distance" />
                </SelectTrigger>
                <SelectContent>
                  {raceDistances.map((distance) => (
                    <SelectItem key={distance.value} value={distance.value}>
                      {distance.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </motion.div>
    </TooltipProvider>
  )
}
