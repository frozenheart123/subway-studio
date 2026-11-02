import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { create } from 'zustand'
import type { Line } from './nutrition'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

export const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null

export interface Creation {
  id: string
  name: string
  author: string
  bread: string
  size: 6 | 12
  toasted: boolean
  items: Line[]
  kcal: number
  protein: number
  carbs: number
  fat: number
  price: number
  likes: number
  created_at: string
}

export interface IngredientRow {
  id: string; group: string; name_zh: string; name_en: string
  kcal: number; protein: number; carbs: number; fat: number; sodium: number
  price: number; max_qty: number; sort: number; is_active: boolean
}

type CloudStatus = 'checking' | 'online' | 'offline'
interface CloudState { status: CloudStatus; reason: string; set: (s: CloudStatus, reason?: string) => void }
export const useCloud = create<CloudState>((set) => ({
  status: supabase ? 'checking' : 'offline',
  reason: supabase ? '' : '未配置 Supabase 环境变量',
  set: (status, reason = '') => set({ status, reason }),
}))

const LOCAL_KEY = 'subway-studio:gallery'
function localGallery(): Creation[] {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]') } catch { return [] }
}
function saveLocalGallery(list: Creation[]) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(list.slice(0, 60))) } catch { /* ignore */ }
}

function offline(reason: string) {
  useCloud.getState().set('offline', reason)
}

export async function fetchIngredients(): Promise<IngredientRow[] | null> {
  if (!supabase) return null
  const { data, error } = await supabase.from('subway_ingredients').select('*').eq('is_active', true)
  if (error) { offline(error.message); return null }
  useCloud.getState().set('online')
  return data as IngredientRow[]
}

export async function fetchCreations(order: 'new' | 'top' = 'new'): Promise<Creation[]> {
  if (!supabase || useCloud.getState().status === 'offline') {
    const list = localGallery()
    return order === 'top' ? [...list].sort((a, b) => b.likes - a.likes) : list
  }
  const q = supabase.from('subway_creations').select('*').limit(36)
  const { data, error } = await (order === 'top' ? q.order('likes', { ascending: false }).order('created_at', { ascending: false }) : q.order('created_at', { ascending: false }))
  if (error) { offline(error.message); return localGallery() }
  return (data ?? []) as Creation[]
}

export type NewCreation = Omit<Creation, 'id' | 'likes' | 'created_at'>

export async function shareCreation(c: NewCreation): Promise<{ creation: Creation; cloud: boolean }> {
  if (supabase && useCloud.getState().status !== 'offline') {
    const { data, error } = await supabase.from('subway_creations').insert(c).select('*').single()
    if (!error && data) return { creation: data as Creation, cloud: true }
    if (error) offline(error.message)
  }
  const creation: Creation = { ...c, id: `local-${Date.now()}`, likes: 0, created_at: new Date().toISOString() }
  saveLocalGallery([creation, ...localGallery()])
  return { creation, cloud: false }
}

export async function likeCreation(id: string): Promise<number | null> {
  if (id.startsWith('local-') || !supabase || useCloud.getState().status === 'offline') {
    const list = localGallery()
    const hit = list.find((c) => c.id === id)
    if (hit) { hit.likes += 1; saveLocalGallery(list); return hit.likes }
    return null
  }
  const { data, error } = await supabase.rpc('subway_like', { creation_id: id })
  if (error) return null
  return data as number
}

export interface NewOrder {
  order_no: string
  customer: string
  phone: string | null
  pickup: 'asap' | 'later'
  items: unknown[]
  item_count: number
  subtotal: number
  kcal: number
}

export async function createOrder(o: NewOrder): Promise<{ cloud: boolean }> {
  if (supabase && useCloud.getState().status !== 'offline') {
    const { error } = await supabase.from('subway_orders').insert({ ...o, status: 'paid', payment: 'demo' })
    if (!error) return { cloud: true }
    offline(error.message)
  }
  try {
    const list = JSON.parse(localStorage.getItem('subway-studio:orders') || '[]')
    list.unshift({ ...o, created_at: new Date().toISOString() })
    localStorage.setItem('subway-studio:orders', JSON.stringify(list.slice(0, 40)))
  } catch { /* ignore */ }
  return { cloud: false }
}

export function subscribeCreations(onInsert: (c: Creation) => void, onUpdate: (c: Creation) => void) {
  if (!supabase) return () => {}
  const channel = supabase
    .channel('subway-creations')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'subway_creations' }, (p) => onInsert(p.new as Creation))
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'subway_creations' }, (p) => onUpdate(p.new as Creation))
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}
