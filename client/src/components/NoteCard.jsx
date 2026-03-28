import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../utils/api'

const difficultyStyle = {
  Beginner: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/25',
  Intermediate: 'bg-amber-500/15 text-amber-200 ring-amber-400/25',
  Advanced: 'bg-rose-500/15 text-rose-200 ring-rose-400/25',
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
    if (!window.confirm('Delete this note permanently?')) return
    try {
      await api.delete(`/notes/${note._id}`)
      onRemove(note._id)
    } catch (err) {
      console.error('Failed to delete:', err)
    }
  }

  const preview =
    note.summary?.slice(0, 180) ||
    (note.rawText ? `${note.rawText.slice(0, 160)}…` : 'No preview')

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
        <div
          className={`relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-5 shadow-lg shadow-black/20 ring-1 ring-white/[0.04] backdrop-blur-md transition-all duration-300 ${
            hovered
              ? '-translate-y-1 border-[#58a6ff]/35 shadow-[0_20px_50px_-15px_rgba(88,166,255,0.25),0_0_0_1px_rgba(88,166,255,0.12)]'
              : ''
          }`}
        >
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute right-3 top-3 z-10 flex gap-1"
              >
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={handleDelete}
                  className="rounded-lg border border-red-500/30 bg-[#0d1117]/90 px-2 py-1 text-[11px] font-medium text-red-300 backdrop-blur-sm transition hover:bg-red-500/20"
                >
                  Delete
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mb-3 pr-12">
            <h3 className="line-clamp-2 text-base font-semibold leading-snug text-white transition group-hover:text-[#79c0ff]">
              {note.title}
            </h3>
          </div>

          <p className="mb-4 line-clamp-3 flex-1 text-sm leading-relaxed text-[#8b949e]">{preview}</p>

          <div className="mb-4 flex flex-wrap gap-2">
            {note.tags?.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-violet-500/12 px-2.5 py-0.5 text-[11px] font-medium text-violet-200 ring-1 ring-violet-400/20"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-white/[0.06] pt-4">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${difficultyStyle[note.difficulty] || 'bg-white/10 text-[#8b949e] ring-white/10'}`}
            >
              {note.difficulty}
            </span>
            <span className="text-xs text-[#484f58]">
              {new Date(note.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </Link>

      <motion.button
        type="button"
        onClick={toggleFavorite}
        whileTap={{ scale: 0.85 }}
        className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.1] bg-[#0d1117]/80 text-lg backdrop-blur-md transition hover:border-[#58a6ff]/40 hover:shadow-[0_0_20px_-4px_rgba(88,166,255,0.5)]"
        title={note.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <motion.span
          animate={starBurst ? { scale: [1, 1.35, 1], rotate: [0, 15, -15, 0] } : {}}
          transition={{ duration: 0.35 }}
        >
          {note.isFavorite ? '★' : '☆'}
        </motion.span>
      </motion.button>
    </motion.div>
  )
}
