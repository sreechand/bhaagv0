"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { X, Calendar, Clock, Dumbbell, MonitorIcon as Running } from "lucide-react"

interface SamplePlanModalProps {
  onClose: () => void
}

export default function SamplePlanModal({ onClose }: SamplePlanModalProps) {
  const weekPlan = [
    {
      day: "Monday",
      title: "Easy Run + Core",
      description: "30 min easy run (Zone 2) + 10 min core workout",
      icon: Running,
      color: "text-green-400",
    },
    {
      day: "Tuesday",
      title: "Strength Training",
      description: "Lower body focus: squats, lunges, and hip exercises",
      icon: Dumbbell,
      color: "text-purple-400",
    },
    {
      day: "Wednesday",
      title: "Interval Training",
      description: "6 x 400m repeats with 2 min recovery",
      icon: Running,
      color: "text-yellow-400",
    },
    {
      day: "Thursday",
      title: "Rest Day",
      description: "Active recovery: light stretching or yoga",
      icon: Clock,
      color: "text-blue-400",
    },
    {
      day: "Friday",
      title: "Tempo Run",
      description: "25 min with middle 15 min at threshold pace",
      icon: Running,
      color: "text-red-400",
    },
    {
      day: "Saturday",
      title: "Strength + Mobility",
      description: "Upper body and core + hip mobility routine",
      icon: Dumbbell,
      color: "text-purple-400",
    },
    {
      day: "Sunday",
      title: "Long Run",
      description: "45-60 min at conversational pace",
      icon: Running,
      color: "text-green-400",
    },
  ]

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative bg-gradient-to-b from-[#0A0A0A] to-[#1C1C2E] rounded-xl max-w-2xl w-full border border-white/10 overflow-hidden max-h-[90vh] flex flex-col"
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

          <div className="p-6 border-b border-white/10">
            <div className="flex items-center">
              <Calendar className="mr-2 text-primary" size={24} />
              <h2 className="text-3xl font-exo font-black">Sample 5K Training Plan</h2>
            </div>
            <p className="text-gray-400 font-barlow mt-1">
              A balanced week of running and strength training for a 5K race
            </p>
          </div>

          <div className="overflow-y-auto p-6 flex-grow">
            <div className="space-y-4">
              {weekPlan.map((day, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border-gradient bg-black/40 rounded-lg p-4"
                >
                  <div className="flex items-start">
                    <div className={`p-3 rounded-full bg-black/50 mr-4 ${day.color}`}>
                      <day.icon size={20} />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-exo font-bold text-xl">{day.day}</h3>
                        <span className="ml-2 px-2 py-0.5 bg-white/10 rounded text-xs font-medium text-gray-300">
                          {day.title}
                        </span>
                      </div>
                      <p className="text-gray-300 font-barlow mt-1">{day.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 bg-primary/10 border border-primary/30 rounded-lg p-4">
              <h3 className="font-exo font-bold text-xl mb-2 text-primary">How Your Real Plan Will Differ</h3>
              <ul className="space-y-2 text-gray-300 font-barlow">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Adapts based on your current fitness level and goals</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Adjusts workout intensity based on your feedback</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Reschedules workouts around your availability</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Provides detailed instructions for each exercise</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="p-6 border-t border-white/10">
            <Button onClick={onClose} className="w-full btn-primary font-barlow">
              Get Your Personalized Plan
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

