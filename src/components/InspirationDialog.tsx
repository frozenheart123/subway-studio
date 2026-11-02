import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Flame, X } from 'lucide-react'
import { PRESETS } from '../data/catalog'
import { usePresetText, useT } from '../i18n'
import { computeTotals } from '../lib/nutrition'
import { useBuilder } from '../store/useBuilder'
import { useToast } from '../store/useToast'
import { MiniSub } from './MiniSub'

export function InspirationDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useT()
  const presetText = usePresetText()
  const applyPreset = useBuilder((s) => s.applyPreset)
  const lookup = useBuilder((s) => s.lookup)
  const show = useToast((s) => s.show)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[65] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button aria-label="close" className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} />
          <motion.div role="dialog" aria-modal="true" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }} transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }} className="paper relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[32px] p-8 shadow-lift">
            <button onClick={onClose} aria-label="close" className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-on-paper transition-colors hover:bg-on-paper hover:text-paper"><X className="h-5 w-5" /></button>
            <p className="eyebrow text-sub-green-3">{t('inspo.eyebrow')}</p>
            <h2 className="mt-2 text-3xl font-extrabold text-on-paper">{t('inspo.title')}</h2>
            <p className="mt-1 text-sm text-on-paper/60">{t('inspo.copy')}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {PRESETS.map((p, i) => {
                const totals = computeTotals(p.bread, p.items, p.size, lookup)
                const text = presetText(p)
                return (
                  <motion.button
                    key={p.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    onClick={() => { applyPreset(p); onClose(); show(t('toast.preset', { name: text.name })); document.getElementById('builder')?.scrollIntoView({ behavior: 'smooth' }) }}
                    className="group flex flex-col overflow-hidden rounded-3xl border-2 border-on-paper/5 bg-white/70 text-left transition-colors hover:border-sub-green hover:bg-white"
                  >
                    <div className="bg-gradient-to-b from-paper-2 to-white">
                      <MiniSub bread={p.bread} lines={p.items} size={p.size} toasted={p.toasted} className="w-full transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <div className="px-4 pb-4 pt-2">
                      <p className="eyebrow text-[9px] text-on-paper/40">{p.en}</p>
                      <h3 className="display text-lg font-extrabold text-on-paper">{text.name}</h3>
                      <p className="mt-1 text-xs text-on-paper/60">{text.description}</p>
                      <p className="mt-2 flex items-center gap-1 text-xs font-bold text-on-paper"><Flame className="h-3.5 w-3.5 text-sub-yellow" /> {totals.kcal} kcal · ¥{totals.price}</p>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
