import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../utils/api'
import DashboardLayout from '../components/layout/DashboardLayout'

export default function NewNote() {
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [pdfFile, setPdfFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef()
  const navigate = useNavigate()

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file?.type === 'application/pdf') {
      setPdfFile(file)
      setError('')
    } else {
      setError('Only PDF files are allowed')
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPdfFile(file)
      setError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim() && !pdfFile) {
      setError('Paste some notes or upload a PDF')
      return
    }

    setLoading(true)
    setError('')

    try {
      let response
      if (pdfFile) {
        const formData = new FormData()
        formData.append('pdf', pdfFile)
        if (title) formData.append('title', title)
        response = await api.post('/notes/analyze', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      } else {
        response = await api.post('/notes/analyze', { title, text })
      }
      navigate(`/notes/${response.data._id}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const header = (
    <div className="border-b border-white/[0.06] bg-[#0d1117]/70 px-4 py-4 backdrop-blur-xl sm:px-8">
      <div className="mx-auto flex max-w-3xl items-center gap-4">
        <Link
          to="/"
          className="text-sm font-medium text-[#8b949e] transition hover:text-[#58a6ff]"
        >
          ← Back
        </Link>
        <h1 className="text-lg font-semibold text-white">New note</h1>
      </div>
    </div>
  )

  return (
    <DashboardLayout header={header} tags={[]} showFab={false}>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#c9d1d9]">Title (optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-[#e6edf3] outline-none transition placeholder:text-[#484f58] focus:border-[#58a6ff]/40 focus:ring-1 focus:ring-[#58a6ff]/30"
              placeholder="e.g. Binary Search Notes"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#c9d1d9]">Paste your notes</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={10}
              className="w-full resize-y rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-sm text-[#e6edf3] outline-none transition placeholder:text-[#484f58] focus:border-[#58a6ff]/40 focus:ring-1 focus:ring-[#58a6ff]/30 disabled:opacity-40"
              placeholder="Paste your study notes here..."
              disabled={!!pdfFile}
            />
          </div>

          <div className="relative">
            <div className="mb-3 flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              <span className="text-xs font-medium uppercase tracking-widest text-[#484f58]">or</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition ${
                dragOver
                  ? 'border-[#58a6ff]/50 bg-[#58a6ff]/10 shadow-[0_0_40px_-12px_rgba(88,166,255,0.35)]'
                  : pdfFile
                    ? 'border-emerald-400/35 bg-emerald-500/10'
                    : 'border-white/[0.12] bg-white/[0.02] hover:border-[#58a6ff]/25 hover:bg-white/[0.04]'
              }`}
            >
              {pdfFile ? (
                <div>
                  <p className="font-medium text-emerald-200">{pdfFile.name}</p>
                  <p className="mt-1 text-sm text-emerald-300/80">{(pdfFile.size / 1024).toFixed(1)} KB</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setPdfFile(null)
                    }}
                    className="mt-3 text-sm text-red-300 underline-offset-2 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <p className="font-medium text-[#c9d1d9]">Drop a PDF here or click to browse</p>
                  <p className="mt-1 text-xs text-[#484f58]">Max 10MB · Text-based PDFs work best</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.01 }}
            whileTap={{ scale: loading ? 1 : 0.99 }}
            className="w-full rounded-xl bg-gradient-to-r from-[#58a6ff] to-[#7c3aed] py-3.5 text-sm font-semibold text-white shadow-[0_8px_32px_-8px_rgba(88,166,255,0.45)] transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analyzing with AI…
              </span>
            ) : (
              'Analyze with AI'
            )}
          </motion.button>
        </form>
      </div>
    </DashboardLayout>
  )
}
