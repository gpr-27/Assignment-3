import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../utils/api'

const difficultyStyle = {
  Beginner: 'bg-emerald-500/12 text-emerald-300 ring-emerald-400/20',
  Intermediate: 'bg-amber-500/12 text-amber-200 ring-amber-400/20',
  Advanced: 'bg-rose-500/12 text-rose-200 ring-rose-400/20',
}

export default function NoteCard({ note, onUpdate, onRemove }) {
  const [hovered, setHovered] = useState(false)
  const [starBurst, setStarBurst] = useState(false)

  const toggleFavorite = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setStarBurst(true)
    setTimeout(() => setStarBurst(false), 400)
    try {
      const { data } = await api.patch(`/notes/${note._id}/favorite`)
      onUpdate(data)
    } catch (err) {
      console.error('Failed to toggle favorite:', err)
    }
  }

  const handleDelete = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!window.confirm('Archive this note?')) return
    try {
      await api.delete(`/notes/${note._id}`)
      onRemove(note._id)
    } catch (err) {
      console.error('Failed to archive:', err)
    }
  }

  const preview =
    note.summary?.slice(0, 180) ||
    (note.rawText ? `${note.rawText.slice(0, 160)}…` : 'No preview')

  const hasStudy = (note.quiz?.length || 0) + (note.flashcards?.length || 0) > 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="group relative h-full"
    >
      <Link to={`/notes/${note._id}`} className="block h-full">
        <div className="glass glass-card relative flex h-full flex-col p-5">
          {/* Top row */}
          <div className="mb-3 flex min-h-10 items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <AnimatePresence mode="popLayout">
                {hovered && (
                  <motion.button
                    key="del"
                    type="button"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.15 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDelete}
                    className="rounded-xl border border-red-500/25 bg-red-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-red-200 transition hover:bg-red-500/20"
                  >
                    Archive
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
            <motion.button
              type="button"
              onClick={toggleFavorite}
              whileTap={{ scale: 0.85 }}
              className="glass shrink-0 flex h-9 w-9 items-center justify-center rounded-2xl text-base transition hover:border-[#58a6ff]/30 hover:shadow-[0_0_18px_-4px_rgba(88,166,255,0.4)]"
              title={note.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <motion.span animate={starBurst ? { scale: [1, 1.4, 1], rotate: [0, 15, -15, 0] } : {}} transition={{ duration: 0.35 }}>
                {note.isFavorite ? '★' : '☆'}
              </motion.span>
            </motion.button>
          </div>

          {/* Title */}
          <div className="mb-3">
            <h3 className="line-clamp-2 text-base font-semibold leading-snug text-white transition group-hover:text-[#79c0ff]">
              {note.title}
            </h3>
          </div>

          {/* Preview */}
          <p className="mb-4 line-clamp-3 flex-1 text-sm leading-relaxed text-[#8b949e]">{preview}</p>

          {/* Tags */}
          <div className="mb-4 flex flex-wrap gap-2">
            {note.tags?.slice(0, 4).map((tag) => (
              <span key={tag} className="rounded-full bg-violet-500/10 px-2.5 py-0.5 text-[11px] font-medium text-violet-200 ring-1 ring-violet-400/15">
                {tag}
              </span>
            ))}
            {hasStudy && (
              <span className="rounded-full bg-[#58a6ff]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#58a6ff] ring-1 ring-[#58a6ff]/15">
                🧠 Study Ready
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="mt-auto flex items-center justify-between border-t border-white/[0.04] pt-4">
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${difficultyStyle[note.difficulty] || 'bg-white/10 text-[#8b949e] ring-white/10'}`}>
              {note.difficulty}
            </span>
            <span className="text-xs text-[#484f58]">
              {new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
