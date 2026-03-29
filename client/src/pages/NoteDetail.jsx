import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../utils/api'
import DashboardLayout from '../components/layout/DashboardLayout'
import SummaryPanel from '../components/SummaryPanel'
import BulletsPanel from '../components/BulletsPanel'
import MindMap from '../components/MindMap'
import StudyMode from '../components/StudyMode'
import ChatPanel from '../components/ChatPanel'
import ExportPanel from '../components/ExportPanel'

const TABS = [
  { label: 'Overview', icon: '📋' },
  { label: 'Mind Map', icon: '🗺️' },
  { label: 'Study', icon: '🧠' },
  { label: 'Chat', icon: '💬' },
  { label: 'Export', icon: '📥' },
]

export default function NoteDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [note, setNote] = useState(null)
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNote()
  }, [id])

  const fetchNote = async () => {
    try {
      const { data } = await api.get(`/notes/${id}`)
      setNote(data)
    } catch (err) {
      console.error('Failed to fetch note:', err)
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Archive this note?')) return
    try {
      await api.delete(`/notes/${id}`)
      navigate('/')
    } catch (err) {
      console.error('Failed to archive:', err)
    }
  }

  const toggleFavorite = async () => {
    try {
      const { data } = await api.patch(`/notes/${id}/favorite`)
      setNote(data)
    } catch (err) {
      console.error('Failed to toggle favorite:', err)
    }
  }

  const header = (
    <div className="border-b border-white/[0.04] bg-[#0a0e14]/70 px-3 py-4 backdrop-blur-2xl backdrop-saturate-[180%] sm:px-5 lg:px-8">
      <div className="mx-auto flex w-full max-w-[min(96rem,calc(100%-2rem))] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm font-medium text-[#8b949e] transition hover:text-[#58a6ff]">
            ← Notes
          </Link>
          {note && (
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold text-white sm:text-xl">{note.title}</h1>
              <p className="text-xs text-[#484f58]">
                {new Date(note.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          )}
          {loading && <span className="text-sm text-[#484f58]">Loading…</span>}
        </div>
        {note && (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-3">
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={toggleFavorite}
              className="glass flex h-10 min-w-10 items-center justify-center rounded-2xl text-lg text-amber-200 transition hover:border-[#58a6ff]/25"
              title="Favorite"
            >
              {note.isFavorite ? '★' : '☆'}
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={handleDelete}
              className="rounded-2xl border border-red-500/20 bg-red-500/8 px-5 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-500/15"
            >
              Archive
            </motion.button>
          </div>
        )}
      </div>
    </div>
  )

  if (!loading && !note) return null

  return (
    <DashboardLayout header={header} tags={[]} showFab>
      <div className="mx-auto w-full max-w-[min(96rem,calc(100%-2rem))] px-3 py-6 sm:px-5 sm:py-8 lg:px-8 lg:py-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-[#8b949e]">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#58a6ff]/30 border-t-[#58a6ff]" />
            <p className="mt-4 text-sm">Loading note…</p>
          </div>
        ) : (
          <>
            {/* ─── Tab Bar ─────────────────────────────────────── */}
            <div className="glass mb-6 flex w-full gap-1 overflow-x-auto rounded-2xl p-1.5 sm:gap-1.5 sm:p-2 lg:p-2.5">
              {TABS.map((tab, i) => (
                <button
                  key={tab.label}
                  type="button"
                  onClick={() => setActiveTab(i)}
                  className={`shrink-0 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold tracking-tight transition sm:flex-1 sm:justify-center sm:px-5 sm:py-3.5 ${
                    activeTab === i
                      ? 'glass-active text-white'
                      : 'text-[#8b949e] hover:bg-white/[0.04] hover:text-[#e6edf3]'
                  }`}
                >
                  <span className="text-base">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* ─── Content Panel ────────────────────────────────── */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, ease: [0.25, 0.1, 0.25, 1] }}
              className={
                activeTab === 3
                  ? 'chat-tab-shell p-5 sm:p-8 lg:p-10'
                  : 'glass-elevated p-5 sm:p-8 lg:p-12'
              }
            >
              {activeTab === 0 && (
                <div className="space-y-10 lg:space-y-12">
                  <SummaryPanel note={note} />
                  <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
                  <BulletsPanel bullets={note.bullets} />
                </div>
              )}
              {activeTab === 1 && <MindMap mindMap={note.mindMap} />}
              {activeTab === 2 && <StudyMode note={note} onNoteUpdate={setNote} />}
              {activeTab === 3 && <ChatPanel noteId={id} />}
              {activeTab === 4 && <ExportPanel note={note} />}
            </motion.div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
