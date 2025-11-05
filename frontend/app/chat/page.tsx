"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Phone, Video, MoreVertical } from "lucide-react"

interface Message {
  id: number
  sender: "user" | "other"
  text: string
  timestamp: Date
  isTyping?: boolean
}

interface Conversation {
  id: number
  name: string
  avatar: string
  lastMessage: string
  unread: number
  isOnline: boolean
}

const conversations: Conversation[] = [
  {
    id: 1,
    name: "Sarah Kim",
    avatar: "/placeholder.svg?key=fss0l",
    lastMessage: "That sounds great! When can we start?",
    unread: 2,
    isOnline: true,
  },
  {
    id: 2,
    name: "Mike Johnson",
    avatar: "/placeholder.svg?key=ld0xe",
    lastMessage: "I love photography too!",
    unread: 0,
    isOnline: false,
  },
  {
    id: 3,
    name: "Maria Garcia",
    avatar: "/placeholder.svg?key=qby93",
    lastMessage: "Perfect, see you next week",
    unread: 0,
    isOnline: true,
  },
  {
    id: 4,
    name: "Alex Chen",
    avatar: "/placeholder.svg?key=eeg5o",
    lastMessage: "Your design portfolio is impressive",
    unread: 1,
    isOnline: true,
  },
]

const initialMessages: Message[] = [
  { id: 1, sender: "other", text: "Hey! I saw your web design skills", timestamp: new Date(Date.now() - 600000) },
  { id: 2, sender: "user", text: "Hi Sarah! Yes, I would love to help", timestamp: new Date(Date.now() - 540000) },
  {
    id: 3,
    sender: "other",
    text: "Great! I need help with my portfolio website",
    timestamp: new Date(Date.now() - 480000),
  },
  { id: 4, sender: "user", text: "I can definitely assist with that", timestamp: new Date(Date.now() - 420000) },
  { id: 5, sender: "other", text: "That sounds great! When can we start?", timestamp: new Date(Date.now() - 360000) },
]

export default function ChatPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(conversations[0])
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        sender: "user",
        text: inputValue,
        timestamp: new Date(),
      }
      setMessages([...messages, newMessage])
      setInputValue("")

      // Simulate response
      setIsTyping(true)
      setTimeout(() => {
        const responseMessage: Message = {
          id: messages.length + 2,
          sender: "other",
          text: "That sounds interesting! Tell me more about what you need.",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, responseMessage])
        setIsTyping(false)
      }, 1000)
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-background">
      {/* Conversations Sidebar */}
      <div className="w-full sm:w-80 border-r border-border bg-card overflow-y-auto">
        <div className="p-4 space-y-4">
          <h2 className="text-xl font-bold text-foreground">Messages</h2>

          <Input placeholder="Search conversations..." className="rounded-full" />

          <div className="space-y-2">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                  selectedConversation?.id === conv.id
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-background"
                }`}
              >
                <div className="relative">
                  <img src={conv.avatar || "/placeholder.svg"} alt={conv.name} className="w-10 h-10 rounded-full" />
                  {conv.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                  )}
                </div>

                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-center">
                    <p
                      className={`font-medium ${conv.unread > 0 ? "text-foreground font-semibold" : "text-foreground/70"}`}
                    >
                      {conv.name}
                    </p>
                    {conv.unread > 0 && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full font-semibold">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground/50 truncate">{conv.lastMessage}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col hidden sm:flex">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="border-b border-border bg-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={selectedConversation.avatar || "/placeholder.svg"}
                    alt={selectedConversation.name}
                    className="w-10 h-10 rounded-full"
                  />
                  {selectedConversation.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{selectedConversation.name}</h3>
                  <p className="text-xs text-foreground/50">
                    {selectedConversation.isOnline ? "Online now" : "Offline"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Phone className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Video className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-background to-card/30">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs lg:max-w-md rounded-2xl px-4 py-2 ${
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-card border border-border text-foreground rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p
                      className={`text-xs mt-1 ${msg.sender === "user" ? "text-primary-foreground/70" : "text-foreground/50"}`}
                    >
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-card border border-border rounded-2xl rounded-bl-none px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-border bg-card p-4">
              <div className="flex gap-3">
                <Input
                  placeholder="Type a message..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSendMessage()
                    }
                  }}
                  className="rounded-full"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-foreground/50">Select a conversation to start chatting</p>
          </div>
        )}
      </div>

      {/* Mobile View Message */}
      <div className="sm:hidden flex-1 flex items-center justify-center">
        <p className="text-foreground/50 text-center px-4">Open on desktop for the full chat experience</p>
      </div>
    </div>
  )
}
