"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"
import { Send, Users } from "lucide-react"
import { io, Socket } from "socket.io-client"

export default function MessagesPage() {
  const { user, isAuthenticated, ready, token } = useAuth()
  const router = useRouter()
  const [connections, setConnections] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<Socket | null>(null)
  const selectedUserRef = useRef<any>(null)

  // Keep ref in sync
  useEffect(() => {
    selectedUserRef.current = selectedUser
  }, [selectedUser])

  useEffect(() => {
    if (!ready) return
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    loadConnections()

    // Initialize Socket.io
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
    const socket = io(backendUrl, {
      auth: { token }
    })
    
    socket.on('connect', () => {
      console.log('Socket.io connected')
    })
    
    socket.on('message:new', (msg) => {
      loadConnections()
      
      setMessages((prev) => {
        const currentSelectedUser = selectedUserRef.current
        // Only append if the message is part of the currently active thread
        if (currentSelectedUser && (String(msg.sender) === String(currentSelectedUser.userId) || String(msg.recipient) === String(currentSelectedUser.userId))) {
           // Also mark it as read immediately if it's from them
           if (String(msg.sender) === String(currentSelectedUser.userId)) {
             api.messages.markRead(currentSelectedUser.userId).catch(console.error)
           }
           // avoid duplicates if we just sent it (though we append locally first, so we should check ID)
           if (prev.some(m => m._id === msg._id)) return prev;
           return [...prev, msg]
        }
        return prev
      })
    })

    socketRef.current = socket

    return () => {
      socket.disconnect()
    }
  }, [ready, isAuthenticated, token])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
    console.log("Selected user:", conn)
    setSelectedUser(conn)
    try {
      const res = await api.messages.getThread(conn.userId)
      console.log("Thread response:", res)
      setMessages(res.messages || [])
      await api.messages.markRead(conn.userId)
    } catch (e) {
      console.error("Error fetching thread:", e)
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
              {selectedUser.isReadOnly ? (
                <div className="p-4 border-t text-center text-sm text-amber-600 bg-amber-50 rounded-b-xl border-amber-200">
                  This exchange is completed. Chat is locked (read-only mode).
                </div>
              ) : (
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
              )}
              </>
          )}
        </div>
      </div>
    </div>
  )
}
