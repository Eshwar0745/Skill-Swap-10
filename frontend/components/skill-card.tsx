"use client"
import { Button } from "@/components/ui/button"
import { MessageCircle, HandshakeIcon } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"

interface Skill {
  id: string | number
  title: string
  category: string
  location?: string
  user: { name: string; avatar: string; id?: string }
  image: string
  description?: string
  _id?: string
  userId?: string
}

export default function SkillCard({ skill }: { skill: Skill }) {
  const [isHovered, setIsHovered] = useState(false)
  const [loading, setLoading] = useState(false)
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  const skillId = skill._id || skill.id
  const ownerId = skill.userId || skill.user?.id

  const handleRequestExchange = async () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (String(ownerId) === String(user?.id)) {
      alert("You can't request an exchange with yourself!")
      return
    }

    setLoading(true)
    try {
      await api.exchanges.create({
        providerId: ownerId,
        offeredSkillId: skillId,
        notes: `I'm interested in learning ${skill.title}!`
      })
      alert('Exchange request sent! Check your exchanges page.')
      router.push('/exchanges')
    } catch (e: any) {
      alert(e?.message || 'Failed to send exchange request')
    } finally {
      setLoading(false)
    }
  }

  const handleMessage = () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    router.push(`/messages?userId=${ownerId}`)
  }

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
          {skill.description && (
            <p className="text-sm text-foreground/60 line-clamp-2">{skill.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2 pt-2">
          <img
            src={skill.user.avatar || "/placeholder.svg"}
            alt={skill.user.name}
            className="w-8 h-8 rounded-full border-2 border-background/50"
          />
          <span className="text-sm text-foreground/70">{skill.user.name}</span>
        </div>

        <div className="flex gap-2">
          <motion.div className="flex-1" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="sm"
              variant="default"
              className="w-full rounded-full gap-2 transition-all duration-200"
              onClick={handleRequestExchange}
              disabled={loading || String(ownerId) === String(user?.id)}
            >
              <HandshakeIcon className="w-4 h-4" />
              {loading ? 'Sending...' : 'Request Swap'}
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full px-3"
              onClick={handleMessage}
              disabled={String(ownerId) === String(user?.id)}
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
