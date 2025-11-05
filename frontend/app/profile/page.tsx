"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit2, Plus, X, Star, MapPin, Mail, Phone } from "lucide-react"

interface UserSkill {
  id: number
  title: string
  category: string
  level: "beginner" | "intermediate" | "advanced"
}

interface UserProfile {
  name: string
  email: string
  phone: string
  location: string
  bio: string
  avatar: string
  offeredSkills: UserSkill[]
  requestedSkills: UserSkill[]
  rating: number
  reviews: number
}

const initialProfile: UserProfile = {
  name: "Sarah Kim",
  email: "sarah.kim@example.com",
  phone: "+1 (555) 123-4567",
  location: "San Francisco, CA",
  bio: "Passionate about JavaScript and helping others learn to code. Coffee enthusiast and open source contributor.",
  avatar: "/placeholder.svg?key=fss0l",
  offeredSkills: [
    { id: 1, title: "JavaScript Mastery", category: "Programming", level: "advanced" },
    { id: 2, title: "Web Development", category: "Programming", level: "advanced" },
    { id: 3, title: "React Basics", category: "Programming", level: "intermediate" },
  ],
  requestedSkills: [
    { id: 4, title: "UI/UX Design", category: "Design", level: "beginner" },
    { id: 5, title: "Photography", category: "Creative", level: "beginner" },
  ],
  rating: 4.8,
  reviews: 24,
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(initialProfile)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(profile)
  const [showAddSkill, setShowAddSkill] = useState(false)
  const [newSkill, setNewSkill] = useState({ title: "", category: "", level: "beginner" as const })
  const [skillType, setSkillType] = useState<"offered" | "requested">("offered")

  const handleEditChange = (field: string, value: string) => {
    setEditData({ ...editData, [field]: value })
  }

  const handleSaveProfile = () => {
    setProfile(editData)
    setIsEditing(false)
  }

  const handleAddSkill = () => {
    if (newSkill.title && newSkill.category) {
      const updatedProfile = { ...profile }
      const skillList = skillType === "offered" ? updatedProfile.offeredSkills : updatedProfile.requestedSkills
      skillList.push({
        id: Math.max(...skillList.map((s) => s.id), 0) + 1,
        ...newSkill,
      })
      setProfile(updatedProfile)
      setNewSkill({ title: "", category: "", level: "beginner" })
      setShowAddSkill(false)
    }
  }

  const handleDeleteSkill = (skillId: number, type: "offered" | "requested") => {
    const updatedProfile = { ...profile }
    if (type === "offered") {
      updatedProfile.offeredSkills = updatedProfile.offeredSkills.filter((s) => s.id !== skillId)
    } else {
      updatedProfile.requestedSkills = updatedProfile.requestedSkills.filter((s) => s.id !== skillId)
    }
    setProfile(updatedProfile)
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
                  src={profile.avatar || "/placeholder.svg"}
                  alt={profile.name}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-primary/20"
                />
                <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-2">
                  <Edit2 className="w-4 h-4 text-primary-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">{profile.name}</h1>
                <div className="flex items-center gap-2 text-amber-500">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(profile.rating) ? "fill-current" : "fill-foreground/20"}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {profile.rating} ({profile.reviews} reviews)
                  </span>
                </div>
              </div>
            </div>

            <Button
              onClick={() => {
                setIsEditing(!isEditing)
                setEditData(profile)
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
                  <label className="text-sm font-semibold text-foreground">Name</label>
                  <Input
                    value={editData.name}
                    onChange={(e) => handleEditChange("name", e.target.value)}
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Email</label>
                  <Input
                    value={editData.email}
                    onChange={(e) => handleEditChange("email", e.target.value)}
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Phone</label>
                  <Input
                    value={editData.phone}
                    onChange={(e) => handleEditChange("phone", e.target.value)}
                    className="rounded-lg"
                  />
                </div>
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
              <p className="text-foreground/80">{profile.bio}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-foreground/70">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm">{profile.location}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground/70">
                  <Mail className="w-4 h-4 text-primary" />
                  <span className="text-sm">{profile.email}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground/70">
                  <Phone className="w-4 h-4 text-primary" />
                  <span className="text-sm">{profile.phone}</span>
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
                  setNewSkill({ title: "", category: "", level: "beginner" })
                }}
                variant="outline"
                size="sm"
                className="rounded-full gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Skill
              </Button>
            </div>

            {profile.offeredSkills.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {profile.offeredSkills.map((skill) => (
                  <div
                    key={skill.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-background border border-border hover:border-primary/50 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{skill.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-medium text-primary">{skill.category}</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary capitalize">
                          {skill.level}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDeleteSkill(skill.id, "offered")}
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
                  setNewSkill({ title: "", category: "", level: "beginner" })
                }}
                variant="outline"
                size="sm"
                className="rounded-full gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Skill
              </Button>
            </div>

            {profile.requestedSkills.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {profile.requestedSkills.map((skill) => (
                  <div
                    key={skill.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-background border border-border hover:border-secondary/50 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{skill.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-medium text-secondary">{skill.category}</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-secondary/10 text-secondary capitalize">
                          {skill.level}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDeleteSkill(skill.id, "requested")}
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
                    value={newSkill.category}
                    onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground mt-1"
                  >
                    <option value="">Select category</option>
                    <option value="Programming">Programming</option>
                    <option value="Design">Design</option>
                    <option value="Creative">Creative</option>
                    <option value="Languages">Languages</option>
                    <option value="Music">Music</option>
                    <option value="Business">Business</option>
                    <option value="Health">Health</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground">Level</label>
                  <select
                    value={newSkill.level}
                    onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground mt-1"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
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
