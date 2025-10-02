'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
// Import supabase client directly
import { supabase } from '@/lib/supabaseClient'
import { Send, MoreVertical, User } from 'lucide-react'

interface Message {
  id: string
  content: string
  sender: string
  created_at: string
}

export default function ChatPage() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Check authentication
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login')
      } else {
        setSession(session)
      }
    })
  }, [router])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

    // Load messages and keep refreshed on realtime changes
    useEffect(() => {
      const fetchMessages = async () => {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: true })
        if (error) {
          console.error('Load messages error:', error.message)
        } else if (data) {
          setMessages(data)
        }
      }

      // Initial fetch
      fetchMessages()

      // Re-fetch whenever something changes
      const channel = supabase
        .channel('realtime-messages')
        .on<any>(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'messages' },
          () => {
            fetchMessages()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }, [])
   
    const sendMessage = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!newMessage.trim() || !session) return
  
      const { error } = await supabase
        .from('messages')
        .insert({
          content: newMessage.trim(),
          sender: session.user.email,
        })
      if (error) {
        console.error('Send message error:', error.message)
        alert('Failed to send: ' + error.message)
      }
      setNewMessage('')
    }

  if (!session) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 roboto-flex-body">
      <header className="bg-white shadow p-4 flex justify-between items-center roboto-flex-header">
        <div className="flex items-center space-x-2">
          <User className="w-6 h-6 text-gray-700" />
          <h1 className="text-lg font-medium text-gray-900">Chat Room</h1>
        </div>
        <MoreVertical className="w-6 h-6 text-gray-700" />
      </header>
      <main className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message-bubble ${
              msg.sender === session.user.email
                ? 'message-bubble-sent roboto-flex-sent'
                : 'message-bubble-received roboto-flex-received'
            }`}
          >
            {msg.sender !== session.user.email && (
              <p className="text-xs font-semibold text-gray-600 roboto-flex-sender">{msg.sender}</p>
            )}
            <p className="roboto-flex-content">{msg.content}</p>
            <p className="text-xs mt-1 text-gray-500 roboto-flex-timestamp">
              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>
      <form onSubmit={sendMessage} className="bg-white border-t p-4 flex roboto-flex-input-form">
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border rounded-full px-4 py-2 roboto-flex-input"
        />
        <button type="submit" className="ml-2 bg-blue-600 text-white rounded-full p-2 roboto-flex-button">
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  )
}