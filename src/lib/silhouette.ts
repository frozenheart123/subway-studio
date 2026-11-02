import * as THREE from 'three'
import { getSprite } from './sprites'

const cache = new Map<string, THREE.Vector2[]>()

/**
 * Trace the outline of a sprite by casting rays from its centre and keeping the
 * last opaque pixel on each ray. Returns points in normalised image space
 * (0..1, y down), suitable for building a THREE.Shape.
 */
export function traceSilhouette(key: string, rays = 112, threshold = 90): THREE.Vector2[] | null {
  const hit = cache.get(key)
  if (hit) return hit
  const sprite = getSprite(key)
  if (!sprite) return null
  const { canvas, width: w, height: h } = sprite
  const data = canvas.getContext('2d', { willReadFrequently: true })!.getImageData(0, 0, w, h).data
  const cx = w / 2, cy = h / 2
  const maxR = Math.hypot(cx, cy)
  const radii: number[] = []
  for (let i = 0; i < rays; i++) {
    const a = (i / rays) * Math.PI * 2
    const dx = Math.cos(a), dy = Math.sin(a)
    let last = 0
    for (let r = 0; r < maxR; r += 1) {
      const x = Math.round(cx + dx * r), y = Math.round(cy + dy * r)
      if (x < 0 || y < 0 || x >= w || y >= h) break
      if (data[(y * w + x) * 4 + 3] > threshold) last = r
    }
    radii.push(last)
  }
  // light smoothing so the extruded edge is not jagged
  const smooth = radii.map((_, i) => (radii[(i - 1 + rays) % rays] + radii[i] * 2 + radii[(i + 1) % rays]) / 4)
  const pts = smooth.map((r, i) => {
    const a = (i / rays) * Math.PI * 2
    return new THREE.Vector2((cx + Math.cos(a) * r) / w, (cy + Math.sin(a) * r) / h)
  })
  cache.set(key, pts)
  return pts
}

export interface LoafOptions { width: number; depth: number; bodyDepth: number; bevelThickness: number; bevelSize: number; bevelSegments?: number }

/**
 * Build a loaf: the sprite outline extruded with a bevel, so the top cap matches
 * the photo exactly while the sides bulge like crust. Material groups:
 * 0 = top cap (photo), 1 = sides and bevel (crust), 2 = bottom cap (crust).
 */
export function loafGeometry(key: string, o: LoafOptions): THREE.ExtrudeGeometry | null {
  const outline = traceSilhouette(key)
  if (!outline) return null
  const shape = new THREE.Shape(outline.map((p) => new THREE.Vector2((p.x - 0.5) * o.width, (0.5 - p.y) * o.depth)))
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: o.bodyDepth,
    bevelEnabled: true,
    bevelThickness: o.bevelThickness,
    bevelSize: o.bevelSize,
    bevelSegments: o.bevelSegments ?? 5,
    curveSegments: 4,
    steps: 1,
  })
  // top cap gets the photo; bottom cap and walls get crust colour
  const [caps, walls] = geo.groups
  const half = caps.count / 2
  geo.clearGroups()
  geo.addGroup(caps.start, half, 2)
  geo.addGroup(caps.start + half, half, 0)
  geo.addGroup(walls.start, walls.count, 1)
  // planar UVs so the top cap samples the whole sprite canvas
  const pos = geo.attributes.position
  const uv = new Float32Array(pos.count * 2)
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = (pos.getX(i) + o.width / 2) / o.width
    uv[i * 2 + 1] = (pos.getY(i) + o.depth / 2) / o.depth
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
  return geo
}
