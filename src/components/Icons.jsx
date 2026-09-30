const I = ({ d, size = 18, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>{d}</svg>
)
export const Plus = (p) => <I {...p} d={<path d="M12 5v14M5 12h14" />} />
export const Trash = (p) => <I {...p} d={<><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></>} />
export const FileIcon = (p) => <I {...p} d={<><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /></>} />
export const Send = (p) => <I {...p} d={<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />} />
export const Menu = (p) => <I {...p} d={<path d="M4 6h16M4 12h16M4 18h16" />} />
export const Close = (p) => <I {...p} d={<path d="M18 6 6 18M6 6l12 12" />} />
export const Upload = (p) => <I {...p} d={<><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 20h16" /></>} />
export const Logout = (p) => <I {...p} d={<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" /></>} />
export const Chat = (p) => <I {...p} d={<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />} />
export const Sparkle = (p) => <I {...p} d={<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" />} />
