import { motion } from 'framer-motion'
import { jsPDF } from 'jspdf'

function generateMarkdown(note) {
  const lines = []
  lines.push(`# ${note.title || 'Untitled Note'}`)
  lines.push('')
  lines.push(`**Difficulty:** ${note.difficulty}`)
  lines.push(`**Tags:** ${(note.tags || []).join(', ')}`)
  lines.push(`**Created:** ${new Date(note.createdAt).toLocaleDateString()}`)
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(note.summary || 'No summary available.')
  lines.push('')
  lines.push('## Key Points')
  lines.push('')
  ;(note.bullets || []).forEach((b, i) => {
    lines.push(`${i + 1}. ${b}`)
  })
  lines.push('')
  if (note.quiz && note.quiz.length > 0) {
    lines.push('## Quiz Questions')
    lines.push('')
    note.quiz.forEach((q, i) => {
      lines.push(`### Q${i + 1}: ${q.question}`)
      q.options.forEach((opt, j) => {
        const marker = j === q.correctIndex ? ' ✅' : ''
        lines.push(`- ${String.fromCharCode(65 + j)}. ${opt}${marker}`)
      })
      lines.push('')
    })
  }
  if (note.flashcards && note.flashcards.length > 0) {
    lines.push('## Flashcards')
    lines.push('')
    note.flashcards.forEach((f, i) => {
      lines.push(`**${i + 1}. ${f.front}**`)
      lines.push(`> ${f.back}`)
      lines.push('')
    })
  }
  return lines.join('\n')
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function exportPDF(note) {
  const doc = new jsPDF()
  const margin = 20
  const pageWidth = doc.internal.pageSize.getWidth()
  const maxWidth = pageWidth - margin * 2
  let y = margin

  const checkPage = (needed) => {
    if (y + needed > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage()
      y = margin
    }
  }

  // Title
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text(note.title || 'Untitled Note', margin, y)
  y += 12

  // Metadata
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(120, 120, 120)
  doc.text(`Difficulty: ${note.difficulty}  |  Tags: ${(note.tags || []).join(', ')}`, margin, y)
  y += 6
  doc.text(`Created: ${new Date(note.createdAt).toLocaleDateString()}`, margin, y)
  y += 12

  // Line
  doc.setDrawColor(200, 200, 200)
  doc.line(margin, y, pageWidth - margin, y)
  y += 10

  // Summary
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Summary', margin, y)
  y += 8

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  const summaryLines = doc.splitTextToSize(note.summary || 'No summary.', maxWidth)
  summaryLines.forEach((line) => {
    checkPage(7)
    doc.text(line, margin, y)
    y += 6
  })
  y += 8

  // Key Points
  checkPage(16)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Key Points', margin, y)
  y += 8

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  ;(note.bullets || []).forEach((b, i) => {
    const bulletLines = doc.splitTextToSize(`${i + 1}. ${b}`, maxWidth - 5)
    bulletLines.forEach((line) => {
      checkPage(7)
      doc.text(line, margin + 5, y)
      y += 6
    })
    y += 2
  })

  // Quiz
  if (note.quiz && note.quiz.length > 0) {
    y += 6
    checkPage(16)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Quiz Questions', margin, y)
    y += 8

    note.quiz.forEach((q, i) => {
      checkPage(20)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      const qLines = doc.splitTextToSize(`Q${i + 1}: ${q.question}`, maxWidth)
      qLines.forEach((line) => {
        checkPage(7)
        doc.text(line, margin, y)
        y += 6
      })
      doc.setFont('helvetica', 'normal')
      q.options.forEach((opt, j) => {
        const marker = j === q.correctIndex ? ' ✓' : ''
        checkPage(7)
        doc.text(`   ${String.fromCharCode(65 + j)}. ${opt}${marker}`, margin + 4, y)
        y += 6
      })
      y += 4
    })
  }

  // Flashcards
  if (note.flashcards && note.flashcards.length > 0) {
    y += 6
    checkPage(16)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Flashcards', margin, y)
    y += 8

    note.flashcards.forEach((f, i) => {
      checkPage(14)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text(`${i + 1}. ${f.front}`, margin, y)
      y += 6
      doc.setFont('helvetica', 'normal')
      const ansLines = doc.splitTextToSize(f.back, maxWidth - 10)
      ansLines.forEach((line) => {
        checkPage(7)
        doc.text(line, margin + 8, y)
        y += 6
      })
      y += 4
    })
  }

  const safeTitle = (note.title || 'note').replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40)
  doc.save(`${safeTitle}.pdf`)
}

export default function ExportPanel({ note }) {
  const handleMarkdown = () => {
    const md = generateMarkdown(note)
    const safeTitle = (note.title || 'note').replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40)
    downloadFile(md, `${safeTitle}.md`, 'text/markdown')
  }

  const handlePDF = () => {
    exportPDF(note)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-lg font-semibold text-white">Export your note</h3>
        <p className="text-sm text-[#8b949e]">
          Download your AI-generated analysis as a Markdown file or a styled PDF. Includes summary, key points, and any quiz/flashcard data.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Markdown export */}
        <motion.button
          type="button"
          onClick={handleMarkdown}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="group flex flex-col items-center rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-8 text-center shadow-lg shadow-black/20 ring-1 ring-white/[0.04] transition hover:border-[#58a6ff]/30 hover:shadow-[0_16px_48px_-12px_rgba(88,166,255,0.2)]"
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#58a6ff]/20 to-violet-500/20 text-2xl transition group-hover:shadow-[0_0_24px_-4px_rgba(88,166,255,0.4)]">
            📝
          </div>
          <h4 className="mb-1 text-base font-semibold text-white">Markdown</h4>
          <p className="text-xs text-[#8b949e]">Download as .md file — great for Notion, Obsidian, or GitHub</p>
        </motion.button>

        {/* PDF export */}
        <motion.button
          type="button"
          onClick={handlePDF}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="group flex flex-col items-center rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-8 text-center shadow-lg shadow-black/20 ring-1 ring-white/[0.04] transition hover:border-rose-400/30 hover:shadow-[0_16px_48px_-12px_rgba(244,114,182,0.2)]"
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500/20 to-amber-500/20 text-2xl transition group-hover:shadow-[0_0_24px_-4px_rgba(244,114,182,0.4)]">
            📄
          </div>
          <h4 className="mb-1 text-base font-semibold text-white">PDF</h4>
          <p className="text-xs text-[#8b949e]">Download as styled PDF — ready to print or share</p>
        </motion.button>
      </div>
    </div>
  )
}
