import { Cloud, CloudOff, Lightbulb, Moon, ShoppingBag, Sun, Volume2, VolumeX } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useLang, useT } from '../i18n'
import { useCloud } from '../lib/supabase'
import { useBuilder } from '../store/useBuilder'
import { useCart } from '../store/useCart'
import { useTheme } from '../theme'

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`display inline-flex items-center text-[26px] font-extrabold leading-none tracking-tight ${className}`}>
      <span className="text-sub-green">SUB</span>
      <span className="text-sub-yellow">WAY</span>
      <svg viewBox="0 0 20 20" className="ml-1 h-5 w-5 fill-sub-yellow" aria-hidden="true"><path d="M2 9h12L9 4l3-3 8 9-8 9-3-3 5-5H2z" /></svg>
    </span>
  )
}

const iconBtn = 'flex h-10 w-10 items-center justify-center rounded-full border border-on-shell/10 text-on-shell/70 transition-colors hover:border-on-shell/30 hover:text-on-shell'

export function Header({ onInspiration }: { onInspiration: () => void }) {
  const t = useT()
  const status = useCloud((s) => s.status)
  const sound = useBuilder((s) => s.sound)
  const toggleSound = useBuilder((s) => s.toggleSound)
  const theme = useTheme((s) => s.theme)
  const toggleTheme = useTheme((s) => s.toggle)
  const toggleLang = useLang((s) => s.toggle)
  const count = useCart((s) => s.items.reduce((n, i) => n + i.qty, 0))
  const setPanel = useCart((s) => s.setPanel)

  return (
    <header className="sticky top-0 z-40 border-b border-on-shell/5 bg-shell/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1480px] items-center gap-4 px-5 py-3.5 md:px-8">
        <a href="#top" className="flex items-center gap-4" aria-label="Subway Studio">
          <Wordmark />
          <span className="hidden flex-col leading-tight xl:flex">
            <span className="eyebrow text-on-shell/80">{t('studio.tag')}</span>
            <span className="text-[11px] text-on-shell/45">{t('studio.sub')}</span>
          </span>
        </a>
        <nav className="ml-auto hidden items-center gap-1 whitespace-nowrap text-sm lg:flex" aria-label="main">
          <a href="#builder" className="rounded-full px-4 py-2 text-on-shell/80 transition-colors hover:bg-on-shell/5 hover:text-on-shell">{t('nav.build')}</a>
          <button onClick={onInspiration} className="flex items-center gap-1.5 rounded-full px-4 py-2 text-on-shell/80 transition-colors hover:bg-on-shell/5 hover:text-on-shell">
            <Lightbulb className="h-4 w-4 text-sub-yellow" /> {t('nav.inspo')}
          </button>
          <a href="#gallery" className="rounded-full px-4 py-2 text-on-shell/80 transition-colors hover:bg-on-shell/5 hover:text-on-shell">{t('nav.gallery')}</a>
        </nav>
        <div className="ml-auto flex items-center gap-2 whitespace-nowrap lg:ml-0">
          <span
            className={`hidden items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold tracking-wide xl:flex ${status === 'online' ? 'border-sub-green-2/40 bg-sub-green/15 text-sub-green-2' : status === 'checking' ? 'border-on-shell/10 text-on-shell/50' : 'border-sub-yellow/40 bg-sub-yellow/10 text-mustard'}`}
            title={status === 'online' ? t('cloud.online.tip') : t('cloud.offline.tip')}
          >
            {status === 'offline' ? <CloudOff className="h-3.5 w-3.5" /> : <Cloud className="h-3.5 w-3.5" />}
            {status === 'online' ? t('cloud.online') : status === 'checking' ? t('cloud.checking') : t('cloud.offline')}
          </span>
          <button onClick={toggleLang} className="display h-10 rounded-full border border-on-shell/10 px-3 text-xs font-bold text-on-shell/80 transition-colors hover:border-on-shell/30 hover:text-on-shell" aria-label="language">
            {t('lang.switch')}
          </button>
          <button onClick={toggleTheme} aria-label={theme === 'dark' ? t('theme.toLight') : t('theme.toDark')} className={iconBtn}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.25 }} className="flex">
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </motion.span>
            </AnimatePresence>
          </button>
          <button onClick={toggleSound} aria-pressed={sound} aria-label={sound ? t('sound.on') : t('sound.off')} className={`${iconBtn} hidden sm:flex`}>
            {sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          <button onClick={() => setPanel('cart')} aria-label={t('nav.cart')} className="relative flex h-10 items-center gap-2 rounded-full bg-sub-yellow pl-3 pr-4 text-xs font-extrabold text-ink transition-colors hover:bg-sub-yellow-2">
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">{t('nav.cart')}</span>
            <AnimatePresence>
              {count > 0 && (
                <motion.span key="badge" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: 'spring', bounce: 0.6 }} className="display absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-tomato px-1 text-[11px] font-extrabold text-white">
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </header>
  )
}
