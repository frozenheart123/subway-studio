import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, Download, Share2, ShoppingBag, X } from 'lucide-react'
import { byId } from '../data/catalog'
import { useName, useT, useToneText } from '../i18n'
import { downloadBlob, renderCard } from '../lib/card'
import { kcalTone } from '../lib/nutrition'
import { shareCreation, useCloud } from '../lib/supabase'
import { useTotals } from '../lib/useTotals'
import { useBuilder } from '../store/useBuilder'
import { useCart } from '../store/useCart'
import { useToast } from '../store/useToast'
import { MiniSub } from './MiniSub'

interface Props { open: boolean; onClose: () => void; onShared: () => void }

const input = 'mt-1 rounded-xl border border-on-paper/15 bg-white px-4 py-3 text-on-paper outline-none transition-colors focus:border-sub-green'

export function PackDialog({ open, onClose, onShared }: Props) {
  const t = useT()
  const name = useName()
  const toneText = useToneText()
  const bread = useBuilder((s) => s.bread)
  const lines = useBuilder((s) => s.lines)
  const size = useBuilder((s) => s.size)
  const toasted = useBuilder((s) => s.toasted)
  const totals = useTotals()
  const tone = kcalTone(totals.kcal)
  const status = useCloud((s) => s.status)
  const show = useToast((s) => s.show)
  const addToCart = useCart((s) => s.add)
  const setPanel = useCart((s) => s.setPanel)
  const [subName, setSubName] = useState('')
  const [author, setAuthor] = useState(() => { try { return localStorage.getItem('subway-studio:author') || '' } catch { return '' } })
  const [busy, setBusy] = useState<'share' | 'download' | null>(null)
  const [shared, setShared] = useState<string | null>(null)

  useEffect(() => { if (open) { setShared(null); setSubName(t('pack.defaultName')) } }, [open, t])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const payload = () => ({
    name: subName.trim() || t('pack.defaultName'),
    author: author.trim() || t('pack.author.ph'),
    bread, size, toasted, items: lines,
    kcal: totals.kcal, protein: totals.protein, carbs: totals.carbs, fat: totals.fat, price: totals.price,
  })

  const toCart = () => {
    const p = payload()
    addToCart({ name: p.name, bread, size, toasted, lines, kcal: totals.kcal, price: totals.price })
    show(t('toast.added', { name: p.name }))
    onClose()
    setTimeout(() => setPanel('cart'), 250)
  }

  const share = async () => {
    setBusy('share')
    try { localStorage.setItem('subway-studio:author', author) } catch { /* ignore */ }
    const { creation, cloud } = await shareCreation(payload())
    setBusy(null)
    setShared(creation.id)
    show(cloud ? t('toast.shared.cloud') : t('toast.shared.local'))
    onShared()
  }

  const download = async () => {
    setBusy('download')
    const p = payload()
    const blob = await renderCard({ ...p, lines, totals })
    downloadBlob(blob, `${p.name}-subway-studio.png`)
    setBusy(null)
    show(t('toast.card'))
  }

  const b = byId(bread)!
  const summary = [name(b) + (toasted ? ` (${t('receipt.toasted')})` : ''), ...lines.map((l) => `${name(byId(l.id)!)}${l.qty > 1 ? ` ×${l.qty}` : ''}`)].join(' / ')

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[65] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button aria-label="close" className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} />
          <motion.div role="dialog" aria-modal="true" aria-labelledby="pack-title" initial={{ y: 40, scale: 0.96, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 24, scale: 0.97, opacity: 0 }} transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }} className="paper relative grid max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[32px] shadow-lift md:grid-cols-[1.1fr_1fr]">
            <button onClick={onClose} aria-label="close" className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-on-paper transition-colors hover:bg-on-paper hover:text-paper"><X className="h-5 w-5" /></button>

            <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden bg-paper-2 p-8">
              <div className="absolute inset-0 stage-wrap opacity-40" />
              <div className="relative w-full max-w-[420px]">
                <MiniSub bread={bread} lines={lines} size={size} toasted={toasted} className="w-full" />
                <motion.div className="wrap-pattern absolute inset-y-[14%] left-0 rounded-l-2xl shadow-lift" initial={{ width: 0 }} animate={{ width: '52%' }} transition={{ delay: 0.5, duration: 0.7, ease: [0.76, 0, 0.24, 1] }} />
                <motion.div className="wrap-pattern absolute inset-y-[14%] right-0 rounded-r-2xl shadow-lift" initial={{ width: 0 }} animate={{ width: '52%' }} transition={{ delay: 0.75, duration: 0.7, ease: [0.76, 0, 0.24, 1] }} />
                <motion.div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-sub-yellow text-center text-ink shadow-lift" initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: -8 }} transition={{ delay: 1.4, type: 'spring', bounce: 0.55 }}>
                  <span className="eyebrow text-[8px]">Made</span>
                  <span className="display text-lg font-extrabold leading-none">BY YOU</span>
                  <span className="text-sub-green">✳</span>
                </motion.div>
                <motion.span className="display absolute -bottom-6 right-4 rotate-[-6deg] text-sub-green-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.7 }}>fresh & happy!</motion.span>
              </div>
            </div>

            <div className="flex flex-col p-8">
              <p className="eyebrow text-sub-green-3">{t('pack.eyebrow')}</p>
              <h2 id="pack-title" className="mt-2 text-3xl font-extrabold leading-tight text-on-paper">{t('pack.title')}</h2>
              <p className="mt-2 text-sm leading-relaxed text-on-paper/60">{summary}</p>
              <div className="mt-4 flex items-center gap-4 rounded-2xl bg-white/70 px-4 py-3">
                <span className="display text-3xl font-extrabold text-on-paper">{totals.kcal.toLocaleString()}<span className="ml-1 text-sm text-on-paper/50">kcal</span></span>
                <span className="rounded-full px-2.5 py-1 text-[10px] font-bold text-ink" style={{ background: tone.color }}>{toneText(tone).label}</span>
                <span className="ml-auto display text-xl font-extrabold text-on-paper">¥{totals.price}</span>
              </div>
              <label className="mt-5 text-xs font-bold text-on-paper/70" htmlFor="sub-name">{t('pack.name')}</label>
              <input id="sub-name" value={subName} maxLength={20} onChange={(e) => setSubName(e.target.value)} className={input} />
              <label className="mt-3 text-xs font-bold text-on-paper/70" htmlFor="sub-author">{t('pack.author')}</label>
              <input id="sub-author" value={author} maxLength={16} placeholder={t('pack.author.ph')} onChange={(e) => setAuthor(e.target.value)} className={input} />
              <div className="mt-5 flex flex-col gap-2">
                <button onClick={toCart} className="flex items-center justify-center gap-2 rounded-2xl bg-sub-yellow px-5 py-3.5 text-sm font-extrabold text-ink transition-colors hover:bg-sub-yellow-2">
                  <ShoppingBag className="h-4 w-4" /> {t('pack.addCart')} · ¥{totals.price}
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={share} disabled={busy !== null || shared !== null} className="flex items-center justify-center gap-2 rounded-2xl bg-sub-green px-3 py-3 text-xs font-extrabold text-white transition-colors enabled:hover:bg-sub-green-3 disabled:opacity-60">
                    {shared ? <><Check className="h-4 w-4" /> {t('pack.shared')}</> : <><Share2 className="h-4 w-4" /> {busy === 'share' ? t('pack.sharing') : status === 'online' ? t('pack.share') : t('pack.shareLocal')}</>}
                  </button>
                  <button onClick={download} disabled={busy !== null} className="flex items-center justify-center gap-2 rounded-2xl border-2 border-on-paper px-3 py-3 text-xs font-extrabold text-on-paper transition-colors enabled:hover:bg-on-paper enabled:hover:text-paper disabled:opacity-60">
                    <Download className="h-4 w-4" /> {busy === 'download' ? t('pack.generating') : t('pack.download')}
                  </button>
                </div>
                <button onClick={onClose} className="py-2 text-xs font-bold text-on-paper/55 transition-colors hover:text-on-paper">{t('pack.continue')}</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
