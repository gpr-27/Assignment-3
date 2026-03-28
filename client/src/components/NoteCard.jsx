import { Link } from 'react-router-dom'
import api from '../utils/api'

const difficultyColors = {
  Beginner: 'bg-green-100 text-green-700',
  Intermediate: 'bg-yellow-100 text-yellow-700',
  Advanced: 'bg-red-100 text-red-700',
}

export default function NoteCard({ note, onUpdate }) {
  const toggleFavorite = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      const { data } = await api.patch(`/notes/${note._id}/favorite`)
      onUpdate(data)
    } catch (err) {
      console.error('Failed to toggle favorite:', err)
    }
  }

  return (
    <Link
      to={`/notes/${note._id}`}
      className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-indigo-200 transition group"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-800 group-hover:text-indigo-600 transition truncate pr-2">
          {note.title}
        </h3>
        <button
          onClick={toggleFavorite}
          className="text-lg shrink-0 cursor-pointer"
          title={note.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {note.isFavorite ? '⭐' : '☆'}
        </button>
      </div>

      <p className="text-sm text-gray-500 line-clamp-2 mb-3">
        {note.summary || note.rawText?.slice(0, 120) + '...'}
      </p>

      <div className="flex items-center gap-2 flex-wrap mb-3">
        {note.tags?.slice(0, 4).map((tag) => (
          <span key={tag} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColors[note.difficulty] || 'bg-gray-100 text-gray-600'}`}>
          {note.difficulty}
        </span>
        <span className="text-xs text-gray-400">
          {new Date(note.createdAt).toLocaleDateString()}
        </span>
      </div>
    </Link>
  )
}
