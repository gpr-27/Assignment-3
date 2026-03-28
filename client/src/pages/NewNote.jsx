import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import Navbar from '../components/Navbar'

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">New Note</h2>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title (optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="e.g. Binary Search Notes"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Paste your notes</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={10}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-y text-sm"
              placeholder="Paste your study notes here..."
              disabled={!!pdfFile}
            />
          </div>

          <div className="relative">
            <div className="flex items-center gap-4 mb-2">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-sm text-gray-400">OR</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
                dragOver
                  ? 'border-indigo-400 bg-indigo-50'
                  : pdfFile
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-300 hover:border-indigo-300 hover:bg-indigo-50/30'
              }`}
            >
              {pdfFile ? (
                <div>
                  <p className="text-green-700 font-medium">{pdfFile.name}</p>
                  <p className="text-sm text-green-600 mt-1">
                    {(pdfFile.size / 1024).toFixed(1)} KB
                  </p>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setPdfFile(null) }}
                    className="text-sm text-red-500 mt-2 hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-gray-500 font-medium">Drop a PDF here or click to browse</p>
                  <p className="text-xs text-gray-400 mt-1">Max 10MB</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analyzing with AI...
              </span>
            ) : (
              'Analyze with AI'
            )}
          </button>
        </form>
      </main>
    </div>
  )
}
