"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"

interface SamplePlanProps {
  onPreviewClick: () => void
}

export default function SamplePlan({ onPreviewClick }: SamplePlanProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, amount: 0.2 })

  return (
    <section id="sample" className="py-20 relative bg-black/30">
      <div className="container mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="mb-4">Want to See a Sample Plan?</h2>
          <p className="text-xl text-gray-300 mb-8 font-barlow">
            Preview what a personalized BHAAG training plan looks like before you commit.
          </p>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
            <Button onClick={onPreviewClick} className="btn-primary text-lg group font-barlow">
              <Calendar className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
              Preview a 7-Day Plan
            </Button>
          </motion.div>

          <p className="mt-4 text-gray-400 text-sm font-barlow">
            Your real plan will adapt to your feedback and schedule.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

