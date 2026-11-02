import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Check, Minus, Plus } from 'lucide-react'
import { STEPS, ofGroup, type Ingredient } from '../data/catalog'
import { useName, useStepText, useT } from '../i18n'
import { getSprite, spriteKey } from '../lib/sprites'
import { useBuilder } from '../store/useBuilder'
import { useToast } from '../store/useToast'

function IngredientCard({ ing }: { ing: Ingredient }) {
  const t = useT()
  const name = useName()
  const bread = useBuilder((s) => s.bread)
  const qty = useBuilder((s) => s.qtyOf(ing.id))
  const size = useBuilder((s) => s.size)
  const add = useBuilder((s) => s.add)
  const remove = useBuilder((s) => s.remove)
  const setBread = useBuilder((s) => s.setBread)
  const show = useToast((s) => s.show)
  const sprite = getSprite(spriteKey(ing))
  const isBread = ing.group === 'bread'
  const selected = isBread ? bread === ing.id : qty > 0
  const mult = size / 6
  const kcal = Math.round(ing.kcal * mult)
  const full = !isBread && qty >= ing.maxQty
  const chipInk = ing.id === 'mayo' ? '#8a6a1c' : ing.id === 'olive' ? '#3a2a2a' : undefined

  const onPick = () => {
    if (isBread) { setBread(ing.id); return }
    if (!add(ing.id)) show(t('pantry.max', { name: name(ing), n: ing.maxQty }))
  }
  const qtyLabel = qty === 1 ? t('qty.1') : qty === 2 ? t('qty.2') : t('qty.n', { n: qty })

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.97 }}
      transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
      draggable={!isBread}
      onDragStart={(e: unknown) => {
        const ev = e as React.DragEvent
        ev.dataTransfer?.setData('text/plain', ing.id)
        ev.dataTransfer!.effectAllowed = 'copy'
      }}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border-2 text-left transition-colors ${selected ? 'border-sub-green bg-white shadow-card' : 'border-on-paper/5 bg-white/70 hover:border-on-paper/15 hover:bg-white'} ${isBread ? '' : 'cursor-grab active:cursor-grabbing'}`}
    >
      <button onClick={onPick} aria-pressed={selected} className="flex w-full flex-col items-stretch px-3 pt-3 text-left">
        <span className="flex items-start justify-between">
          <span className="eyebrow text-[9px] text-on-paper/40">{ing.price ? `¥${ing.price * mult}` : t('pantry.included')}</span>
          <span className={`flex h-6 w-6 items-center justify-center rounded-full border transition-colors ${selected ? 'border-sub-green bg-sub-green text-white' : 'border-on-paper/15 bg-white text-on-paper'}`}>
            {selected ? (isBread ? <Check className="h-3.5 w-3.5" /> : <span className="text-[11px] font-bold">{qty}</span>) : <Plus className="h-3.5 w-3.5 text-on-paper/40" />}
          </span>
        </span>
        <span className="relative my-1 flex h-20 items-center justify-center">
          <span className="absolute inset-x-4 bottom-2 h-6 rounded-full bg-on-paper/10 blur-md transition-opacity group-hover:opacity-70" />
          {sprite && (
            <motion.img src={sprite.url} alt={name(ing)} draggable={false} className="relative max-h-20 w-[88%] object-contain" whileHover={{ rotate: -3, y: -3, scale: 1.04 }} transition={{ type: 'spring', bounce: 0.5 }} />
          )}
        </span>
        <span className="display text-[15px] font-bold leading-tight text-on-paper">{name(ing)}</span>
        <span className="eyebrow text-[9px] text-on-paper/40">{ing.nameEn}</span>
        <span className="mt-2 mb-3 inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold" style={{ background: `${ing.color}26`, color: chipInk ?? '#1a2419' }}>
          +{kcal} kcal
        </span>
      </button>
      {!isBread && (
        <AnimatePresence initial={false}>
          {qty > 0 && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="flex items-center justify-between border-t border-on-paper/10 bg-paper-2/70 px-2 py-1.5">
                <button onClick={() => remove(ing.id)} aria-label={`- ${name(ing)}`} className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-on-paper shadow-sm transition-colors hover:bg-tomato hover:text-white"><Minus className="h-4 w-4" /></button>
                <span className="text-xs font-bold text-on-paper/70">{qtyLabel} · {Math.round(ing.kcal * qty * mult)} kcal</span>
                <button onClick={onPick} disabled={full} aria-label={`+ ${name(ing)}`} className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-on-paper shadow-sm transition-colors enabled:hover:bg-sub-green enabled:hover:text-white disabled:opacity-35"><Plus className="h-4 w-4" /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  )
}

export function Pantry({ onFinish }: { onFinish: () => void }) {
  const t = useT()
  const stepText = useStepText()
  const step = useBuilder((s) => s.step)
  const setStep = useBuilder((s) => s.setStep)
  const lines = useBuilder((s) => s.lines)
  const lookup = useBuilder((s) => s.lookup)
  const current = STEPS[step]
  const text = stepText(current)
  const items = ofGroup(current.key).map((i) => lookup(i.id) ?? i)
  const doneFor = (key: string) => key === 'bread' || lines.some((l) => lookup(l.id)?.group === key)

  return (
    <aside className="paper flex flex-col rounded-[28px] shadow-lift">
      <div role="tablist" className="flex gap-1 border-b border-on-paper/10 p-2">
        {STEPS.map((s, i) => (
          <button
            key={s.key}
            role="tab"
            aria-selected={i === step}
            onClick={() => setStep(i)}
            className={`flex flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-2xl px-1.5 py-2.5 text-[12px] font-bold transition-colors ${i === step ? 'bg-on-paper text-paper' : 'text-on-paper/60 hover:bg-on-paper/5'}`}
          >
            <span className="display text-[10px] opacity-60">{s.num}</span>{stepText(s).title}
            {doneFor(s.key) && i !== step && <Check className="h-3 w-3 text-sub-green" />}
          </button>
        ))}
      </div>
      <div className="px-5 pt-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="eyebrow text-sub-green-3">{current.en}</p>
            <h2 className="display mt-1 text-2xl font-extrabold text-on-paper">{text.headline}</h2>
          </div>
          <span className="display text-4xl font-extrabold text-on-paper/10">{current.num}</span>
        </div>
        <p className="mt-1 text-sm text-on-paper/60">{text.description}</p>
      </div>
      <div className="scrollbar-thin grid max-h-[560px] grid-cols-2 gap-3 overflow-y-auto p-5" role="tabpanel">
        <AnimatePresence mode="popLayout">
          {items.map((ing) => <IngredientCard key={ing.id} ing={ing} />)}
        </AnimatePresence>
      </div>
      <div className="mt-auto flex items-center justify-between px-5 pb-2 text-[11px] text-on-paper/50">
        <span>{text.hint}</span>
        <span className="flex items-center gap-1 font-semibold text-sub-green-3"><span className="h-1.5 w-1.5 rounded-full bg-sub-green" />{t('pantry.fresh')}</span>
      </div>
      <div className="p-4 pt-2">
        <button onClick={() => (step < 3 ? setStep(step + 1) : onFinish())} className="group flex w-full items-center justify-between rounded-2xl bg-sub-green px-5 py-4 text-sm font-bold text-white transition-colors hover:bg-sub-green-3">
          {step < 3 ? t('pantry.next') : t('pantry.finish')}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </aside>
  )
}
