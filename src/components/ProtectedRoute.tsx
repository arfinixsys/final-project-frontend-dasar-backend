import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'

/**
 * Wraps routes that require authentication.
 * Redirects to /login if user is not authenticated.
 */
export default function ProtectedRoute() {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return <Outlet />
}
