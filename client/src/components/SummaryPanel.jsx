const difficultyStyle = {
  Beginner: 'bg-emerald-500/12 text-emerald-200 ring-emerald-400/20',
  Intermediate: 'bg-amber-500/12 text-amber-100 ring-amber-400/20',
  Advanced: 'bg-rose-500/12 text-rose-100 ring-rose-400/20',
}

export default function SummaryPanel({ note }) {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-2.5">
        <span
          className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 ${difficultyStyle[note.difficulty] || 'bg-white/10 text-[#8b949e] ring-white/10'}`}
        >
          {note.difficulty}
        </span>
        {note.tags?.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-violet-500/10 px-3 py-1.5 text-sm font-medium text-violet-200 ring-1 ring-violet-400/20"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="max-w-none">
        <h3 className="mb-4 text-xl font-semibold tracking-tight text-white sm:text-2xl">Summary</h3>
        <p className="text-base leading-[1.75] text-[#aeb8c4] sm:text-[17px] sm:leading-[1.8] whitespace-pre-line">
          {note.summary}
        </p>
      </div>
    </div>
  )
}
