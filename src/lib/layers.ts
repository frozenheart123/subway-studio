import { byId, type Ingredient } from '../data/catalog'
import type { Line } from './nutrition'

export interface Layer { key: string; ing: Ingredient; copy: number; index: number }

/** Expand quantity lines into an ordered stack, bottom to top. */
export function expandLayers(lines: Line[]): Layer[] {
  const out: Layer[] = []
  const sorted = lines
    .map((l, i) => ({ l, i, ing: byId(l.id)! }))
    .filter((x) => x.ing)
    .sort((a, b) => a.ing.layerOrder - b.ing.layerOrder || a.i - b.i)
  for (const { l, ing } of sorted) {
    for (let c = 0; c < l.qty; c++) out.push({ key: `${l.id}-${c}`, ing, copy: c, index: out.length })
  }
  return out
}
