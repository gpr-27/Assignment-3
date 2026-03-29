const difficultyStyle = {
  Beginner: 'bg-emerald-500/12 text-emerald-200 ring-emerald-400/20',
  Intermediate: 'bg-amber-500/12 text-amber-100 ring-amber-400/20',
  Advanced: 'bg-rose-500/12 text-rose-100 ring-rose-400/20',
}

export default function SummaryPanel({ note }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${difficultyStyle[note.difficulty] || 'bg-white/10 text-[#8b949e] ring-white/10'}`}
        >
          {note.difficulty}
        </span>
        {note.tags?.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-200 ring-1 ring-violet-400/20"
          >
            {tag}
          </span>
        ))}
      </div>

      <div>
        <h3 className="mb-3 text-lg font-semibold text-white">Summary</h3>
        <p className="leading-relaxed text-[#8b949e] whitespace-pre-line">{note.summary}</p>
      </div>
    </div>
  )
}
