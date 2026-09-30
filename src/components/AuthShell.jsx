import { Sparkle } from './Icons'
export default function AuthShell({ title, children }) {
  return (
    <div className="app-bg grid min-h-[100dvh] lg:grid-cols-2">
      <div className="bg-brand relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/15 blur-2xl" />
        <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-sky-200/30 blur-2xl" />
        <div className="relative flex items-center gap-2 text-lg font-bold"><Sparkle /> RAG Assistant</div>
        <div className="relative">
          <h2 className="text-4xl font-bold leading-tight">Chat with your documents.</h2>
          <p className="mt-3 max-w-sm text-white/85">Upload PDFs, ask questions, and get answers with the sources they came from.</p>
        </div>
        <p className="relative text-sm text-white/70">Private to your account.</p>
      </div>
      <div className="grid place-items-center p-5 sm:p-8">
        <div className="card rise w-full max-w-sm p-6 shadow-xl shadow-pink-100/60 sm:p-8">
          <div className="text-brand mb-1 text-2xl font-extrabold lg:hidden">RAG Assistant</div>
          <h1 className="mb-1 text-xl font-bold text-slate-800">{title}</h1>
          <p className="mb-6 text-sm text-slate-500">Welcome — it only takes a moment.</p>
          {children}
        </div>
      </div>
    </div>
  )
}
