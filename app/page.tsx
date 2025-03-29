"use client"

import { useEffect, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import WhyBhaag from "@/components/why-bhaag"
import KeyFeatures from "@/components/key-features"
import Testimonials from "@/components/testimonials"
import SamplePlan from "@/components/sample-plan"
import Faq from "@/components/faq"
import ComingSoon from "@/components/coming-soon"
import Footer from "@/components/footer"
import LoginModal from "@/components/login-modal"
import SamplePlanModal from "@/components/sample-plan-modal"

export default function Home() {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSamplePlanModal, setShowSamplePlanModal] = useState(false)
  const { scrollYProgress } = useScroll()
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"])

  useEffect(() => {
    if (showLoginModal || showSamplePlanModal) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [showLoginModal, showSamplePlanModal])

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-[#0A0A0A] to-[#1C1C2E] text-white">
      <motion.div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ y: backgroundY }}>
        <div className="absolute inset-0 bg-[url('/background-grid.svg')] bg-repeat opacity-10"></div>
      </motion.div>

      <div className="relative z-10">
        <Navbar onLoginClick={() => setShowLoginModal(true)} />
        <Hero onGetStartedClick={() => setShowLoginModal(true)} />
        <WhyBhaag />
        <KeyFeatures />
        <Testimonials />
        <SamplePlan onPreviewClick={() => setShowSamplePlanModal(true)} />
        <Faq />
        <ComingSoon />
        <Footer />
      </div>

      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}

      {showSamplePlanModal && <SamplePlanModal onClose={() => setShowSamplePlanModal(false)} />}
    </main>
  )
}

