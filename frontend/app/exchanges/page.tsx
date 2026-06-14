"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"
import { CheckCircle, XCircle, Clock, Calendar, MessageCircle, Star, Ban } from "lucide-react"
import { toast } from "sonner"

export default function ExchangesPage() {
  const { user, isAuthenticated, ready } = useAuth()
  const router = useRouter()
  const [exchanges, setExchanges] = useState<any[]>([])
  const [filter, setFilter] = useState<'all' | 'requester' | 'provider'>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ready) return // Wait for auth to hydrate
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    loadExchanges()
  }, [ready, isAuthenticated, filter, statusFilter])

  const loadExchanges = async () => {
    setLoading(true)
    try {
      const params: any = { limit: 50 }
      if (filter !== 'all') params.role = filter
      if (statusFilter !== 'all') params.status = statusFilter
      
      const res = await api.exchanges.list(params)
      setExchanges(res.items || [])
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load exchanges')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (exchangeId: string, newStatus: string) => {
    try {
      await api.exchanges.updateStatus(exchangeId, newStatus)
      toast.success(`Exchange ${newStatus} successfully`)
      loadExchanges()
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update status')
    }
  }

  const handleMessage = (userId: string) => {
    router.push(`/messages?userId=${userId}`)
  }

  const handleReview = (exchangeId: string) => {
    router.push(`/reviews/create?exchangeId=${exchangeId}`)
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Exchanges</h1>
          <p className="text-foreground/60">Manage your skill swap requests and offers</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className="rounded-full"
            >
              All
            </Button>
            <Button
              variant={filter === 'requester' ? 'default' : 'outline'}
              onClick={() => setFilter('requester')}
              className="rounded-full"
            >
              Sent Requests
            </Button>
            <Button
              variant={filter === 'provider' ? 'default' : 'outline'}
              onClick={() => setFilter('provider')}
              className="rounded-full"
            >
              Received
            </Button>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-full border border-border bg-background text-foreground"
          >
            <option value="all">All Statuses</option>
            <option value="proposed">Proposed</option>
            <option value="accepted">Accepted</option>
            <option value="declined">Declined</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Exchanges List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-card rounded-xl animate-pulse border border-border"></div>
            ))}
          </div>
        ) : exchanges.length > 0 ? (
          <div className="space-y-4">
            {exchanges.map((exchange) => {
              const isRequester = String(exchange.requester?._id || exchange.requester) === String(user?.id)
              const otherUser = isRequester ? exchange.provider : exchange.requester
              
              // Action logic
              const canAccept = !isRequester && exchange.status === 'proposed'
              const canDecline = !isRequester && exchange.status === 'proposed'
              const canCancel = exchange.status === 'proposed' || exchange.status === 'accepted'
              const canComplete = exchange.status === 'accepted'
              const canMessage = exchange.status === 'accepted' || exchange.status === 'completed'
              const canReview = exchange.status === 'completed'

              return (
                <div
                  key={exchange._id}
                  className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all shadow-sm"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={otherUser?.avatarUrl || '/placeholder.svg'}
                          alt={otherUser?.name || 'User'}
                          className="w-12 h-12 rounded-full border-2 border-primary/20 cursor-pointer"
                          onClick={() => router.push(`/user/${otherUser?._id}`)}
                        />
                        <div>
                          <p className="font-semibold text-foreground cursor-pointer hover:underline" onClick={() => router.push(`/user/${otherUser?._id}`)}>
                            {isRequester ? 'Request sent to' : 'Request received from'} {otherUser?.name || 'User'}
                          </p>
                          <p className="text-sm text-foreground/60">
                            {new Date(exchange.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4 text-sm bg-background/50 p-4 rounded-lg border border-border/50">
                        <div>
                          <span className="text-foreground/60 block mb-1">They will teach:</span>
                          <span className="font-medium">
                            {exchange.providerSkill?.title || exchange.offeredSkill?.title || 'General Mentorship'}
                          </span>
                        </div>
                        <div>
                          <span className="text-foreground/60 block mb-1">You will teach:</span>
                          <span className="font-medium">
                            {exchange.requesterSkill?.title || exchange.requestedSkill?.title || 'General Mentorship'}
                          </span>
                        </div>
                      </div>

                      {exchange.notes && (
                        <p className="text-sm text-foreground/70 italic border-l-2 border-primary/20 pl-3">
                          "{exchange.notes}"
                        </p>
                      )}

                      <div className="flex items-center gap-2">
                        {exchange.status === 'proposed' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-600 text-xs font-medium border border-yellow-500/20">
                            <Clock className="w-3 h-3" />
                            Pending
                          </span>
                        )}
                        {exchange.status === 'accepted' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-medium border border-green-500/20">
                            <CheckCircle className="w-3 h-3" />
                            Accepted
                          </span>
                        )}
                        {exchange.status === 'declined' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/10 text-red-600 text-xs font-medium border border-red-500/20">
                            <XCircle className="w-3 h-3" />
                            Declined
                          </span>
                        )}
                        {exchange.status === 'cancelled' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-500/10 text-gray-600 text-xs font-medium border border-gray-500/20">
                            <Ban className="w-3 h-3" />
                            Cancelled
                          </span>
                        )}
                        {exchange.status === 'completed' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-xs font-medium border border-blue-500/20">
                            <CheckCircle className="w-3 h-3" />
                            Completed
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 min-w-[140px]">
                      {canAccept && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleStatusUpdate(exchange._id, 'accepted')}
                          className="rounded-full gap-1 w-full"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Accept
                        </Button>
                      )}
                      {canDecline && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(exchange._id, 'declined')}
                          className="rounded-full gap-1 w-full"
                        >
                          <XCircle className="w-4 h-4" />
                          Decline
                        </Button>
                      )}
                      {canComplete && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleStatusUpdate(exchange._id, 'completed')}
                          className="rounded-full gap-1 w-full"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Mark Complete
                        </Button>
                      )}
                      {canMessage && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleMessage(otherUser?._id || otherUser)}
                          className="rounded-full gap-1 w-full"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Message
                        </Button>
                      )}
                      {canReview && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReview(exchange._id)}
                          className="rounded-full gap-1 w-full"
                        >
                          <Star className="w-4 h-4" />
                          Leave Review
                        </Button>
                      )}
                      {canCancel && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatusUpdate(exchange._id, 'cancelled')}
                          className="rounded-full gap-1 w-full text-muted-foreground hover:text-destructive"
                        >
                          <Ban className="w-4 h-4" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-card border border-border rounded-xl shadow-sm">
            <Calendar className="w-16 h-16 mx-auto text-foreground/30 mb-4" />
            <p className="text-xl font-bold text-foreground mb-2">No exchanges yet</p>
            <p className="text-foreground/60 mb-6 max-w-sm mx-auto">
              Find true reciprocal matches and send your first swap request!
            </p>
            <Button
              onClick={() => router.push('/find-matches')}
              className="rounded-full"
            >
              Find Matches
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
