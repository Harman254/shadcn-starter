
"use client"
import React from 'react'
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
        <div className="w-full">
            <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900 dark:text-white">Create account</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Enter your details to get started</p>
            </div>

            <Form {...form}>
                <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-500" />
                                        Full Name
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            className="h-11 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                            disabled={loading}
                                            type="text"
                                            placeholder="Enter your full name"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs text-red-500" />
                                </FormItem>
                            )}
                        />

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
                                                    <EyeOff className="h-4 w-4 text-gray-500" />
                                                ) : (
                                                    <Eye className="h-4 w-4 text-gray-500" />
                                                )}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-xs text-red-500" />
                                </FormItem>
                            )}
                        />
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
                                Creating account...
                            </div>
                        ) : (
                            "Create Account"
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

                    <div className="text-center pt-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Already have an account? </span>
                        <button
                            className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-500 transition-colors"
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