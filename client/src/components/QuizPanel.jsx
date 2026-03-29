import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function QuizPanel({ quiz, onGenerate, generating }) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [answers, setAnswers] = useState([])

  if (!quiz || quiz.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#58a6ff]/20 to-[#a855f7]/20 text-3xl">
          🧠
        </div>
        <h3 className="mb-2 text-lg font-semibold text-white">No quiz yet</h3>
        <p className="mb-6 max-w-sm text-sm text-[#8b949e]">
          Generate an interactive quiz from your notes to test your understanding.
        </p>
        <motion.button
          type="button"
          onClick={onGenerate}
          disabled={generating}
          whileHover={{ scale: generating ? 1 : 1.02 }}
          whileTap={{ scale: generating ? 1 : 0.98 }}
          className="rounded-xl bg-gradient-to-r from-[#58a6ff] to-[#7c3aed] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_32px_-8px_rgba(88,166,255,0.45)] transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          {generating ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating Quiz…
            </span>
          ) : (
            '🧠 Generate Quiz'
          )}
        </motion.button>
      </div>
    )
  }

  const q = quiz[current]
  const total = quiz.length
  const progress = ((current + (showResult ? 1 : 0)) / total) * 100

  const handleSelect = (idx) => {
    if (showResult) return
    setSelected(idx)
    setShowResult(true)
    const correct = idx === q.correctIndex
    if (correct) setScore((s) => s + 1)
    setAnswers((prev) => [...prev, { questionIndex: current, selected: idx, correct }])
  }

  const handleNext = () => {
    if (current + 1 >= total) {
      setFinished(true)
    } else {
      setCurrent((c) => c + 1)
      setSelected(null)
      setShowResult(false)
    }
  }

  const handleRestart = () => {
    setCurrent(0)
    setSelected(null)
    setShowResult(false)
    setScore(0)
    setFinished(false)
    setAnswers([])
  }

  if (finished) {
    const pct = Math.round((score / total) * 100)
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/25 to-[#58a6ff]/25 text-4xl ring-2 ring-emerald-400/30">
          {pct >= 80 ? '🏆' : pct >= 50 ? '👍' : '📚'}
        </div>
        <h3 className="mb-1 text-2xl font-bold text-white">Quiz Complete!</h3>
        <p className="mb-2 text-lg text-[#c9d1d9]">
          You scored <span className="font-bold text-[#58a6ff]">{score}</span> out of{' '}
          <span className="font-bold">{total}</span>
        </p>
        <div className="mb-6 h-3 w-48 overflow-hidden rounded-full bg-white/[0.08]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full ${pct >= 80 ? 'bg-emerald-400' : pct >= 50 ? 'bg-amber-400' : 'bg-rose-400'}`}
          />
        </div>
        <motion.button
          type="button"
          onClick={handleRestart}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="rounded-xl border border-[#58a6ff]/25 bg-[#58a6ff]/10 px-6 py-3 text-sm font-semibold text-[#58a6ff] transition hover:bg-[#58a6ff]/20"
        >
          🔄 Try Again
        </motion.button>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[#8b949e]">
          <span>Question {current + 1} of {total}</span>
          <span>{score} correct</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#58a6ff] to-[#a855f7]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="mb-5 text-lg font-semibold leading-relaxed text-white">{q.question}</h3>

          <div className="space-y-3">
            {q.options.map((option, idx) => {
              let style = 'border-white/[0.1] bg-white/[0.04] hover:border-[#58a6ff]/30 hover:bg-white/[0.06]'
              if (showResult) {
                if (idx === q.correctIndex) {
                  style = 'border-emerald-400/50 bg-emerald-500/15 ring-1 ring-emerald-400/25'
                } else if (idx === selected && idx !== q.correctIndex) {
                  style = 'border-rose-400/50 bg-rose-500/15 ring-1 ring-rose-400/25'
                } else {
                  style = 'border-white/[0.06] bg-white/[0.02] opacity-50'
                }
              } else if (selected === idx) {
                style = 'border-[#58a6ff]/45 bg-[#58a6ff]/12 ring-1 ring-[#58a6ff]/25'
              }

              return (
                <motion.button
                  key={idx}
                  type="button"
                  onClick={() => handleSelect(idx)}
                  disabled={showResult}
                  whileHover={!showResult ? { scale: 1.01 } : {}}
                  whileTap={!showResult ? { scale: 0.99 } : {}}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm transition ${style}`}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.08] text-xs font-bold text-[#8b949e]">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-[#c9d1d9]">{option}</span>
                  {showResult && idx === q.correctIndex && (
                    <span className="ml-auto text-emerald-300">✓</span>
                  )}
                  {showResult && idx === selected && idx !== q.correctIndex && (
                    <span className="ml-auto text-rose-300">✗</span>
                  )}
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Next button */}
      {showResult && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end"
        >
          <motion.button
            type="button"
            onClick={handleNext}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-xl bg-gradient-to-r from-[#58a6ff] to-[#7c3aed] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_16px_-4px_rgba(88,166,255,0.4)] transition"
          >
            {current + 1 >= total ? 'See Results' : 'Next →'}
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}
