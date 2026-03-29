import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import api from '../utils/api'

export default function ChatPanel({ noteId }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(true)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    loadHistory()
  }, [noteId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }

  const loadHistory = async () => {
    try {
      const { data } = await api.get(`/notes/${noteId}/chat`)
      setMessages(data)
    } catch (err) {
      console.error('Failed to load chat history:', err)
    } finally {
      setHistoryLoading(false)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    setInput('')
    setLoading(true)

    // Optimistically add user message
    const tempUserMsg = { _id: `temp-${Date.now()}`, role: 'user', content: text, createdAt: new Date() }
    setMessages((prev) => [...prev, tempUserMsg])

    try {
      const { data } = await api.post(`/notes/${noteId}/chat`, { message: text })
      // Replace temp message and add assistant response
      setMessages((prev) => [
        ...prev.filter((m) => m._id !== tempUserMsg._id),
        data.userMessage,
        data.assistantMessage,
      ])
    } catch (err) {
      // Remove temp message on error
      setMessages((prev) => prev.filter((m) => m._id !== tempUserMsg._id))
      console.error('Failed to send message:', err)
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  return (
    <div className="flex h-[min(65vh,560px)] flex-col">
      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto rounded-xl border border-white/[0.06] bg-[#010409]/60 p-4"
      >
        {historyLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#58a6ff]/30 border-t-[#58a6ff]" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#58a6ff]/20 to-violet-500/20 text-2xl">
              💬
            </div>
            <p className="text-sm font-medium text-[#c9d1d9]">Chat with your notes</p>
            <p className="mt-1 max-w-xs text-xs text-[#484f58]">
              Ask questions about your notes and get AI-powered answers based on your content.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <motion.div
              key={msg._id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-[#58a6ff]/20 to-violet-500/20 text-[#e6edf3] ring-1 ring-[#58a6ff]/20'
                    : 'border border-white/[0.08] bg-white/[0.04] text-[#c9d1d9] ring-1 ring-white/[0.04]'
                }`}
              >
                {msg.role === 'assistant' && (
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-[#58a6ff]/60">
                    AI
                  </span>
                )}
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </motion.div>
          ))
        )}

        {/* Typing indicator */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex items-center gap-1.5 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 ring-1 ring-white/[0.04]">
              <div className="h-2 w-2 animate-bounce rounded-full bg-[#58a6ff]/60" style={{ animationDelay: '0ms' }} />
              <div className="h-2 w-2 animate-bounce rounded-full bg-[#58a6ff]/60" style={{ animationDelay: '150ms' }} />
              <div className="h-2 w-2 animate-bounce rounded-full bg-[#58a6ff]/60" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="mt-4 flex gap-3">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your notes…"
          disabled={loading}
          className="flex-1 rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-sm text-[#e6edf3] outline-none transition placeholder:text-[#484f58] focus:border-[#58a6ff]/40 focus:ring-1 focus:ring-[#58a6ff]/30 disabled:opacity-50"
        />
        <motion.button
          type="submit"
          disabled={loading || !input.trim()}
          whileHover={{ scale: loading ? 1 : 1.03 }}
          whileTap={{ scale: loading ? 1 : 0.97 }}
          className="shrink-0 rounded-xl bg-gradient-to-r from-[#58a6ff] to-[#7c3aed] px-5 py-3 text-sm font-semibold text-white shadow-[0_4px_16px_-4px_rgba(88,166,255,0.4)] transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send
        </motion.button>
      </form>
    </div>
  )
}
