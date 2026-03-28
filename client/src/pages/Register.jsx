import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await axios.post('/api/auth/register', form)
      login(data.user, data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="bg-mesh" aria-hidden />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-8 shadow-2xl shadow-black/50 ring-1 ring-white/[0.06] backdrop-blur-xl"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#58a6ff] to-[#a855f7] text-lg font-bold text-white shadow-[0_0_32px_-4px_rgba(88,166,255,0.5)]">
            N
          </div>
          <h1 className="text-2xl font-bold text-white">Create account</h1>
          <p className="mt-1 text-sm text-[#8b949e]">Start organizing with AI</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#c9d1d9]">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-[#e6edf3] outline-none transition placeholder:text-[#484f58] focus:border-[#58a6ff]/40 focus:ring-1 focus:ring-[#58a6ff]/30"
              placeholder="Your name"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#c9d1d9]">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-[#e6edf3] outline-none transition placeholder:text-[#484f58] focus:border-[#58a6ff]/40 focus:ring-1 focus:ring-[#58a6ff]/30"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#c9d1d9]">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-[#e6edf3] outline-none transition placeholder:text-[#484f58] focus:border-[#58a6ff]/40 focus:ring-1 focus:ring-[#58a6ff]/30"
              placeholder="Min 6 characters"
              minLength={6}
              required
            />
          </div>
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.01 }}
            whileTap={{ scale: loading ? 1 : 0.99 }}
            className="w-full rounded-xl bg-gradient-to-r from-[#58a6ff] to-[#7c3aed] py-3 text-sm font-semibold text-white shadow-[0_8px_32px_-8px_rgba(88,166,255,0.45)] transition disabled:opacity-50"
          >
            {loading ? 'Creating account…' : 'Register'}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-sm text-[#8b949e]">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-[#58a6ff] hover:text-[#79c0ff]">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
