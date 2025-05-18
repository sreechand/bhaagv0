"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronLeft, ChevronRight, Dumbbell, MonitorIcon as Running } from "lucide-react"

interface PlanPreviewStepProps {
  formData: any
}

// Mock data for the plan preview .
const mockWeekPlan = [
  {
    day: "Monday",
    workouts: [
      {
        type: "run",
        title: "Easy Run",
        description: "30 min at Zone 2 (conversational pace)",
        icon: Running,
      },
    ],
  },
  {
    day: "Tuesday",
    workouts: [
      {
        type: "run",
        title: "Interval Training",
        description: "6 x 400m repeats with 2 min recovery",
        icon: Running,
      },
    ],
  },
  {
    day: "Wednesday",
    workouts: [
      {
        type: "strength",
        title: "Lower Body Strength",
        description: "30 min focusing on legs and core",
        icon: Dumbbell,
      },
    ],
  },
  {
    day: "Thursday",
    workouts: [
      {
        type: "run",
        title: "Tempo Run",
        description: "25 min with middle 15 min at threshold pace",
        icon: Running,
      },
    ],
  },
  {
    day: "Friday",
    workouts: [
      {
        type: "rest",
        title: "Rest Day",
        description: "Active recovery or light stretching",
        icon: Calendar,
      },
    ],
  },
  {
    day: "Saturday",
    workouts: [
      {
        type: "strength",
        title: "Upper Body & Core",
        description: "30 min focusing on upper body and core",
        icon: Dumbbell,
      },
    ],
  },
  {
    day: "Sunday",
    workouts: [
      {
        type: "run",
        title: "Long Run",
        description: "45-60 min at easy pace",
        icon: Running,
      },
    ],
  },
]

export default function PlanPreviewStep({ formData }: PlanPreviewStepProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handlePreviewClick = () => {
    setIsLoading(true)
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false)
      setShowPreview(true)
    }, 1500)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div>
        <h3 className="text-xl font-exo font-bold mb-4">Plan Preview</h3>
        <p className="text-gray-300 font-barlow mb-6">Preview your personalized training plan before generating it.</p>
      </div>

      <div className="bg-black/30 rounded-xl p-6 border border-white/10">
        <h4 className="text-lg font-exo font-bold mb-4">Your Plan Summary</h4>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 font-barlow text-sm">Running Level</p>
              <p className="font-barlow font-semibold">
                {formData.runningLevel
                  ? formData.runningLevel.charAt(0).toUpperCase() + formData.runningLevel.slice(1)
                  : "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-gray-400 font-barlow text-sm">Primary Goal</p>
              <p className="font-barlow font-semibold">
                {formData.primaryGoal ? formData.primaryGoal.toUpperCase() : "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-gray-400 font-barlow text-sm">Training Days</p>
              <p className="font-barlow font-semibold">
                {formData.trainingDays.length > 0
                  ? formData.trainingDays.map((day: string) => day.charAt(0).toUpperCase() + day.slice(1)).join(", ")
                  : "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-gray-400 font-barlow text-sm">Strength Days</p>
              <p className="font-barlow font-semibold">
                {formData.strengthDays.length > 0
                  ? formData.strengthDays.map((day: string) => day.charAt(0).toUpperCase() + day.slice(1)).join(", ")
                  : "Not specified"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {!showPreview ? (
        <div className="flex justify-center">
          <Button
            onClick={handlePreviewClick}
            disabled={isLoading}
            className="bg-primary text-black font-bold py-3 px-8 rounded-md transition-all duration-300 hover:scale-105 hover:glow"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                Generating Preview...
              </div>
            ) : (
              "Preview Plan"
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-exo font-bold">Sample Week</h4>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" className="rounded-full bg-black/30 border-white/20">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-barlow">Week 1</span>
              <Button variant="outline" size="icon" className="rounded-full bg-black/30 border-white/20">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {mockWeekPlan.map((day, index) => (
              <motion.div
                key={day.day}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-black/30 rounded-lg border border-white/10 overflow-hidden"
              >
                <div className="bg-black/50 p-2 text-center font-barlow font-semibold border-b border-white/10">
                  {day.day}
                </div>
                <div className="p-3 space-y-3">
                  {day.workouts.map((workout, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg ${
                        workout.type === "run"
                          ? "bg-primary/10 border border-primary/30"
                          : workout.type === "strength"
                            ? "bg-secondary/10 border border-secondary/30"
                            : "bg-gray-800/50 border border-white/10"
                      }`}
                    >
                      <div className="flex items-center mb-1">
                        <workout.icon
                          className={`h-4 w-4 mr-2 ${workout.type === "run" ? "text-primary" : workout.type === "strength" ? "text-secondary" : "text-gray-400"}`}
                        />
                        <span className="font-barlow font-semibold text-sm">{workout.title}</span>
                      </div>
                      <p className="text-xs text-gray-300 font-barlow">{workout.description}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-black/30 rounded-lg p-4 border border-primary/30">
            <p className="text-sm text-gray-300 font-barlow">
              This is a sample of your first week. Your actual plan will be 8-16 weeks long depending on your goal and
              will adapt based on your progress and feedback.
            </p>
          </div>
        </div>
      )}
    </motion.div>
  )
}
