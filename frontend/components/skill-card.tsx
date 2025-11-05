"use client"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"

interface Skill {
  id: number
  title: string
  category: string
  user: { name: string; avatar: string }
  image: string
}

export default function SkillCard({ skill }: { skill: Skill }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.04, y: -8 }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group rounded-lg overflow-hidden border border-border bg-card hover:shadow-2xl hover:border-primary/50 transition-all duration-300 animate-fadeIn cursor-pointer"
    >
      <div className="relative overflow-hidden h-40 bg-muted">
        <motion.img
          src={skill.image || "/placeholder.svg"}
          alt={skill.title}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.15 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="p-4 space-y-3">
        <div className="space-y-1">
          <motion.p
            className="text-xs font-semibold text-primary uppercase tracking-wide"
            whileHover={{ color: "var(--secondary)" }}
            transition={{ duration: 0.2 }}
          >
            {skill.category}
          </motion.p>
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
            {skill.title}
          </h3>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <img
            src={skill.user.avatar || "/placeholder.svg"}
            alt={skill.user.name}
            className="w-8 h-8 rounded-full border-2 border-background/50"
          />
          <span className="text-sm text-foreground/70">{skill.user.name}</span>
        </div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            size="sm"
            variant="default"
            className="w-full rounded-full gap-2 mt-2 transition-all duration-200 group-hover:shadow-md"
          >
            <MessageCircle className="w-4 h-4" />
            Request Swap
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}
