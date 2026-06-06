import type { BreakRisk } from '@/types/breakRisk.type.ts'

export const RISK_META: Record<
  BreakRisk,
  { label: string; className: string }
> = {
  none: { label: 'None', className: 'bg-muted text-muted-foreground' },
  low: { label: 'Low', className: 'bg-green-100 text-green-700' },
  medium: { label: 'Medium', className: 'bg-yellow-100 text-yellow-700' },
  high: { label: 'High', className: 'bg-red-100 text-red-700' },
}
