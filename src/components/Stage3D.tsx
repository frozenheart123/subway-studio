import { Suspense, useLayoutEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Float, OrbitControls, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { byId } from '../data/catalog'
import { expandLayers } from '../lib/layers'
import { getSprite, getTexture, spriteKey } from '../lib/sprites'
import { useBuilder } from '../store/useBuilder'

const BREAD_W = 6
const FILL_W = 5.3

interface Target { x: number; y: number; z: number; rx?: number }

function Dropper({ target, children, from = 2.6 }: { target: Target; children: React.ReactNode; from?: number }) {
  const ref = useRef<THREE.Group>(null)
  const init = useRef(false)
  useLayoutEffect(() => {
    if (ref.current && !init.current) {
      ref.current.position.set(target.x, target.y + from, target.z)
      ref.current.scale.setScalar(1.12)
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
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, target.rx ?? 0, k, dt)
    const s = THREE.MathUtils.damp(g.scale.x, 1, k, dt)
    g.scale.setScalar(s)
  })
  return <group ref={ref}>{children}</group>
}

function TexturedPlane({ texKey, width, tint, y = 0, opacity = 1 }: { texKey: string; width: number; tint?: string; y?: number; opacity?: number }) {
  const tex = getTexture(texKey)
  const sprite = getSprite(texKey)
  if (!tex || !sprite) return null
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} castShadow receiveShadow>
      <planeGeometry args={[width, width * sprite.aspect]} />
      <meshStandardMaterial map={tex} transparent alphaTest={0.12} roughness={0.9} metalness={0} color={tint ?? '#ffffff'} opacity={opacity} side={THREE.DoubleSide} />
    </mesh>
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
  const baseSprite = getSprite(spriteKey(b))
  const depth = BREAD_W * (baseSprite?.aspect ?? 0.45)
  const bh = b.thickness
  const tint = toasted ? '#d9b07a' : undefined
  const crust = toasted ? new THREE.Color(b.crust ?? b.color).multiplyScalar(0.78).getStyle() : (b.crust ?? b.color)

  let y = bh
  const placed = layers.map((l) => {
    const t = l.ing.thickness
    const cy = y + t * 0.5
    y += t
    return { ...l, cy, t }
  })
  const lidH = 0.9
  const lidTarget: Target = closed
    ? { x: 0, y: y + lidH / 2 + 0.02, z: 0, rx: 0 }
    : { x: 0, y: lidH / 2, z: -depth * 1.25, rx: 0 }

  return (
    <group scale={[sx, 1, 1]}>
      <Dropper target={{ x: 0, y: bh / 2, z: 0 }} from={1.5}>
        <RoundedBox args={[BREAD_W, bh, depth]} radius={Math.min(0.28, bh / 2 - 0.02)} smoothness={6} castShadow receiveShadow>
          <meshStandardMaterial color={crust} roughness={0.95} />
        </RoundedBox>
        <TexturedPlane texKey={spriteKey(b)} width={BREAD_W} tint={tint} y={bh / 2 + 0.006} />
      </Dropper>
      {placed.map((l) => (
        <Dropper key={l.key} target={{ x: (l.copy % 2 ? -1 : 1) * l.copy * 0.12, y: l.cy, z: l.copy * 0.08 }}>
          <group rotation={[0, l.copy * 0.05, 0]}>
            <TexturedPlane texKey={spriteKey(l.ing)} width={FILL_W} />
            <TexturedPlane texKey={spriteKey(l.ing)} width={FILL_W * 0.985} tint="#9a9a9a" y={-l.t * 0.42} />
          </group>
        </Dropper>
      ))}
      <Dropper target={lidTarget} from={2.2}>
        <RoundedBox args={[BREAD_W, lidH, depth]} radius={0.36} smoothness={6} castShadow receiveShadow>
          <meshStandardMaterial color={crust} roughness={0.95} />
        </RoundedBox>
        <TexturedPlane texKey={spriteKey(b, true)} width={BREAD_W} tint={tint} y={lidH / 2 + 0.006} />
      </Dropper>
    </group>
  )
}

export function Stage3D() {
  return (
    <div className="absolute inset-0">
      <Canvas shadows dpr={[1, 1.8]} camera={{ position: [0.4, 6.2, 8.2], fov: 30 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.55} />
        <directionalLight position={[5, 9, 6]} intensity={2.4} color="#fff2d8" castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0002}>
          <orthographicCamera attach="shadow-camera" args={[-8, 8, 8, -8, 0.5, 30]} />
        </directionalLight>
        <directionalLight position={[-7, 4, -5]} intensity={0.9} color="#a6ecc4" />
        <spotLight position={[0, 10, 1]} angle={0.55} penumbra={1} intensity={60} color="#ffd56a" />
        <Suspense fallback={null}>
          <Float speed={1.3} rotationIntensity={0.08} floatIntensity={0.35}>
            <Sandwich />
          </Float>
        </Suspense>
        <ContactShadows position={[0, -0.05, 0]} opacity={0.7} scale={16} blur={2.4} far={5} resolution={1024} color="#02130a" />
        <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.8} minPolarAngle={0.45} maxPolarAngle={1.3} target={[0, 0.7, 0]} />
      </Canvas>
    </div>
  )
}
