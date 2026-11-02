import { create } from 'zustand'
import { CATALOG, byId, type Ingredient, type Preset } from '../data/catalog'
import { computeTotals, type Line, type Totals } from '../lib/nutrition'
import type { Creation } from '../lib/supabase'

export type View = '2d' | '3d'

interface Snapshot { bread: string; size: 6 | 12; toasted: boolean; lines: Line[] }
export interface Delta { kcal: number; label: string; key: number; color: string }

interface BuilderState extends Snapshot {
  step: number
  closed: boolean
  view: View
  sound: boolean
  history: Snapshot[]
  deltas: Delta[]
  nutrition: Record<string, Partial<Ingredient>>
  lookup: (id: string) => Ingredient | undefined
  totals: () => Totals
  qtyOf: (id: string) => number
  setBread: (id: string) => void
  add: (id: string) => boolean
  remove: (id: string) => void
  setQty: (id: string, qty: number) => void
  setSize: (size: 6 | 12) => void
  toggleToast: () => void
  setStep: (step: number) => void
  setClosed: (closed: boolean) => void
  setView: (view: View) => void
  toggleSound: () => void
  undo: () => void
  reset: () => void
  applyPreset: (p: Preset) => void
  loadCreation: (c: Creation) => void
  applyNutrition: (rows: Record<string, Partial<Ingredient>>) => void
  pushDelta: (d: Omit<Delta, 'key'>) => void
}

const STORAGE = 'subway-studio:v2'
const initial = (): Snapshot => ({ bread: 'italian', size: 6, toasted: false, lines: [] })

function restore(): Snapshot & { step: number } {
  try {
    const raw = localStorage.getItem(STORAGE)
    if (!raw) return { ...initial(), step: 0 }
    const s = JSON.parse(raw)
    const bread = byId(s.bread)?.group === 'bread' ? s.bread : 'italian'
    const lines: Line[] = Array.isArray(s.lines)
      ? s.lines.filter((l: Line) => byId(l.id) && byId(l.id)!.group !== 'bread').map((l: Line) => ({ id: l.id, qty: Math.max(1, Math.min(byId(l.id)!.maxQty, l.qty | 0)) }))
      : []
    return { bread, size: s.size === 12 ? 12 : 6, toasted: !!s.toasted, lines, step: Number.isInteger(s.step) ? Math.min(3, Math.max(0, s.step)) : 0 }
  } catch { return { ...initial(), step: 0 } }
}

let pop: (() => void) | null = null
export function setPopSound(fn: () => void) { pop = fn }

export const useBuilder = create<BuilderState>((set, get) => {
  const persist = () => {
    const { bread, size, toasted, lines, step } = get()
    try { localStorage.setItem(STORAGE, JSON.stringify({ bread, size, toasted, lines, step })) } catch { /* ignore */ }
  }
  const snapshot = (): Snapshot => {
    const { bread, size, toasted, lines } = get()
    return { bread, size, toasted, lines: lines.map((l) => ({ ...l })) }
  }
  const commit = (patch: Partial<Snapshot>) => {
    const history = [...get().history, snapshot()].slice(-40)
    set({ ...patch, history })
    persist()
    if (get().sound) pop?.()
  }

  return {
    ...restore(),
    closed: false,
    view: '2d',
    sound: false,
    history: [],
    deltas: [],
    nutrition: {},
    lookup: (id) => {
      const base = byId(id)
      if (!base) return undefined
      const extra = get().nutrition[id]
      return extra ? { ...base, ...extra } : base
    },
    totals: () => {
      const { bread, lines, size, lookup } = get()
      return computeTotals(bread, lines, size, lookup)
    },
    qtyOf: (id) => get().lines.find((l) => l.id === id)?.qty ?? 0,
    pushDelta: (d) => {
      const key = Date.now() + Math.random()
      set({ deltas: [...get().deltas.slice(-4), { ...d, key }] })
      setTimeout(() => set({ deltas: get().deltas.filter((x) => x.key !== key) }), 1600)
    },
    setBread: (id) => {
      const ing = get().lookup(id)
      if (!ing || ing.group !== 'bread' || id === get().bread) return
      const prev = get().lookup(get().bread)
      const mult = get().size / 6
      commit({ bread: id })
      get().pushDelta({ kcal: (ing.kcal - (prev?.kcal ?? 0)) * mult, label: ing.nameZh, color: ing.color })
    },
    add: (id) => {
      const ing = get().lookup(id)
      if (!ing) return false
      if (ing.group === 'bread') { get().setBread(id); return true }
      const lines = get().lines.map((l) => ({ ...l }))
      const hit = lines.find((l) => l.id === id)
      if (hit) {
        if (hit.qty >= ing.maxQty) return false
        hit.qty += 1
      } else lines.push({ id, qty: 1 })
      commit({ lines })
      get().pushDelta({ kcal: ing.kcal * (get().size / 6), label: hit ? `${ing.nameZh} ×${hit.qty}` : ing.nameZh, color: ing.color })
      return true
    },
    remove: (id) => {
      const ing = get().lookup(id)
      const lines = get().lines.map((l) => ({ ...l }))
      const hit = lines.find((l) => l.id === id)
      if (!hit || !ing) return
      hit.qty -= 1
      commit({ lines: lines.filter((l) => l.qty > 0) })
      get().pushDelta({ kcal: -ing.kcal * (get().size / 6), label: ing.nameZh, color: ing.color })
    },
    setQty: (id, qty) => {
      const cur = get().qtyOf(id)
      if (qty > cur) { for (let i = cur; i < qty; i++) get().add(id) }
      else { for (let i = cur; i > qty; i--) get().remove(id) }
    },
    setSize: (size) => {
      if (size === get().size) return
      const before = get().totals().kcal
      commit({ size })
      get().pushDelta({ kcal: get().totals().kcal - before, label: size === 12 ? '12 英寸' : '6 英寸', color: '#ffc600' })
    },
    toggleToast: () => commit({ toasted: !get().toasted }),
    setStep: (step) => { set({ step: Math.min(3, Math.max(0, step)) }); persist() },
    setClosed: (closed) => set({ closed }),
    setView: (view) => set({ view }),
    toggleSound: () => set({ sound: !get().sound }),
    undo: () => {
      const history = [...get().history]
      const last = history.pop()
      if (!last) return
      set({ ...last, history })
      persist()
    },
    reset: () => { set({ ...initial(), step: 0, closed: false, history: [...get().history, snapshot()].slice(-40) }); persist() },
    applyPreset: (p) => {
      const before = get().totals().kcal
      commit({ bread: p.bread, size: p.size, toasted: p.toasted, lines: p.items.map((l) => ({ ...l })) })
      set({ step: 3, closed: false })
      persist()
      get().pushDelta({ kcal: get().totals().kcal - before, label: p.name, color: '#ffc600' })
    },
    loadCreation: (c) => {
      const lines = (c.items ?? []).filter((l) => byId(l.id) && byId(l.id)!.group !== 'bread')
      commit({ bread: byId(c.bread) ? c.bread : 'italian', size: c.size === 12 ? 12 : 6, toasted: !!c.toasted, lines })
      set({ step: 3, closed: false })
      persist()
    },
    applyNutrition: (rows) => set({ nutrition: rows }),
  }
})

export const ALL_IDS = CATALOG.map((x) => x.id)
