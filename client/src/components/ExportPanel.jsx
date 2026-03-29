import { motion } from 'framer-motion'
import { jsPDF } from 'jspdf'

function generateMarkdown(note) {
  const lines = []
  lines.push(`# ${note.title || 'Untitled Note'}`)
  lines.push('')
  lines.push(`**Difficulty:** ${note.difficulty}  `)
  lines.push(`**Tags:** ${(note.tags || []).join(', ')}  `)
  lines.push(`**Created:** ${new Date(note.createdAt).toLocaleDateString()}`)
  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(note.summary || 'No summary available.')
  lines.push('')
  lines.push('## Key Points')
  lines.push('')
  ;(note.bullets || []).forEach((b, i) => { lines.push(`${i + 1}. ${b}`) })
  lines.push('')
  if (note.quiz?.length > 0) {
    lines.push('## Quiz Questions')
    lines.push('')
    note.quiz.forEach((q, i) => {
      lines.push(`### Q${i + 1}: ${q.question}`)
      q.options.forEach((opt, j) => {
        lines.push(`- ${String.fromCharCode(65 + j)}. ${opt}${j === q.correctIndex ? ' ✅' : ''}`)
      })
      lines.push('')
    })
  }
  if (note.flashcards?.length > 0) {
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
    if (y + needed > doc.internal.pageSize.getHeight() - margin) { doc.addPage(); y = margin }
  }

  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text(note.title || 'Untitled Note', margin, y)
  y += 12

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(120, 120, 120)
  doc.text(`Difficulty: ${note.difficulty}  |  Tags: ${(note.tags || []).join(', ')}`, margin, y)
  y += 6
  doc.text(`Created: ${new Date(note.createdAt).toLocaleDateString()}`, margin, y)
  y += 12

  doc.setDrawColor(200, 200, 200)
  doc.line(margin, y, pageWidth - margin, y)
  y += 10

  doc.setTextColor(0, 0, 0)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Summary', margin, y)
  y += 8

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.splitTextToSize(note.summary || 'No summary.', maxWidth).forEach((line) => { checkPage(7); doc.text(line, margin, y); y += 6 })
  y += 8

  checkPage(16)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Key Points', margin, y)
  y += 8

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  ;(note.bullets || []).forEach((b, i) => {
    doc.splitTextToSize(`${i + 1}. ${b}`, maxWidth - 5).forEach((line) => { checkPage(7); doc.text(line, margin + 5, y); y += 6 })
    y += 2
  })

  if (note.quiz?.length > 0) {
    y += 6; checkPage(16)
    doc.setFontSize(16); doc.setFont('helvetica', 'bold')
    doc.text('Quiz Questions', margin, y); y += 8
    note.quiz.forEach((q, i) => {
      checkPage(20); doc.setFontSize(11); doc.setFont('helvetica', 'bold')
      doc.splitTextToSize(`Q${i + 1}: ${q.question}`, maxWidth).forEach((l) => { checkPage(7); doc.text(l, margin, y); y += 6 })
      doc.setFont('helvetica', 'normal')
      q.options.forEach((opt, j) => { checkPage(7); doc.text(`   ${String.fromCharCode(65 + j)}. ${opt}${j === q.correctIndex ? ' ✓' : ''}`, margin + 4, y); y += 6 })
      y += 4
    })
  }

  if (note.flashcards?.length > 0) {
    y += 6; checkPage(16)
    doc.setFontSize(16); doc.setFont('helvetica', 'bold')
    doc.text('Flashcards', margin, y); y += 8
    note.flashcards.forEach((f, i) => {
      checkPage(14); doc.setFontSize(11); doc.setFont('helvetica', 'bold')
      doc.text(`${i + 1}. ${f.front}`, margin, y); y += 6
      doc.setFont('helvetica', 'normal')
      doc.splitTextToSize(f.back, maxWidth - 10).forEach((l) => { checkPage(7); doc.text(l, margin + 8, y); y += 6 })
      y += 4
    })
  }

  doc.save(`${(note.title || 'note').replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40)}.pdf`)
}

export default function ExportPanel({ note }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-lg font-semibold text-white">Export your note</h3>
        <p className="text-sm text-[#8b949e]">
          Download your AI-generated study materials. Includes summary, key points, and quiz/flashcard data.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <motion.button
          type="button"
          onClick={() => {
            const md = generateMarkdown(note)
            downloadFile(md, `${(note.title || 'note').replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40)}.md`, 'text/markdown')
          }}
          whileHover={{ scale: 1.02, y: -3 }}
          whileTap={{ scale: 0.98 }}
          className="glass glass-card group flex flex-col items-center p-8 text-center"
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#58a6ff]/15 to-violet-500/15 text-2xl ring-1 ring-white/[0.06] transition group-hover:shadow-[0_0_24px_-4px_rgba(88,166,255,0.4)]">
            📝
          </div>
          <h4 className="mb-1 text-base font-semibold text-white">Markdown</h4>
          <p className="text-xs text-[#8b949e]">.md — Notion, Obsidian, GitHub</p>
        </motion.button>

        <motion.button
          type="button"
          onClick={() => exportPDF(note)}
          whileHover={{ scale: 1.02, y: -3 }}
          whileTap={{ scale: 0.98 }}
          className="glass glass-card group flex flex-col items-center p-8 text-center"
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500/15 to-amber-500/15 text-2xl ring-1 ring-white/[0.06] transition group-hover:shadow-[0_0_24px_-4px_rgba(244,114,182,0.4)]">
            📄
          </div>
          <h4 className="mb-1 text-base font-semibold text-white">PDF</h4>
          <p className="text-xs text-[#8b949e]">Styled PDF — print or share</p>
        </motion.button>
      </div>
    </div>
  )
}
