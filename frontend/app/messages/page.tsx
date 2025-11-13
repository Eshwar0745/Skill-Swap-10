"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api"
import { useRouter, useSearchParams } from "next/navigation"
import { Send, Users, MessageCircle } from "lucide-react"

export default function MessagesPage() {
  const { user, isAuthenticated, ready } = useAuth()
  const router = useRouter()
  const [connections, setConnections] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ready) return
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    loadConnections()
  }, [ready, isAuthenticated])

  const loadConnections = async () => {
    try {
      const res = await api.messages.getConnections()
      setConnections(res.connections || [])
      setLoading(false)
    } catch (e) {
      console.error(e)
      setLoading(false)
    }
  }

  const handleSelectUser = async (conn: any) => {
    setSelectedUser(conn)
    try {
      const res = await api.messages.getThread(conn.userId)
      setMessages(res.messages || [])
      await api.messages.markRead(conn.userId)
    } catch (e) {
      console.error(e)
    }
  }

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedUser) return
    try {
      await api.messages.send({
        recipientId: selectedUser.userId,
        content: newMessage.trim()
      })
      setMessages(prev => [...prev, {
        _id: Date.now(),
        sender: user?.id,
        content: newMessage.trim(),
        createdAt: new Date()
      }])
      setNewMessage('')
    } catch (e: any) {
      alert(e?.message || 'Failed to send')
    }
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto grid md:grid-cols-[300px_1fr] gap-4">
        <div className="bg-card rounded-xl p-4 border">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" /> Connections
          </h2>
          {loading ? (
            <p>Loading...</p>
          ) : connections.length === 0 ? (
            <p className="text-sm text-foreground/60">No connections yet</p>
          ) : (
            connections.map(conn => (
              <button
                key={conn.userId}
                onClick={() => handleSelectUser(conn)}
                className={`w-full p-3 rounded-lg mb-2 text-left hover:bg-background ${
                  selectedUser?.userId === conn.userId ? 'bg-primary/10' : ''
                }`}
              >
                <p className="font-semibold text-sm">{conn.name}</p>
              </button>
            ))
          )}
        </div>
        
        <div className="bg-card rounded-xl border flex flex-col h-[600px]">
          {!selectedUser ? (
            <div className="flex-1 flex items-center justify-center">
              <p>Select a connection to chat</p>
            </div>
          ) : (
            <>
              <div className="p-4 border-b">
                <h2 className="font-bold">{selectedUser.name}</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(msg => {
                  const isMine = String(msg.sender) === String(user?.id)
                  return (
                    <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                        isMine ? 'bg-primary text-white' : 'bg-background'
                      }`}>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-4 border-t flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                />
                <Button onClick={handleSend}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
