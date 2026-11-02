import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Box, Flame, LayoutPanelTop, Undo2 } from 'lucide-react'
import { Stage2D } from './Stage2D'
import { Stage3D } from './Stage3D'
import { useT } from '../i18n'
import { useBuilder } from '../store/useBuilder'
import { useToast } from '../store/useToast'
import { useTotals } from '../lib/useTotals'

const pill = 'flex rounded-full border border-on-shell/10 bg-shell-2 p-1 text-xs font-bold'

export function Stage() {
  const t = useT()
  const view = useBuilder((s) => s.view)
  const setView = useBuilder((s) => s.setView)
  const size = useBuilder((s) => s.size)
  const setSize = useBuilder((s) => s.setSize)
  const toasted = useBuilder((s) => s.toasted)
  const toggleToast = useBuilder((s) => s.toggleToast)
  const closed = useBuilder((s) => s.closed)
  const setClosed = useBuilder((s) => s.setClosed)
  const undo = useBuilder((s) => s.undo)
  const canUndo = useBuilder((s) => s.history.length > 0)
  const add = useBuilder((s) => s.add)
  const lines = useBuilder((s) => s.lines)
  const show = useToast((s) => s.show)
  const totals = useTotals()
  const [dragging, setDragging] = useState(false)
  const layerCount = lines.reduce((n, l) => n + l.qty, 0)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="eyebrow flex items-center gap-2 text-on-shell/60"><span className="h-1.5 w-1.5 rounded-full bg-sub-yellow" /> {t('stage.station')}</span>
        <div className="flex items-center gap-2">
          <div className={pill}>
            {(['2d', '3d'] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} aria-pressed={view === v} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors ${view === v ? 'bg-sub-yellow text-ink' : 'text-on-shell/60 hover:text-on-shell'}`}>
                {v === '2d' ? <LayoutPanelTop className="h-3.5 w-3.5" /> : <Box className="h-3.5 w-3.5" />}
                {v === '2d' ? t('view.2d') : t('view.3d')}
              </button>
            ))}
          </div>
          <button onClick={undo} disabled={!canUndo} className="flex items-center gap-1.5 rounded-full border border-on-shell/10 px-3 py-2 text-xs font-bold text-on-shell/70 transition-colors enabled:hover:border-on-shell/30 enabled:hover:text-on-shell disabled:opacity-30">
            <Undo2 className="h-3.5 w-3.5" /> {t('undo')}
          </button>
        </div>
      </div>

      <div
        className={`stage-glow stage-wrap relative overflow-hidden rounded-[28px] border transition-colors ${dragging ? 'border-sub-yellow' : 'border-on-shell/10'}`}
        style={{ minHeight: 520 }}
        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; if (!dragging) setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          const id = e.dataTransfer.getData('text/plain')
          if (id && !add(id)) show(t('stage.max'))
        }}
        role="img"
        aria-label="sandwich preview"
      >
        {view === '2d' ? <Stage2D /> : <Stage3D />}
        <AnimatePresence>
          {dragging && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-4 flex items-center justify-center rounded-3xl border-2 border-dashed border-sub-yellow bg-ink/40 backdrop-blur-[2px]">
              <span className="display rounded-full bg-sub-yellow px-5 py-2 text-sm font-bold text-ink">{t('drop')}</span>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="pointer-events-none absolute left-5 top-5 flex items-center gap-2 rounded-full bg-ink/60 px-3 py-1.5 text-[11px] font-bold text-cream/85 backdrop-blur">
          <Flame className="h-3.5 w-3.5 text-sub-yellow" /> {totals.kcal.toLocaleString()} kcal
        </div>
        <div className="pointer-events-none absolute bottom-5 left-5 display text-xs font-semibold text-cream/55">
          {String(layerCount + 1).padStart(2, '0')} / {layerCount === 0 ? t('layers.bread') : t('layers.n', { n: layerCount })}
        </div>
        <div className="pointer-events-none absolute bottom-5 right-5 text-[11px] text-cream/45">{view === '3d' ? t('hint.3d') : t('hint.2d')}</div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className={pill}>
          {([6, 12] as const).map((s) => (
            <button key={s} onClick={() => setSize(s)} aria-pressed={size === s} className={`rounded-full px-4 py-2 transition-colors ${size === s ? 'bg-on-shell text-shell' : 'text-on-shell/60 hover:text-on-shell'}`}>
              {t('size.inch', { n: s })} <span className="font-normal opacity-60">{s === 6 ? '15' : '30'} cm</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleToast} aria-pressed={toasted} className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-colors ${toasted ? 'border-sub-yellow bg-sub-yellow/15 text-mustard' : 'border-on-shell/10 text-on-shell/70 hover:border-on-shell/30'}`}>
            <span className={`relative h-4 w-7 rounded-full transition-colors ${toasted ? 'bg-sub-yellow' : 'bg-on-shell/15'}`}><span className={`absolute top-0.5 h-3 w-3 rounded-full bg-ink transition-all ${toasted ? 'left-3.5' : 'left-0.5'}`} /></span>
            {t('toastit')}
          </button>
          <button onClick={() => setClosed(!closed)} aria-pressed={closed} className={`rounded-full border px-4 py-2 text-xs font-bold transition-colors ${closed ? 'border-sub-green-2 bg-sub-green/15 text-sub-green-2' : 'border-on-shell/10 text-on-shell/70 hover:border-on-shell/30'}`}>
            {closed ? t('lid.open') : t('lid.close')}
          </button>
        </div>
      </div>
    </div>
  )
}
