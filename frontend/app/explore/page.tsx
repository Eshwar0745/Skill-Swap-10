"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import SkillCard from "@/components/skill-card"
import { Search } from "lucide-react"
import { motion } from "framer-motion"
import { ScrollReveal } from "@/components/scroll-reveal"

const allSkills = [
  {
    id: 1,
    title: "Web Design",
    category: "Design",
    location: "New York",
    user: { name: "Alex Chen", avatar: "/placeholder.svg?key=eeg5o" },
    image: "/placeholder.svg?key=j2oz9",
  },
  {
    id: 2,
    title: "JavaScript Mastery",
    category: "Programming",
    location: "San Francisco",
    user: { name: "Sarah Kim", avatar: "/placeholder.svg?key=fss0l" },
    image: "/placeholder.svg?key=edn2i",
  },
  {
    id: 3,
    title: "Photography Basics",
    category: "Creative",
    location: "Los Angeles",
    user: { name: "Mike Johnson", avatar: "/placeholder.svg?key=ld0xe" },
    image: "/placeholder.svg?key=fjd9v",
  },
  {
    id: 4,
    title: "Spanish Language",
    category: "Languages",
    location: "Miami",
    user: { name: "Maria Garcia", avatar: "/placeholder.svg?key=qby93" },
    image: "/placeholder.svg?key=45n2s",
  },
  {
    id: 5,
    title: "React Development",
    category: "Programming",
    location: "Seattle",
    user: { name: "David Park", avatar: "/placeholder.svg?key=mnd02" },
    image: "/placeholder.svg?key=knj9p",
  },
  {
    id: 6,
    title: "UI/UX Design",
    category: "Design",
    location: "Austin",
    user: { name: "Emma Wilson", avatar: "/placeholder.svg?key=ols34" },
    image: "/placeholder.svg?key=rnd3x",
  },
  {
    id: 7,
    title: "Video Editing",
    category: "Creative",
    location: "Nashville",
    user: { name: "Chris Miller", avatar: "/placeholder.svg?key=qpk89" },
    image: "/placeholder.svg?key=vdn4k",
  },
  {
    id: 8,
    title: "French Language",
    category: "Languages",
    location: "Boston",
    user: { name: "Pierre Laurent", avatar: "/placeholder.svg?key=jdm92" },
    image: "/placeholder.svg?key=frn1m",
  },
  {
    id: 9,
    title: "Graphic Design",
    category: "Design",
    location: "Portland",
    user: { name: "Lisa Brown", avatar: "/placeholder.svg?key=jse03" },
    image: "/placeholder.svg?key=grd5n",
  },
  {
    id: 10,
    title: "Piano Lessons",
    category: "Music",
    location: "Chicago",
    user: { name: "James Carter", avatar: "/placeholder.svg?key=mos28" },
    image: "/placeholder.svg?key=pno7q",
  },
  {
    id: 11,
    title: "Digital Marketing",
    category: "Business",
    location: "Denver",
    user: { name: "Rachel Green", avatar: "/placeholder.svg?key=rgs45" },
    image: "/placeholder.svg?key=dmn8s",
  },
  {
    id: 12,
    title: "Yoga & Fitness",
    category: "Health",
    location: "Phoenix",
    user: { name: "Sophia Lee", avatar: "/placeholder.svg?key=yli67" },
    image: "/placeholder.svg?key=yga9t",
  },
]

const categories = ["All", "Design", "Programming", "Creative", "Languages", "Music", "Business", "Health"]
const locations = [
  "All",
  "New York",
  "San Francisco",
  "Los Angeles",
  "Miami",
  "Seattle",
  "Austin",
  "Nashville",
  "Boston",
  "Portland",
  "Chicago",
  "Denver",
  "Phoenix",
]

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedLocation, setSelectedLocation] = useState("All")

  const filteredSkills = useMemo(() => {
    return allSkills.filter((skill) => {
      const matchesSearch =
        skill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.category.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "All" || skill.category === selectedCategory
      const matchesLocation = selectedLocation === "All" || skill.location === selectedLocation

      return matchesSearch && matchesCategory && matchesLocation
    })
  }, [searchQuery, selectedCategory, selectedLocation])

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
            {/* Search Bar */}
            <motion.div className="relative" whileFocus={{ scale: 1.02 }}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search skills..."
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
              Showing {filteredSkills.length} skill{filteredSkills.length !== 1 ? "s" : ""}
            </motion.div>
          </motion.div>
        </div>

        {/* Skills Grid */}
        <div className="mt-12">
          {filteredSkills.length > 0 ? (
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
                <SkillCard key={skill.id} skill={skill} />
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
