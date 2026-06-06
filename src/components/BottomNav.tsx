import { NavLink } from 'react-router-dom'
import { Sun, ListChecks, BarChart2, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { to: '/', icon: Sun, label: 'Today', end: true },
  { to: '/habits', icon: ListChecks, label: 'Habits', end: false },
  { to: '/stats', icon: BarChart2, label: 'Stats', end: false },
  { to: '/profile', icon: User, label: 'Profile', end: false },
]

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border flex items-center z-20">
      {tabs.map(({ to, icon: Icon, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              'flex-1 flex flex-col items-center gap-1 text-[11px] font-medium transition-colors',
              isActive ? 'text-accent-foreground' : 'text-muted-foreground'
            )
          }
        >
          <Icon size={18} strokeWidth={1.5} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
