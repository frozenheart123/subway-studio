import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useToast } from '../store/useToast'

export function Toast() {
  const { message, key } = useToast()
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (!key) return
    setVisible(true)
    const t = setTimeout(() => setVisible(false), 2600)
    return () => clearTimeout(t)
  }, [key])
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[70] flex justify-center px-4">
      <AnimatePresence>
        {visible && (
          <motion.div
            key={key}
            role="status"
            initial={{ y: 30, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.35, duration: 0.5 }}
            className="paper rounded-full px-5 py-3 text-sm font-semibold shadow-lift"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
