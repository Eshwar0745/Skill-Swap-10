"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"
import { CheckCircle, MapPin, Star, Plus, Users } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function FindMatchesPage() {
  const { user, isAuthenticated, ready } = useAuth()
  const router = useRouter()
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ready) return
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    loadMatches()
  }, [ready, isAuthenticated])

  const loadMatches = async () => {
    setLoading(true)
    try {
      const res = await api.matches.reciprocal()
      setMatches(res.matches || [])
    } catch (e: any) {
      toast.error(e?.message || "Failed to load matches")
    } finally {
      setLoading(false)
    }
  }

  const handleRequestSwap = async (providerId: string, providerSkillTitles: string[], requesterSkillTitles: string[]) => {
    // In a full implementation, we'd open a modal to let the user select *which* specific skill they want to swap.
    // For now, we'll just create a general exchange request to start the conversation, leaving the specific skill IDs blank.
    try {
      await api.exchanges.create({
        providerId,
        notes: `Hi! I saw we have a reciprocal match. I'm interested in learning from you, and I can teach you!`,
      })
      toast.success('Swap request sent successfully!')
      loadMatches() // Refresh to show active exchange status
    } catch (e: any) {
      toast.error(e?.message || 'Failed to send request')
    }
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-background to-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Find True Matches</h1>
          <p className="text-lg text-foreground/70 max-w-2xl">
            These are people who offer a skill you want to learn, and also want to learn a skill you offer. It's a perfect two-way street!
          </p>
        </div>

        {/* Matches Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-card rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : matches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => (
              <div
                key={match.user._id}
                className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all hover:shadow-lg flex flex-col h-full"
              >
                {/* User Info */}
                <div className="flex items-start gap-4 mb-6 cursor-pointer" onClick={() => router.push(`/user/${match.user._id}`)}>
                  <img
                    src={match.user.avatarUrl || '/placeholder.svg'}
                    alt={match.user.name}
                    className="w-16 h-16 rounded-full border-2 border-primary/20 object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-lg">{match.user.name}</h3>
                    {match.user.location && (
                      <div className="flex items-center text-sm text-foreground/60 mt-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        {match.user.location}
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-sm">
                      <span className="flex items-center text-amber-500 font-medium">
                        <Star className="w-4 h-4 mr-1 fill-current" />
                        {match.user.averageRating ? match.user.averageRating.toFixed(1) : 'New'}
                        <span className="text-foreground/40 ml-1">({match.user.reviewsCount || 0})</span>
                      </span>
                      <span className="flex items-center text-foreground/60">
                        <Users className="w-4 h-4 mr-1" />
                        {match.user.followersCount || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reciprocal Skills */}
                <div className="flex-1 space-y-4">
                  <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">They have what you need</p>
                    <div className="flex flex-wrap gap-2">
                      {match.skillsTheyCanTeachMe.map((skill: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-background rounded-full text-sm border border-primary/20 shadow-sm text-primary font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-secondary/5 rounded-xl p-4 border border-secondary/10">
                    <p className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2">You have what they need</p>
                    <div className="flex flex-wrap gap-2">
                      {match.skillsICanTeachThem.map((skill: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-background rounded-full text-sm border border-secondary/20 shadow-sm text-secondary font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="mt-6 pt-4 border-t border-border">
                  {match.hasActiveExchange ? (
                    <Button variant="outline" className="w-full rounded-full" asChild>
                      <Link href="/exchanges">View Active Swap ({match.exchangeStatus})</Link>
                    </Button>
                  ) : (
                    <Button
                      className="w-full rounded-full group"
                      onClick={() => handleRequestSwap(match.user._id, match.skillsTheyCanTeachMe, match.skillsICanTeachThem)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Request Swap
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card border border-border rounded-2xl shadow-sm">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No Matches Yet</h2>
            <p className="text-foreground/60 max-w-md mx-auto mb-8">
              True matches require someone who offers what you want, AND wants what you offer. 
              Try adding more skills to increase your chances!
            </p>
            <Button size="lg" className="rounded-full" asChild>
              <Link href="/profile">
                <Plus className="w-5 h-5 mr-2" />
                Add More Skills
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
