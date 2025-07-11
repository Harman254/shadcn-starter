"use client"
import React, { useState } from 'react'
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
        <div className="w-full">
            <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900 dark:text-white">Welcome back</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Enter your credentials to access your account</p>
            </div>

            <Form {...form}>
                <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-gray-500" />
                                        Email Address
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            className="h-11 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                            disabled={loading}
                                            type="email"
                                            placeholder="Enter your email"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs text-red-500" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-gray-500" />
                                        Password
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                className="h-11 pr-10 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                                disabled={loading}
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Enter your password"
                                                {...field}
                                            />
                                            <button
                                                type="button"
                                                onClick={togglePasswordVisibility}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-r-lg transition-colors"
                                                aria-label={showPassword ? "Hide password" : "Show password"}
                                            >
                                                {showPassword ? (
                                                    <EyeOffIcon className="h-4 w-4 text-gray-500" />
                                                ) : (
                                                    <EyeIcon className="h-4 w-4 text-gray-500" />
                                                )}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-xs text-red-500" />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex justify-end">
                        <Link
                            href="/forgot-password"
                            className="text-sm text-indigo-600 hover:text-indigo-500 font-medium hover:underline transition-colors"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    <div className="space-y-3">
                        <FormError message={error} />
                        <FormSuccess message={success} />
                    </div>

                    <Button
                        disabled={loading}
                        type="submit"
                        className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Signing in...
                            </div>
                        ) : (
                            "Sign In"
                        )}
                    </Button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-[#18181b] text-gray-500 dark:text-gray-400">Or continue with</span>
                        </div>
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

                    <div className="text-center pt-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Don&#39;t have an account? </span>
                        <button
                            className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-500 transition-colors"
                            onClick={handleSwitchToSignUp}
                            type="button"
                        >
                            Sign up
                        </button>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default SignIn