import { useHabitStore } from '@/store/useHabitStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useBadges } from '@/hooks/useBadges'
import { calculateStreak } from '@/lib/analytics'
import { useNavigate } from 'react-router-dom'

export default function ProfilePage() {
  const habits = useHabitStore((s) => s.habits)
  const completions = useHabitStore((s) => s.completions)
  const { earned, locked, earnedCount, total } = useBadges()
  const user = useAuthStore((s) => s.user)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const navigate = useNavigate()

  const today = new Date()
  const active = habits.filter((h) => !h.archivedAt)
  const totalStreak = active.reduce((sum, h) => {
    const { current } = calculateStreak(h, completions, today)
    return sum + current
  }, 0)

  const joinDate = user?.createdAt
    ? new Date(user.createdAt)
    : habits.length > 0
      ? new Date(Math.min(...habits.map((h) => new Date(h.createdAt).getTime())))
      : null

  const displayName = user?.name ?? 'Habit Tracker'
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  function handleLogout() {
    clearAuth()
    navigate('/login', { replace: true })
  }

  return (
    <div className="p-4 md:p-5 pb-24">
      {/* Profile card */}
      <div className="rounded-2xl bg-card border border-border shadow-sm p-5 mb-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold">{displayName}</h1>
          {user?.email && (
            <p className="text-xs text-muted-foreground">{user.email}</p>
          )}
          <p className="text-sm text-muted-foreground">
            {joinDate
              ? `Joined ${joinDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
              : 'Newcomer'}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {active.length} active {active.length === 1 ? 'habit' : 'habits'}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="ml-auto shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-destructive hover:border-destructive transition"
        >
          Sign out
        </button>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Active Habits', value: active.length, emoji: '📋' },
          { label: 'Total Done', value: completions.length, emoji: '✅' },
          { label: 'Total Streak', value: totalStreak, emoji: '🔥' },
          { label: 'Badges', value: `${earnedCount}/${total}`, emoji: '🏅' },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-4 bg-card border border-border shadow-sm text-center"
          >
            <div className="text-2xl mb-1">{s.emoji}</div>
            <div className="text-xl font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Badges */}
      <h2 className="text-sm font-semibold mb-4">Achievements</h2>

      {earned.length > 0 && (
        <div className="mb-6">
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">
            Earned ({earnedCount})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {earned.map((badge) => (
              <div
                key={badge.id}
                className="rounded-xl p-3 bg-card border border-border shadow-sm text-center"
              >
                <div className="text-3xl mb-1">{badge.emoji}</div>
                <p className="text-xs font-medium">{badge.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {badge.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {locked.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">
            Locked ({total - earnedCount})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {locked.map((badge) => (
              <div
                key={badge.id}
                className="rounded-xl p-3 bg-muted/50 border border-border/50 text-center opacity-50"
              >
                <div className="text-3xl mb-1 grayscale">{badge.emoji}</div>
                <p className="text-xs font-medium text-muted-foreground">
                  {badge.name}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {badge.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
