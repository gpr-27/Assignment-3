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
        className="glass-elevated relative z-10 w-full max-w-md p-8"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#58a6ff] to-[#a855f7] text-lg font-bold text-white shadow-[0_0_32px_-4px_rgba(88,166,255,0.5)]">
            N
          </div>
          <h1 className="text-2xl font-bold text-white">Create account</h1>
          <p className="mt-1 text-sm text-[#8b949e]">Start studying with AI</p>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-200">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#c9d1d9]">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="glass-input w-full px-4 py-3 text-[#e6edf3] outline-none placeholder:text-[#484f58]"
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
              className="glass-input w-full px-4 py-3 text-[#e6edf3] outline-none placeholder:text-[#484f58]"
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
              className="glass-input w-full px-4 py-3 text-[#e6edf3] outline-none placeholder:text-[#484f58]"
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
            className="glass-button w-full py-3 text-sm font-semibold text-white disabled:opacity-50"
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
