import { byId, type Ingredient } from '../data/catalog'

export interface Line { id: string; qty: number }
export interface Totals { kcal: number; protein: number; carbs: number; fat: number; sodium: number; price: number }

export const DAILY_KCAL = 2000

export function computeTotals(bread: string, lines: Line[], size: 6 | 12, lookup: (id: string) => Ingredient | undefined = byId): Totals {
  const mult = size / 6
  const all: { ing: Ingredient; qty: number }[] = []
  const b = lookup(bread)
  if (b) all.push({ ing: b, qty: 1 })
  for (const l of lines) {
    const ing = lookup(l.id)
    if (ing && l.qty > 0) all.push({ ing, qty: l.qty })
  }
  const t = all.reduce<Totals>((acc, { ing, qty }) => ({
    kcal: acc.kcal + ing.kcal * qty,
    protein: acc.protein + ing.protein * qty,
    carbs: acc.carbs + ing.carbs * qty,
    fat: acc.fat + ing.fat * qty,
    sodium: acc.sodium + ing.sodium * qty,
    price: acc.price + ing.price * qty,
  }), { kcal: 0, protein: 0, carbs: 0, fat: 0, sodium: 0, price: 0 })
  return {
    kcal: Math.round(t.kcal * mult),
    protein: Math.round(t.protein * mult * 10) / 10,
    carbs: Math.round(t.carbs * mult * 10) / 10,
    fat: Math.round(t.fat * mult * 10) / 10,
    sodium: Math.round(t.sodium * mult),
    price: Math.round(t.price * mult * 100) / 100,
  }
}

export type ToneKey = 'light' | 'balanced' | 'hearty' | 'feast' | 'monster'
export interface Tone { key: ToneKey; label: string; en: string; color: string; note: string }
export function kcalTone(kcal: number): Tone {
  if (kcal < 400) return { key: 'light', label: '轻盈', en: 'LIGHT', color: '#1fb962', note: '轻松一餐，没有负担。' }
  if (kcal < 650) return { key: 'balanced', label: '均衡', en: 'BALANCED', color: '#8fd14f', note: '刚刚好的一份午餐。' }
  if (kcal < 900) return { key: 'hearty', label: '满足', en: 'HEARTY', color: '#ffc600', note: '吃饱吃好，下午有劲。' }
  if (kcal < 1200) return { key: 'feast', label: '豪华', en: 'FEAST', color: '#ff9a2e', note: '放纵一下，也很值得。' }
  return { key: 'monster', label: '巨无霸', en: 'MONSTER', color: '#e3432c', note: '勇士的选择，分享更快乐。' }
}

export const toneInk = (tone: Tone) => (tone.color === '#ffc600' ? '#b78600' : tone.color)
export const fmtKcal = (n: number) => `${Math.round(n).toLocaleString('zh-CN')} kcal`
export const fmtPrice = (n: number) => `¥${n.toFixed(n % 1 === 0 ? 0 : 2)}`
