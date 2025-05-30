"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, useScroll, useTransform } from "framer-motion"
import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import WhyBhaag from "@/components/why-bhaag"
import KeyFeatures from "@/components/key-features"
import Testimonials from "@/components/testimonials"
import SamplePlan from "@/components/sample-plan"
import FAQ from "@/components/faq"
import ComingSoon from "@/components/coming-soon"
import Footer from "@/components/footer"
import SamplePlanModal from "@/components/sample-plan-modal"
import { StravaRunModal } from "@/components/Modal"
import { supabase } from "@/lib/supabaseClient"

export default function Home() {
  const [showSamplePlanModal, setShowSamplePlanModal] = useState(false)
  const [showStravaRunModal, setShowStravaRunModal] = useState(false)
  const router = useRouter()
  const { scrollYProgress } = useScroll()
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"])

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push("/dashboard")
      }
    }
    checkUser()
  }, [router])

  useEffect(() => {
    if (showSamplePlanModal) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [showSamplePlanModal])

  const handleLoginClick = () => {
    router.push("/auth/login")
  }

  return (
    <main className="relative w-full min-h-screen bg-gradient-to-b from-[#0A0A0A] to-[#1C1C2E] text-white">
      <motion.div className="fixed inset-0 z-0 opacity-20 pointer-events-none" style={{ y: backgroundY }}>
        <div className="absolute inset-0 bg-[url('/background-grid.svg')] bg-repeat opacity-10"></div>
      </motion.div>

      <div className="relative z-10 w-full">
        <Navbar onLoginClick={handleLoginClick} />
        <Hero onGetStartedClick={handleLoginClick} />
        <WhyBhaag />
        <KeyFeatures />
        <Testimonials />
        <SamplePlan onPreviewClick={() => setShowSamplePlanModal(true)} />
        <FAQ />
        <ComingSoon />
        <div className="flex justify-center my-8">
          <button
            onClick={() => setShowStravaRunModal(true)}
            className="px-6 py-3 rounded-lg font-medium text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-700/20 transform transition-all duration-200 hover:translate-y-[-1px] active:translate-y-[1px]"
          >
            Show Strava Run Modal
          </button>
        </div>
      </div>

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
    </main>
  )
}

