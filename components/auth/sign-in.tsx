"use client"
import React, { useState } from 'react'
import CardWrapper from '../card-wrapper'
import FormError from '../form-error'
import { SignInButton } from './social-button'
import { useAuthState } from '@/lib/use-AuthState'

import LoginSchema from '@/lib/helpers/zod/login-schema'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { signIn } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import FormSuccess from '../form-success'
import Link from 'next/link'
import { LogoIcons } from '../icons'
import { EyeIcon, EyeOffIcon, Mail } from 'lucide-react'
import { Lock } from 'lucide-react'
import { useAuthModal } from "@/components/AuthModalProvider"

interface SignInProps {
  onSwitchToSignUp?: () => void;
  onSuccess?: () => void;
}

const SignIn: React.FC<SignInProps> = ({ onSwitchToSignUp, onSuccess }) => {
    const router = useRouter()
    const { error, success, loading, setSuccess, setError, setLoading, resetState } = useAuthState();
    const [googleLoading, setGoogleLoading] = React.useState(false)
    const [githubLoading, setGithubLoading] = React.useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const { switchToSignUp, close: closeAuthModal } = useAuthModal();

    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: '',
            password: '',
        }
    })

    const handleSuccess = () => {
        setSuccess("Logged in successfully");
        closeAuthModal();
        onSuccess?.();
    };

    const handleSwitchToSignUp = () => {
        if (onSwitchToSignUp) {
            onSwitchToSignUp();
        } else {
            switchToSignUp();
        }
    };

    const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
        try {
          resetState()
          setLoading(true)
          
          const result = await signIn.email({
            email: values.email,
            password: values.password,
          }, {
            onRequest: () => {
              console.log("Login request started");
            },
            onResponse: () => {
              console.log("Login response received");
            },
            onSuccess: () => {
              console.log("Login successful");
              setLoading(false);
              handleSuccess();
            },
            onError: (ctx) => {
              console.error("Login error:", ctx.error);
              setLoading(false);
              
              if (ctx.error.status === 403) {
                setError("Please verify your email address before logging in");
              } else if (ctx.error.status === 401) {
                setError("Invalid email or password");
              } else {
                setError(ctx.error.message || "Login failed. Please try again.");
              }
            }
          });
          
          if (!result.data && !error) {
            setLoading(false);
            setError("Login failed. Please check your credentials.");
          }
        } catch (error: any) {
          console.error("Unexpected login error:", error);
          setLoading(false);
          setError(error?.message || "Something went wrong during login");
        }
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    return (
        <>
            <div className="sticky top-0 z-20 bg-white dark:bg-[#18181b] rounded-b-xl shadow-md flex items-center justify-center py-3 mb-2">
                <LogoIcons.Logo className="h-8 w-auto" />
            </div>
            <div className="w-full max-w-sm mx-auto bg-white dark:bg-[#18181b] rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 dark:border-gray-800 mt-1 mb-4 transition-all duration-300">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-center">Sign In</h2>
                <p className="text-base sm:text-lg text-center mb-6 text-gray-500 dark:text-gray-400">Enter your email below to login to your account</p>
                <Form {...form}>
                    <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="space-y-5">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel className="text-sm font-semibold text-foreground flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-muted-foreground" />
                                            Email Address
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative group">
                                                <Input
                                                    className="block w-full h-11 px-4 mb-3 text-base bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
                                                    disabled={loading}
                                                    type="email"
                                                    placeholder="Enter your email address"
                                                    {...field}
                                                />
                                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-primary/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none" />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel className="text-sm font-semibold text-foreground flex items-center gap-2">
                                            <Lock className="w-4 h-4 text-muted-foreground" />
                                            Password
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative group">
                                                <Input
                                                    className="block w-full h-12 px-4 pr-12 mb-4 text-base bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                                    disabled={loading}
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Enter your password"
                                                    {...field}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={togglePasswordVisibility}
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-muted/50 rounded-r-xl transition-all duration-200 group"
                                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                                >
                                                    {showPassword ? (
                                                        <EyeOffIcon className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                                                    ) : (
                                                        <EyeIcon className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                                                    )}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-3">
                            <FormError message={error} />
                            <FormSuccess message={success} />
                        </div>

                        <div className="flex justify-end">
                            <Link
                                href="/forgot-password"
                                className="text-sm text-primary hover:text-primary/80 font-medium hover:underline transition-colors duration-200"
                            >
                                Forgot your password?
                            </Link>
                        </div>

                        <Button
                            disabled={loading}
                            type="submit"
                            className="w-full h-11 mt-3 text-base font-semibold rounded-lg bg-gradient-to-r from-indigo-500 to-rose-500 text-white shadow-md hover:scale-105 transition-all duration-200"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                    Signing in...
                                </div>
                            ) : (
                                "Sign In"
                            )}
                        </Button>

                        <div className="relative flex items-center my-5">
                            <div className="flex-grow border-t border-border"></div>
                            <span className="mx-3 text-muted-foreground font-medium text-sm">Or continue with</span>
                            <div className="flex-grow border-t border-border"></div>
                        </div>

                        <div className="space-y-3">
                            <SignInButton
                                title="Continue with Google"
                                provider="google"
                                callbackURL="/meal-plans/new"
                                icon={<LogoIcons.Google />}
                                loading={googleLoading}
                                setLoading={setGoogleLoading}
                            />
                            <SignInButton
                                title="Continue with GitHub"
                                provider="github"
                                callbackURL="/meal-plans/new"
                                icon={<LogoIcons.Github />}
                                loading={githubLoading}
                                setLoading={setGithubLoading}
                            />
                        </div>

                        <div className="text-center mt-5">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Don&apos;t have an account?</span>
                            <button
                                className="ml-2 text-indigo-600 dark:text-indigo-400 font-semibold underline hover:text-rose-500 transition text-sm"
                                onClick={handleSwitchToSignUp}
                                type="button"
                            >
                                Sign up
                            </button>
                        </div>
                    </form>
                </Form>
            </div>
        </>
    )
}

export default SignIn