"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Moon, Sun, LogOut, Bell, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api"

interface NavbarProps {
  darkMode: boolean
  onToggleDarkMode: () => void
}

export default function Navbar({ darkMode, onToggleDarkMode }: NavbarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { isAuthenticated, user, logout, ready } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    if (isAuthenticated) {
      loadUnreadCount()
      loadNotifications()
      // Poll every 30 seconds
      const interval = setInterval(() => {
        loadUnreadCount()
        loadNotifications()
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  const loadUnreadCount = async () => {
    try {
      const res = await api.messages.unreadCount()
      setUnreadCount(res.count || 0)
    } catch (e) {
      console.error(e)
    }
  }

  const loadNotifications = async () => {
    try {
      const res = await api.notifications.list({ page: 1, limit: 5 })
      setNotifications(res.items || [])
    } catch (e) {
      console.error(e)
    }
  }

  const links = [
    { href: "/", label: "Home" },
    { href: "/explore", label: "Explore" },
    { href: "/find-matches", label: "Find Matches" },
    { href: "/exchanges", label: "Exchanges" },
    { href: "/profile", label: "Profile" },
  ]

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-xl text-primary hover:text-primary/80 transition-colors duration-200"
            >
              <motion.div
                className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-primary-foreground text-sm font-bold"
                whileHover={{ rotate: 10 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                SS
              </motion.div>
              <span className="hidden sm:inline">SkillSwap</span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.div
            className="hidden md:flex items-center gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {links.map((link, index) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
              >
                <Link
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 relative ${
                    pathname === link.href
                      ? "text-primary bg-primary/10"
                      : "text-foreground/70 hover:text-foreground hover:bg-background"
                  }`}
                >
                  <motion.span whileHover={{ y: -2 }} transition={{ duration: 0.2 }} className="inline-block">
                    {link.label}
                  </motion.span>
                  {pathname === link.href && (
                    <motion.div
                      layoutId="navbar-underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <>
                {/* Messages Icon with Badge */}
                <Link href="/messages">
                  <Button variant="ghost" size="icon" className="rounded-full relative">
                    <MessageCircle className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Button>
                </Link>

                {/* Notifications Icon with Dropdown */}
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full"
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                  >
                    <Bell className="h-5 w-5" />
                    {notifications.filter(n => !n.read).length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {notifications.filter(n => !n.read).length}
                      </span>
                    )}
                  </Button>

                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg p-4 z-50">
                      <h3 className="font-bold mb-3">Notifications</h3>
                      {notifications.length === 0 ? (
                        <p className="text-sm text-foreground/60">No notifications</p>
                      ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {notifications.map((notif) => (
                            <div
                              key={notif._id}
                              className={`p-3 rounded-lg text-sm ${
                                notif.read ? 'bg-background/50' : 'bg-primary/10'
                              }`}
                              onClick={async () => {
                                if (!notif.read) {
                                  await api.notifications.markRead(notif._id)
                                  loadNotifications()
                                }
                              }}
                            >
                              <p className="font-semibold">{notif.title}</p>
                              <p className="text-foreground/70">{notif.body}</p>
                              <p className="text-xs text-foreground/50 mt-1">
                                {new Date(notif.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleDarkMode}
                className="rounded-full transition-all duration-200"
              >
                <motion.div
                  key={darkMode ? "sun" : "moon"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-center"
                >
                  {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </motion.div>
              </Button>
            </motion.div>

            {ready && isAuthenticated ? (
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground/80 hidden sm:inline">{user?.name || user?.email}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => logout()}
                    className="rounded-full transition-all duration-200"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/login">
                  <Button variant="default" className="rounded-full transition-all duration-200">
                    Login
                  </Button>
                </Link>
              </motion.div>
            )}

            {/* Mobile menu button */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden rounded-full transition-all duration-200"
              >
                <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
                  <Menu className="h-5 w-5" />
                </motion.div>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden pb-3 space-y-1 overflow-hidden"
            >
              {links.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <Link
                    href={link.href}
                    className={`block px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      pathname === link.href
                        ? "text-primary bg-primary/10"
                        : "text-foreground/70 hover:text-foreground hover:bg-background"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}
