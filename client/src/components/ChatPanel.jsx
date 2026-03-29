import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import api from '../utils/api'
import ChatMarkdown from './ChatMarkdown'

export default function ChatPanel({ noteId }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(true)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => { loadHistory() }, [noteId])
  useEffect(() => { scrollToBottom() }, [messages])

  const scrollToBottom = () => {
    const el = scrollRef.current
    if (!el) return
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight
    })
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

    const tempUserMsg = { _id: `temp-${Date.now()}`, role: 'user', content: text, createdAt: new Date() }
    setMessages((prev) => [...prev, tempUserMsg])

    try {
      const { data } = await api.post(`/notes/${noteId}/chat`, { message: text })
      setMessages((prev) => [
        ...prev.filter((m) => m._id !== tempUserMsg._id),
        data.userMessage,
        data.assistantMessage,
      ])
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m._id !== tempUserMsg._id))
      console.error('Failed to send message:', err)
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  return (
    <div className="flex min-h-[min(72vh,720px)] h-[min(78vh,820px)] flex-col">
      {/* Messages area */}
      <div
        ref={scrollRef}
        className="chat-scroll-panel flex-1 space-y-5 overflow-y-auto p-5 sm:p-6 lg:p-7 [contain:layout_paint]"
      >
        {historyLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#58a6ff]/30 border-t-[#58a6ff]" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="animate-float mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#58a6ff]/15 to-violet-500/15 text-2xl ring-1 ring-white/[0.06]">
              💬
            </div>
            <p className="text-sm font-medium text-[#c9d1d9]">Chat with your notes</p>
            <p className="mt-1 max-w-xs text-xs text-[#484f58]">
              Ask questions about this specific note — the AI will answer based only on your content.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`min-w-0 rounded-3xl px-5 py-4 text-[15px] leading-relaxed sm:px-6 sm:py-4 sm:text-base ${
                  msg.role === 'user'
                    ? 'max-w-[min(88%,26rem)] bg-gradient-to-r from-[#58a6ff]/15 to-violet-500/15 text-[#e6edf3] ring-1 ring-[#58a6ff]/15'
                    : 'chat-bubble-ai max-w-[75%] text-[#c9d1d9]'
                }`}
              >
                {msg.role === 'assistant' && (
                  <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#58a6ff]/50">
                    NoteWise AI
                  </span>
                )}
                {msg.role === 'assistant' ? (
                  <ChatMarkdown>{msg.content}</ChatMarkdown>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="chat-bubble-ai flex w-full max-w-[75%] items-center gap-2 rounded-3xl px-5 py-3.5">
              <div className="h-2 w-2 animate-bounce rounded-full bg-[#58a6ff]/50" style={{ animationDelay: '0ms' }} />
              <div className="h-2 w-2 animate-bounce rounded-full bg-[#58a6ff]/50" style={{ animationDelay: '150ms' }} />
              <div className="h-2 w-2 animate-bounce rounded-full bg-[#58a6ff]/50" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="mt-5 flex gap-3 sm:gap-4">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about this note…"
          disabled={loading}
          className="glass-input min-h-[52px] flex-1 px-5 py-3.5 text-[15px] text-[#e6edf3] outline-none placeholder:text-[#484f58] disabled:opacity-50 sm:text-base"
        />
        <motion.button
          type="submit"
          disabled={loading || !input.trim()}
          whileHover={{ scale: loading ? 1 : 1.03 }}
          whileTap={{ scale: loading ? 1 : 0.97 }}
          className="glass-button min-h-[52px] shrink-0 px-7 py-3.5 text-[15px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
        >
          Send
        </motion.button>
      </form>
    </div>
  )
}
