const difficultyColors = {
  Beginner: 'bg-green-100 text-green-700',
  Intermediate: 'bg-yellow-100 text-yellow-700',
  Advanced: 'bg-red-100 text-red-700',
}

export default function SummaryPanel({ note }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <span className={`text-xs px-3 py-1 rounded-full font-medium ${difficultyColors[note.difficulty] || 'bg-gray-100 text-gray-600'}`}>
          {note.difficulty}
        </span>
        {note.tags?.map((tag) => (
          <span key={tag} className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full">
            {tag}
          </span>
        ))}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Summary</h3>
        <p className="text-gray-600 leading-relaxed whitespace-pre-line">{note.summary}</p>
      </div>
    </div>
  )
}
