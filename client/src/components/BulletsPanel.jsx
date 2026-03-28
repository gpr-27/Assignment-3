export default function BulletsPanel({ bullets }) {
  if (!bullets || bullets.length === 0) {
    return <p className="text-[#484f58]">No key points generated.</p>
  }

  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold text-white">Key points</h3>
      <ul className="space-y-3">
        {bullets.map((point, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#58a6ff]/30 to-violet-500/25 text-xs font-bold text-[#79c0ff] ring-1 ring-[#58a6ff]/25">
              {i + 1}
            </span>
            <span className="text-[#c9d1d9]">{point}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
