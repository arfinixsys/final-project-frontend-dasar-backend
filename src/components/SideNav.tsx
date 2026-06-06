import { NavLink } from 'react-router-dom'
import { Sun, ListChecks, BarChart2, User } from 'lucide-react'

const tabs = [
  { to: '/', icon: Sun, label: 'Today', end: true },
  { to: '/habits', icon: ListChecks, label: 'Habits', end: false },
  { to: '/stats', icon: BarChart2, label: 'Stats', end: false },
  { to: '/profile', icon: User, label: 'Profile', end: false },
]

export default function SideNav() {
  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-border min-h-screen sticky top-0 p-4 gap-1">
      <p className="text-2xl font-bold px-3 py-2 mb-2">IGNITE</p>
      {tabs.map(({ to, icon: Icon, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`
          }
        >
          <Icon size={18} strokeWidth={1.5} />
          {label}
        </NavLink>
      ))}
    </aside>
  )
}
