import { useState, useEffect } from 'react'
import api from '../utils/api'
import Navbar from '../components/Navbar'
import NoteCard from '../components/NoteCard'

export default function Home() {
  const [notes, setNotes] = useState([])
  const [search, setSearch] = useState('')
  const [showFavorites, setShowFavorites] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      const { data } = await api.get('/notes')
      setNotes(data)
    } catch (err) {
      console.error('Failed to fetch notes:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleNoteUpdate = (updatedNote) => {
    setNotes((prev) => prev.map((n) => (n._id === updatedNote._id ? updatedNote : n)))
  }

  const filtered = notes.filter((note) => {
    const matchesSearch =
      note.title?.toLowerCase().includes(search.toLowerCase()) ||
      note.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    const matchesFav = showFavorites ? note.isFavorite : true
    return matchesSearch && matchesFav
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h2 className="text-2xl font-bold text-gray-800">My Notes</h2>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search by title or tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
            />
            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                showFavorites
                  ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {showFavorites ? '⭐ Favorites' : '☆ Favorites'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading notes...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-2">
              {notes.length === 0 ? 'No notes yet' : 'No matching notes'}
            </p>
            <p className="text-gray-400 text-sm">
              {notes.length === 0 ? 'Click "+ New Note" to analyze your first notes!' : 'Try a different search term'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((note) => (
              <NoteCard key={note._id} note={note} onUpdate={handleNoteUpdate} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
