import { Suspense, useLayoutEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { byId, type Ingredient } from '../data/catalog'
import { expandLayers } from '../lib/layers'
import { loafGeometry } from '../lib/silhouette'
import { getSprite, getTexture, spriteKey } from '../lib/sprites'
import { useBuilder } from '../store/useBuilder'

const BREAD_W = 6
const FILL_W = 5.25
const BASE = { bodyDepth: 0.3, bevelThickness: 0.14, bevelSize: 0.16 }
const LID = { bodyDepth: 0.22, bevelThickness: 0.34, bevelSize: 0.26, bevelSegments: 7 }
const baseHeight = BASE.bodyDepth + BASE.bevelThickness * 2

interface Target { x: number; y: number; z: number; ry?: number }

/** Eases a group toward its target; new layers drop in from above. */
function Dropper({ target, children, from = 2.4 }: { target: Target; children: React.ReactNode; from?: number }) {
  const ref = useRef<THREE.Group>(null)
  const init = useRef(false)
  useLayoutEffect(() => {
    if (ref.current && !init.current) {
      ref.current.position.set(target.x, target.y + from, target.z)
      ref.current.rotation.y = target.ry ?? 0
      ref.current.scale.setScalar(1.08)
      init.current = true
    }
  }, [target, from])
  useFrame((_, dt) => {
    const g = ref.current
    if (!g) return
    const k = 7
    g.position.x = THREE.MathUtils.damp(g.position.x, target.x, k, dt)
    g.position.y = THREE.MathUtils.damp(g.position.y, target.y, k, dt)
    g.position.z = THREE.MathUtils.damp(g.position.z, target.z, k, dt)
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, target.ry ?? 0, k, dt)
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, 1, k, dt))
  })
  return <group ref={ref}>{children}</group>
}

function tone(hex: string, k: number) {
  return new THREE.Color(hex).multiplyScalar(k).getStyle()
}

/** Bread half: the sprite outline extruded with a bevel, photo on the cap, crust on the sides. */
function Loaf({ bread, lid, toasted }: { bread: Ingredient; lid: boolean; toasted: boolean }) {
  const key = spriteKey(bread, lid)
  const sprite = getSprite(key)
  const tex = getTexture(key)
  const depth = BREAD_W * (sprite?.aspect ?? 0.45)
  const geo = useMemo(() => loafGeometry(key, { width: BREAD_W, depth, ...(lid ? LID : BASE) }), [key, depth, lid])
  const crust = bread.crust ?? bread.color
  if (!geo || !tex) return null
  const k = toasted ? 0.72 : 1
  return (
    <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]} position={[0, lid ? LID.bevelThickness : BASE.bevelThickness, 0]} castShadow receiveShadow>
      <meshStandardMaterial attach="material-0" map={tex} color={toasted ? '#cfa36f' : '#ffffff'} roughness={0.9} />
      <meshStandardMaterial attach="material-1" color={tone(crust, k)} roughness={0.95} />
      <meshStandardMaterial attach="material-2" color={tone(crust, 0.8 * k)} roughness={1} />
    </mesh>
  )
}

/** A filling: textured sheet with a few stacked copies for thickness. */
function Filling({ ing, t }: { ing: Ingredient; t: number }) {
  const key = spriteKey(ing)
  const tex = getTexture(key)
  const sprite = getSprite(key)
  if (!tex || !sprite) return null
  const h = FILL_W * sprite.aspect
  const sheets = [1, 0.86, 0.72]
  return (
    <group>
      {sheets.map((k, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, -i * (t / sheets.length), 0]} castShadow={i === 0} receiveShadow={i === 0}>
          <planeGeometry args={[FILL_W, h]} />
          <meshStandardMaterial map={tex} transparent alphaTest={0.15} roughness={0.9} color={new THREE.Color(k, k, k)} side={THREE.DoubleSide} depthWrite />
        </mesh>
      ))}
    </group>
  )
}

function Sandwich() {
  const bread = useBuilder((s) => s.bread)
  const lines = useBuilder((s) => s.lines)
  const size = useBuilder((s) => s.size)
  const toasted = useBuilder((s) => s.toasted)
  const closed = useBuilder((s) => s.closed)
  const b = byId(bread)!
  const layers = useMemo(() => expandLayers(lines), [lines])
  const sx = size === 12 ? 1.3 : 1
  const depth = BREAD_W * (getSprite(spriteKey(b))?.aspect ?? 0.45)

  let y = baseHeight - 0.04
  const placed = layers.map((l) => {
    const t = l.ing.thickness
    const cy = y + t
    y += t * 0.92
    // deterministic little offsets so stacks look hand-made
    const seed = (l.index * 7919 + l.copy * 104729) % 97
    const jx = ((seed % 7) - 3) * 0.035
    const jz = (((seed * 3) % 7) - 3) * 0.03
    const ry = (((seed * 5) % 9) - 4) * 0.012
    return { ...l, cy, t, jx, jz, ry }
  })
  const lidTarget: Target = closed
    ? { x: 0, y: y + 0.02, z: 0, ry: 0 }
    : { x: 0, y: 0, z: -depth * 1.35, ry: 0.12 }

  return (
    <group scale={[sx, 1, 1]}>
      <Dropper target={{ x: 0, y: 0, z: 0 }} from={1.4}>
        <Loaf bread={b} lid={false} toasted={toasted} />
      </Dropper>
      {placed.map((l) => (
        <Dropper key={l.key} target={{ x: l.jx, y: l.cy, z: l.jz, ry: l.ry }}>
          <Filling ing={l.ing} t={l.t} />
        </Dropper>
      ))}
      <Dropper target={lidTarget} from={2.4}>
        <Loaf bread={b} lid toasted={toasted} />
      </Dropper>
    </group>
  )
}

function Turntable({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (ref.current) ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.9) * 0.05
  })
  return <group ref={ref}>{children}</group>
}

export function Stage3D() {
  return (
    <div className="absolute inset-0">
      <Canvas shadows dpr={[1, 1.8]} camera={{ position: [0.6, 5.4, 8.6], fov: 30 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.5} />
        <hemisphereLight args={['#fff4dc', '#0e1f16', 0.6]} />
        <directionalLight position={[5, 9, 6]} intensity={2.3} color="#fff2d8" castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0003}>
          <orthographicCamera attach="shadow-camera" args={[-8, 8, 8, -8, 0.5, 30]} />
        </directionalLight>
        <directionalLight position={[-7, 4, -5]} intensity={0.9} color="#a6ecc4" />
        <spotLight position={[0, 10, 1]} angle={0.55} penumbra={1} intensity={60} color="#ffd56a" />
        <Suspense fallback={null}>
          <Turntable>
            <Sandwich />
          </Turntable>
        </Suspense>
        <ContactShadows position={[0, -0.04, 0]} opacity={0.75} scale={16} blur={2.2} far={5} resolution={1024} color="#02130a" />
        <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.7} minPolarAngle={0.4} maxPolarAngle={1.3} target={[0, 0.8, 0]} />
      </Canvas>
    </div>
  )
}
