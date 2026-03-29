import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../utils/api'
import DashboardLayout from '../components/layout/DashboardLayout'

const AUDIO_TYPES = ['.mp3', '.wav', '.m4a', '.webm']
const AUDIO_MIMES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/x-m4a', 'audio/m4a', 'audio/webm']

export default function NewNote() {
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [pdfFile, setPdfFile] = useState(null)
  const [audioFile, setAudioFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [audioDragOver, setAudioDragOver] = useState(false)
  const fileRef = useRef()
  const audioRef = useRef()
  const navigate = useNavigate()

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file?.type === 'application/pdf') {
      setPdfFile(file)
      setAudioFile(null)
      setError('')
    } else {
      setError('Only PDF files are allowed here')
    }
  }

  const handleAudioDrop = (e) => {
    e.preventDefault()
    setAudioDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && AUDIO_MIMES.includes(file.type)) {
      setAudioFile(file)
      setPdfFile(null)
      setText('')
      setError('')
    } else {
      setError('Only audio files (MP3, WAV, M4A, WebM) are allowed')
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPdfFile(file)
      setAudioFile(null)
      setError('')
    }
  }

  const handleAudioChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAudioFile(file)
      setPdfFile(null)
      setText('')
      setError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim() && !pdfFile && !audioFile) {
      setError('Paste some notes, upload a PDF, or upload an audio file')
      return
    }

    setLoading(true)
    setError('')

    try {
      let response
      if (pdfFile || audioFile) {
        const formData = new FormData()
        if (pdfFile) {
          formData.append('file', pdfFile)
        } else {
          formData.append('file', audioFile)
        }
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
              disabled={!!pdfFile || !!audioFile}
            />
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="mb-3 flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              <span className="text-xs font-medium uppercase tracking-widest text-[#484f58]">or upload</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* PDF Upload */}
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition ${
                  dragOver
                    ? 'border-[#58a6ff]/50 bg-[#58a6ff]/10 shadow-[0_0_40px_-12px_rgba(88,166,255,0.35)]'
                    : pdfFile
                      ? 'border-emerald-400/35 bg-emerald-500/10'
                      : audioFile
                        ? 'border-white/[0.06] bg-white/[0.01] opacity-50'
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
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#58a6ff]/10 text-xl">📄</div>
                    <p className="font-medium text-[#c9d1d9]">PDF</p>
                    <p className="mt-1 text-xs text-[#484f58]">Drop or click · Max 10MB</p>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />

              {/* Audio Upload */}
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setAudioDragOver(true)
                }}
                onDragLeave={() => setAudioDragOver(false)}
                onDrop={handleAudioDrop}
                onClick={() => audioRef.current?.click()}
                className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition ${
                  audioDragOver
                    ? 'border-violet-400/50 bg-violet-500/10 shadow-[0_0_40px_-12px_rgba(139,92,246,0.35)]'
                    : audioFile
                      ? 'border-violet-400/35 bg-violet-500/10'
                      : pdfFile
                        ? 'border-white/[0.06] bg-white/[0.01] opacity-50'
                        : 'border-white/[0.12] bg-white/[0.02] hover:border-violet-400/25 hover:bg-white/[0.04]'
                }`}
              >
                {audioFile ? (
                  <div>
                    <p className="font-medium text-violet-200">{audioFile.name}</p>
                    <p className="mt-1 text-sm text-violet-300/80">{(audioFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setAudioFile(null)
                      }}
                      className="mt-3 text-sm text-red-300 underline-offset-2 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-xl">🎙️</div>
                    <p className="font-medium text-[#c9d1d9]">Audio</p>
                    <p className="mt-1 text-xs text-[#484f58]">MP3, WAV, M4A, WebM · Max 25MB</p>
                  </div>
                )}
              </div>
              <input ref={audioRef} type="file" accept={AUDIO_TYPES.join(',')} onChange={handleAudioChange} className="hidden" />
            </div>
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
                {audioFile ? 'Transcribing & Analyzing…' : 'Analyzing with AI…'}
              </span>
            ) : (
              audioFile ? '🎙️ Transcribe & Analyze' : 'Analyze with AI'
            )}
          </motion.button>
        </form>
      </div>
    </DashboardLayout>
  )
}
