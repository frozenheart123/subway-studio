import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { RotateCcw } from 'lucide-react'
import { CalorieMeter } from './components/CalorieMeter'
import { CartDrawer } from './components/CartDrawer'
import { Gallery } from './components/Gallery'
import { Header, Wordmark } from './components/Header'
import { Hero } from './components/Hero'
import { InspirationDialog } from './components/InspirationDialog'
import { PackDialog } from './components/PackDialog'
import { Pantry } from './components/Pantry'
import { Preloader } from './components/Preloader'
import { Receipt } from './components/Receipt'
import { Stage } from './components/Stage'
import { Toast } from './components/Toast'
import { useLang, useT } from './i18n'
import { pop } from './lib/sound'
import { sliceAtlases } from './lib/sprites'
import { fetchIngredients } from './lib/supabase'
import { setPopSound, useBuilder } from './store/useBuilder'
import { useToast } from './store/useToast'
import type { Ingredient } from './data/catalog'

export default function App() {
  const t = useT()
  const lang = useLang((s) => s.lang)
  const [progress, setProgress] = useState(0)
  const [ready, setReady] = useState(false)
  const [packOpen, setPackOpen] = useState(false)
  const [inspoOpen, setInspoOpen] = useState(false)
  const [galleryKey, setGalleryKey] = useState(0)
  const setClosed = useBuilder((s) => s.setClosed)
  const reset = useBuilder((s) => s.reset)
  const applyNutrition = useBuilder((s) => s.applyNutrition)
  const show = useToast((s) => s.show)

  useEffect(() => { document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en' }, [lang])

  useEffect(() => {
    setPopSound(pop)
    const start = performance.now()
    sliceAtlases(setProgress).then(() => {
      const wait = Math.max(0, 1600 - (performance.now() - start))
      setTimeout(() => setReady(true), wait)
    })
    fetchIngredients().then((rows) => {
      if (!rows) return
      const map: Record<string, Partial<Ingredient>> = {}
      for (const r of rows) {
        map[r.id] = { kcal: r.kcal, protein: Number(r.protein), carbs: Number(r.carbs), fat: Number(r.fat), sodium: r.sodium, price: Number(r.price), maxQty: r.max_qty, nameZh: r.name_zh, nameEn: r.name_en }
      }
      applyNutrition(map)
    })
  }, [applyNutrition])

  const openPack = useCallback(() => { setClosed(true); setTimeout(() => setPackOpen(true), 650) }, [setClosed])
  const closePack = useCallback(() => setPackOpen(false), [])
  const closeInspo = useCallback(() => setInspoOpen(false), [])

  return (
    <>
      <AnimatePresence>{!ready && <Preloader key="pre" progress={progress} />}</AnimatePresence>
      {ready && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
          <Header onInspiration={() => setInspoOpen(true)} />
          <main>
            <Hero />
            <section id="builder" className="mx-auto max-w-[1480px] px-5 pt-14 md:px-8">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="eyebrow text-sub-green-2">{t('builder.eyebrow')}</p>
                  <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-on-shell md:text-4xl">{t('builder.title')}</h2>
                </div>
                <button onClick={() => { reset(); show(t('toast.reset')) }} className="flex items-center gap-2 rounded-full border border-on-shell/10 px-4 py-2 text-xs font-bold text-on-shell/70 transition-colors hover:border-on-shell/30 hover:text-on-shell">
                  <RotateCcw className="h-3.5 w-3.5" /> {t('reset')}
                </button>
              </div>
              <div className="grid gap-6 xl:grid-cols-[330px_minmax(0,1fr)_340px]">
                <Pantry onFinish={openPack} />
                <Stage />
                <div className="flex flex-col gap-5">
                  <CalorieMeter />
                  <Receipt onPack={openPack} />
                </div>
              </div>
            </section>
            <Gallery refreshKey={galleryKey} />
          </main>
          <footer className="border-t border-on-shell/5 py-10">
            <div className="mx-auto flex max-w-[1480px] flex-wrap items-center justify-between gap-4 px-5 text-xs text-on-shell/45 md:px-8">
              <span className="flex items-center gap-3"><Wordmark className="text-lg" /> STUDIO <i className="not-italic text-on-shell/25">/</i> MAKE IT YOURS.</span>
              <p>{t('footer.copy')}</p>
              <span className="eyebrow">{t('footer.tag')}</span>
            </div>
          </footer>
          <PackDialog open={packOpen} onClose={closePack} onShared={() => setGalleryKey((k) => k + 1)} />
          <InspirationDialog open={inspoOpen} onClose={closeInspo} />
          <CartDrawer />
          <Toast />
        </motion.div>
      )}
    </>
  )
}
