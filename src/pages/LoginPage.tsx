import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store/useAuthStore'

const LoginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
})

type LoginForm = z.infer<typeof LoginSchema>

export default function LoginPage() {
    const navigate = useNavigate()
    const setAuth = useAuthStore((s) => s.setAuth)
    const [serverError, setServerError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginForm>({ resolver: zodResolver(LoginSchema) })

    const onSubmit = async (data: LoginForm) => {
        setServerError(null)
        try {
            const res = await authApi.login(data.email, data.password)
            setAuth(res.token, res.user)
            navigate('/', { replace: true })
        } catch (err) {
            setServerError(err instanceof Error ? err.message : 'Login failed')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-sm">
                {/* Logo / Brand */}
                <div className="text-center mb-8">
                    <div className="text-4xl mb-2">🔥</div>
                    <h1 className="text-2xl font-bold">Ignite</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Track your habits, build your streaks
                    </p>
                </div>

                {/* Card */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-semibold mb-5">Sign in</h2>

                    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium mb-1.5"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                {...register('email')}
                                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40 transition placeholder:text-muted-foreground"
                                placeholder="you@example.com"
                            />
                            {errors.email && (
                                <p className="mt-1 text-xs text-destructive">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium mb-1.5"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                autoComplete="current-password"
                                {...register('password')}
                                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40 transition placeholder:text-muted-foreground"
                                placeholder="••••••••"
                            />
                            {errors.password && (
                                <p className="mt-1 text-xs text-destructive">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {/* Server error */}
                        {serverError && (
                            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2">
                                <p className="text-xs text-destructive">{serverError}</p>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary/90 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Signing in…' : 'Sign in'}
                        </button>
                    </form>
                </div>

                {/* Register link */}
                <p className="text-center text-sm text-muted-foreground mt-5">
                    Don't have an account?{' '}
                    <Link
                        to="/register"
                        className="font-medium text-primary hover:underline"
                    >
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    )
}
