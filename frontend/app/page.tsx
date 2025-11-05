"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Users, Zap } from "lucide-react"
import SkillCard from "@/components/skill-card"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ScrollReveal } from "@/components/scroll-reveal"

const featuredSkills = [
  {
    id: 1,
    title: "Web Design",
    category: "Design",
    user: { name: "Alex Chen", avatar: "/diverse-avatars.png" },
    image: "/web-design-mockup.png",
  },
  {
    id: 2,
    title: "JavaScript Mastery",
    category: "Programming",
    user: { name: "Sarah Kim", avatar: "/diverse-avatars.png" },
    image: "/javascript-code.png",
  },
  {
    id: 3,
    title: "Photography Basics",
    category: "Creative",
    user: { name: "Mike Johnson", avatar: "/diverse-avatars.png" },
    image: "/classic-photography-camera.png",
  },
  {
    id: 4,
    title: "Spanish Language",
    category: "Languages",
    user: { name: "Maria Garcia", avatar: "/diverse-avatars.png" },
    image: "/language-learning.jpg",
  },
]

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 py-20 md:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 6,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 7,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="w-4 h-4" />
              Welcome to SkillSwap
            </motion.div>

            <motion.h1
              className="text-4xl md:text-6xl font-bold text-balance leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Learn and Share Skills{" "}
              <motion.span
                className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary"
                animate={{
                  backgroundPosition: ["0% center", "100% center", "0% center"],
                }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
              >
                Together
              </motion.span>
            </motion.h1>

            <motion.p
              className="text-lg text-foreground/60 max-w-2xl mx-auto text-balance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Connect with others, discover new talents, and build meaningful relationships through skill exchange.
              Start your journey today.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-3 justify-center pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/explore">
                  <Button size="lg" className="rounded-full group">
                    Find a Skill
                    <motion.div
                      className="inline-block"
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                    >
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </motion.div>
                  </Button>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/profile">
                  <Button size="lg" variant="outline" className="rounded-full bg-transparent">
                    Offer a Skill
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Skills Section */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-12">
          <ScrollReveal>
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">Featured Skills</h2>
              <p className="text-foreground/60 max-w-2xl mx-auto">
                Explore some of the most popular skills being shared by our community
              </p>
            </div>
          </ScrollReveal>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
          >
            {featuredSkills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </motion.div>

          <ScrollReveal className="flex justify-center pt-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/explore">
                <Button variant="ghost" className="rounded-full">
                  View All Skills
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </ScrollReveal>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.15,
                },
              },
            }}
          >
            {[
              {
                icon: Users,
                title: "Connect with Experts",
                description: "Learn directly from skilled individuals in your community",
                color: "primary",
              },
              {
                icon: Zap,
                title: "Share Your Talent",
                description: "Teach others what you know and build your reputation",
                color: "secondary",
              },
              {
                icon: Sparkles,
                title: "Real-Time Chat",
                description: "Connect instantly with skill providers and learners",
                color: "accent",
              },
            ].map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <motion.div
                  key={index}
                  className="space-y-3"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                >
                  <motion.div
                    className={`w-12 h-12 bg-${benefit.color}/10 rounded-lg flex items-center justify-center`}
                    style={{
                      backgroundColor:
                        benefit.color === "primary"
                          ? "var(--primary)10"
                          : benefit.color === "secondary"
                            ? "var(--secondary)10"
                            : "var(--accent)10",
                    }}
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon
                      className="w-6 h-6"
                      style={{
                        color:
                          benefit.color === "primary"
                            ? "var(--primary)"
                            : benefit.color === "secondary"
                              ? "var(--secondary)"
                              : "var(--accent)",
                      }}
                    />
                  </motion.div>
                  <h3 className="text-lg font-semibold">{benefit.title}</h3>
                  <p className="text-foreground/60">{benefit.description}</p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>
    </div>
  )
}
