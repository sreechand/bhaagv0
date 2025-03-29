"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const testimonials = [
  {
    quote:
      "BHAAG helped me go from couch to 5K in just 8 weeks. The adaptive training plan was perfect for my busy schedule.",
    name: "Sarah J.",
    title: "Beginner Runner",
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    quote: "As a marathon runner, I was skeptical about AI coaching. BHAAG proved me wrong - I PR'd by 12 minutes!",
    name: "Michael T.",
    title: "Marathon Runner",
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    quote:
      "The strength training integration is what sets BHAAG apart. My running form improved dramatically after just one month.",
    name: "Priya K.",
    title: "Trail Runner",
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    quote:
      "When I had to skip a week due to illness, BHAAG adjusted my plan perfectly. No other app does this so intelligently.",
    name: "David L.",
    title: "Ultra Runner",
    image: "/placeholder.svg?height=80&width=80",
  },
]

export default function Testimonials() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, amount: 0.2 })
  const [activeIndex, setActiveIndex] = useState(0)

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="mb-4">What Runners Are Saying</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto font-barlow">
            <span className="text-primary font-semibold">3,000+</span> personalized plans created and counting
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden">
            <motion.div
              className="flex transition-all duration-500 ease-in-out"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                x: `-${activeIndex * 100}%`,
              }}
              transition={{ duration: 0.5 }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="w-full flex-shrink-0 px-4">
                  <div className="border-gradient bg-black/40 rounded-xl p-8 relative">
                    <Quote className="absolute top-6 left-6 text-primary/20" size={40} />
                    <div className="relative z-10">
                      <p className="text-xl mb-6 font-barlow">"{testimonial.quote}"</p>
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full overflow-hidden mr-4 border border-primary/30">
                          <img
                            src={testimonial.image || "/placeholder.svg"}
                            alt={testimonial.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-exo font-bold text-xl">{testimonial.name}</h4>
                          <p className="text-gray-400 text-sm font-barlow">{testimonial.title}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  activeIndex === index ? "bg-primary" : "bg-gray-600"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-4 hidden md:block">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevTestimonial}
              className="rounded-full bg-black/50 hover:bg-black/70 text-white"
            >
              <ChevronLeft size={24} />
              <span className="sr-only">Previous testimonial</span>
            </Button>
          </div>

          <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-4 hidden md:block">
            <Button
              variant="ghost"
              size="icon"
              onClick={nextTestimonial}
              className="rounded-full bg-black/50 hover:bg-black/70 text-white"
            >
              <ChevronRight size={24} />
              <span className="sr-only">Next testimonial</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

