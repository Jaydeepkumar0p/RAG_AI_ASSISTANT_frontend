import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// GFM enables tables, task lists, strikethrough. Tables scroll horizontally on small screens.
const components = {
  table: (p) => <div className="my-2 overflow-x-auto rounded-xl border border-slate-100"><table {...p} /></div>,
  a: (p) => <a {...p} target="_blank" rel="noreferrer" />,
}
export default function Markdown({ children }) {
  return <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{children}</ReactMarkdown>
}
