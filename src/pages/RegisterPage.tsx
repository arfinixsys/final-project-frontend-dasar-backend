import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store/useAuthStore'

const RegisterSchema = z
    .object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email('Invalid email address'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        confirmPassword: z.string().min(1, 'Please confirm your password'),
    })
    .refine((d) => d.password === d.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    })

type RegisterForm = z.infer<typeof RegisterSchema>

export default function RegisterPage() {
    const navigate = useNavigate()
    const setAuth = useAuthStore((s) => s.setAuth)
    const [serverError, setServerError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterForm>({ resolver: zodResolver(RegisterSchema) })

    const onSubmit = async (data: RegisterForm) => {
        setServerError(null)
        try {
            const res = await authApi.register(data.name, data.email, data.password)
            setAuth(res.token, res.user)
            navigate('/', { replace: true })
        } catch (err) {
            setServerError(
                err instanceof Error ? err.message : 'Registration failed'
            )
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
                        Start building better habits today
                    </p>
                </div>

                {/* Card */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-semibold mb-5">Create an account</h2>

                    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                        {/* Name */}
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium mb-1.5"
                            >
                                Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                autoComplete="name"
                                {...register('name')}
                                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40 transition placeholder:text-muted-foreground"
                                placeholder="Your name"
                            />
                            {errors.name && (
                                <p className="mt-1 text-xs text-destructive">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

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
                                autoComplete="new-password"
                                {...register('password')}
                                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40 transition placeholder:text-muted-foreground"
                                placeholder="Min. 6 characters"
                            />
                            {errors.password && (
                                <p className="mt-1 text-xs text-destructive">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-medium mb-1.5"
                            >
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                {...register('confirmPassword')}
                                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40 transition placeholder:text-muted-foreground"
                                placeholder="••••••••"
                            />
                            {errors.confirmPassword && (
                                <p className="mt-1 text-xs text-destructive">
                                    {errors.confirmPassword.message}
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
                            {isSubmitting ? 'Creating account…' : 'Create account'}
                        </button>
                    </form>
                </div>

                {/* Login link */}
                <p className="text-center text-sm text-muted-foreground mt-5">
                    Already have an account?{' '}
                    <Link
                        to="/login"
                        className="font-medium text-primary hover:underline"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}
