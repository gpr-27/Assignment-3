import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import Navbar from '../components/Navbar'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-20 text-gray-400">Loading note...</div>
      </div>
    )
  }

  if (!note) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{note.title}</h2>
            <p className="text-sm text-gray-400 mt-1">
              {new Date(note.createdAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleFavorite}
              className="text-2xl cursor-pointer"
              title={note.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              {note.isFavorite ? '⭐' : '☆'}
            </button>
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition cursor-pointer ${
                activeTab === i
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {activeTab === 0 && <SummaryPanel note={note} />}
          {activeTab === 1 && <BulletsPanel bullets={note.bullets} />}
          {activeTab === 2 && <MindMap mindMap={note.mindMap} />}
        </div>
      </main>
    </div>
  )
}
