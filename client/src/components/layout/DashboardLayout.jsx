import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'

export default function DashboardLayout({ children, header, tags = [], showFab = true }) {
  return (
    <div className="relative flex min-h-screen text-[#e6edf3]">
      <div className="bg-mesh" aria-hidden />
      <div className="relative z-10 hidden md:flex">
        <Sidebar tags={tags} />
      </div>

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-2 border-b border-white/[0.06] bg-[#0d1117]/80 px-4 py-3 backdrop-blur-xl md:hidden">
          <Link to="/" className="text-base font-semibold text-white">
            NoteWise
          </Link>
          <div className="flex gap-2 overflow-x-auto text-xs">
            <Link
              to="/"
              className="shrink-0 rounded-lg bg-white/[0.06] px-3 py-1.5 text-[#c9d1d9] ring-1 ring-white/[0.06]"
            >
              Home
            </Link>
            <Link
              to="/?view=favorites"
              className="shrink-0 rounded-lg bg-white/[0.06] px-3 py-1.5 text-[#c9d1d9] ring-1 ring-white/[0.06]"
            >
              Favorites
            </Link>
            <Link
              to="/new"
              className="shrink-0 rounded-lg bg-[#58a6ff]/15 px-3 py-1.5 text-[#58a6ff] ring-1 ring-[#58a6ff]/25"
            >
              New
            </Link>
          </div>
        </header>

        {header}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>

      {showFab && (
        <motion.div
          className="fixed bottom-6 right-6 z-20 md:bottom-8 md:right-8"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          <Link to="/new">
            <motion.span
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#58a6ff] to-[#7c3aed] text-2xl font-light text-white shadow-[0_8px_32px_-4px_rgba(88,166,255,0.55),0_0_0_1px_rgba(255,255,255,0.08)] transition"
              title="New note"
            >
              +
            </motion.span>
          </Link>
        </motion.div>
      )}
    </div>
  )
}
