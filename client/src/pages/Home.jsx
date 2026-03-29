import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../utils/api'
import DashboardLayout from '../components/layout/DashboardLayout'
import NoteCard from '../components/NoteCard'
import NoteSkeletonGrid from '../components/NoteSkeleton'

export default function Home() {
  const [searchParams] = useSearchParams()
  const [notes, setNotes] = useState([])
  const [search, setSearch] = useState('')
  const [difficulty, setDifficulty] = useState('all')
  const [sort, setSort] = useState('recent')
  const [loading, setLoading] = useState(true)

  const viewFavorites = searchParams.get('view') === 'favorites'
  const tagParam = searchParams.get('tag')
  const tagFilter = tagParam ? decodeURIComponent(tagParam) : ''

  useEffect(() => { fetchNotes() }, [])

  const fetchNotes = async () => {
    try {
      const { data } = await api.get('/notes')
      setNotes(data)
    } catch (err) {
      if (err.response?.status !== 401) console.error('Failed to fetch notes:', err)
    } finally {
      setLoading(false)
    }
  }

  const allTags = useMemo(() => {
    const set = new Set()
    notes.forEach((n) => (n.tags || []).forEach((t) => set.add(t)))
    return [...set].sort()
  }, [notes])

  const handleNoteUpdate = (updatedNote) => {
    setNotes((prev) => prev.map((n) => (n._id === updatedNote._id ? updatedNote : n)))
  }

  const handleRemove = (id) => {
    setNotes((prev) => prev.filter((n) => n._id !== id))
  }

  let filtered = notes.filter((note) => {
    if (viewFavorites && !note.isFavorite) return false
    if (tagFilter && !(note.tags || []).includes(tagFilter)) return false
    if (difficulty !== 'all' && note.difficulty !== difficulty) return false
    const q = search.toLowerCase()
    if (!q) return true
    return (
      note.title?.toLowerCase().includes(q) ||
      note.tags?.some((t) => t.toLowerCase().includes(q)) ||
      note.summary?.toLowerCase().includes(q)
    )
  })

  filtered = [...filtered].sort((a, b) => {
    if (sort === 'favorites') {
      if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1
    }
    if (sort === 'title') return (a.title || '').localeCompare(b.title || '')
    return new Date(b.createdAt) - new Date(a.createdAt)
  })

  const headerTitle = viewFavorites ? 'Favorites' : tagFilter ? `Tag: ${tagFilter}` : 'Dashboard'

  const header = (
    <div className="sticky top-0 z-[5] border-b border-white/[0.04] bg-[#0a0e14]/70 px-4 py-5 backdrop-blur-2xl backdrop-saturate-[180%] sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <div className="flex flex-col gap-1 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{headerTitle}</h1>
            <p className="mt-1 text-sm text-[#8b949e]">
              {loading ? 'Syncing your workspace…' : `${filtered.length} note${filtered.length !== 1 ? 's' : ''} · AI-powered`}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:gap-4">
          <div className="relative min-w-0 flex-1">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#484f58]">⌕</span>
            <input
              type="search"
              placeholder="Search notes, tags, or summaries…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-input w-full py-3 pl-11 pr-4 text-sm text-[#e6edf3] outline-none placeholder:text-[#484f58]"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="glass-input cursor-pointer px-3 py-2.5 text-sm text-[#c9d1d9] outline-none"
            >
              <option value="all">All levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="glass-input cursor-pointer px-3 py-2.5 text-sm text-[#c9d1d9] outline-none"
            >
              <option value="recent">Most recent</option>
              <option value="favorites">Favorites first</option>
              <option value="title">Title A–Z</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <DashboardLayout header={header} tags={allTags} showFab>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
        {loading ? (
          <NoteSkeletonGrid count={6} />
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-elevated flex flex-col items-center justify-center px-8 py-24 text-center"
          >
            <div className="animate-float mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#58a6ff]/15 to-[#a855f7]/15 text-3xl ring-1 ring-white/[0.06]">
              ✦
            </div>
            <h2 className="text-xl font-semibold text-white">
              {notes.length === 0 ? 'Your canvas is empty' : 'No matches'}
            </h2>
            <p className="mt-2 max-w-md text-sm text-[#8b949e]">
              {notes.length === 0
                ? 'Drop in notes, a PDF, or an audio recording — we\'ll summarize, quiz, and map them with AI.'
                : 'Try another search, tag, or filter.'}
            </p>
            {notes.length === 0 && (
              <Link
                to="/new"
                className="glass-button mt-8 px-6 py-3 text-sm font-semibold text-white"
              >
                Create your first note
              </Link>
            )}
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((note) => (
              <NoteCard key={note._id} note={note} onUpdate={handleNoteUpdate} onRemove={handleRemove} />
            ))}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  )
}
