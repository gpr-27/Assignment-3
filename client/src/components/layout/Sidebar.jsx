import { NavLink, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'

function navClass(active) {
  return `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-250 ${
    active
      ? 'glass-active text-white'
      : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-white/[0.04] border border-transparent'
  }`
}

export default function Sidebar({ tags = [] }) {
  const location = useLocation()
  const { user, logout } = useAuth()
  const params = new URLSearchParams(location.search)
  const viewFav = params.get('view') === 'favorites'
  const activeTag = params.get('tag') || ''

  const onLibrary = location.pathname === '/' && !viewFav && !activeTag
  const onFavorites = location.pathname === '/' && viewFav
  const onNew = location.pathname === '/new'

  return (
    <aside className="glass-sidebar flex h-full w-64 shrink-0 flex-col">
      {/* Logo */}
      <div className="p-6 pb-5">
        <Link to="/" className="group flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#58a6ff] to-[#a855f7] text-sm font-bold text-white shadow-[0_0_24px_-4px_rgba(88,166,255,0.5)] transition group-hover:shadow-[0_0_36px_-2px_rgba(168,85,247,0.5)]">
            N
          </span>
          <div>
            <span className="text-lg font-semibold tracking-tight text-white">NoteWise</span>
            <p className="text-[10px] text-[#484f58]">AI Study Assistant</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 px-3">
        <p className="mb-2 px-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#484f58]">
          Navigate
        </p>
        <Link to="/" className={navClass(onLibrary)}>
          <span className="text-base">📋</span> Dashboard
        </Link>
        <Link to="/?view=favorites" className={navClass(onFavorites)}>
          <span className="text-base">⭐</span> Favorites
        </Link>
        <NavLink to="/new" className={() => navClass(onNew)}>
          <span className="text-base">✨</span> New note
        </NavLink>

        {/* Tags */}
        {tags.length > 0 && (
          <>
            <p className="mb-1 mt-6 px-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#484f58]">
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
                    className={`block truncate rounded-2xl px-3.5 py-2 text-sm transition-all duration-200 ${
                      active
                        ? 'bg-violet-500/12 text-violet-200 ring-1 ring-violet-500/25'
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

      {/* User */}
      <div className="mt-auto border-t border-white/[0.04] p-3">
        <div className="glass rounded-2xl p-3.5">
          <p className="truncate text-sm font-medium text-[#e6edf3]">{user?.name}</p>
          <p className="truncate text-xs text-[#8b949e]">{user?.email}</p>
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => { logout(); window.location.href = '/login' }}
            className="mt-3 w-full rounded-xl border border-red-500/15 bg-red-500/8 py-2 text-xs font-medium text-red-300 transition hover:bg-red-500/15"
          >
            Log out
          </motion.button>
        </div>
      </div>
    </aside>
  )
}
