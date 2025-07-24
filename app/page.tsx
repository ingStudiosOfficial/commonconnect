"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Send, User, MoreVertical } from "lucide-react"

interface Message {
  _id: string
  content: string
  sender: string
  timestamp: Date
  avatar?: string
}

export default function ChatApp() {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [username, setUsername] = useState("")
  const [isUsernameSet, setIsUsernameSet] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load messages from localStorage on component mount
  useEffect(() => {
    if (!isUsernameSet) return

    const loadMessages = () => {
      try {
        const storedMessages = localStorage.getItem("chat-messages")
        if (storedMessages) {
          const parsedMessages = JSON.parse(storedMessages).map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }))
          setMessages(parsedMessages)
        }
      } catch (error) {
        console.error("Error loading messages:", error)
      }
    }

    loadMessages()

    // Poll for new messages every 2 seconds (simulates real-time updates from other users)
    const interval = setInterval(loadMessages, 2000)
    return () => clearInterval(interval)
  }, [isUsernameSet])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isLoading) return

    setIsLoading(true)

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300))

      const message: Message = {
        _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        content: newMessage.trim(),
        sender: username,
        timestamp: new Date(),
      }

      // Get existing messages from localStorage
      const existingMessages = JSON.parse(localStorage.getItem("chat-messages") || "[]")
      const updatedMessages = [...existingMessages, message]

      // Save to localStorage
      localStorage.setItem("chat-messages", JSON.stringify(updatedMessages))

      // Update state
      setMessages(
        updatedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      )

      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      setIsUsernameSet(true)
    }
  }

  const clearChat = () => {
    localStorage.removeItem("chat-messages")
    setMessages([])
  }

  if (!isUsernameSet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Chat</h1>
            <p className="text-gray-600">Enter your name to start chatting</p>
          </div>

          <form onSubmit={handleUsernameSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-2xl font-medium hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              Start Chatting
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Chat Room</h1>
              <p className="text-sm text-gray-500">Welcome, {username}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={clearChat}
              className="px-3 py-1 text-xs bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
            >
              Clear Chat
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <MoreVertical className="text-gray-600 w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="max-w-4xl mx-auto p-4 pb-24">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="text-blue-600 w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
            <p className="text-gray-500">Start the conversation by sending a message!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${message.sender === username ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-3xl ${
                    message.sender === username
                      ? "bg-blue-600 text-white rounded-br-lg"
                      : "bg-white text-gray-900 rounded-bl-lg shadow-sm"
                  }`}
                >
                  {message.sender !== username && (
                    <p className="text-xs font-medium text-blue-600 mb-1">{message.sender}</p>
                  )}
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${message.sender === username ? "text-blue-100" : "text-gray-500"}`}>
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={sendMessage} className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim() || isLoading}
              className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
