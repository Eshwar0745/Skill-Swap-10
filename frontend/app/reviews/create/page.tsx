"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api"
import { useRouter, useSearchParams } from "next/navigation"
import { Star, ArrowLeft } from "lucide-react"

export default function CreateReviewPage() {
  const { user, isAuthenticated, ready } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const revieweeId = searchParams?.get('userId')
  
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!ready) return
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    if (!revieweeId) {
      router.push('/exchanges')
      return
    }
  }, [ready, isAuthenticated, revieweeId])

  const handleSubmit = async () => {
    if (!revieweeId || rating === 0) {
      alert('Please select a rating')
      return
    }

    setSubmitting(true)
    try {
      await api.reviews.create({
        revieweeId,
        rating,
        comment: comment.trim(),
        context: 'exchange'
      })
      alert('Review submitted successfully!')
      router.push('/exchanges')
    } catch (e: any) {
      alert(e?.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-6 rounded-full"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="bg-card border border-border rounded-xl p-8">
          <h1 className="text-3xl font-bold mb-2">Leave a Review</h1>
          <p className="text-foreground/60 mb-8">Share your experience with this skill exchange</p>

          <div className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-semibold mb-3">Rating *</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-10 h-10 ${
                        star <= (hoverRating || rating)
                          ? 'fill-amber-500 text-amber-500'
                          : 'text-foreground/30'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-foreground/60 mt-2">
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-semibold mb-2">Comment (optional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={5}
                placeholder="Share your thoughts about the skill exchange..."
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                maxLength={500}
              />
              <p className="text-xs text-foreground/50 mt-1">
                {comment.length}/500 characters
              </p>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="flex-1 rounded-full"
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 rounded-full"
                disabled={rating === 0 || submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
