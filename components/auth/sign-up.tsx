"use client"
import React from 'react'
import CardWrapper from '../card-wrapper'
import FormError from '../form-error'
import { SignInButton } from './social-button'
import { useAuthState } from '@/lib/use-AuthState'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { SignupSchema } from '@/lib/helpers/zod/sign-up-schema'
import { signUp } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import FormSuccess from '../form-success'
import { LogoIcons } from '../icons'
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react'
import { useAuthModal } from "@/components/AuthModalProvider"

interface SignUpProps {
  onSwitchToSignIn?: () => void;
  onSuccess?: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSwitchToSignIn, onSuccess }) => {
    const router = useRouter();
    const { error, success, loading, setLoading, setError, setSuccess, resetState } = useAuthState();
    const [googleLoading, setGoogleLoading] = React.useState(false);
    const [githubLoading, setGithubLoading] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);
    const { switchToSignIn, close: closeAuthModal } = useAuthModal();

    const form = useForm<z.infer<typeof SignupSchema>>({
        resolver: zodResolver(SignupSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
        }
    });

    const handleSuccess = () => {
        setSuccess("Verification link has been sent to your email");
        closeAuthModal();
        onSuccess?.();
    };

    const handleSwitchToSignIn = () => {
        if (onSwitchToSignIn) {
            onSwitchToSignIn();
        } else {
            switchToSignIn();
        }
    };

    const onSubmit = async (values: z.infer<typeof SignupSchema>) => {
        try {
            resetState();
            setLoading(true);
            
            await signUp.email({
                name: values.name,
                email: values.email,
                password: values.password,
            }, {
                onRequest: () => {
                    console.log("Signup request started");
                },
                onResponse: () => {
                    console.log("Signup response received");
                },
                onSuccess: () => {
                    console.log("Signup successful");
                    setLoading(false);
                    handleSuccess();
                },
                onError: (ctx) => {
                    console.error("Signup error:", ctx.error);
                    setLoading(false);
                    
                    if (ctx.error.status === 409) {
                        setError("Email already in use. Please try a different email or sign in.");
                    } else if (ctx.error.status === 400) {
                        setError("Invalid signup data. Please check your information.");
                    } else {
                        setError(ctx.error.message || "Signup failed. Please try again.");
                    }
                }
            });
        } catch (error: any) {
            console.error("Unexpected signup error:", error);
            setLoading(false);
            setError(error?.message || "Something went wrong during signup");
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="w-full max-w-md mx-auto bg-white dark:bg-[#18181b] rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-center">Sign Up</h2>
            <p className="text-base sm:text-lg text-center mb-6 text-gray-500 dark:text-gray-400">Create a new account</p>
            <Form {...form}>
                <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="space-y-5">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        <User className="w-4 h-4 text-muted-foreground" />
                                        Full Name
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative group">
                                            <Input
                                                className="block w-full h-12 px-4 mb-4 text-base bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                                disabled={loading}
                                                type="text"
                                                placeholder="Enter your full name"
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
                                                className="block w-full h-12 px-4 mb-4 text-base bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
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
                                                    <EyeOff className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                                                ) : (
                                                    <Eye className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
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

                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full h-12 mt-4 text-base font-semibold rounded-xl bg-gradient-to-r from-indigo-500 to-rose-500 text-white shadow-lg hover:scale-105 transition"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                Signing up...
                            </div>
                        ) : (
                            "Sign Up"
                        )}
                    </button>

                    <div className="relative flex items-center my-6">
                        <div className="flex-grow border-t border-border"></div>
                        <span className="mx-4 text-muted-foreground font-medium">Or continue with</span>
                        <div className="flex-grow border-t border-border"></div>
                    </div>

                    <div className="space-y-3">
                        <SignInButton
                            title="Continue with Google"
                            provider="google"
                            callbackURL="/"
                            icon={<LogoIcons.Google />}
                            loading={googleLoading}
                            setLoading={setGoogleLoading}
                        />
                        <SignInButton
                            title="Continue with GitHub"
                            provider="github"
                            callbackURL="/"
                            icon={<LogoIcons.Github />}
                            loading={githubLoading}
                            setLoading={setGithubLoading}
                        />
                    </div>

                    <div className="text-center mt-6">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Already have an account?</span>
                      <button
                        className="ml-2 text-indigo-600 dark:text-indigo-400 font-semibold underline hover:text-rose-500 transition"
                        onClick={handleSwitchToSignIn}
                        type="button"
                      >
                        Sign In
                      </button>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default SignUp