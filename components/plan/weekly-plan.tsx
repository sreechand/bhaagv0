"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { AlertCircle, Calendar, ChevronLeft, ChevronRight, Dumbbell, MonitorIcon as Running } from "lucide-react"
import { Button } from "@/components/ui/button"

// Mock data for the weekly plan
const mockWeeks = [
  {
    weekNumber: 1,
    days: [
      {
        day: "Monday",
        workouts: [
          {
            id: "w1",
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
            id: "w2",
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
            id: "w3",
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
            id: "w4",
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
            id: "w5",
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
            id: "w6",
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
            id: "w7",
            type: "run",
            title: "Long Run",
            description: "45-60 min at easy pace",
            icon: Running,
          },
        ],
      },
    ],
  },
  // Additional weeks would be added here
]

export default function WeeklyPlan() {
  const [currentWeek, setCurrentWeek] = useState(0)
  const [conflicts, setConflicts] = useState<string[]>([])

  const handlePrevWeek = () => {
    if (currentWeek > 0) {
      setCurrentWeek(currentWeek - 1)
    }
  }

  const handleNextWeek = () => {
    if (currentWeek < mockWeeks.length - 1) {
      setCurrentWeek(currentWeek + 1)
    }
  }

  // This would be a real function that checks for conflicts
  const checkForConflicts = () => {
    // For demonstration purposes, we'll just mark Tuesday and Thursday as having conflicts
    setConflicts(["Tuesday", "Thursday"])
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl md:text-5xl font-exo font-black mb-2">Your Training Plan</h1>
          <p className="text-xl text-gray-300 font-barlow">Drag and drop workouts to customize your schedule</p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevWeek}
            disabled={currentWeek === 0}
            className="rounded-full bg-black/30 border-white/20 hover:bg-black/50"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-barlow px-2">
            Week {mockWeeks[currentWeek].weekNumber} of {mockWeeks.length}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextWeek}
            disabled={currentWeek === mockWeeks.length - 1}
            className="rounded-full bg-black/30 border-white/20 hover:bg-black/50"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Weekly Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {mockWeeks[currentWeek].days.map((day, index) => (
          <motion.div
            key={day.day}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`bg-black/30 rounded-lg border ${
              conflicts.includes(day.day) ? "border-red-500" : "border-white/10"
            } overflow-hidden min-h-[200px]`}
          >
            <div className="bg-black/50 p-2 text-center font-barlow font-semibold border-b border-white/10 relative">
              {day.day}
              {conflicts.includes(day.day) && (
                <div className="absolute top-2 right-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </div>
              )}
            </div>
            <div className="p-3 space-y-3">
              {day.workouts.map((workout) => (
                <motion.div
                  key={workout.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-3 rounded-lg cursor-move ${
                    workout.type === "run"
                      ? "bg-primary/10 border border-primary/30"
                      : workout.type === "strength"
                        ? "bg-secondary/10 border border-secondary/30"
                        : "bg-gray-800/50 border border-white/10"
                  }`}
                >
                  <div className="flex items-center mb-1">
                    <workout.icon
                      className={`h-4 w-4 mr-2 ${
                        workout.type === "run"
                          ? "text-primary"
                          : workout.type === "strength"
                            ? "text-secondary"
                            : "text-gray-400"
                      }`}
                    />
                    <span className="font-barlow font-semibold text-sm">{workout.title}</span>
                  </div>
                  <p className="text-xs text-gray-300 font-barlow">{workout.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Weekly Summary */}
      <div className="bg-black/30 rounded-lg p-6 border border-white/10">
        <h3 className="text-xl font-exo font-bold mb-4">Weekly Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-gray-400 font-barlow text-sm mb-2">Fatigue Score (1-10)</label>
            <input
              type="range"
              min="1"
              max="10"
              defaultValue="5"
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          <div>
            <label className="block text-gray-400 font-barlow text-sm mb-2">Any Injuries?</label>
            <select className="w-full p-2 rounded-md bg-black/50 border border-white/20 text-white font-barlow">
              <option value="none">None</option>
              <option value="minor">Minor (can train)</option>
              <option value="moderate">Moderate (limited training)</option>
              <option value="severe">Severe (cannot train)</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-400 font-barlow text-sm mb-2">Comments</label>
            <textarea
              className="w-full p-2 rounded-md bg-black/50 border border-white/20 text-white font-barlow"
              rows={2}
              placeholder="Any additional notes..."
            ></textarea>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button className="bg-primary text-black font-bold hover:glow font-barlow">Submit Weekly Feedback</Button>
        </div>
      </div>

      {/* Conflict Warning */}
      {conflicts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-black/30 border border-red-500/30 rounded-lg flex items-start gap-3"
        >
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-barlow font-semibold text-red-500">Scheduling Conflicts Detected</h4>
            <p className="text-gray-300 font-barlow text-sm">
              There are potential conflicts in your schedule. Hard workouts scheduled back-to-back may lead to increased
              injury risk and decreased performance.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
