import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const components = {
  h1: (props) => (
    <h1
      className="mb-3 mt-5 border-b border-[#30363d] pb-2 text-lg font-bold tracking-tight text-[#e6edf3] first:mt-0"
      {...props}
    />
  ),
  h2: (props) => (
    <h2 className="mb-2.5 mt-5 text-base font-bold tracking-tight text-[#f0f3f6] first:mt-0 sm:text-lg" {...props} />
  ),
  h3: (props) => (
    <h3 className="mb-2 mt-4 text-[15px] font-semibold text-[#e6edf3] first:mt-0 sm:text-base" {...props} />
  ),
  h4: (props) => <h4 className="mb-1.5 mt-3 text-[15px] font-medium text-[#d8dee4] first:mt-0" {...props} />,
  p: (props) => <p className="mb-3.5 last:mb-0 text-[#c9d1d9] leading-[1.7] sm:leading-[1.72]" {...props} />,
  ul: (props) => (
    <ul
      className="mb-4 list-disc space-y-2.5 pl-5 text-[#c9d1d9] marker:text-[#58a6ff]/80"
      {...props}
    />
  ),
  ol: (props) => (
    <ol className="mb-4 list-decimal space-y-2.5 pl-5 marker:font-semibold marker:text-[#c4b5fd]" {...props} />
  ),
  li: (props) => (
    <li className="leading-[1.65] text-[#c9d1d9] [&>p]:mb-2 [&>p]:last:mb-0 [&>ul]:mt-2 [&>ol]:mt-2" {...props} />
  ),
  strong: (props) => <strong className="font-semibold text-[#f0f3f6]" {...props} />,
  em: (props) => <em className="italic text-[#d8dee4]" {...props} />,
  hr: (props) => <hr className="my-5 border-0 border-t border-[#30363d]" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="my-4 rounded-r-xl border border-[#3d444d]/60 border-l-[3px] border-l-[#58a6ff] bg-[#0d1117]/65 py-3 pl-4 pr-4 text-[#aeb8c4] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] [&>p]:mb-0"
      {...props}
    />
  ),
  a: (props) => (
    <a
      className="font-medium text-[#58a6ff] underline decoration-[#58a6ff]/35 underline-offset-2 transition hover:text-[#79c0ff]"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  pre: (props) => (
    <pre className="mb-4 overflow-x-auto rounded-xl bg-[#0d1117] p-4 text-[13px] leading-relaxed ring-1 ring-white/[0.08]" {...props} />
  ),
  code: ({ inline, className, children, ...props }) =>
    inline ? (
      <code
        className="rounded-md bg-[#21262d] px-1.5 py-0.5 font-mono text-[0.88em] text-[#79c0ff] ring-1 ring-white/[0.06]"
        {...props}
      >
        {children}
      </code>
    ) : (
      <code className={`font-mono text-[#d1d7e0] ${className || ''}`} {...props}>
        {children}
      </code>
    ),
  table: (props) => (
    <div className="mb-5 overflow-x-auto rounded-xl border border-[#30363d] bg-[#0d1117]/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ring-1 ring-white/[0.05]">
      <table className="w-full min-w-[300px] border-collapse text-left text-[14px]" {...props} />
    </div>
  ),
  thead: (props) => <thead className="bg-gradient-to-b from-[#1c2128] to-[#161b22]" {...props} />,
  tbody: (props) => <tbody className="divide-y divide-[#30363d]/80 [&>tr:nth-child(even)]:bg-[#0d1117]/40" {...props} />,
  tr: (props) => <tr className="transition-colors hover:bg-[#21262d]/35" {...props} />,
  th: (props) => (
    <th
      className="border-b border-[#30363d] px-3 py-2.5 text-left text-[12px] font-semibold uppercase tracking-wider text-[#e6edf3] first:rounded-tl-xl last:rounded-tr-xl"
      {...props}
    />
  ),
  td: (props) => <td className="px-3 py-2.5 align-top text-[#c9d1d9]" {...props} />,
}

export default function ChatMarkdown({ children }) {
  return (
    <div className="chat-markdown text-[15px] sm:text-base">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  )
}
