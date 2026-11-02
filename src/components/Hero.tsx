import { motion } from 'motion/react'
import { Flame } from 'lucide-react'
import { useT, useToneText } from '../i18n'
import { useTotals } from '../lib/useTotals'
import { kcalTone, toneInk } from '../lib/nutrition'

export function Hero() {
  const t = useT()
  const toneText = useToneText()
  const totals = useTotals()
  const tone = kcalTone(totals.kcal)
  const words = t('marquee').split('|')
  const stagger = { hidden: { opacity: 0, y: 28 }, show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.1 + i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } }) }
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-40 top-10 h-[420px] w-[420px] rounded-full bg-sub-green/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-20 top-0 h-[360px] w-[360px] rounded-full bg-sub-yellow/15 blur-[110px]" />
      <div className="mx-auto grid max-w-[1480px] items-end gap-10 px-5 pb-10 pt-14 md:grid-cols-[1.4fr_1fr] md:px-8 md:pt-20">
        <div>
          <motion.p custom={0} initial="hidden" animate="show" variants={stagger} className="eyebrow flex items-center gap-2 text-sub-green-2">
            <span className="h-1.5 w-1.5 rounded-full bg-sub-yellow" /> {t('hero.eyebrow')}
          </motion.p>
          <motion.h1 custom={1} initial="hidden" animate="show" variants={stagger} className="mt-5 text-[52px] font-extrabold leading-[0.98] tracking-tight text-on-shell md:text-[92px]">
            {t('hero.h1a')}
            <br className="hidden md:block" />
            <span className="relative inline-block text-sub-yellow">
              {t('hero.h1b')}
              <svg viewBox="0 0 220 18" className="absolute -bottom-3 left-0 w-full stroke-sub-green-2" fill="none" strokeWidth="5" strokeLinecap="round" aria-hidden="true">
                <motion.path d="M4 12Q100-5 214 8" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.9, duration: 0.8 }} />
              </svg>
            </span>
          </motion.h1>
          <motion.p custom={2} initial="hidden" animate="show" variants={stagger} className="mt-7 max-w-xl text-lg leading-relaxed text-on-shell/65">
            {t('hero.copy')}
          </motion.p>
        </div>
        <motion.div custom={3} initial="hidden" animate="show" variants={stagger} className="justify-self-start md:justify-self-end">
          <div className="paper relative flex items-center gap-5 rounded-3xl px-6 py-5 shadow-lift">
            <span className="absolute -top-3 left-6 rounded-full bg-sub-green px-3 py-1 text-[10px] font-bold tracking-[.2em] text-white">LIVE</span>
            <div className="relative flex h-16 w-16 items-center justify-center">
              <span className="absolute inset-0 animate-pulse-ring rounded-full border-2" style={{ borderColor: tone.color }} />
              <span className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: tone.color }}>
                <Flame className="h-6 w-6 text-ink" />
              </span>
            </div>
            <div>
              <p className="eyebrow text-on-paper/50">{t('hero.live')}</p>
              <p className="display text-3xl font-extrabold leading-none text-on-paper">{totals.kcal.toLocaleString()} <span className="text-base font-semibold text-on-paper/50">kcal</span></p>
              <p className="mt-1 text-xs font-semibold" style={{ color: toneInk(tone) }}>{toneText(tone).label} · {tone.en}</p>
            </div>
          </div>
        </motion.div>
      </div>
      <div className="relative border-y border-on-shell/5 bg-shell-2/60 py-3">
        <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
          {[...words, ...words].map((w, i) => (
            <span key={i} className="display flex items-center gap-10 text-sm font-semibold tracking-[.18em] text-on-shell/55">
              {w} <span className="text-sub-yellow">✳</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
