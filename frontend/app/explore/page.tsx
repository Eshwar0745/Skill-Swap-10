"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import SkillCard from "@/components/skill-card"
import { Search } from "lucide-react"
import { motion } from "framer-motion"
import { ScrollReveal } from "@/components/scroll-reveal"
import { api } from "@/lib/api"

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedLocation, setSelectedLocation] = useState("All")
  const [skillType, setSkillType] = useState<"offered" | "requested">("offered")
  const [skills, setSkills] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>(["All"])
  const [locations, setLocations] = useState<string[]>(["All"])

  // Load categories from backend
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.categories.list()
        setCategories(["All", ...(res.categories || [])])
      } catch (e) {
        console.error("Failed to load categories:", e)
        setCategories(["All", "Programming", "Design", "Other"])
      }
    }
    loadCategories()
  }, [])

  // Load skills from backend
  useEffect(() => {
    const loadSkills = async () => {
      setLoading(true)
      try {
        const params: any = { limit: 100 }
        if (selectedCategory !== "All") {
          params.category = selectedCategory
        }
        if (searchQuery.trim()) {
          params.q = searchQuery.trim()
        }

        const res = skillType === "offered" 
          ? await api.offeredSkills.list(params)
          : await api.requestedSkills.list(params)
        
        setSkills(res.items || [])

        // Extract unique locations from skills
        const uniqueLocations = Array.from(
          new Set(
            (res.items || [])
              .map((s: any) => s.location)
              .filter((loc: string) => loc && loc.trim())
          )
        ).sort()
        setLocations(["All", ...uniqueLocations])
      } catch (e) {
        console.error("Failed to load skills:", e)
        setSkills([])
      } finally {
        setLoading(false)
      }
    }
    loadSkills()
  }, [skillType, selectedCategory, searchQuery])

  // Filter skills by location (client-side since backend doesn't filter by location yet)
  const filteredSkills = useMemo(() => {
    if (selectedLocation === "All") return skills
    return skills.filter((skill) => skill.location === selectedLocation)
  }, [skills, selectedLocation])

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="space-y-8">
          <ScrollReveal>
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold">Explore Skills</h1>
              <p className="text-foreground/60">Discover amazing skills and connect with talented people</p>
            </div>
          </ScrollReveal>

          {/* Search and Filters */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Skill Type Toggle */}
            <div className="flex gap-2 justify-center">
              <Button
                variant={skillType === "offered" ? "default" : "outline"}
                onClick={() => setSkillType("offered")}
                className="rounded-full"
              >
                Skills Offered
              </Button>
              <Button
                variant={skillType === "requested" ? "default" : "outline"}
                onClick={() => setSkillType("requested")}
                className="rounded-full"
              >
                Skills Wanted
              </Button>
            </div>

            {/* Search Bar */}
            <motion.div className="relative" whileFocus={{ scale: 1.02 }}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search skills by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-full py-2 h-11"
              />
            </motion.div>

            {/* Filter Dropdowns */}
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.div className="flex-1" whileHover={{ scale: 1.01 }}>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 rounded-full border border-border bg-background text-foreground appearance-none cursor-pointer pr-10 transition-all duration-200 hover:border-primary/50"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23888888' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 0.5rem center",
                    backgroundSize: "1.5em 1.5em",
                    paddingRight: "2.5rem",
                  }}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </motion.div>

              <motion.div className="flex-1" whileHover={{ scale: 1.01 }}>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-4 py-2 rounded-full border border-border bg-background text-foreground appearance-none cursor-pointer pr-10 transition-all duration-200 hover:border-primary/50"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23888888' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 0.5rem center",
                    backgroundSize: "1.5em 1.5em",
                    paddingRight: "2.5rem",
                  }}
                >
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </motion.div>
            </div>

            {/* Results Count */}
            <motion.div className="text-sm text-foreground/60" animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              {loading ? "Loading..." : `Showing ${filteredSkills.length} skill${filteredSkills.length !== 1 ? "s" : ""}`}
            </motion.div>
          </motion.div>
        </div>

        {/* Skills Grid */}
        <div className="mt-12">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              <p className="mt-4 text-foreground/60">Loading skills...</p>
            </div>
          ) : filteredSkills.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.05,
                    delayChildren: 0.1,
                  },
                },
              }}
            >
              {filteredSkills.map((skill) => (
                <SkillCard key={skill._id} skill={{
                  id: skill._id,
                  title: skill.title,
                  category: skill.categories?.[0] || 'Other',
                  user: {
                    name: skill.user?.name || 'Anonymous',
                    avatar: skill.user?.avatarUrl || '/placeholder.svg',
                    id: skill.user?._id
                  },
                  image: '/placeholder.svg',
                  description: skill.description,
                  userId: skill.user?._id
                }} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="text-center py-12 space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-lg font-semibold text-foreground">No skills found</p>
              <p className="text-foreground/60">Try adjusting your filters or search term</p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  className="rounded-full bg-transparent"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("All")
                    setSelectedLocation("All")
                  }}
                >
                  Clear Filters
                </Button>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
