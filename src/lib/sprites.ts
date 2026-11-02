import * as THREE from 'three'
import type { AtlasName, Ingredient } from '../data/catalog'

export interface Sprite {
  key: string
  url: string
  canvas: HTMLCanvasElement
  width: number
  height: number
  aspect: number
}

const ATLASES: Record<AtlasName, { src: string; cols: number; rows: number }> = {
  bread: { src: `${import.meta.env.BASE_URL}assets/bread-atlas.png`, cols: 4, rows: 2 },
  fillings: { src: `${import.meta.env.BASE_URL}assets/fillings-atlas.png`, cols: 4, rows: 3 },
}

const sprites = new Map<string, Sprite>()
const textures = new Map<string, THREE.CanvasTexture>()
let ready: Promise<void> | null = null

export const spriteKey = (ing: Ingredient, lid = false) =>
  `${ing.atlas}:${ing.atlas === 'bread' && lid ? ing.tile + 4 : ing.tile}${ing.tint ? `:${ing.tint}` : ''}`

export function getSprite(key: string) { return sprites.get(key) }
export function getTexture(key: string) {
  let t = textures.get(key)
  if (!t) {
    const s = sprites.get(key)
    if (!s) return undefined
    t = new THREE.CanvasTexture(s.canvas)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    t.needsUpdate = true
    textures.set(key, t)
  }
  return t
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/** Longest run of "solid" indices, tolerating small gaps (crumbs and speckles are ignored). */
function mainRun(solid: boolean[], gap = 4): [number, number] {
  let best: [number, number] = [0, solid.length - 1]
  let bestLen = -1
  let start = -1
  let lastSolid = -1
  for (let i = 0; i <= solid.length; i++) {
    const s = i < solid.length && solid[i]
    if (s) {
      if (start === -1) start = i
      lastSolid = i
    } else if (start !== -1 && (i - lastSolid > gap || i === solid.length)) {
      const len = lastSolid - start
      if (len > bestLen) { bestLen = len; best = [start, lastSolid] }
      start = -1
    }
  }
  return best
}

function tileBounds(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const inset = Math.round(w * 0.02)
  const data = ctx.getImageData(x + inset, y + inset, w - inset * 2, h - inset * 2)
  const W = data.width, H = data.height, px = data.data
  const colCount = new Array<number>(W).fill(0)
  const rowCount = new Array<number>(H).fill(0)
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      if (px[(j * W + i) * 4 + 3] > 110) { colCount[i]++; rowCount[j]++ }
    }
  }
  const [x0, x1] = mainRun(colCount.map((c) => c >= 6))
  const [y0, y1] = mainRun(rowCount.map((c) => c >= 6))
  return { x0: x + inset + x0, x1: x + inset + x1, y0: y + inset + y0, y1: y + inset + y1 }
}

function tint(src: HTMLCanvasElement, hex: string) {
  const out = document.createElement('canvas')
  out.width = src.width; out.height = src.height
  const ctx = out.getContext('2d')!
  ctx.drawImage(src, 0, 0)
  const img = ctx.getImageData(0, 0, out.width, out.height)
  const d = img.data
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16)
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue
    const lum = (d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11) / 255
    const k = 0.45 + lum * 0.95
    d[i] = Math.min(255, r * k)
    d[i + 1] = Math.min(255, g * k)
    d[i + 2] = Math.min(255, b * k)
  }
  ctx.putImageData(img, 0, 0)
  return out
}

function register(key: string, canvas: HTMLCanvasElement) {
  const url = canvas.toDataURL('image/png')
  sprites.set(key, { key, url, canvas, width: canvas.width, height: canvas.height, aspect: canvas.height / canvas.width })
}

export function sliceAtlases(onProgress?: (p: number) => void) {
  if (ready) return ready
  ready = (async () => {
    const names = Object.keys(ATLASES) as AtlasName[]
    const total = names.reduce((n, a) => n + ATLASES[a].cols * ATLASES[a].rows, 0) + 2
    let done = 0
    const tick = () => onProgress?.(Math.min(1, ++done / total))
    for (const name of names) {
      const { src, cols, rows } = ATLASES[name]
      const img = await loadImage(src)
      const full = document.createElement('canvas')
      full.width = img.naturalWidth; full.height = img.naturalHeight
      const ctx = full.getContext('2d', { willReadFrequently: true })!
      ctx.drawImage(img, 0, 0)
      const tw = full.width / cols, th = full.height / rows
      for (let t = 0; t < cols * rows; t++) {
        const col = t % cols, row = Math.floor(t / cols)
        const b = tileBounds(ctx, Math.round(col * tw), Math.round(row * th), Math.round(tw), Math.round(th))
        const pad = Math.round(tw * 0.035)
        const sx = Math.max(0, b.x0 - pad), sy = Math.max(0, b.y0 - pad)
        const sw = Math.min(full.width - sx, b.x1 - b.x0 + pad * 2), sh = Math.min(full.height - sy, b.y1 - b.y0 + pad * 2)
        const c = document.createElement('canvas')
        c.width = sw; c.height = sh
        c.getContext('2d')!.drawImage(full, sx, sy, sw, sh, 0, 0, sw, sh)
        register(`${name}:${t}`, c)
        tick()
        await new Promise((r) => setTimeout(r, 0))
      }
    }
    const sauce = sprites.get('fillings:11')!.canvas
    register('fillings:11:#5a2410', tint(sauce, '#5a2410')); tick()
    register('fillings:11:#d8381f', tint(sauce, '#d8381f')); tick()
  })()
  return ready
}
