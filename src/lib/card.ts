import { byId } from '../data/catalog'
import { expandLayers } from './layers'
import { getSprite, spriteKey } from './sprites'
import type { Line, Totals } from './nutrition'
import { kcalTone } from './nutrition'

interface CardInput { name: string; author: string; bread: string; lines: Line[]; size: 6 | 12; toasted: boolean; totals: Totals }

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export async function renderCard(input: CardInput): Promise<Blob> {
  await document.fonts.ready.catch(() => undefined)
  const W = 900, H = 1240
  const c = document.createElement('canvas')
  c.width = W; c.height = H
  const ctx = c.getContext('2d')!
  const display = '"Bricolage Grotesque", "Noto Sans SC", sans-serif'
  const body = '"Instrument Sans", "Noto Sans SC", sans-serif'

  ctx.fillStyle = '#0b1510'
  ctx.fillRect(0, 0, W, H)
  const g = ctx.createRadialGradient(W / 2, 420, 40, W / 2, 420, 520)
  g.addColorStop(0, 'rgba(255,198,0,.22)'); g.addColorStop(1, 'rgba(0,155,72,0)')
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)

  ctx.font = `800 34px ${display}`
  ctx.fillStyle = '#009b48'; ctx.fillText('SUB', 60, 84)
  ctx.fillStyle = '#ffc600'; ctx.fillText('WAY', 60 + ctx.measureText('SUB').width, 84)
  ctx.font = `700 13px ${display}`; ctx.fillStyle = 'rgba(247,241,228,.55)'
  ctx.fillText('THE SANDWICH STUDIO  ·  MADE BY YOU', 60, 112)

  ctx.font = `800 64px ${display}`; ctx.fillStyle = '#f7f1e4'
  ctx.fillText(input.name, 60, 200)
  ctx.font = `500 20px ${body}`; ctx.fillStyle = 'rgba(247,241,228,.6)'
  ctx.fillText(`by ${input.author}`, 62, 236)

  const b = byId(input.bread)!
  const base = getSprite(spriteKey(b)), lid = getSprite(spriteKey(b, true))
  const layers = expandLayers(input.lines)
  const cx = W / 2, cy = 560
  const bw = (input.size === 12 ? 760 : 640)
  const draw = (s: ReturnType<typeof getSprite>, w: number, dy: number, dx = 0, sepia = false) => {
    if (!s) return
    const h = w * s.aspect
    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 12
    if (sepia) ctx.filter = 'sepia(.32) saturate(1.25) contrast(1.06) brightness(.94)'
    ctx.drawImage(s.canvas, cx - w / 2 + dx, cy - h / 2 + dy, w, h)
    ctx.restore()
  }
  draw(base, bw, 0, 0, input.toasted)
  layers.forEach((l) => draw(getSprite(spriteKey(l.ing)), bw * 0.9, -(l.index + 1) * 9, (l.copy % 2 ? -1 : 1) * l.copy * 10))
  draw(lid, bw, -(layers.length + 1) * 9 - 20, 0, input.toasted)

  const t = input.totals
  const tone = kcalTone(t.kcal)
  roundRect(ctx, 60, 820, W - 120, 340, 28); ctx.fillStyle = '#f7f1e4'; ctx.fill()
  ctx.font = `700 12px ${display}`; ctx.fillStyle = 'rgba(26,36,25,.5)'
  ctx.fillText('CALORIES · 实时卡路里', 96, 862)
  ctx.font = `800 76px ${display}`; ctx.fillStyle = '#1a2419'
  ctx.fillText(t.kcal.toLocaleString(), 96, 940)
  ctx.font = `700 22px ${body}`; ctx.fillStyle = tone.color === '#ffc600' ? '#b78600' : tone.color
  ctx.fillText(`${tone.label} · ${tone.en}`, 96, 974)
  ctx.font = `500 16px ${body}`; ctx.fillStyle = 'rgba(26,36,25,.6)'
  ctx.fillText(`蛋白质 ${t.protein} g   碳水 ${t.carbs} g   脂肪 ${t.fat} g   ·   ¥${t.price}`, 96, 1004)

  const names = [`${b.nameZh}${input.toasted ? '(烤)' : ''}`, ...input.lines.map((l) => `${byId(l.id)?.nameZh}${l.qty > 1 ? `×${l.qty}` : ''}`)]
  ctx.font = `500 15px ${body}`; ctx.fillStyle = 'rgba(26,36,25,.75)'
  const text = names.join('  /  ')
  const lines: string[] = []
  let cur = ''
  for (const part of text.split('  /  ')) {
    const next = cur ? `${cur}  /  ${part}` : part
    if (ctx.measureText(next).width > W - 192) { lines.push(cur); cur = part } else cur = next
  }
  if (cur) lines.push(cur)
  lines.slice(0, 3).forEach((ln, i) => ctx.fillText(ln, 96, 1050 + i * 24))

  ctx.font = `700 12px ${display}`; ctx.fillStyle = 'rgba(247,241,228,.4)'
  ctx.fillText('SUBWAY STUDIO  ·  FRESHLY MADE. UNIQUELY YOU.  ·  示例价格，非实际下单', 60, H - 44)

  return new Promise((resolve) => c.toBlob((blob) => resolve(blob!), 'image/png'))
}

export function downloadBlob(blob: Blob, filename: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 2000)
}
