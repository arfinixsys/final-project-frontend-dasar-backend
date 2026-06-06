import type { MomentumStatus } from '@/types/momentum.type'
import * as LucideIcons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const MOMENTUM_META: Record<
  MomentumStatus,
  { label: string; arrow: LucideIcon; className: string }
> = {
  rising: {
    label: 'Rising',
    arrow: LucideIcons['LucideArrowUp'],
    className: 'bg-green-100 text-green-700',
  },
  falling: {
    label: 'Falling',
    arrow: LucideIcons['LucideArrowDown'],
    className: 'bg-red-100 text-red-700',
  },
  steady: {
    label: 'Steady',
    arrow: LucideIcons['LucideArrowRight'],
    className: 'bg-muted text-muted-foreground',
  },
}
