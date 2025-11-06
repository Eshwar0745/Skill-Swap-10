"use client"


import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit2, Plus, X, Star, MapPin, Mail } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api"

interface UserSkill {
  _id: string
  title: string
  categories: string[]
  description: string
}

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({ bio: '', location: '' })
  const [showAddSkill, setShowAddSkill] = useState(false)
  const [newSkill, setNewSkill] = useState({ title: "", categories: [""], description: "" })
  const [skillType, setSkillType] = useState<"offered" | "requested">("offered")
  const [offeredSkills, setOfferedSkills] = useState<UserSkill[]>([])
  const [requestedSkills, setRequestedSkills] = useState<UserSkill[]>([])
  const [loading, setLoading] = useState(true)
  const [availableCategories, setAvailableCategories] = useState<string[]>([])

  useEffect(() => {
    loadCategories()
    if (!user) return
    loadProfile()
  }, [user])

  const loadCategories = async () => {
    try {
      const res = await api.categories.list()
      setAvailableCategories(res.categories || [])
    } catch (e) {
      console.error(e)
      setAvailableCategories(['Programming', 'Design', 'Language Learning', 'Other'])
    }
  }

  const loadProfile = async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const [off, req] = await Promise.all([
        api.offeredSkills.list({ userId: user.id }),
        api.requestedSkills.list({ userId: user.id }),
      ])
      setOfferedSkills(off.items || [])
      setRequestedSkills(req.items || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleEditChange = (field: string, value: string) => {
    setEditData({ ...editData, [field]: value })
  }

  const handleSaveProfile = async () => {
    if (!user?.id) return
    try {
      await api.users.updateProfile(user.id, editData)
      alert('Profile updated successfully!')
      setIsEditing(false)
      // Optionally reload user data
      window.location.reload()
    } catch (e: any) {
      alert(e?.message || 'Failed to update profile')
    }
  }

  const handleAddSkill = async () => {
    if (!newSkill.title) return
    try {
      if (skillType === "offered") {
        await api.offeredSkills.create(newSkill)
      } else {
        await api.requestedSkills.create(newSkill)
      }
      setNewSkill({ title: "", categories: [""], description: "" })
      setShowAddSkill(false)
      loadProfile()
    } catch (e: any) {
      alert(e?.message || 'Failed to add skill')
    }
  }

  const handleDeleteSkill = async (skillId: string, type: "offered" | "requested") => {
    try {
      if (type === "offered") {
        await api.offeredSkills.delete(skillId)
      } else {
        await api.requestedSkills.delete(skillId)
      }
      loadProfile()
    } catch (e: any) {
      alert(e?.message || 'Failed to delete skill')
    }
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-foreground/60">Please log in to view your profile.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 bg-gradient-to-b from-background to-card/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-card border border-border rounded-xl p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <img
                  src={user.avatarUrl || "/placeholder.svg"}
                  alt={user.name}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-primary/20"
                />
                <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-2">
                  <Edit2 className="w-4 h-4 text-primary-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">{user.name}</h1>
                <div className="flex items-center gap-2 text-amber-500">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(user.averageRating || 0) ? "fill-current" : "fill-foreground/20"}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {(user.averageRating || 0).toFixed(1)} ({user.reviewsCount || 0} reviews)
                  </span>
                </div>
              </div>
            </div>

            <Button
              onClick={() => {
                setIsEditing(!isEditing)
                setEditData({ bio: user.bio || '', location: user.location || '' })
              }}
              variant={isEditing ? "default" : "outline"}
              className="rounded-full"
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>

          {/* Profile Details */}
          {isEditing ? (
            <div className="mt-8 space-y-4 border-t border-border pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Location</label>
                  <Input
                    value={editData.location}
                    onChange={(e) => handleEditChange("location", e.target.value)}
                    className="rounded-lg"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Bio</label>
                <textarea
                  value={editData.bio}
                  onChange={(e) => handleEditChange("bio", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Button onClick={handleSaveProfile} className="rounded-full">
                Save Changes
              </Button>
            </div>
          ) : (
            <div className="mt-6 border-t border-border pt-6 space-y-4">
              <p className="text-foreground/80">{user.bio || 'No bio yet.'}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-foreground/70">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm">{user.location || 'Not set'}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground/70">
                  <Mail className="w-4 h-4 text-primary" />
                  <span className="text-sm">{user.email}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Skills Section */}
        <div className="space-y-8">
          {/* Offered Skills */}
          <div className="bg-card border border-border rounded-xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Skills I Offer</h2>
              <Button
                onClick={() => {
                  setShowAddSkill(true)
                  setSkillType("offered")
                  setNewSkill({ title: "", categories: [""], description: "" })
                }}
                variant="outline"
                size="sm"
                className="rounded-full gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Skill
              </Button>
            </div>

            {loading ? (
              <p className="text-foreground/50 text-center py-8">Loading...</p>
            ) : offeredSkills.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {offeredSkills.map((skill) => (
                  <div
                    key={skill._id}
                    className="flex items-center justify-between p-4 rounded-lg bg-background border border-border hover:border-primary/50 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{skill.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {skill.categories?.map((c, i) => (
                          <span key={i} className="text-xs font-medium text-primary">{c}</span>
                        ))}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDeleteSkill(skill._id, "offered")}
                      variant="ghost"
                      size="sm"
                      className="rounded-full"
                    >
                      <X className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-foreground/50 text-center py-8">You haven't added any skills yet</p>
            )}
          </div>

          {/* Requested Skills */}
          <div className="bg-card border border-border rounded-xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Skills I Want to Learn</h2>
              <Button
                onClick={() => {
                  setShowAddSkill(true)
                  setSkillType("requested")
                  setNewSkill({ title: "", categories: [""], description: "" })
                }}
                variant="outline"
                size="sm"
                className="rounded-full gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Skill
              </Button>
            </div>

            {loading ? (
              <p className="text-foreground/50 text-center py-8">Loading...</p>
            ) : requestedSkills.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {requestedSkills.map((skill) => (
                  <div
                    key={skill._id}
                    className="flex items-center justify-between p-4 rounded-lg bg-background border border-border hover:border-secondary/50 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{skill.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {skill.categories?.map((c, i) => (
                          <span key={i} className="text-xs font-medium text-secondary">{c}</span>
                        ))}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDeleteSkill(skill._id, "requested")}
                      variant="ghost"
                      size="sm"
                      className="rounded-full"
                    >
                      <X className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-foreground/50 text-center py-8">You haven't added any skills yet</p>
            )}
          </div>
        </div>

        {/* Add Skill Modal */}
        {showAddSkill && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">
                  {skillType === "offered" ? "Add Skill to Offer" : "Add Skill to Learn"}
                </h3>
                <Button onClick={() => setShowAddSkill(false)} variant="ghost" size="icon" className="rounded-full">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold text-foreground">Skill Title</label>
                  <Input
                    placeholder="e.g., Web Development"
                    value={newSkill.title}
                    onChange={(e) => setNewSkill({ ...newSkill, title: e.target.value })}
                    className="rounded-lg mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground">Category</label>
                  <select
                    value={newSkill.categories[0] || ''}
                    onChange={(e) => setNewSkill({ ...newSkill, categories: [e.target.value] })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground mt-1 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select a category</option>
                    {availableCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground">Description (optional)</label>
                  <textarea
                    placeholder="Describe the skill..."
                    value={newSkill.description}
                    onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary mt-1"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={() => setShowAddSkill(false)} variant="outline" className="flex-1 rounded-full">
                  Cancel
                </Button>
                <Button onClick={handleAddSkill} className="flex-1 rounded-full">
                  Add
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
