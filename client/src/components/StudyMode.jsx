import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../utils/api'

// ─── Study Mode: Unified Quiz + Flashcards ──────────────────────────
// Phases: dashboard → quiz → flashcards → results

const PHASES = {
  DASHBOARD: 'dashboard',
  QUIZ: 'quiz',
  FLASHCARDS: 'flashcards',
  RESULTS: 'results',
}

export default function StudyMode({ note, onNoteUpdate }) {
  const [phase, setPhase] = useState(PHASES.DASHBOARD)
  const [generating, setGenerating] = useState(false)

  // Quiz state
  const [qIndex, setQIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState([])

  // Flashcard state
  const [fcIndex, setFcIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const quiz = note?.quiz || []
  const flashcards = note?.flashcards || []
  const hasStudyData = quiz.length > 0 || flashcards.length > 0

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const { data } = await api.post(`/notes/${note._id}/quiz`)
      onNoteUpdate(data)
    } catch (err) {
      console.error('Failed to generate study materials:', err)
    } finally {
      setGenerating(false)
    }
  }

  const resetQuiz = () => {
    setQIndex(0)
    setSelected(null)
    setShowAnswer(false)
    setScore(0)
    setAnswers([])
  }

  const resetFlashcards = () => {
    setFcIndex(0)
    setFlipped(false)
  }

  // ─── Quiz Logic ─────────────────────────────────────────────
  const handleQuizSelect = (idx) => {
    if (showAnswer) return
    setSelected(idx)
    setShowAnswer(true)
    const correct = idx === quiz[qIndex].correctIndex
    if (correct) setScore((s) => s + 1)
    setAnswers((prev) => [...prev, { qi: qIndex, selected: idx, correct }])
  }

  const handleQuizNext = () => {
    if (qIndex + 1 >= quiz.length) {
      setPhase(PHASES.RESULTS)
    } else {
      setQIndex((i) => i + 1)
      setSelected(null)
      setShowAnswer(false)
    }
  }

  // ─── Flashcard Logic ────────────────────────────────────────
  const fcNext = () => { setFlipped(false); setTimeout(() => setFcIndex((i) => (i + 1) % flashcards.length), 120) }
  const fcPrev = () => { setFlipped(false); setTimeout(() => setFcIndex((i) => (i - 1 + flashcards.length) % flashcards.length), 120) }

  // ─── PHASE: Dashboard ───────────────────────────────────────
  if (phase === PHASES.DASHBOARD) {
    if (!hasStudyData) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="animate-float mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#58a6ff]/15 to-[#a855f7]/15 text-4xl ring-1 ring-white/[0.06]">
            🧠
          </div>
          <h3 className="mb-2 text-xl font-bold text-white">Study Mode</h3>
          <p className="mb-8 max-w-md text-sm leading-relaxed text-[#8b949e]">
            Generate interactive quizzes and flashcards to test your understanding of this material.
          </p>
          <motion.button
            onClick={handleGenerate}
            disabled={generating}
            whileHover={{ scale: generating ? 1 : 1.03 }}
            whileTap={{ scale: generating ? 1 : 0.97 }}
            className="glass-button px-8 py-3.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generating ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Generating…
              </span>
            ) : '🧠 Generate Study Materials'}
          </motion.button>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Questions', value: quiz.length, icon: '❓', color: 'from-[#58a6ff]/12 to-[#58a6ff]/04' },
            { label: 'Flashcards', value: flashcards.length, icon: '🃏', color: 'from-amber-500/12 to-amber-500/04' },
            { label: 'Difficulty', value: note.difficulty, icon: '📊', color: 'from-violet-500/12 to-violet-500/04' },
            { label: 'Topics', value: (note.tags || []).length, icon: '🏷️', color: 'from-emerald-500/12 to-emerald-500/04' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`glass rounded-2xl bg-gradient-to-br ${stat.color} p-4 text-center`}
            >
              <div className="mb-1 text-xl">{stat.icon}</div>
              <div className="text-lg font-bold text-white">{stat.value}</div>
              <div className="text-[11px] text-[#8b949e]">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <motion.button
            onClick={() => { resetQuiz(); setPhase(PHASES.QUIZ) }}
            whileHover={{ scale: 1.02, y: -3 }}
            whileTap={{ scale: 0.98 }}
            className="glass glass-card group flex flex-col items-center p-8 text-center"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#58a6ff]/20 to-violet-500/20 text-3xl ring-1 ring-[#58a6ff]/10 transition group-hover:ring-[#58a6ff]/25 group-hover:shadow-[0_0_32px_-4px_rgba(88,166,255,0.35)]">
              🧠
            </div>
            <h4 className="mb-1 text-lg font-semibold text-white">Take Quiz</h4>
            <p className="text-xs text-[#8b949e]">{quiz.length} questions · Test your knowledge</p>
          </motion.button>

          <motion.button
            onClick={() => { resetFlashcards(); setPhase(PHASES.FLASHCARDS) }}
            whileHover={{ scale: 1.02, y: -3 }}
            whileTap={{ scale: 0.98 }}
            className="glass glass-card group flex flex-col items-center p-8 text-center"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 text-3xl ring-1 ring-amber-400/10 transition group-hover:ring-amber-400/25 group-hover:shadow-[0_0_32px_-4px_rgba(245,158,11,0.35)]">
              🃏
            </div>
            <h4 className="mb-1 text-lg font-semibold text-white">Flashcards</h4>
            <p className="text-xs text-[#8b949e]">{flashcards.length} cards · Quick review</p>
          </motion.button>
        </div>

        {/* Regenerate */}
        <div className="flex justify-center pt-2">
          <motion.button
            onClick={handleGenerate}
            disabled={generating}
            whileTap={{ scale: 0.97 }}
            className="text-xs font-medium text-[#484f58] transition hover:text-[#58a6ff]"
          >
            {generating ? 'Regenerating…' : '↻ Regenerate fresh questions'}
          </motion.button>
        </div>
      </div>
    )
  }

  // ─── PHASE: Quiz ────────────────────────────────────────────
  if (phase === PHASES.QUIZ) {
    if (quiz.length === 0) return null
    const q = quiz[qIndex]
    const progress = ((qIndex + (showAnswer ? 1 : 0)) / quiz.length) * 100

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={() => setPhase(PHASES.DASHBOARD)} className="text-sm font-medium text-[#8b949e] transition hover:text-[#58a6ff]">
            ← Back
          </button>
          <div className="flex items-center gap-3 text-xs text-[#8b949e]">
            <span>Q{qIndex + 1}/{quiz.length}</span>
            <span className="text-emerald-300">{score} ✓</span>
          </div>
        </div>

        {/* Progress */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-[#58a6ff] to-[#a855f7]" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div key={qIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="mb-6 text-lg font-semibold leading-relaxed text-white">{q.question}</h3>
            <div className="space-y-3">
              {q.options.map((opt, idx) => {
                let cls = 'border-white/[0.08] bg-white/[0.03] hover:border-[#58a6ff]/25 hover:bg-white/[0.05]'
                if (showAnswer) {
                  if (idx === q.correctIndex) cls = 'border-emerald-400/40 bg-emerald-500/12 ring-1 ring-emerald-400/20'
                  else if (idx === selected) cls = 'border-rose-400/40 bg-rose-500/12 ring-1 ring-rose-400/20'
                  else cls = 'border-white/[0.04] bg-white/[0.01] opacity-40'
                }
                return (
                  <motion.button
                    key={idx}
                    onClick={() => handleQuizSelect(idx)}
                    disabled={showAnswer}
                    whileHover={!showAnswer ? { scale: 1.01 } : {}}
                    whileTap={!showAnswer ? { scale: 0.99 } : {}}
                    className={`glass flex w-full items-center gap-3 rounded-2xl border px-5 py-4 text-left text-sm transition ${cls}`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-xs font-bold text-[#8b949e]">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-[#c9d1d9]">{opt}</span>
                    {showAnswer && idx === q.correctIndex && <span className="ml-auto text-emerald-300">✓</span>}
                    {showAnswer && idx === selected && idx !== q.correctIndex && <span className="ml-auto text-rose-300">✗</span>}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {showAnswer && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
            <motion.button onClick={handleQuizNext} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="glass-button px-6 py-2.5 text-sm font-semibold text-white">
              {qIndex + 1 >= quiz.length ? 'See Results' : 'Next →'}
            </motion.button>
          </motion.div>
        )}
      </div>
    )
  }

  // ─── PHASE: Flashcards ──────────────────────────────────────
  if (phase === PHASES.FLASHCARDS) {
    if (flashcards.length === 0) return null
    const card = flashcards[fcIndex]

    return (
      <div className="flex flex-col items-center space-y-6 py-2">
        {/* Header */}
        <div className="flex w-full items-center justify-between">
          <button onClick={() => setPhase(PHASES.DASHBOARD)} className="text-sm font-medium text-[#8b949e] transition hover:text-[#58a6ff]">
            ← Back
          </button>
          <div className="flex items-center gap-2">
            {flashcards.map((_, i) => (
              <button
                key={i}
                onClick={() => { setFlipped(false); setFcIndex(i) }}
                className={`h-2 w-2 rounded-full transition ${i === fcIndex ? 'bg-[#58a6ff] shadow-[0_0_8px_rgba(88,166,255,0.5)]' : 'bg-white/[0.12] hover:bg-white/[0.25]'}`}
              />
            ))}
          </div>
          <span className="text-xs text-[#484f58]">{fcIndex + 1}/{flashcards.length}</span>
        </div>

        {/* Card with 3D flip */}
        <div onClick={() => setFlipped((f) => !f)} className="relative w-full max-w-lg cursor-pointer" style={{ perspective: '1200px' }}>
          <motion.div
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.55, type: 'spring', stiffness: 180, damping: 22 }}
            style={{ transformStyle: 'preserve-3d' }}
            className="relative min-h-[300px]"
          >
            {/* Front */}
            <div style={{ backfaceVisibility: 'hidden' }} className="glass absolute inset-0 flex flex-col items-center justify-center rounded-3xl border border-[#58a6ff]/15 bg-gradient-to-br from-[#58a6ff]/8 to-violet-500/8 p-10 text-center shadow-[0_20px_60px_-15px_rgba(88,166,255,0.2)]">
              <span className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#58a6ff]/50">Question</span>
              <p className="text-lg font-medium leading-relaxed text-white">{card.front}</p>
              <span className="mt-8 text-[10px] text-[#484f58]">Tap to reveal</span>
            </div>
            {/* Back */}
            <div style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }} className="glass absolute inset-0 flex flex-col items-center justify-center rounded-3xl border border-emerald-400/15 bg-gradient-to-br from-emerald-500/8 to-cyan-500/8 p-10 text-center shadow-[0_20px_60px_-15px_rgba(52,211,153,0.2)]">
              <span className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400/50">Answer</span>
              <p className="text-lg font-medium leading-relaxed text-white">{card.back}</p>
              <span className="mt-8 text-[10px] text-[#484f58]">Tap to flip back</span>
            </div>
          </motion.div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-4">
          <motion.button onClick={fcPrev} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} className="glass flex h-11 w-11 items-center justify-center rounded-2xl text-lg text-[#8b949e] transition hover:text-white">←</motion.button>
          <motion.button onClick={fcNext} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} className="glass flex h-11 w-11 items-center justify-center rounded-2xl text-lg text-[#8b949e] transition hover:text-white">→</motion.button>
        </div>
      </div>
    )
  }

  // ─── PHASE: Results ─────────────────────────────────────────
  if (phase === PHASES.RESULTS) {
    const pct = quiz.length > 0 ? Math.round((score / quiz.length) * 100) : 0

    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-10 text-center">
        <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-[#58a6ff]/20 text-5xl ring-2 ring-emerald-400/20">
          {pct >= 80 ? '🏆' : pct >= 50 ? '👍' : '📚'}
        </div>
        <h3 className="mb-1 text-2xl font-bold text-white">Quiz Complete!</h3>
        <p className="mb-3 text-lg text-[#c9d1d9]">
          <span className="font-bold text-[#58a6ff]">{score}</span> / {quiz.length} correct
        </p>

        {/* Score bar */}
        <div className="mb-6 h-3 w-48 overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full ${pct >= 80 ? 'bg-emerald-400' : pct >= 50 ? 'bg-amber-400' : 'bg-rose-400'}`}
          />
        </div>

        <p className="mb-8 text-sm text-[#8b949e]">
          {pct >= 80 ? 'Excellent! You\'ve mastered this material.' : pct >= 50 ? 'Good effort! Review the flashcards to strengthen weak areas.' : 'Keep studying! Try the flashcards for better recall.'}
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <motion.button
            onClick={() => { resetQuiz(); setPhase(PHASES.QUIZ) }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="glass rounded-2xl px-6 py-3 text-sm font-semibold text-white transition hover:border-[#58a6ff]/25"
          >
            🔄 Retry Quiz
          </motion.button>
          <motion.button
            onClick={() => { resetFlashcards(); setPhase(PHASES.FLASHCARDS) }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="glass rounded-2xl px-6 py-3 text-sm font-semibold text-white transition hover:border-amber-400/25"
          >
            🃏 Review Cards
          </motion.button>
          <motion.button
            onClick={() => setPhase(PHASES.DASHBOARD)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="rounded-2xl px-6 py-3 text-sm font-medium text-[#8b949e] transition hover:text-white"
          >
            ← Dashboard
          </motion.button>
        </div>
      </motion.div>
    )
  }

  return null
}
