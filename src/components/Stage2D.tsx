import { AnimatePresence, motion } from 'motion/react'
import { byId } from '../data/catalog'
import { expandLayers } from '../lib/layers'
import { getSprite, spriteKey } from '../lib/sprites'
import { useBuilder } from '../store/useBuilder'

export function Stage2D() {
  const bread = useBuilder((s) => s.bread)
  const lines = useBuilder((s) => s.lines)
  const size = useBuilder((s) => s.size)
  const toasted = useBuilder((s) => s.toasted)
  const closed = useBuilder((s) => s.closed)
  const b = byId(bread)!
  const base = getSprite(spriteKey(b))
  const lid = getSprite(spriteKey(b, true))
  const layers = expandLayers(lines)
  if (!base || !lid) return null
  const step = 2.4

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        className="paper relative w-[86%] max-w-[760px] rounded-[22px] shadow-lift"
        style={{ aspectRatio: '16 / 10' }}
        initial={{ rotate: -1.5, y: 10, opacity: 0 }}
        animate={{ rotate: -1.5, y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="absolute inset-3 rounded-[14px] border border-dashed border-ink/15" />
        <span className="display absolute left-7 top-6 text-[28px] font-extrabold leading-none text-sub-green/25">freshly<br />made.</span>
        <span className="display absolute bottom-6 right-7 text-right text-[28px] font-extrabold leading-none text-sub-green/25">make it<br />yours.</span>
        <span className="absolute right-8 top-6 text-2xl text-sub-yellow">✳</span>
        <span className="absolute bottom-7 left-8 text-2xl text-sub-yellow">✳</span>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div className="relative w-[74%]" animate={{ scaleX: size === 12 ? 1.22 : 1, rotate: 1.5 }} transition={{ type: 'spring', bounce: 0.3, duration: 0.7 }}>
            <div className="relative" style={{ paddingTop: `${base.aspect * 100}%` }}>
              <motion.img
                key={bread}
                src={base.url}
                alt={`${b.nameZh}底`}
                draggable={false}
                className={`sprite-shadow absolute inset-0 w-full ${toasted ? 'toasted' : ''}`}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              />
              <AnimatePresence initial={false}>
                {layers.map((l) => {
                  const s = getSprite(spriteKey(l.ing))
                  if (!s) return null
                  const x = (l.copy % 2 ? -1 : 1) * l.copy * 1.6
                  return (
                    <motion.img
                      key={l.key}
                      src={s.url}
                      alt={l.ing.nameZh}
                      draggable={false}
                      className="absolute left-1/2 top-1/2 w-[90%] drop-shadow-[0_8px_8px_rgba(0,0,0,.28)]"
                      style={{ x: `calc(-50% + ${x}%)`, rotate: l.copy * 1.6 }}
                      initial={{ y: 'calc(-50% - 160px)', opacity: 0, scale: 1.08 }}
                      animate={{ y: `calc(-50% - ${(l.index + 1) * step}%)`, opacity: 1, scale: 1 }}
                      exit={{ y: 'calc(-50% - 90px)', opacity: 0, scale: 1.04, transition: { duration: 0.25 } }}
                      transition={{ type: 'spring', bounce: 0.42, duration: 0.75 }}
                    />
                  )
                })}
                {closed && (
                  <motion.img
                    key="lid"
                    src={lid.url}
                    alt={`${b.nameZh}盖`}
                    draggable={false}
                    className={`sprite-shadow absolute left-1/2 top-1/2 w-full ${toasted ? 'toasted' : ''}`}
                    style={{ x: '-50%' }}
                    initial={{ y: 'calc(-50% - 260px)', opacity: 0, rotate: -6 }}
                    animate={{ y: `calc(-50% - ${(layers.length + 1) * step + 5}%)`, opacity: 1, rotate: 0 }}
                    exit={{ y: 'calc(-50% - 220px)', opacity: 0, transition: { duration: 0.3 } }}
                    transition={{ type: 'spring', bounce: 0.35, duration: 0.9 }}
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
