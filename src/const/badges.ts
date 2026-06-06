export interface Badge {
  id: string
  name: string
  emoji: string
  description: string
  check: (ctx: BadgeContext) => boolean
}

export interface BadgeContext {
  activeCount: number
  totalCompletions: number
  maxStreak: number
  maxLongestStreak: number
  categories: Set<string>
  maxConsistency: number
  hasRising: boolean
  allDoneToday: boolean
}

export const BADGES: Badge[] = [
  {
    id: 'first-step',
    name: 'First Step',
    emoji: '👶',
    description: 'Complete your first habit',
    check: (ctx) => ctx.totalCompletions > 0,
  },
  {
    id: 'streak-starter',
    name: 'Streak Starter',
    emoji: '🔥',
    description: 'Reach a 3-day streak',
    check: (ctx) => ctx.maxStreak >= 3,
  },
  {
    id: 'week-warrior',
    name: 'Week Warrior',
    emoji: '⚡',
    description: 'Reach a 7-day streak',
    check: (ctx) => ctx.maxStreak >= 7,
  },
  {
    id: 'centurion',
    name: 'Centurion',
    emoji: '💯',
    description: 'Reach a 30-day streak',
    check: (ctx) => ctx.maxStreak >= 30,
  },
  {
    id: 'all-rounder',
    name: 'All-Rounder',
    emoji: '🌟',
    description: 'Have habits in all categories',
    check: (ctx) => ctx.categories.size >= 4,
  },
  {
    id: 'consistent',
    name: 'Consistent',
    emoji: '📈',
    description: 'Any habit with 80%+ consistency',
    check: (ctx) => ctx.maxConsistency >= 80,
  },
  {
    id: 'rising-star',
    name: 'Rising Star',
    emoji: '🚀',
    description: 'Any habit with rising momentum',
    check: (ctx) => ctx.hasRising,
  },
  {
    id: 'habit-master',
    name: 'Habit Master',
    emoji: '👑',
    description: 'Maintain 5+ active habits',
    check: (ctx) => ctx.activeCount >= 5,
  },
  {
    id: 'perfect-day',
    name: 'Perfect Day',
    emoji: '✨',
    description: 'Complete all due habits today',
    check: (ctx) => ctx.allDoneToday,
  },
]
