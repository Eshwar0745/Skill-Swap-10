"use client"

import { useState, useEffect, use } from "react"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { MapPin, Star, Users, ArrowLeft, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"
import SkillCard from "@/components/skill-card"
import { useRouter } from "next/navigation"

export default function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'offered'|'requested'|'posts'>('offered')
  const [offeredSkills, setOfferedSkills] = useState<any[]>([])
  const [requestedSkills, setRequestedSkills] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)

  useEffect(() => {
    loadUser()
  }, [id])

  const loadUser = async () => {
    try {
      const data = await api.users.getProfile(id)
      setUser(data)

      const [offeredRes, requestedRes, postsRes] = await Promise.all([
        api.offeredSkills.list({ userId: id }),
        api.requestedSkills.list({ userId: id }),
        api.posts.listForUser(id)
      ])
      
      setOfferedSkills(offeredRes.items || [])
      setRequestedSkills(requestedRes.items || [])
      setPosts(postsRes.items || [])

      if (currentUser && currentUser.id !== id) {
        const followRes = await api.follows.check(id)
        setIsFollowing(followRes.isFollowing)
      }
    } catch (e: any) {
      toast.error('Failed to load user profile')
    } finally {
      setLoading(false)
    }
  }

  const handleFollowToggle = async () => {
    if (!currentUser) {
      toast.error('Please login to follow users')
      router.push('/login')
      return
    }
    setFollowLoading(true)
    try {
      if (isFollowing) {
        await api.follows.unfollow(id)
        setIsFollowing(false)
        setUser(prev => ({ ...prev, followersCount: Math.max(0, (prev.followersCount || 1) - 1) }))
        toast.success('Unfollowed user')
      } else {
        await api.follows.follow(id)
        setIsFollowing(true)
        setUser(prev => ({ ...prev, followersCount: (prev.followersCount || 0) + 1 }))
        toast.success('Following user')
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update follow status')
    } finally {
      setFollowLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
        <Button onClick={() => router.push('/')}>Return Home</Button>
      </div>
    )
  }

  const isSelf = currentUser?.id === user._id

  return (
    <div className="min-h-screen py-12 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Button variant="ghost" className="mb-6 rounded-full" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        {/* Header Card */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm mb-8">
          <div className="h-32 bg-gradient-to-r from-primary/20 to-secondary/20"></div>
          <div className="px-8 pb-8 relative">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-12 mb-6">
              <img 
                src={user.avatarUrl ? (user.avatarUrl.startsWith('http') ? user.avatarUrl : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000'}${user.avatarUrl}`) : '/placeholder.svg'} 
                alt={user.name} 
                className="w-28 h-28 rounded-full border-4 border-card object-cover bg-muted"
              />
              <div className="flex-1 pb-2">
                <h1 className="text-3xl font-bold">{user.name}</h1>
                <div className="flex items-center gap-4 text-sm text-foreground/60 mt-1">
                  {user.location && <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {user.location}</span>}
                  <span className="flex items-center text-amber-500 font-medium">
                    <Star className="w-4 h-4 mr-1 fill-current" />
                    {user.averageRating ? user.averageRating.toFixed(1) : 'New'} ({user.reviewsCount || 0} reviews)
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm font-medium mt-3">
                  <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {user.followersCount || 0} Followers</span>
                  <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {user.followingCount || 0} Following</span>
                </div>
              </div>
              <div className="pb-2">
                {!isSelf && (
                  <Button 
                    variant={isFollowing ? "outline" : "default"}
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    className="rounded-full w-32"
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                )}
                {isSelf && (
                  <Button variant="outline" onClick={() => router.push('/profile')} className="rounded-full">
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>

            <div className="max-w-2xl">
              <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
                {user.bio || "This user hasn't added a bio yet."}
              </p>
            </div>
            
            {user.badges && user.badges.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {user.badges.map((b: string) => (
                  <span key={b} className="px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full text-xs font-semibold border border-amber-500/20">{b}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-6 overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => setActiveTab('offered')}
            className={`px-6 py-3 font-semibold border-b-2 whitespace-nowrap transition-colors ${activeTab === 'offered' ? 'border-primary text-primary' : 'border-transparent text-foreground/60 hover:text-foreground'}`}
          >
            Teaches ({offeredSkills.length})
          </button>
          <button 
            onClick={() => setActiveTab('requested')}
            className={`px-6 py-3 font-semibold border-b-2 whitespace-nowrap transition-colors ${activeTab === 'requested' ? 'border-primary text-primary' : 'border-transparent text-foreground/60 hover:text-foreground'}`}
          >
            Wants to Learn ({requestedSkills.length})
          </button>
          <button 
            onClick={() => setActiveTab('posts')}
            className={`px-6 py-3 font-semibold border-b-2 whitespace-nowrap transition-colors ${activeTab === 'posts' ? 'border-primary text-primary' : 'border-transparent text-foreground/60 hover:text-foreground'}`}
          >
            Portfolio ({posts.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'offered' && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {offeredSkills.map(skill => (
                <SkillCard key={skill._id} skill={{
                  id: skill._id,
                  title: skill.title,
                  category: skill.categories?.[0] || 'Other',
                  user: { name: user.name, avatar: user.avatarUrl, id: user._id },
                  image: '/placeholder.svg',
                  description: skill.description,
                  userId: user._id
                }} />
              ))}
            </div>
            {offeredSkills.length === 0 && (
              <div className="text-center py-12 border rounded-xl border-dashed">
                <p className="text-foreground/60">No skills offered yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'requested' && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {requestedSkills.map(skill => (
                <div key={skill._id} className="bg-card border rounded-xl p-6">
                  <h3 className="font-bold text-lg mb-2">{skill.title}</h3>
                  <p className="text-sm text-foreground/70">{skill.description}</p>
                </div>
              ))}
            </div>
            {requestedSkills.length === 0 && (
              <div className="text-center py-12 border rounded-xl border-dashed">
                <p className="text-foreground/60">No skills requested yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'posts' && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {posts.map(post => (
                <div key={post._id} className="bg-card border rounded-xl overflow-hidden shadow-sm">
                  <div className="aspect-square bg-muted">
                    <img 
                      src={post.imageUrl.startsWith('http') ? post.imageUrl : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000'}${post.imageUrl}`} 
                      alt={post.caption} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {post.caption && (
                    <div className="p-4 border-t">
                      <p className="text-sm">{post.caption}</p>
                      <p className="text-[10px] text-foreground/50 mt-2">{new Date(post.createdAt).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {posts.length === 0 && (
              <div className="text-center py-12 border rounded-xl border-dashed">
                <ImageIcon className="w-12 h-12 mx-auto text-foreground/20 mb-3" />
                <p className="text-foreground/60">No portfolio posts yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
