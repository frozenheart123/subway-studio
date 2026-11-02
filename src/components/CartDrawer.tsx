import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, Check, Flame, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { byId } from '../data/catalog'
import { useName, useT } from '../i18n'
import { fmtPrice } from '../lib/nutrition'
import { createOrder, useCloud } from '../lib/supabase'
import { useCart } from '../store/useCart'
import { useToast } from '../store/useToast'
import { MiniSub } from './MiniSub'

const field = 'mt-1 w-full rounded-xl border border-on-paper/15 bg-white px-4 py-3 text-on-paper outline-none transition-colors focus:border-sub-green'

const orderNo = () => `SW-${Date.now().toString(36).toUpperCase().slice(-4)}${Math.floor(Math.random() * 900 + 100)}`

export function CartDrawer() {
  const t = useT()
  const name = useName()
  const items = useCart((s) => s.items)
  const panel = useCart((s) => s.panel)
  const setPanel = useCart((s) => s.setPanel)
  const remove = useCart((s) => s.remove)
  const setQty = useCart((s) => s.setQty)
  const clear = useCart((s) => s.clear)
  const lastOrder = useCart((s) => s.lastOrder)
  const setLastOrder = useCart((s) => s.setLastOrder)
  const status = useCloud((s) => s.status)
  const show = useToast((s) => s.show)
  const [customer, setCustomer] = useState(() => { try { return localStorage.getItem('subway-studio:author') || '' } catch { return '' } })
  const [phone, setPhone] = useState('')
  const [pickup, setPickup] = useState<'asap' | 'later'>('asap')
  const [paying, setPaying] = useState(false)

  const open = panel !== 'closed'
  const count = items.reduce((n, i) => n + i.qty, 0)
  const subtotal = Math.round(items.reduce((n, i) => n + i.price * i.qty, 0) * 100) / 100
  const kcal = items.reduce((n, i) => n + i.kcal * i.qty, 0)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !paying) setPanel('closed') }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open, paying, setPanel])

  const pay = async () => {
    if (!customer.trim()) { show(t('checkout.nameRequired')); return }
    setPaying(true)
    const no = orderNo()
    await new Promise((r) => setTimeout(r, 1700))
    const { cloud } = await createOrder({
      order_no: no,
      customer: customer.trim(),
      phone: phone.trim() || null,
      pickup,
      items: items.map((i) => ({ name: i.name, bread: i.bread, size: i.size, toasted: i.toasted, lines: i.lines, kcal: i.kcal, price: i.price, qty: i.qty })),
      item_count: count,
      subtotal,
      kcal,
    })
    setLastOrder({ orderNo: no, total: subtotal, kcal, cloud })
    clear()
    setPaying(false)
    setPanel('done')
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[66]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button aria-label="close" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !paying && setPanel('closed')} />
          <motion.aside
            role="dialog"
            aria-modal="true"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', bounce: 0.15, duration: 0.6 }}
            className="paper absolute inset-y-0 right-0 flex w-full max-w-[460px] flex-col shadow-lift"
          >
            <div className="flex items-center justify-between border-b border-on-paper/10 px-6 py-5">
              <div>
                <p className="eyebrow text-sub-green-3">{panel === 'done' ? 'Order placed' : panel === 'checkout' ? 'Checkout' : 'Your cart'}</p>
                <h2 className="display text-2xl font-extrabold text-on-paper">{panel === 'done' ? t('done.title') : panel === 'checkout' ? t('checkout.title') : t('cart.title')}</h2>
              </div>
              <button onClick={() => !paying && setPanel('closed')} aria-label="close" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-on-paper transition-colors hover:bg-on-paper hover:text-paper"><X className="h-5 w-5" /></button>
            </div>

            {panel === 'cart' && (
              <>
                <div className="scrollbar-thin flex-1 overflow-y-auto px-5 py-4">
                  {items.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-on-paper/5"><ShoppingBag className="h-7 w-7 text-on-paper/40" /></span>
                      <p className="display text-lg font-extrabold text-on-paper">{t('cart.empty')}</p>
                      <p className="max-w-[260px] text-sm text-on-paper/55">{t('cart.emptyCopy')}</p>
                      <button onClick={() => setPanel('closed')} className="mt-2 rounded-full bg-sub-green px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-sub-green-3">{t('cart.continue')}</button>
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      <AnimatePresence initial={false}>
                        {items.map((i) => {
                          const b = byId(i.bread)
                          return (
                            <motion.li key={i.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 40 }} className="flex gap-3 rounded-2xl bg-white/75 p-3">
                              <div className="w-28 shrink-0 rounded-xl bg-paper-2"><MiniSub bread={i.bread} lines={i.lines} size={i.size} toasted={i.toasted} className="w-full" /></div>
                              <div className="min-w-0 flex-1">
                                <p className="display truncate font-extrabold text-on-paper">{i.name}</p>
                                <p className="truncate text-[11px] text-on-paper/55">{b ? name(b) : i.bread} · {i.size}" · {i.toasted ? t('receipt.toasted') : ''}</p>
                                <p className="mt-0.5 flex items-center gap-1 text-[11px] font-bold text-on-paper/70"><Flame className="h-3 w-3 text-mustard" />{i.kcal} kcal</p>
                                <div className="mt-2 flex items-center justify-between">
                                  <div className="flex items-center gap-1 rounded-full bg-on-paper/5 p-0.5">
                                    <button onClick={() => (i.qty === 1 ? remove(i.id) : setQty(i.id, i.qty - 1))} aria-label="-" className="flex h-7 w-7 items-center justify-center rounded-full text-on-paper transition-colors hover:bg-white">{i.qty === 1 ? <Trash2 className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}</button>
                                    <span className="display w-5 text-center text-sm font-extrabold text-on-paper">{i.qty}</span>
                                    <button onClick={() => setQty(i.id, i.qty + 1)} aria-label="+" className="flex h-7 w-7 items-center justify-center rounded-full text-on-paper transition-colors hover:bg-white"><Plus className="h-3.5 w-3.5" /></button>
                                  </div>
                                  <span className="display font-extrabold text-on-paper">{fmtPrice(i.price * i.qty)}</span>
                                </div>
                              </div>
                            </motion.li>
                          )
                        })}
                      </AnimatePresence>
                    </ul>
                  )}
                </div>
                {items.length > 0 && (
                  <div className="border-t border-on-paper/10 px-6 py-5">
                    <div className="flex items-center justify-between text-sm text-on-paper/70"><span>{t('cart.kcal')}</span><span className="font-bold text-on-paper">{kcal.toLocaleString()} kcal</span></div>
                    <div className="mt-1 flex items-center justify-between"><span className="text-sm text-on-paper/70">{t('cart.subtotal')} · {t('cart.items', { n: count })}</span><span className="display text-2xl font-extrabold text-on-paper">{fmtPrice(subtotal)}</span></div>
                    <div className="mt-4 grid grid-cols-[1fr_1.6fr] gap-2">
                      <button onClick={() => setPanel('closed')} className="rounded-2xl border-2 border-on-paper/15 px-4 py-3.5 text-sm font-bold text-on-paper transition-colors hover:border-on-paper">{t('cart.continue')}</button>
                      <button onClick={() => setPanel('checkout')} className="rounded-2xl bg-sub-green px-4 py-3.5 text-sm font-extrabold text-white transition-colors hover:bg-sub-green-3">{t('cart.checkout')} →</button>
                    </div>
                  </div>
                )}
              </>
            )}

            {panel === 'checkout' && (
              <div className="flex flex-1 flex-col overflow-y-auto px-6 py-5">
                <button onClick={() => setPanel('cart')} className="flex w-fit items-center gap-1 text-xs font-bold text-on-paper/55 transition-colors hover:text-on-paper"><ArrowLeft className="h-3.5 w-3.5" /> {t('checkout.back')}</button>
                <ul className="mt-4 space-y-1.5 rounded-2xl bg-white/70 p-4 text-sm">
                  {items.map((i) => (
                    <li key={i.id} className="flex items-baseline justify-between gap-2 text-on-paper"><span className="truncate">{i.name} <span className="text-on-paper/50">×{i.qty}</span></span><span className="display font-bold">{fmtPrice(i.price * i.qty)}</span></li>
                  ))}
                  <li className="mt-2 flex items-center justify-between border-t border-dashed border-on-paper/20 pt-2 text-on-paper"><span className="text-xs">{kcal.toLocaleString()} kcal</span><span className="display text-xl font-extrabold">{fmtPrice(subtotal)}</span></li>
                </ul>
                <label className="mt-5 text-xs font-bold text-on-paper/70" htmlFor="co-name">{t('checkout.name')}</label>
                <input id="co-name" value={customer} maxLength={24} placeholder={t('checkout.name.ph')} onChange={(e) => setCustomer(e.target.value)} className={field} />
                <label className="mt-3 text-xs font-bold text-on-paper/70" htmlFor="co-phone">{t('checkout.phone')}</label>
                <input id="co-phone" value={phone} maxLength={20} inputMode="tel" onChange={(e) => setPhone(e.target.value)} className={field} />
                <p className="mt-3 text-xs font-bold text-on-paper/70">{t('checkout.pickup')}</p>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  {(['asap', 'later'] as const).map((p) => (
                    <button key={p} onClick={() => setPickup(p)} aria-pressed={pickup === p} className={`rounded-xl border-2 px-3 py-2.5 text-sm font-bold transition-colors ${pickup === p ? 'border-sub-green bg-sub-green/10 text-on-paper' : 'border-on-paper/10 text-on-paper/60 hover:border-on-paper/30'}`}>{p === 'asap' ? t('pickup.asap') : t('pickup.later')}</button>
                  ))}
                </div>
                <div className="mt-auto pt-6">
                  <button onClick={pay} disabled={paying} className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-on-paper px-5 py-4 text-sm font-extrabold text-paper transition-colors enabled:hover:bg-sub-green-3 disabled:opacity-80">
                    {paying && <motion.span className="absolute inset-y-0 left-0 bg-sub-green/60" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.6, ease: 'easeInOut' }} />}
                    <span className="relative">{paying ? t('checkout.paying') : t('checkout.pay', { n: subtotal })}</span>
                  </button>
                  <p className="mt-2 text-center text-[11px] text-on-paper/45">{t('checkout.note')}</p>
                </div>
              </div>
            )}

            {panel === 'done' && lastOrder && (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.55, delay: 0.1 }} className="flex h-20 w-20 items-center justify-center rounded-full bg-sub-green text-white shadow-lift"><Check className="h-10 w-10" strokeWidth={3} /></motion.span>
                <p className="mt-6 text-sm text-on-paper/60">{t('done.copy')}</p>
                <div className="mt-6 w-full rounded-2xl bg-white/75 p-5">
                  <p className="eyebrow text-[9px] text-on-paper/45">{t('done.orderNo')}</p>
                  <p className="display text-4xl font-extrabold tracking-tight text-on-paper">{lastOrder.orderNo}</p>
                  <div className="mt-4 flex justify-between text-sm">
                    <span className="text-on-paper/60">{t('done.total')}</span><span className="display font-extrabold text-on-paper">{fmtPrice(lastOrder.total)}</span>
                  </div>
                  <div className="mt-1 flex justify-between text-sm">
                    <span className="text-on-paper/60">{t('done.kcal')}</span><span className="display font-extrabold text-on-paper">{lastOrder.kcal.toLocaleString()} kcal</span>
                  </div>
                </div>
                <p className="mt-3 text-[11px] text-on-paper/45">{lastOrder.cloud && status === 'online' ? t('done.cloud') : t('done.local')}</p>
                <button onClick={() => setPanel('closed')} className="mt-6 w-full rounded-2xl bg-sub-yellow px-5 py-3.5 text-sm font-extrabold text-ink transition-colors hover:bg-sub-yellow-2">{t('done.close')}</button>
              </div>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
