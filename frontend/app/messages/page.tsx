"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api"
import { useRouter, useSearchParams } from "next/navigation"
import { Send, Users, MessageCircle } from "lucide-react"
import { toast } from "sonner"

export default function MessagesPage() {
  const { user, isAuthenticated, ready } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlUserId = searchParams?.get('userId')
  
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
      
      // Auto-select user from URL if provided
      if (urlUserId && res.connections?.length > 0) {
        const conn = res.connections.find((c: any) => String(c.userId) === urlUserId)
        if (conn) handleSelectUser(conn)
      }
      setLoading(false)
    } catch (e: any) {
      toast.error(e?.message || "Failed to load connections")
      setLoading(false)
    }
  }

  const handleSelectUser = async (conn: any) => {
    setSelectedUser(conn)
    // Clear unread count locally
    setConnections(prev => prev.map(c => c.userId === conn.userId ? { ...c, unreadCount: 0 } : c))
    
    try {
      const res = await api.messages.getThread(conn.userId)
      setMessages(res.messages || [])
      await api.messages.markRead(conn.userId)
      setTimeout(scrollToBottom, 100)
    } catch (e: any) {
      toast.error(e?.message || "Failed to load messages")
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedUser) return
    try {
      await api.messages.send({
        recipientId: selectedUser.userId,
        content: newMessage.trim(),
        exchangeId: selectedUser.exchangeId
      })
      setMessages(prev => [...prev, {
        _id: Date.now(),
        sender: user?.id,
        content: newMessage.trim(),
        createdAt: new Date()
      }])
      setNewMessage('')
      setTimeout(scrollToBottom, 100)
      
      // Update last message in connection list
      setConnections(prev => prev.map(c => 
        c.userId === selectedUser.userId 
          ? { ...c, lastMessage: { content: newMessage.trim(), createdAt: new Date(), isFromMe: true } } 
          : c
      ))
    } catch (e: any) {
      toast.error(e?.message || 'Failed to send')
    }
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen p-4 py-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-foreground/60">Chat with your swap partners</p>
      </div>

      <div className="grid md:grid-cols-[320px_1fr] gap-6 bg-card border rounded-2xl shadow-sm overflow-hidden h-[700px]">
        {/* Sidebar */}
        <div className="border-r bg-background/50 flex flex-col h-full">
          <div className="p-4 border-b bg-card">
            <h2 className="font-bold flex items-center gap-2">
              <Users className="w-5 h-5" /> Connections
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-card border rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : connections.length === 0 ? (
              <div className="text-center py-10">
                <MessageCircle className="w-10 h-10 mx-auto text-foreground/20 mb-3" />
                <p className="text-sm text-foreground/60">No connections yet.<br/>Accept a swap request to start chatting!</p>
              </div>
            ) : (
              connections.map(conn => (
                <button
                  key={conn.userId}
                  onClick={() => handleSelectUser(conn)}
                  className={`w-full p-3 rounded-xl text-left transition-all flex items-center gap-3 border ${
                    selectedUser?.userId === conn.userId 
                      ? 'bg-primary/10 border-primary/30 shadow-sm' 
                      : 'bg-card border-transparent hover:border-border'
                  }`}
                >
                  <img src={conn.avatar || '/placeholder.svg'} alt={conn.name} className="w-10 h-10 rounded-full object-cover" />
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-bold text-sm truncate pr-2">{conn.name}</p>
                      {conn.lastMessage && (
                        <span className="text-[10px] text-foreground/50 whitespace-nowrap">
                          {new Date(conn.lastMessage.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {conn.lastMessage ? (
                      <p className={`text-xs truncate ${conn.unreadCount > 0 ? 'font-semibold text-foreground' : 'text-foreground/60'}`}>
                        {conn.lastMessage.isFromMe ? 'You: ' : ''}{conn.lastMessage.content}
                      </p>
                    ) : (
                      <p className="text-xs text-foreground/40 italic">New connection</p>
                    )}
                  </div>
                  {conn.unreadCount > 0 && (
                    <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {conn.unreadCount}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
        
        {/* Chat Area */}
        <div className="flex flex-col h-full bg-card">
          {!selectedUser ? (
            <div className="flex-1 flex flex-col items-center justify-center text-foreground/40">
              <MessageCircle className="w-16 h-16 mb-4 opacity-50" />
              <p>Select a connection to start chatting</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-4 border-b flex items-center justify-between bg-background/50">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push(`/user/${selectedUser.userId}`)}>
                  <img src={selectedUser.avatar || '/placeholder.svg'} alt={selectedUser.name} className="w-10 h-10 rounded-full" />
                  <div>
                    <h2 className="font-bold hover:underline">{selectedUser.name}</h2>
                    <p className="text-xs text-foreground/60">Connected via Swap Exchange</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/30">
                {messages.length === 0 && (
                  <div className="text-center text-sm text-foreground/50 my-10">
                    This is the beginning of your conversation with {selectedUser.name}.
                  </div>
                )}
                {messages.map(msg => {
                  const isMine = String(msg.sender) === String(user?.id)
                  return (
                    <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm ${
                        isMine ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-card border rounded-tl-sm'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${isMine ? 'text-primary-foreground/70' : 'text-foreground/40'} text-right`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t bg-background/50">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSend() }}
                  className="flex gap-2"
                >
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="rounded-full bg-card"
                  />
                  <Button type="submit" disabled={!newMessage.trim()} className="rounded-full px-6">
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
