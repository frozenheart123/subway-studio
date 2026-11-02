import { byId } from '../data/catalog'
import { expandLayers } from '../lib/layers'
import { getSprite, spriteKey } from '../lib/sprites'
import type { Line } from '../lib/nutrition'

interface Props { bread: string; lines: Line[]; size?: 6 | 12; toasted?: boolean; closed?: boolean; className?: string }

/** Static stacked preview used in cards and dialogs. */
export function MiniSub({ bread, lines, size = 6, toasted = false, closed = true, className = '' }: Props) {
  const b = byId(bread) ?? byId('italian')!
  const base = getSprite(spriteKey(b))
  const lid = getSprite(spriteKey(b, true))
  const layers = expandLayers(lines)
  if (!base) return null
  const step = 2.2
  return (
    <div className={`relative ${className}`} style={{ aspectRatio: '16 / 9' }}>
      <div className="absolute left-1/2 top-1/2 w-[76%]" style={{ transform: `translate(-50%, -50%) scaleX(${size === 12 ? 1.2 : 1})` }}>
        <div className="relative" style={{ paddingTop: `${base.aspect * 100}%` }}>
          <img src={base.url} alt="" className={`absolute inset-0 w-full ${toasted ? 'toasted' : ''}`} draggable={false} />
          {layers.map((l) => {
            const s = getSprite(spriteKey(l.ing))
            if (!s) return null
            return (
              <img
                key={l.key}
                src={s.url}
                alt=""
                draggable={false}
                className="absolute left-1/2 top-1/2 w-[90%]"
                style={{ transform: `translate(calc(-50% + ${(l.copy % 2 ? -1 : 1) * l.copy * 1.5}%), calc(-50% - ${(l.index + 1) * step}%)) rotate(${l.copy * 1.5}deg)` }}
              />
            )
          })}
          {closed && lid && (
            <img src={lid.url} alt="" draggable={false} className={`absolute left-1/2 top-1/2 w-full ${toasted ? 'toasted' : ''}`} style={{ transform: `translate(-50%, calc(-50% - ${(layers.length + 1) * step + 4}%))` }} />
          )}
        </div>
      </div>
    </div>
  )
}
