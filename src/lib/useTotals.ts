import { useMemo } from 'react'
import { useBuilder } from '../store/useBuilder'
import { computeTotals } from './nutrition'

export function useTotals() {
  const bread = useBuilder((s) => s.bread)
  const lines = useBuilder((s) => s.lines)
  const size = useBuilder((s) => s.size)
  const lookup = useBuilder((s) => s.lookup)
  const nutrition = useBuilder((s) => s.nutrition)
  // nutrition is read so DB overrides re-run the memo
  return useMemo(() => computeTotals(bread, lines, size, lookup), [bread, lines, size, lookup, nutrition])
}
