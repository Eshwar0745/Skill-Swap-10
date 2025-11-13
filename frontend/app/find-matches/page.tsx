"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"
import { Star, Sparkles, Users, ArrowRight } from "lucide-react"

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
      const res = await api.matches.myMatches()
      setMatches(res.matches || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestSwap = async (match: any) => {
    try {
      await api.exchanges.create({
        providerId: match.provider._id,
        offeredSkillId: match.offeredSkill._id,
        requestedSkillId: match.requestedSkill._id,
        notes: `I'd like to learn ${match.offeredSkill.title} and I can teach ${match.mutualSkills.join(', ')}!`
      })
      alert('Swap request sent!')
      loadMatches()
    } catch (e: any) {
      alert(e?.message || 'Failed to send request')
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

  const mutualMatches = matches.filter(m => m.isMutualMatch)
  const otherMatches = matches.filter(m => !m.isMutualMatch)

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-background to-card/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Find Your Perfect Match</h1>
          <p className="text-foreground/60">Discover people who can teach you what you want to learn</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{matches.length}</p>
                <p className="text-sm text-foreground/60">Total Matches</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-green-500/20 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{mutualMatches.length}</p>
                <p className="text-sm text-foreground/60">Mutual Matches</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <Star className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{otherMatches.length}</p>
                <p className="text-sm text-foreground/60">Other Matches</p>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-foreground/60">Finding your matches...</p>
          </div>
        ) : matches.length > 0 ? (
          <div className="space-y-8">
            {/* Mutual Matches */}
            {mutualMatches.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-green-600" />
                  <h2 className="text-2xl font-bold">Perfect Matches</h2>
                  <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-600 text-xs font-medium">
                    You both want what the other offers!
                  </span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {mutualMatches.map((match: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-card border-2 border-green-500 rounded-xl p-6 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <img
                          src={match.provider.avatarUrl || '/placeholder.svg'}
                          alt={match.provider.name}
                          className="w-16 h-16 rounded-full border-2 border-green-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-lg font-bold">{match.provider.name}</p>
                            <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-600 text-xs font-medium">
                              🤝 Mutual
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= Math.floor(match.provider.averageRating || 0)
                                      ? 'fill-amber-500 text-amber-500'
                                      : 'text-foreground/20'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-foreground/60">
                              {(match.provider.averageRating || 0).toFixed(1)} ({match.provider.reviewsCount || 0})
                            </span>
                          </div>
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm">
                              <ArrowRight className="w-4 h-4 text-green-600" />
                              <span className="text-foreground/70">They offer:</span>
                              <span className="font-medium text-primary">{match.offeredSkill.title}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <ArrowRight className="w-4 h-4 text-green-600" />
                              <span className="text-foreground/70">You offer:</span>
                              <span className="font-medium text-secondary">{match.mutualSkills.join(', ')}</span>
                            </div>
                          </div>
                          {match.hasActiveExchange ? (
                            <Button variant="outline" size="sm" className="w-full rounded-full" disabled>
                              {match.exchangeStatus === 'proposed' ? 'Request Pending' : 'Already Connected'}
                            </Button>
                          ) : (
                            <Button
                              variant="default"
                              size="sm"
                              className="w-full rounded-full"
                              onClick={() => handleRequestSwap(match)}
                            >
                              Request Swap
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Other Matches */}
            {otherMatches.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Other Matches</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {otherMatches.map((match: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <img
                          src={match.provider.avatarUrl || '/placeholder.svg'}
                          alt={match.provider.name}
                          className="w-16 h-16 rounded-full border-2 border-primary/20"
                        />
                        <div className="flex-1">
                          <p className="text-lg font-bold mb-2">{match.provider.name}</p>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= Math.floor(match.provider.averageRating || 0)
                                      ? 'fill-amber-500 text-amber-500'
                                      : 'text-foreground/20'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-foreground/60">
                              {(match.provider.averageRating || 0).toFixed(1)} ({match.provider.reviewsCount || 0})
                            </span>
                          </div>
                          <p className="text-sm text-foreground/70 mb-3">
                            Offers: <span className="font-medium text-primary">{match.offeredSkill.title}</span>
                          </p>
                          {match.hasActiveExchange ? (
                            <Button variant="outline" size="sm" className="w-full rounded-full" disabled>
                              Request Pending
                            </Button>
                          ) : (
                            <Button
                              variant="secondary"
                              size="sm"
                              className="w-full rounded-full"
                              onClick={() => handleRequestSwap(match)}
                            >
                              Request Swap
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 bg-card border border-border rounded-xl">
            <Sparkles className="w-16 h-16 mx-auto text-foreground/30 mb-4" />
            <p className="text-lg font-semibold text-foreground mb-2">No matches found yet</p>
            <p className="text-foreground/60 mb-6">
              Add skills you want to learn in your profile to find matches!
            </p>
            <Button
              onClick={() => router.push('/profile')}
              className="rounded-full"
            >
              Add Skills to Learn
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
