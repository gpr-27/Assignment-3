export default function BulletsPanel({ bullets }) {
  if (!bullets || bullets.length === 0) {
    return <p className="text-[#484f58]">No key points generated.</p>
  }

  return (
    <div className="max-w-none">
      <h3 className="mb-5 text-xl font-semibold tracking-tight text-white sm:text-2xl">Key Points</h3>
      <ul className="space-y-4 sm:space-y-5">
        {bullets.map((point, i) => (
          <li key={i} className="flex items-start gap-4">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#58a6ff]/22 to-violet-500/18 text-sm font-bold text-[#79c0ff] ring-1 ring-[#58a6ff]/18">
              {i + 1}
            </span>
            <span className="text-[#c9d1d9] text-base leading-[1.75] sm:text-[17px] sm:leading-[1.8]">{point}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
