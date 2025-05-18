"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface TeamMember {
  name: string
  role: string
  bio: string
  image: string
  linkedin?: string
  github?: string
}

const teamMembers: TeamMember[] = [
  {
    name: "Manish Arora",
    role: "Founder & Lead Developer",
    bio: "Runner | Automation Engineering Leader | Vibe Coding Enthusiast",
    image: "/team/Manish-Arora.png", // You'll need to add these images to the public/team directory
    linkedin: "www.linkedin.com/in/manish-arora-020b8651",
    github: "https://github.com/manar8x"
  },
  {
    name: "Sreechand Tavva",
    role: "Full Stack Developer",
    bio: "Cyclist | Product Manager | Vibe Coding Enthusiast ",
    image: "/team/Sreechand-Tavva.png",
    linkedin: "https://linkedin.com/in/sreechand",
    github: "https://github.com/sreechand"
  },
  {
    name: "Sandeep Singh Rajput",
    role: "Role",
    bio: "Senior Data Analyst",
    image: "/team/Sandeep-Singh-Rajput.png",
    linkedin: "https://www.linkedin.com/in/sandeepsingh1910/",
    github: "https://github.com/member3"
  },
  {
    name: "Abhishek Vyas",
    role: "Role",
    bio: "Bio for team member 4",
    image: "/team/Abhishek-Vyas.png",
    linkedin: "https://linkedin.com/in/member4",
    github: "https://github.com/member4"
  }
]

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0A0A0A] to-[#1C1C2E] text-white">
      {/* Hero Section */}
      <div className="relative h-[300px] overflow-hidden">
        <div className="absolute inset-0 bg-[url('/background-grid.svg')] bg-repeat opacity-10"></div>
        <div className="relative z-10 container mx-auto px-6 h-full flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-exo font-black mb-4">
              About <span className="text-gradient">BHAAG</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 font-barlow">
              Meet the team behind your AI-powered running coach
            </p>
          </motion.div>
        </div>
      </div>

      {/* Build W/ AI Section */}
      <div className="container mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card-glow mb-16"
        >
          <div className="p-8">
            <h2 className="text-3xl font-exo font-bold mb-6">Built with Build W/ AI</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-lg text-gray-300 mb-4">
                BHAAG is proud to be part of the Build W/ AI bootcamp, an innovative program that brings together developers, designers, and entrepreneurs to create AI-powered solutions. This bootcamp has provided us with the resources, mentorship, and community support needed to bring our vision of an AI-powered running coach to life.
              </p>
              <p className="text-lg text-gray-300 mb-6">
                Through Build W/ AI, we've gained access to cutting-edge AI technologies and best practices, enabling us to create a more intelligent and personalized running experience. The bootcamp's focus on practical AI implementation has been instrumental in shaping BHAAG's development.
              </p>
              <Link href="https://www.buildschool.net/" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="text-primary border-primary hover:bg-primary/10">
                  Learn More About Build W/ AI
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Team Section */}
        <h2 className="text-3xl font-exo font-bold mb-8">Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card-glow group"
            >
              <div className="flex flex-col md:flex-row gap-6 p-6">
                <div className="relative w-48 h-48 mx-auto md:mx-0">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-exo font-bold mb-2">{member.name}</h3>
                  <p className="text-primary font-barlow mb-4">{member.role}</p>
                  <p className="text-gray-300 mb-4">{member.bio}</p>
                  <div className="flex gap-4">
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-primary transition-colors"
                      >
                        LinkedIn
                      </a>
                    )}
                    {member.github && (
                      <a
                        href={member.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-primary transition-colors"
                      >
                        GitHub
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  )
} 