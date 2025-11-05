"use client"

import { motion } from "framer-motion"
import type React from "react"

interface ScrollRevealProps {
  children: React.ReactNode
  delay?: number
  className?: string
}

export function ScrollReveal({ children, delay = 0, className = "" }: ScrollRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
