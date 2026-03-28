import { NavLink, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'

function navClass(active) {
  return `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
    active
      ? 'bg-white/[0.08] text-white shadow-[0_0_20px_-4px_rgba(88,166,255,0.35)] border border-[#58a6ff]/20'
      : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-white/[0.04] border border-transparent'
  }`
}

export default function Sidebar({ tags = [] }) {
  const location = useLocation()
  const { user, logout } = useAuth()
  const params = new URLSearchParams(location.search)
  const viewFav = params.get('view') === 'favorites'
  const activeTag = params.get('tag') || ''

  const onLibrary =
    location.pathname === '/' && !viewFav && !activeTag
  const onFavorites = location.pathname === '/' && viewFav
  const onNew = location.pathname === '/new'

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-white/[0.06] bg-[#0d1117]/85 backdrop-blur-xl">
      <div className="p-5 pb-4">
        <Link to="/" className="group flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#58a6ff] to-[#a855f7] text-sm font-bold text-white shadow-[0_0_24px_-4px_rgba(88,166,255,0.55)] transition group-hover:shadow-[0_0_32px_-2px_rgba(168,85,247,0.45)]">
            N
          </span>
          <span className="text-lg font-semibold tracking-tight text-white">NoteWise</span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-3">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-[#484f58]">
          Navigate
        </p>
        <Link to="/" className={navClass(onLibrary)}>
          Dashboard
        </Link>
        <Link to="/?view=favorites" className={navClass(onFavorites)}>
          Favorites
        </Link>
        <NavLink to="/new" className={() => navClass(onNew)}>
          New note
        </NavLink>

        {tags.length > 0 && (
          <>
            <p className="mb-1 mt-6 px-3 text-[10px] font-semibold uppercase tracking-widest text-[#484f58]">
              Tags
            </p>
            <div className="max-h-44 space-y-0.5 overflow-y-auto pr-1">
              {tags.map((tag) => {
                const encoded = encodeURIComponent(tag)
                const active = location.pathname === '/' && activeTag === tag
                return (
                  <Link
                    key={tag}
                    to={`/?tag=${encoded}`}
                    className={`block truncate rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                      active
                        ? 'bg-violet-500/15 text-violet-200 ring-1 ring-violet-500/35'
                        : 'text-[#8b949e] hover:bg-white/[0.04] hover:text-[#e6edf3]'
                    }`}
                  >
                    {tag}
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </nav>

      <div className="mt-auto border-t border-white/[0.06] p-3">
        <div className="rounded-xl bg-white/[0.03] p-3 ring-1 ring-white/[0.06]">
          <p className="truncate text-sm font-medium text-[#e6edf3]">{user?.name}</p>
          <p className="truncate text-xs text-[#8b949e]">{user?.email}</p>
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => {
              logout()
              window.location.href = '/login'
            }}
            className="mt-3 w-full rounded-lg border border-red-500/20 bg-red-500/10 py-2 text-xs font-medium text-red-300 transition hover:bg-red-500/20"
          >
            Log out
          </motion.button>
        </div>
      </div>
    </aside>
  )
}
