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
import { Eye, EyeOff } from 'lucide-react'

const SignUp = () => {
    const router = useRouter();
    const { error, success, loading, setLoading, setError, setSuccess, resetState } = useAuthState();
    const [googleLoading, setGoogleLoading] = React.useState(false);
    const [githubLoading, setGithubLoading] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);

    const form = useForm<z.infer<typeof SignupSchema>>({
        resolver: zodResolver(SignupSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
        }
    });

    const onSubmit = async (values: z.infer<typeof SignupSchema>) => {
        try {
            resetState();
            setLoading(true);
            
            // Using the signUp method from auth-client.ts with proper callbacks
            await signUp.email({
                name: values.name,
                email: values.email,
                password: values.password,
            }, {
                // Callbacks to handle different states of the signup process
                onRequest: () => {
                    console.log("Signup request started");
                    // Already set loading state above
                },
                onResponse: () => {
                    console.log("Signup response received");
                    // Keep loading state until we process the response
                },
                onSuccess: () => {
                    console.log("Signup successful");
                    setLoading(false);
                    setSuccess("Verification link has been sent to your email");
                },
                onError: (ctx) => {
                    console.error("Signup error:", ctx.error);
                    setLoading(false);
                    
                    // Handle specific error cases
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
        <CardWrapper
            cardTitle='SignUp'
            cardDescription='Create a new account'
            cardFooterLink='/sign-in'
            cardFooterDescription='Already have an account?'
            cardFooterLinkTitle='Login'
        >
            <Form {...form}>
                <form className='space-y-4' onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input
                                        disabled={loading}
                                        type="text"
                                        placeholder='John'
                                        {...field} 
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input
                                        disabled={loading}
                                        type="email"
                                        placeholder='example@gmail.com'
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            disabled={loading}
                                            type={showPassword ? "text" : "password"}
                                            placeholder='********'
                                            {...field}
                                        />
                                        <button
                                            type="button"
                                            onClick={togglePasswordVisibility}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                                            ) : (
                                                <Eye className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                                            )}
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormError message={error} />
                    <FormSuccess message={success} />
                    <Button disabled={loading} type="submit" className='w-full'>
                        {loading ? "Creating account..." : "Submit"}
                    </Button>
                    <div>
                        <div>
                            <SignInButton 
                                title="Sign in with Github" 
                                provider="github" 
                                callbackURL="https://mealwise-lemon.vercel.app/api/auth/callback/github" 
                                icon={<LogoIcons.Github />} 
                                loading={githubLoading} 
                                setLoading={setGithubLoading}
                            />
                            <SignInButton 
                                title="Sign in with Google" 
                                provider="google" 
                                callbackURL="https://mealwise-lemon.vercel.app/api/auth/callback/google" 
                                icon={<LogoIcons.Google />} 
                                loading={googleLoading} 
                                setLoading={setGoogleLoading} 
                            />
                        </div>
                    </div>
                </form>
            </Form>
        </CardWrapper>
    )
}

export default SignUp
