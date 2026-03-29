import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'

export default function DashboardLayout({ children, header, tags = [], showFab = true }) {
  return (
    <div className="relative flex h-[100dvh] min-h-0 overflow-hidden text-[#e6edf3] md:h-screen">
      <div className="bg-mesh" aria-hidden />
      {/* Sidebar: fixed height to viewport; does not scroll with main content */}
      <div className="relative z-10 hidden shrink-0 md:flex md:h-full md:min-h-0">
        <Sidebar tags={tags} />
      </div>

      <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* Mobile nav */}
        <header className="flex shrink-0 items-center justify-between gap-2 border-b border-white/[0.04] bg-[#0a0e14]/80 px-4 py-3 backdrop-blur-2xl backdrop-saturate-[180%] md:hidden">
          <Link to="/" className="text-base font-semibold text-white">
            NoteWise
          </Link>
          <div className="flex gap-2 overflow-x-auto text-xs">
            <Link to="/" className="glass shrink-0 rounded-xl px-3 py-1.5 text-[#c9d1d9]">
              Home
            </Link>
            <Link to="/?view=favorites" className="glass shrink-0 rounded-xl px-3 py-1.5 text-[#c9d1d9]">
              Favorites
            </Link>
            <Link to="/new" className="shrink-0 rounded-xl bg-[#58a6ff]/12 px-3 py-1.5 text-[#58a6ff] ring-1 ring-[#58a6ff]/20">
              New
            </Link>
          </div>
        </header>

        {header ? <div className="shrink-0">{header}</div> : null}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">{children}</div>
      </div>

      {/* FAB */}
      {showFab && (
        <motion.div
          className="fixed bottom-6 right-6 z-20 md:bottom-8 md:right-8"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          <Link to="/new">
            <motion.span
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="glass-button flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-light text-white"
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
