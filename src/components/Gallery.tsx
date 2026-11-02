import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Flame, Heart, RefreshCw } from 'lucide-react'
import { byId } from '../data/catalog'
import { useName, useT } from '../i18n'
import { fetchCreations, likeCreation, subscribeCreations, useCloud, type Creation } from '../lib/supabase'
import { useBuilder } from '../store/useBuilder'
import { useToast } from '../store/useToast'
import { MiniSub } from './MiniSub'

const LIKED_KEY = 'subway-studio:liked'
const liked = (): Set<string> => { try { return new Set(JSON.parse(localStorage.getItem(LIKED_KEY) || '[]')) } catch { return new Set() } }

export function Gallery({ refreshKey }: { refreshKey: number }) {
  const t = useT()
  const name = useName()
  const [order, setOrder] = useState<'new' | 'top'>('new')
  const [list, setList] = useState<Creation[]>([])
  const [loading, setLoading] = useState(true)
  const [likedIds, setLikedIds] = useState<Set<string>>(liked)
  const status = useCloud((s) => s.status)
  const load = useBuilder((s) => s.loadCreation)
  const show = useToast((s) => s.show)

  const timeAgo = (iso: string) => {
    const d = (Date.now() - new Date(iso).getTime()) / 1000
    if (d < 60) return t('time.now')
    if (d < 3600) return t('time.min', { n: Math.floor(d / 60) })
    if (d < 86400) return t('time.hour', { n: Math.floor(d / 3600) })
    return t('time.day', { n: Math.floor(d / 86400) })
  }

  useEffect(() => {
    let alive = true
    setLoading(true)
    fetchCreations(order).then((rows) => { if (alive) { setList(rows); setLoading(false) } })
    return () => { alive = false }
  }, [order, refreshKey, status])

  useEffect(() => subscribeCreations(
    (c) => setList((l) => (l.some((x) => x.id === c.id) ? l : [c, ...l])),
    (c) => setList((l) => l.map((x) => (x.id === c.id ? { ...x, ...c } : x))),
  ), [])

  const like = async (c: Creation) => {
    if (likedIds.has(c.id)) { show(t('gallery.liked')); return }
    const next = new Set(likedIds).add(c.id)
    setLikedIds(next)
    try { localStorage.setItem(LIKED_KEY, JSON.stringify([...next])) } catch { /* ignore */ }
    setList((l) => l.map((x) => (x.id === c.id ? { ...x, likes: x.likes + 1 } : x)))
    const n = await likeCreation(c.id)
    if (n === null) show(t('gallery.likeFail'))
  }

  const copy = (c: Creation) => {
    load(c)
    show(t('gallery.copied', { name: c.name }))
    document.getElementById('builder')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section id="gallery" className="mx-auto max-w-[1480px] px-5 py-20 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow text-sub-green-2">{status === 'online' ? t('gallery.eyebrow.online') : t('gallery.eyebrow.offline')}</p>
          <h2 className="mt-2 text-4xl font-extrabold tracking-tight text-on-shell md:text-5xl">{t('gallery.title')}</h2>
          <p className="mt-3 max-w-lg text-on-shell/55">{t('gallery.copy')}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-full border border-on-shell/10 bg-shell-2 p-1 text-xs font-bold">
            {(['new', 'top'] as const).map((o) => (
              <button key={o} onClick={() => setOrder(o)} aria-pressed={order === o} className={`rounded-full px-4 py-2 transition-colors ${order === o ? 'bg-on-shell text-shell' : 'text-on-shell/60 hover:text-on-shell'}`}>{o === 'new' ? t('order.new') : t('order.top')}</button>
            ))}
          </div>
          <button onClick={() => fetchCreations(order).then(setList)} aria-label={t('refresh')} className="flex h-10 w-10 items-center justify-center rounded-full border border-on-shell/10 text-on-shell/60 transition-colors hover:text-on-shell"><RefreshCw className="h-4 w-4" /></button>
        </div>
      </div>

      {loading && list.length === 0 ? (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-72 animate-pulse rounded-3xl bg-on-shell/5" />)}
        </div>
      ) : list.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-on-shell/15 p-14 text-center text-on-shell/50">{t('gallery.empty')}</div>
      ) : (
        <motion.div layout className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence initial={false}>
            {list.map((c) => {
              const b = byId(c.bread)
              return (
                <motion.article key={c.id} layout initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ type: 'spring', bounce: 0.25, duration: 0.6 }} className="group paper flex flex-col overflow-hidden rounded-3xl shadow-card">
                  <div className="relative bg-gradient-to-b from-paper-2 to-paper">
                    <MiniSub bread={c.bread} lines={c.items} size={c.size} toasted={c.toasted} className="w-full transition-transform duration-500 group-hover:scale-[1.04]" />
                    <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-on-paper px-2.5 py-1 text-[11px] font-bold text-paper"><Flame className="h-3 w-3 text-sub-yellow" />{c.kcal} kcal</span>
                    <span className="absolute right-3 top-3 rounded-full bg-white/80 px-2 py-1 text-[10px] font-bold text-on-paper/70">{c.size}"</span>
                  </div>
                  <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
                    <h3 className="display truncate text-lg font-extrabold text-on-paper">{c.name}</h3>
                    <p className="truncate text-xs text-on-paper/55">{c.author} · {b ? name(b) : c.bread}{c.toasted ? ` · ${t('receipt.toasted')}` : ''} · {timeAgo(c.created_at)}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <button onClick={() => like(c)} aria-pressed={likedIds.has(c.id)} className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${likedIds.has(c.id) ? 'border-tomato bg-tomato text-white' : 'border-on-paper/15 text-on-paper hover:border-tomato hover:text-tomato'}`}>
                        <Heart className={`h-3.5 w-3.5 ${likedIds.has(c.id) ? 'fill-current' : ''}`} /> {c.likes}
                      </button>
                      <button onClick={() => copy(c)} className="rounded-full bg-sub-green px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-sub-green-3">{t('gallery.make')}</button>
                    </div>
                  </div>
                </motion.article>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  )
}
