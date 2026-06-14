"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Star, Settings, Camera, Shield, Users, Image as ImageIcon, Plus, Trash2, X, GraduationCap, Briefcase, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import SkillCard from "@/components/skill-card"

export default function ProfilePage() {
  const { user, ready, refresh } = useAuth()
  const [activeTab, setActiveTab] = useState<'info'|'offered'|'requested'|'posts'>('info')
  const [offeredSkills, setOfferedSkills] = useState<any[]>([])
  const [requestedSkills, setRequestedSkills] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [categories, setCategories] = useState<string[]>([])
  
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Skill Add Forms
  const [showAddOffered, setShowAddOffered] = useState(false)
  const [showAddRequested, setShowAddRequested] = useState(false)
  const [newSkillTitle, setNewSkillTitle] = useState('')
  const [newSkillDesc, setNewSkillDesc] = useState('')
  const [newSkillCategory, setNewSkillCategory] = useState('')
  const [isAddingSkill, setIsAddingSkill] = useState(false)

  // Post form
  const [postCaption, setPostCaption] = useState('')
  const [postFile, setPostFile] = useState<File | null>(null)
  const [uploadingPost, setUploadingPost] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setBio(user.bio || '')
      setLocation(user.location || '')
      loadSkills()
      loadPosts()
      loadCategories()
    }
  }, [user])

  const loadSkills = async () => {
    if (!user) return
    try {
      const [offeredRes, requestedRes] = await Promise.all([
        api.offeredSkills.list({ userId: user.id }),
        api.requestedSkills.list({ userId: user.id })
      ])
      setOfferedSkills(offeredRes.items || [])
      setRequestedSkills(requestedRes.items || [])
    } catch (e) {
      console.error(e)
    }
  }

  const loadPosts = async () => {
    if (!user) return
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/posts/user/${user.id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      })
      const data = await res.json()
      setPosts(data.items || [])
    } catch (e) {
      console.error(e)
    }
  }

  const loadCategories = async () => {
    try {
      const res = await api.categories.list()
      setCategories(res.categories || [])
      if (res.categories?.length > 0) setNewSkillCategory(res.categories[0])
    } catch (e) {
      setCategories(['Programming', 'Design', 'Languages', 'Music', 'Other'])
      setNewSkillCategory('Programming')
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      await api.users.updateProfile(user!.id, { name, bio, location })
      await refresh()
      setIsEditing(false)
      toast.success('Profile updated successfully')
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    
    setUploadingAvatar(true)
    try {
      await api.users.uploadAvatar(user.id, file)
      await refresh()
      toast.success('Avatar updated beautifully')
    } catch (e: any) {
      toast.error('Failed to update avatar')
    } finally {
      setUploadingAvatar(false)
    }
  }

  // Add Offered Skill
  const handleAddOffered = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAddingSkill(true)
    try {
      await api.offeredSkills.create({
        title: newSkillTitle,
        description: newSkillDesc,
        categories: [newSkillCategory]
      })
      toast.success('Skill added to your offerings')
      setNewSkillTitle(''); setNewSkillDesc(''); setShowAddOffered(false);
      loadSkills()
    } catch (e: any) {
      toast.error(e?.message || 'Failed to add skill')
    } finally {
      setIsAddingSkill(false)
    }
  }

  // Add Requested Skill
  const handleAddRequested = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAddingSkill(true)
    try {
      await api.requestedSkills.create({
        title: newSkillTitle,
        description: newSkillDesc,
        categories: [newSkillCategory]
      })
      toast.success('Skill added to your wants')
      setNewSkillTitle(''); setNewSkillDesc(''); setShowAddRequested(false);
      loadSkills()
    } catch (e: any) {
      toast.error(e?.message || 'Failed to add skill')
    } finally {
      setIsAddingSkill(false)
    }
  }

  // Delete Skills
  const handleDeleteOffered = async (id: string) => {
    if (!confirm('Remove this skill from your offerings?')) return
    try {
      await api.offeredSkills.delete(id)
      toast.success('Skill removed')
      loadSkills()
    } catch (e: any) {
      toast.error('Failed to remove skill')
    }
  }

  const handleDeleteRequested = async (id: string) => {
    if (!confirm('Remove this skill from your wants?')) return
    try {
      await api.requestedSkills.delete(id)
      toast.success('Skill removed')
      loadSkills()
    } catch (e: any) {
      toast.error('Failed to remove skill')
    }
  }

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!postFile || !user) return

    const formData = new FormData()
    formData.append('image', postFile)
    if (postCaption) formData.append('caption', postCaption)

    setUploadingPost(true)
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/posts`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
        body: formData
      })
      toast.success('Added to portfolio')
      setPostFile(null)
      setPostCaption('')
      loadPosts()
    } catch (e: any) {
      toast.error(e?.message || 'Failed to create post')
    } finally {
      setUploadingPost(false)
    }
  }

  const handleDeletePost = async (id: string) => {
    if (!confirm('Delete this post from your portfolio?')) return
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/posts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      })
      toast.success('Post deleted')
      loadPosts()
    } catch (e: any) {
      toast.error('Failed to delete post')
    }
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen pb-20 bg-background/50 dark:bg-[#09090b]">
      {/* Dynamic Header Banner */}
      <div className="h-64 w-full bg-gradient-to-br from-violet-600 via-indigo-500 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/10 blur-3xl rounded-full"></div>
        <div className="absolute top-12 -left-12 w-64 h-64 bg-black/10 blur-3xl rounded-full"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        
        {/* Main Profile Card */}
        <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl p-6 sm:p-10 mb-10">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-end -mt-24 mb-8">
            <div className="relative group">
              <div className="w-36 h-36 rounded-full p-1 bg-gradient-to-br from-primary to-purple-600 shadow-xl">
                <img 
                  src={user.avatarUrl ? (user.avatarUrl.startsWith('http') ? user.avatarUrl : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000'}${user.avatarUrl}`) : '/placeholder.svg'} 
                  alt={user.name} 
                  className="w-full h-full rounded-full object-cover bg-background border-4 border-background"
                />
              </div>
              <label className="absolute inset-1 bg-black/60 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-300">
                <Camera className="w-8 h-8 mb-2" />
                <span className="text-sm font-semibold">Update Photo</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={uploadingAvatar} />
              </label>
            </div>
            
            <div className="flex-1 space-y-3">
              <h1 className="text-4xl font-extrabold tracking-tight">{user.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-foreground/70">
                {user.location && (
                  <span className="flex items-center bg-muted/50 px-3 py-1.5 rounded-full"><MapPin className="w-4 h-4 mr-1.5 text-primary" /> {user.location}</span>
                )}
                <span className="flex items-center bg-muted/50 px-3 py-1.5 rounded-full"><Shield className="w-4 h-4 mr-1.5 text-emerald-500" /> {user.email}</span>
                <span className="flex items-center bg-amber-500/10 text-amber-600 px-3 py-1.5 rounded-full">
                  <Star className="w-4 h-4 mr-1.5 fill-current" />
                  {user.averageRating ? user.averageRating.toFixed(1) : 'New User'} ({user.reviewsCount || 0} reviews)
                </span>
              </div>
            </div>
            
            <div className="flex-shrink-0 w-full md:w-auto mt-4 md:mt-0">
              <Button 
                variant={isEditing ? "default" : "outline"} 
                onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                disabled={saving}
                className={`w-full md:w-auto rounded-full font-semibold transition-all ${!isEditing ? 'border-primary/20 hover:bg-primary/5 hover:text-primary' : 'shadow-lg shadow-primary/20'}`}
                size="lg"
              >
                {isEditing ? 'Save Profile' : 'Edit Profile'}
                {!isEditing && <Settings className="w-4 h-4 ml-2" />}
              </Button>
              {isEditing && (
                <Button variant="ghost" onClick={() => setIsEditing(false)} className="w-full md:w-auto rounded-full mt-2 md:mt-0 md:ml-2">Cancel</Button>
              )}
            </div>
          </div>

          {/* Edit Profile Form OR Bio View */}
          {isEditing ? (
            <div className="grid md:grid-cols-2 gap-6 bg-muted/30 p-6 rounded-2xl border border-border/50 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold block mb-1.5 text-foreground/80">Display Name</label>
                  <Input value={name} onChange={e => setName(e.target.value)} className="bg-background" />
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-1.5 text-foreground/80">Location</label>
                  <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. San Francisco, CA" className="bg-background" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold block mb-1.5 text-foreground/80">About Me</label>
                <textarea 
                  value={bio} 
                  onChange={e => setBio(e.target.value)} 
                  placeholder="Tell the community about yourself, your goals, and what you love doing..."
                  className="w-full p-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none resize-none transition-shadow"
                  rows={5}
                />
              </div>
            </div>
          ) : (
            <div className="bg-muted/20 rounded-2xl p-6 border border-border/30">
              <h3 className="text-sm font-bold tracking-wider text-foreground/50 uppercase mb-3">About</h3>
              <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap text-lg">
                {user.bio || "No bio added yet. Tell the community what makes you awesome!"}
              </p>
              
              <div className="flex gap-8 mt-8 pt-6 border-t border-border/50">
                <div className="text-center">
                  <p className="text-3xl font-black">{user.followersCount || 0}</p>
                  <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mt-1">Followers</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-black">{user.followingCount || 0}</p>
                  <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mt-1">Following</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modern Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-8 p-1 bg-muted/40 rounded-full border border-border/50 backdrop-blur-sm w-max max-w-full">
          {[
            { id: 'info', label: 'Overview', icon: Star },
            { id: 'offered', label: `I Can Teach (${offeredSkills.length})`, icon: GraduationCap },
            { id: 'requested', label: `I Want to Learn (${requestedSkills.length})`, icon: Briefcase },
            { id: 'posts', label: `Portfolio (${posts.length})`, icon: ImageIcon }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any)
                  setShowAddOffered(false)
                  setShowAddRequested(false)
                }}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold transition-all duration-300 ${isActive ? 'bg-background shadow-md text-primary scale-100' : 'text-foreground/60 hover:text-foreground hover:bg-muted/80 scale-95'}`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-foreground/50'}`} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* --- TAB: OVERVIEW --- */}
        {activeTab === 'info' && (
          <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-card/50 backdrop-blur-md border border-border/50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Star className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold mb-4">Achievements & Badges</h3>
              {/* @ts-ignore */}
              {user.badges && user.badges.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {/* @ts-ignore */}
                  {user.badges.map(b => (
                    <span key={b} className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-400 text-white rounded-xl text-sm font-bold shadow-md shadow-amber-500/20">{b}</span>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-border">
                    <Shield className="w-6 h-6 text-foreground/30" />
                  </div>
                  <p className="text-foreground/60 font-medium">Complete exchanges to earn badges and build your reputation!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TAB: OFFERED SKILLS --- */}
        {activeTab === 'offered' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold">Skills I Can Teach</h2>
                <p className="text-foreground/60 mt-1">List what you are good at so others can find you.</p>
              </div>
              <Button 
                onClick={() => setShowAddOffered(!showAddOffered)} 
                className="rounded-full shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
              >
                {showAddOffered ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                {showAddOffered ? 'Cancel' : 'Add Skill'}
              </Button>
            </div>

            {/* Inline Add Form */}
            {showAddOffered && (
              <div className="bg-card border-2 border-primary/20 rounded-2xl p-6 mb-8 shadow-xl animate-in fade-in slide-in-from-top-4">
                <h3 className="text-lg font-bold mb-4 text-primary">Add a New Skill You Can Teach</h3>
                <form onSubmit={handleAddOffered} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold mb-1 block">Skill Title</label>
                      <Input value={newSkillTitle} onChange={e=>setNewSkillTitle(e.target.value)} placeholder="e.g. Advanced Python" required />
                    </div>
                    <div>
                      <label className="text-sm font-semibold mb-1 block">Category</label>
                      <select 
                        value={newSkillCategory} 
                        onChange={e=>setNewSkillCategory(e.target.value)}
                        className="w-full flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                      >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-1 block">Description</label>
                    <textarea 
                      value={newSkillDesc} 
                      onChange={e=>setNewSkillDesc(e.target.value)}
                      placeholder="Detail what exactly you can teach and your experience level..."
                      className="w-full p-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none resize-none"
                      rows={3}
                      required
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isAddingSkill} className="rounded-full px-8">
                      {isAddingSkill ? 'Adding...' : 'Save Skill'}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offeredSkills.map(skill => (
                <div key={skill._id} className="group relative">
                  <SkillCard skill={{
                    id: skill._id,
                    title: skill.title,
                    category: skill.categories?.[0] || 'Other',
                    user: { name: user.name, avatar: user.avatarUrl, id: user.id },
                    image: '/placeholder.svg', // In a real app we might have category images
                    description: skill.description,
                    userId: user.id
                  }} />
                  <button 
                    onClick={() => handleDeleteOffered(skill._id)}
                    className="absolute -top-3 -right-3 bg-destructive text-destructive-foreground p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-10"
                    title="Delete Skill"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            
            {offeredSkills.length === 0 && !showAddOffered && (
              <div className="text-center py-20 bg-muted/30 border-2 border-dashed border-border/60 rounded-3xl">
                <GraduationCap className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-bold mb-2">No skills offered yet</h3>
                <p className="text-foreground/60 mb-6 max-w-md mx-auto">Add the skills you're proficient in to start matching with people who want to learn from you.</p>
                <Button onClick={() => setShowAddOffered(true)} className="rounded-full shadow-lg shadow-primary/20">
                  <Plus className="w-4 h-4 mr-2" /> Add Your First Skill
                </Button>
              </div>
            )}
          </div>
        )}

        {/* --- TAB: REQUESTED SKILLS --- */}
        {activeTab === 'requested' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold">Skills I Want To Learn</h2>
                <p className="text-foreground/60 mt-1">Tell the community what you are trying to master.</p>
              </div>
              <Button 
                onClick={() => setShowAddRequested(!showAddRequested)} 
                variant="secondary"
                className="rounded-full hover:scale-105 transition-transform"
              >
                {showAddRequested ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                {showAddRequested ? 'Cancel' : 'Add Request'}
              </Button>
            </div>

            {/* Inline Add Form */}
            {showAddRequested && (
              <div className="bg-card border-2 border-secondary/40 rounded-2xl p-6 mb-8 shadow-xl animate-in fade-in slide-in-from-top-4">
                <h3 className="text-lg font-bold mb-4">Add a New Skill You Want to Learn</h3>
                <form onSubmit={handleAddRequested} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold mb-1 block">Skill Title</label>
                      <Input value={newSkillTitle} onChange={e=>setNewSkillTitle(e.target.value)} placeholder="e.g. Spanish Language" required />
                    </div>
                    <div>
                      <label className="text-sm font-semibold mb-1 block">Category</label>
                      <select 
                        value={newSkillCategory} 
                        onChange={e=>setNewSkillCategory(e.target.value)}
                        className="w-full flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                      >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-1 block">Description</label>
                    <textarea 
                      value={newSkillDesc} 
                      onChange={e=>setNewSkillDesc(e.target.value)}
                      placeholder="Why do you want to learn this? What's your current level?"
                      className="w-full p-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-secondary/50 outline-none resize-none"
                      rows={3}
                      required
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" variant="secondary" disabled={isAddingSkill} className="rounded-full px-8">
                      {isAddingSkill ? 'Adding...' : 'Save Request'}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {requestedSkills.map(skill => (
                <div key={skill._id} className="bg-card/80 backdrop-blur-md border border-border/60 hover:border-secondary/40 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative group">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="inline-block px-3 py-1 bg-secondary/10 text-secondary-foreground rounded-full text-xs font-bold mb-3">{skill.categories?.[0] || 'Other'}</span>
                      <h3 className="text-xl font-bold mb-2">{skill.title}</h3>
                      <p className="text-foreground/70 leading-relaxed">{skill.description}</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleDeleteRequested(skill._id)}
                    className="absolute top-4 right-4 bg-destructive text-destructive-foreground p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-md"
                    title="Delete Request"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {requestedSkills.length === 0 && !showAddRequested && (
              <div className="text-center py-20 bg-muted/30 border-2 border-dashed border-border/60 rounded-3xl">
                <Briefcase className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-bold mb-2">No learning requests yet</h3>
                <p className="text-foreground/60 mb-6 max-w-md mx-auto">What have you always wanted to learn? Add requests to let others know you're looking for a teacher.</p>
                <Button onClick={() => setShowAddRequested(true)} variant="secondary" className="rounded-full shadow-lg">
                  <Plus className="w-4 h-4 mr-2" /> Add Your First Request
                </Button>
              </div>
            )}
          </div>
        )}

        {/* --- TAB: PORTFOLIO POSTS --- */}
        {activeTab === 'posts' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-8 mb-10 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
              <h3 className="text-2xl font-bold mb-6 flex items-center"><ImageIcon className="w-6 h-6 mr-3 text-primary" /> Upload to Portfolio</h3>
              <form onSubmit={handlePostSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="relative group cursor-pointer">
                    <div className="aspect-video w-full rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:bg-primary/10 group-hover:border-primary/50">
                      {postFile ? (
                        <img src={URL.createObjectURL(postFile)} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <div className="w-14 h-14 bg-background rounded-full flex items-center justify-center shadow-sm mb-3">
                            <Plus className="w-6 h-6 text-primary" />
                          </div>
                          <span className="font-semibold text-primary">Select Image</span>
                          <span className="text-xs text-foreground/50 mt-1">JPG, PNG up to 5MB</span>
                        </>
                      )}
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={e => setPostFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required
                    />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold mb-2 block">Caption (Optional)</label>
                      <textarea 
                        value={postCaption} 
                        onChange={e => setPostCaption(e.target.value)} 
                        placeholder="Tell the story behind this work..."
                        className="w-full p-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                        rows={4}
                        maxLength={1000}
                      />
                    </div>
                    <Button type="submit" disabled={!postFile || uploadingPost} className="w-full rounded-full shadow-lg shadow-primary/20 hover:shadow-xl transition-all h-12 text-md font-bold">
                      {uploadingPost ? 'Publishing...' : 'Publish to Portfolio'}
                      {!uploadingPost && <ChevronRight className="w-5 h-5 ml-2" />}
                    </Button>
                  </div>
                </div>
              </form>
            </div>

            <h3 className="text-xl font-bold mb-6">Your Works ({posts.length})</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map(post => (
                <div key={post._id} className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-md group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    <img 
                      src={post.imageUrl.startsWith('http') ? post.imageUrl : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000'}${post.imageUrl}`} 
                      alt={post.caption} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                      <p className="text-white text-sm line-clamp-3">{post.caption}</p>
                      <p className="text-white/60 text-xs mt-2">{new Date(post.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                    <button 
                      onClick={() => handleDeletePost(post._id)}
                      className="bg-destructive/90 text-white p-2 rounded-full shadow-lg hover:bg-destructive hover:scale-110 transition-all backdrop-blur-sm"
                      title="Delete Post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {posts.length === 0 && (
              <div className="text-center py-16">
                <p className="text-foreground/50">Your portfolio is empty. Upload your first work above!</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
