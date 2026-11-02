import { AnimatePresence, motion } from 'motion/react'
import { Package, Sparkles } from 'lucide-react'
import { ofGroup } from '../data/catalog'
import { useName, useT } from '../i18n'
import { fmtPrice } from '../lib/nutrition'
import { useTotals } from '../lib/useTotals'
import { useBuilder } from '../store/useBuilder'
import { useToast } from '../store/useToast'

const pick = <T,>(arr: T[], n: number) => [...arr].sort(() => Math.random() - 0.5).slice(0, n)

export function Receipt({ onPack }: { onPack: () => void }) {
  const t = useT()
  const name = useName()
  const bread = useBuilder((s) => s.bread)
  const lines = useBuilder((s) => s.lines)
  const size = useBuilder((s) => s.size)
  const toasted = useBuilder((s) => s.toasted)
  const lookup = useBuilder((s) => s.lookup)
  const applyPreset = useBuilder((s) => s.applyPreset)
  const show = useToast((s) => s.show)
  const totals = useTotals()
  const b = lookup(bread)!
  const mult = size / 6

  const surprise = () => {
    const breads = ofGroup('bread')
    const items = [
      ...pick(ofGroup('protein').filter((x) => x.id !== 'cheese'), 1).map((x) => ({ id: x.id, qty: Math.random() < 0.3 ? 2 : 1 })),
      ...(Math.random() < 0.7 ? [{ id: 'cheese', qty: 1 }] : []),
      ...pick(ofGroup('veggie'), 2 + Math.floor(Math.random() * 3)).map((x) => ({ id: x.id, qty: Math.random() < 0.25 ? 2 : 1 })),
      ...pick(ofGroup('sauce'), 1 + Math.floor(Math.random() * 2)).map((x) => ({ id: x.id, qty: Math.random() < 0.35 ? 2 : 1 })),
    ]
    applyPreset({ id: 'surprise', name: '惊喜搭配', en: 'SURPRISE', description: '', descriptionEn: '', bread: breads[Math.floor(Math.random() * breads.length)].id, items, toasted: Math.random() < 0.5, size: Math.random() < 0.25 ? 12 : 6 })
    show(t('toast.surprise'))
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="paper receipt-edge rounded-t-[22px] px-6 pb-7 pt-6 shadow-lift">
        <div className="text-center">
          <span className="text-sub-yellow">✳</span>
          <h2 className="display text-[30px] font-extrabold leading-none tracking-tight text-on-paper">YOUR SUB</h2>
          <p className="mt-1 text-xs text-on-paper/55">{t('receipt.sub')}</p>
          <p className="eyebrow mt-3 text-[9px] text-on-paper/40">{t('receipt.order')} · {size}" / {size === 6 ? 15 : 30} cm</p>
        </div>
        <div className="my-4 border-t border-dashed border-on-paper/20" />
        <ul className="space-y-2 text-[13px]" aria-live="polite">
          <li className="flex items-baseline justify-between gap-2">
            <span className="font-semibold text-on-paper">{name(b)}{toasted ? ` · ${t('receipt.toasted')}` : ''}<span className="ml-1 text-[10px] text-on-paper/40">{Math.round(b.kcal * mult)} kcal</span></span>
            <span className="flex-1 border-b border-dotted border-on-paper/25" />
            <span className="display font-bold text-on-paper">{fmtPrice(b.price * mult)}</span>
          </li>
          <AnimatePresence initial={false}>
            {lines.map((l) => {
              const ing = lookup(l.id)!
              return (
                <motion.li key={l.id} layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} className="flex items-baseline justify-between gap-2">
                  <span className="text-on-paper/85">
                    {name(ing)}{l.qty > 1 && <b className="ml-1 rounded bg-on-paper/8 px-1 text-[10px] text-on-paper">×{l.qty}</b>}
                    <span className="ml-1 text-[10px] text-on-paper/40">{Math.round(ing.kcal * l.qty * mult)} kcal</span>
                  </span>
                  <span className="flex-1 border-b border-dotted border-on-paper/25" />
                  <span className="display font-bold text-on-paper">{ing.price ? fmtPrice(ing.price * l.qty * mult) : t('pantry.included')}</span>
                </motion.li>
              )
            })}
          </AnimatePresence>
          {lines.length === 0 && <li className="text-xs text-on-paper/45">{t('receipt.empty')}</li>}
        </ul>
        <div className="my-4 border-t border-dashed border-on-paper/20" />
        <div className="flex items-end justify-between">
          <div>
            <p className="eyebrow text-[9px] text-on-paper/45">{t('receipt.total')}</p>
            <p className="text-xs text-on-paper/60">{totals.kcal.toLocaleString()} kcal</p>
          </div>
          <p className="display text-3xl font-extrabold text-on-paper">{fmtPrice(totals.price)}</p>
        </div>
        <div className="barcode mt-5 opacity-80" aria-hidden="true" />
        <p className="eyebrow mt-2 text-center text-[9px] text-on-paper/40">{t('receipt.made')}</p>
      </div>
      <button onClick={onPack} className="group flex items-center justify-between rounded-2xl bg-sub-yellow px-5 py-4 text-sm font-extrabold text-ink transition-colors hover:bg-sub-yellow-2">
        {t('receipt.pack')} <Package className="h-5 w-5 transition-transform group-hover:-rotate-6" />
      </button>
      <button onClick={surprise} className="flex items-center justify-center gap-2 rounded-2xl border border-on-shell/10 px-5 py-3 text-xs font-bold text-on-shell/75 transition-colors hover:border-on-shell/30 hover:text-on-shell">
        <Sparkles className="h-4 w-4 text-sub-yellow" /> {t('receipt.surprise')}
      </button>
      <p className="text-center text-[10px] text-on-shell/35">{t('receipt.demo')}</p>
    </div>
  )
}
