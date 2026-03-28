export default function BulletsPanel({ bullets }) {
  if (!bullets || bullets.length === 0) {
    return <p className="text-gray-400">No key points generated.</p>
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Points</h3>
      <ul className="space-y-3">
        {bullets.map((point, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
              {i + 1}
            </span>
            <span className="text-gray-600">{point}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
