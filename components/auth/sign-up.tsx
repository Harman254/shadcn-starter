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
      cardTitle="Sign Up"
      cardDescription="Create a new account"
      cardFooterLink="/sign-in"
      cardFooterDescription="Already have an account?"
      cardFooterLinkTitle="Sign In"
    >
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
                        className="h-12 px-4 text-base bg-background/50 border-border rounded-xl transition-all duration-200 focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:opacity-60 disabled:cursor-not-allowed dark:bg-muted/20 dark:focus:bg-background"
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
                        className="h-12 px-4 text-base bg-background/50 border-border rounded-xl transition-all duration-200 focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:opacity-60 disabled:cursor-not-allowed dark:bg-muted/20 dark:focus:bg-background"
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
                        className="h-12 px-4 pr-12 text-base bg-background/50 border-border rounded-xl transition-all duration-200 focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:opacity-60 disabled:cursor-not-allowed dark:bg-muted/20 dark:focus:bg-background"
                        disabled={loading}
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
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
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-primary/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none" />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>

          {/* Status Messages */}
          <div className="space-y-3">
            <FormError message={error} />
            <FormSuccess message={success} />
          </div>

          {/* Sign Up Button */}
          <Button
            disabled={loading}
            type="submit"
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:scale-[1.02] disabled:transform-none disabled:opacity-60 shadow-lg shadow-primary/25 disabled:shadow-none"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Creating account...
              </div>
            ) : (
              "Create Account"
            )}
          </Button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background text-muted-foreground font-medium">Or continue with</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <SignInButton
              title="Continue with Google"
              provider="google"
              callbackURL="https://www.aimealwise.com/api/auth/callback/google"
              icon={<LogoIcons.Google />}
              loading={googleLoading}
              setLoading={setGoogleLoading}
            />
            <SignInButton
              title="Continue with GitHub"
              provider="github"
              callbackURL="https://www.aimealwise.com/api/auth/callback/github"
              icon={<LogoIcons.Github />}
              loading={githubLoading}
              setLoading={setGithubLoading}
            />
          </div>
        </form>
      </Form>
    </CardWrapper>
    )
}

export default SignUp
