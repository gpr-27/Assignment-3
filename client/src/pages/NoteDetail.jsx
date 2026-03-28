import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../utils/api'
import DashboardLayout from '../components/layout/DashboardLayout'
import SummaryPanel from '../components/SummaryPanel'
import BulletsPanel from '../components/BulletsPanel'
import MindMap from '../components/MindMap'

const TABS = ['Summary', 'Key Points', 'Mind Map']

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
    if (!window.confirm('Delete this note?')) return
    try {
      await api.delete(`/notes/${id}`)
      navigate('/')
    } catch (err) {
      console.error('Failed to delete:', err)
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
    <div className="border-b border-white/[0.06] bg-[#0d1117]/70 px-4 py-4 backdrop-blur-xl sm:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm font-medium text-[#8b949e] transition hover:text-[#58a6ff]">
            ← Notes
          </Link>
          {note && (
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold text-white sm:text-xl">{note.title}</h1>
              <p className="text-xs text-[#484f58]">
                {new Date(note.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          )}
          {loading && <span className="text-sm text-[#484f58]">Loading…</span>}
        </div>
        {note && (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-3">
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={toggleFavorite}
              className="flex h-10 min-w-10 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.04] text-lg text-amber-200 transition hover:border-[#58a6ff]/30"
              title="Favorite"
            >
              {note.isFavorite ? '★' : '☆'}
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={handleDelete}
              className="rounded-xl border border-red-500/25 bg-red-500/10 px-5 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
            >
              Delete
            </motion.button>
          </div>
        )}
      </div>
    </div>
  )

  if (!loading && !note) return null

  return (
    <DashboardLayout header={header} tags={[]} showFab>
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-[#8b949e]">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#58a6ff]/30 border-t-[#58a6ff]" />
            <p className="mt-4 text-sm">Loading note…</p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex w-full gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-1.5 ring-1 ring-white/[0.04] sm:p-2">
              {TABS.map((tab, i) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(i)}
                  className={`min-h-[52px] flex-1 rounded-xl px-4 py-3.5 text-base font-semibold tracking-tight transition sm:min-h-[56px] sm:px-8 sm:py-4 sm:text-lg ${
                    activeTab === i
                      ? 'bg-gradient-to-r from-[#58a6ff]/25 to-violet-500/25 text-white shadow-[0_0_28px_-6px_rgba(88,166,255,0.45)] ring-1 ring-[#58a6ff]/30'
                      : 'text-[#8b949e] hover:bg-white/[0.05] hover:text-[#e6edf3]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 shadow-xl shadow-black/30 ring-1 ring-white/[0.04] backdrop-blur-md sm:p-10"
            >
              {activeTab === 0 && <SummaryPanel note={note} />}
              {activeTab === 1 && <BulletsPanel bullets={note.bullets} />}
              {activeTab === 2 && <MindMap mindMap={note.mindMap} />}
            </motion.div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
