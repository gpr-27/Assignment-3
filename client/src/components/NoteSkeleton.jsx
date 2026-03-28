import { motion } from 'framer-motion'

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 ring-1 ring-white/[0.04]">
      <div className="mb-4 h-5 w-[60%] animate-pulse rounded-lg bg-white/[0.08]" />
      <div className="mb-2 h-3 w-full animate-pulse rounded bg-white/[0.06]" />
      <div className="mb-2 h-3 w-[92%] animate-pulse rounded bg-white/[0.06]" />
      <div className="mb-4 h-3 w-[66%] animate-pulse rounded bg-white/[0.06]" />
      <div className="flex gap-2">
        <div className="h-6 w-16 animate-pulse rounded-full bg-white/[0.06]" />
        <div className="h-6 w-20 animate-pulse rounded-full bg-white/[0.06]" />
      </div>
    </div>
  )
}

export default function NoteSkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <SkeletonCard />
        </motion.div>
      ))}
    </div>
  )
}
