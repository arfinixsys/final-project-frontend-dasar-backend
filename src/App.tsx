import { Routes, Route } from 'react-router-dom'
import BottomNav from '@/components/BottomNav'
import SideNav from '@/components/SideNav'
import TodayPage from '@/pages/TodayPage'
import HabitsPage from '@/pages/HabitsPage'
import StatsPage from '@/pages/StatsPage'
import HabitDetailPage from '@/pages/HabitDetailPage'
import ProfilePage from '@/pages/ProfilePage'
import { useReminder } from '@/hooks/useReminder'

export default function App() {
  useReminder()
  return (
    <div className="min-h-screen flex">
      <SideNav />
      <main className="flex-1 min-h-screen pb-20 md:pb-0 overflow-y-auto">
        <div className="max-w-5xl mx-auto my-4 md:px-8 w-full">
          <Routes>
            <Route path="/" element={<TodayPage />} />
            <Route path="/habits" element={<HabitsPage />} />
            <Route path="/habits/:id" element={<HabitDetailPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
