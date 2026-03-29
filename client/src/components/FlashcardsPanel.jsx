import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function FlashcardsPanel({ flashcards, onGenerate, generating }) {
  const [current, setCurrent] = useState(0)
  const [flipped, setFlipped] = useState(false)

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-[#f472b6]/20 text-3xl">
          🃏
        </div>
        <h3 className="mb-2 text-lg font-semibold text-white">No flashcards yet</h3>
        <p className="mb-6 max-w-sm text-sm text-[#8b949e]">
          Generate flashcards from your notes for quick review and memorization.
        </p>
        <motion.button
          type="button"
          onClick={onGenerate}
          disabled={generating}
          whileHover={{ scale: generating ? 1 : 1.02 }}
          whileTap={{ scale: generating ? 1 : 0.98 }}
          className="rounded-xl bg-gradient-to-r from-amber-500 to-[#f472b6] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_32px_-8px_rgba(245,158,11,0.45)] transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          {generating ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating…
            </span>
          ) : (
            '🃏 Generate Flashcards'
          )}
        </motion.button>
      </div>
    )
  }

  const card = flashcards[current]
  const total = flashcards.length

  const goNext = () => {
    setFlipped(false)
    setTimeout(() => {
      setCurrent((c) => (c + 1) % total)
    }, 150)
  }

  const goPrev = () => {
    setFlipped(false)
    setTimeout(() => {
      setCurrent((c) => (c - 1 + total) % total)
    }, 150)
  }

  return (
    <div className="flex flex-col items-center space-y-6 py-4">
      {/* Counter */}
      <div className="flex items-center gap-3 text-sm text-[#8b949e]">
        <span>Card {current + 1} of {total}</span>
        <div className="flex gap-1">
          {flashcards.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { setFlipped(false); setCurrent(i) }}
              className={`h-2 w-2 rounded-full transition ${i === current ? 'bg-[#58a6ff]' : 'bg-white/[0.15] hover:bg-white/[0.25]'}`}
            />
          ))}
        </div>
      </div>

      {/* Card */}
      <div
        onClick={() => setFlipped((f) => !f)}
        className="relative w-full max-w-lg cursor-pointer"
        style={{ perspective: '1000px' }}
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 25 }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative min-h-[280px]"
        >
          {/* Front */}
          <div
            style={{ backfaceVisibility: 'hidden' }}
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-[#58a6ff]/20 bg-gradient-to-br from-[#58a6ff]/10 to-violet-500/10 p-8 text-center shadow-[0_16px_48px_-12px_rgba(88,166,255,0.25)] ring-1 ring-[#58a6ff]/15"
          >
            <span className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#58a6ff]/70">Question</span>
            <p className="text-lg font-medium leading-relaxed text-white">{card.front}</p>
            <span className="mt-6 text-xs text-[#484f58]">Click to flip</span>
          </div>

          {/* Back */}
          <div
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/10 to-[#22d3ee]/10 p-8 text-center shadow-[0_16px_48px_-12px_rgba(52,211,153,0.25)] ring-1 ring-emerald-400/15"
          >
            <span className="mb-3 text-xs font-semibold uppercase tracking-widest text-emerald-400/70">Answer</span>
            <p className="text-lg font-medium leading-relaxed text-white">{card.back}</p>
            <span className="mt-6 text-xs text-[#484f58]">Click to flip back</span>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-4">
        <motion.button
          type="button"
          onClick={goPrev}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.04] text-lg text-[#8b949e] transition hover:border-[#58a6ff]/30 hover:text-white"
        >
          ←
        </motion.button>
        <motion.button
          type="button"
          onClick={goNext}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.04] text-lg text-[#8b949e] transition hover:border-[#58a6ff]/30 hover:text-white"
        >
          →
        </motion.button>
      </div>
    </div>
  )
}
