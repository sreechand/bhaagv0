"use client"

import { useRef, useState } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    question: "What if I miss a run?",
    answer:
      "No problem! BHAAG's AI will automatically adjust your future workouts based on your missed session. The app analyzes your training history and adapts your plan to keep you on track toward your goals.",
  },
  {
    question: "Do I need a gym?",
    answer:
      "Not at all. BHAAG creates strength workouts that can be done at home with minimal or no equipment. If you do have access to a gym, the app will incorporate more varied exercises into your plan.",
  },
  {
    question: "Can beginners use this?",
    answer:
      "BHAAG is designed for runners of all levels. For beginners, the app starts with walk-run intervals and gradually builds your endurance. The AI ensures you progress at a safe, sustainable pace.",
  },
  {
    question: "Is Strava required?",
    answer:
      "No, Strava integration is optional. While connecting Strava enhances the experience by automatically importing your runs, you can manually log your workouts directly in the BHAAG app.",
  },
  {
    question: "Does the plan change every day?",
    answer:
      "Yes! Your plan dynamically adapts based on your performance, feedback, and life circumstances. If you're feeling great, BHAAG might increase intensity. If you're fatigued, it will suggest recovery. This continuous adaptation is what makes BHAAG different from static training plans.",
  },
]

export default function Faq() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, amount: 0.2 })

  return (
    <section id="faq" className="py-20 relative">
      <div className="container mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto font-barlow">Everything you need to know about BHAAG</p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <FaqItem key={index} question={faq.question} answer={faq.answer} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

interface FaqItemProps {
  question: string
  answer: string
  index: number
}

function FaqItem({ question, answer, index }: FaqItemProps) {
  const [isOpen, setIsOpen] = useState(false)
  const itemRef = useRef(null)
  const isInView = useInView(itemRef, { once: false, amount: 0.3 })

  return (
    <motion.div
      ref={itemRef}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="mb-4"
    >
      <div className="border-gradient bg-black/40 rounded-lg overflow-hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-6 flex justify-between items-center text-left focus:outline-none"
        >
          <h3 className="text-xl font-exo font-bold tracking-wide">{question}</h3>
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronDown className="text-primary" />
          </motion.div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-6 pt-0 border-t border-white/10">
                <p className="text-gray-300 font-barlow">{answer}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

