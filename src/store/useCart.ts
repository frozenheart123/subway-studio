import { create } from 'zustand'
import type { Line } from '../lib/nutrition'

export interface CartItem {
  id: string
  name: string
  bread: string
  size: 6 | 12
  toasted: boolean
  lines: Line[]
  kcal: number
  price: number
  qty: number
}

type Panel = 'closed' | 'cart' | 'checkout' | 'done'

interface CartState {
  items: CartItem[]
  panel: Panel
  lastOrder: { orderNo: string; total: number; kcal: number; cloud: boolean } | null
  add: (item: Omit<CartItem, 'id' | 'qty'>) => CartItem
  remove: (id: string) => void
  setQty: (id: string, qty: number) => void
  clear: () => void
  setPanel: (p: Panel) => void
  setLastOrder: (o: CartState['lastOrder']) => void
  count: () => number
  subtotal: () => number
  totalKcal: () => number
}

const KEY = 'subway-studio:cart'
const load = (): CartItem[] => { try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] } }

export const useCart = create<CartState>((set, get) => {
  const persist = (items: CartItem[]) => { set({ items }); try { localStorage.setItem(KEY, JSON.stringify(items)) } catch { /* ignore */ } }
  return {
    items: load(),
    panel: 'closed',
    lastOrder: null,
    add: (item) => {
      const next: CartItem = { ...item, id: `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, qty: 1 }
      persist([...get().items, next])
      return next
    },
    remove: (id) => persist(get().items.filter((i) => i.id !== id)),
    setQty: (id, qty) => persist(get().items.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(9, qty)) } : i))),
    clear: () => persist([]),
    setPanel: (panel) => set({ panel }),
    setLastOrder: (lastOrder) => set({ lastOrder }),
    count: () => get().items.reduce((n, i) => n + i.qty, 0),
    subtotal: () => Math.round(get().items.reduce((n, i) => n + i.price * i.qty, 0) * 100) / 100,
    totalKcal: () => get().items.reduce((n, i) => n + i.kcal * i.qty, 0),
  }
})
