import { useEffect } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { useT, useToneText } from '../i18n'
import { DAILY_KCAL, kcalTone } from '../lib/nutrition'
import { useTotals } from '../lib/useTotals'
import { useBuilder } from '../store/useBuilder'

const R = 56
const C = 2 * Math.PI * R

function Bar({ label, value, cap, color }: { label: string; value: number; cap: number; color: string }) {
  const pct = Math.min(100, (value / cap) * 100)
  return (
    <div>
      <div className="flex items-baseline justify-between text-[11px]">
        <span className="font-semibold text-on-paper/60">{label}</span>
        <span className="display font-bold text-on-paper">{value} <span className="text-on-paper/40">g</span></span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-on-paper/10">
        <motion.div className="h-full rounded-full" style={{ background: color }} animate={{ width: `${pct}%` }} transition={{ type: 'spring', bounce: 0.2, duration: 0.8 }} />
      </div>
    </div>
  )
}

export function CalorieMeter() {
  const t = useT()
  const toneText = useToneText()
  const totals = useTotals()
  const deltas = useBuilder((s) => s.deltas)
  const tone = kcalTone(totals.kcal)
  const mv = useMotionValue(totals.kcal)
  const spring = useSpring(mv, { stiffness: 140, damping: 22, mass: 0.8 })
  const text = useTransform(spring, (v) => Math.round(v).toLocaleString())
  const pct = Math.min(1, totals.kcal / DAILY_KCAL)
  useEffect(() => { mv.set(totals.kcal) }, [totals.kcal, mv])

  return (
    <div className="paper relative rounded-[28px] p-5 shadow-lift">
      <div className="flex items-center justify-between">
        <p className="eyebrow text-on-paper/50">{t('cal.title')}</p>
        <span className="rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider text-ink" style={{ background: tone.color }}>{tone.en}</span>
      </div>
      <div className="mt-3 flex items-center gap-5">
        <div className="relative h-[136px] w-[136px] shrink-0">
          <svg viewBox="0 0 136 136" className="h-full w-full -rotate-90">
            <circle cx="68" cy="68" r={R} fill="none" stroke="rgba(0,0,0,.08)" strokeWidth="11" />
            <motion.circle cx="68" cy="68" r={R} fill="none" strokeWidth="11" strokeLinecap="round" stroke={tone.color} strokeDasharray={C} animate={{ strokeDashoffset: C * (1 - pct) }} transition={{ type: 'spring', bounce: 0.15, duration: 0.9 }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span className="display text-[30px] font-extrabold leading-none tracking-tight text-on-paper tabular-nums">{text}</motion.span>
            <span className="eyebrow mt-1 text-[9px] text-on-paper/45">kcal</span>
          </div>
          <AnimatePresence>
            {deltas.map((d) => (
              <motion.span
                key={d.key}
                initial={{ opacity: 0, y: 6, x: '-50%', scale: 0.8 }}
                animate={{ opacity: 1, y: -46, scale: 1 }}
                exit={{ opacity: 0, y: -70 }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                className="pointer-events-none absolute left-1/2 top-1/2 whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-extrabold shadow-card"
                style={{ background: d.kcal >= 0 ? '#fff' : '#1a2419', color: d.kcal >= 0 ? '#1a2419' : '#fff', border: `2px solid ${d.color}` }}
              >
                {d.kcal >= 0 ? '+' : '−'}{Math.abs(Math.round(d.kcal))} kcal
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
        <div className="min-w-0 flex-1">
          <p className="display text-xl font-extrabold leading-tight text-on-paper">{t('cal.meal', { tone: toneText(tone).label })}</p>
          <p className="mt-1 text-xs leading-relaxed text-on-paper/60">{toneText(tone).note}</p>
          <p className="mt-3 text-[11px] text-on-paper/50">{t('cal.daily', { n: DAILY_KCAL.toLocaleString(), pct: Math.round(pct * 100) })}</p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-4">
        <Bar label={t('macro.protein')} value={totals.protein} cap={60} color="#009b48" />
        <Bar label={t('macro.carbs')} value={totals.carbs} cap={120} color="#ffc600" />
        <Bar label={t('macro.fat')} value={totals.fat} cap={40} color="#e3432c" />
      </div>
      <p className="mt-3 text-[10px] text-on-paper/40">{t('sodium')} {totals.sodium.toLocaleString()} mg · {t('cal.note')}</p>
    </div>
  )
}
