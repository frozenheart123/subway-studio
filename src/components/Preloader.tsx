import { motion } from 'motion/react'

const LAYERS = [
  { color: '#d9a65e', w: 170, h: 26, r: 14 },
  { color: '#8fd14f', w: 160, h: 12, r: 6 },
  { color: '#e8452e', w: 150, h: 10, r: 5 },
  { color: '#f2a93b', w: 156, h: 7, r: 3 },
  { color: '#e8b8a6', w: 158, h: 10, r: 5 },
  { color: '#cf9443', w: 170, h: 30, r: 15 },
]

export function Preloader({ progress }: { progress: number }) {
  const pct = Math.round(progress * 100)
  return (
    <motion.div
      className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-ink text-cream"
      initial={{ clipPath: 'inset(0 0 0 0)' }}
      exit={{ clipPath: 'inset(0 0 100% 0)' }}
      transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="absolute inset-0 stage-wrap opacity-60" />
      <div className="relative flex flex-col items-center gap-10">
        <div className="relative flex h-[150px] w-[200px] flex-col-reverse items-center justify-start gap-[3px]">
          {LAYERS.map((l, i) => (
            <motion.div
              key={i}
              style={{ background: l.color, width: l.w, height: l.h, borderRadius: l.r }}
              className="shadow-lift"
              initial={{ y: -90, opacity: 0, scaleX: 0.8 }}
              animate={{ y: 0, opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.25 + i * 0.16, type: 'spring', bounce: 0.5, duration: 0.8 }}
            />
          ))}
          <motion.div
            className="absolute -bottom-5 h-3 w-[190px] rounded-full bg-black/60 blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          />
        </div>
        <div className="flex items-end gap-4">
          <span className="display text-[112px] font-extrabold leading-none tracking-tight tabular-nums text-cream">{pct}</span>
          <span className="display mb-4 text-3xl font-semibold text-sub-yellow">%</span>
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="h-1 w-64 overflow-hidden rounded-full bg-white/10">
            <motion.div className="h-full bg-sub-yellow" style={{ width: `${pct}%` }} transition={{ ease: 'linear' }} />
          </div>
          <p className="eyebrow text-cream/60">正在切新鲜食材 · Slicing fresh</p>
        </div>
      </div>
    </motion.div>
  )
}
