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
import {  EyeIcon, EyeOffIcon, Mail } from 'lucide-react'
import { Lock } from 'lucide-react'

const SignIn = () => {
    const router = useRouter()
    const { error, success, loading, setSuccess, setError, setLoading, resetState } = useAuthState();
    const [googleLoading, setGoogleLoading] = React.useState(false)
    const [githubLoading, setGithubLoading] = React.useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: '',
            password: '',
        }
    })

    const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
        try {
          resetState()
          setLoading(true)
          
          // Using the signIn method from auth-client.ts
          const result = await signIn.email({
            email: values.email,
            password: values.password,
          }, {
            // Callbacks to handle different states of the authentication process
            onRequest: () => {
              console.log("Login request started");
              // Already set loading state above
            },
            onResponse: () => {
              console.log("Login response received");
              // Keep loading state until we process the response
            },
            onSuccess: () => {
              console.log("Login successful");
              setLoading(false);
              setSuccess("Logged in successfully");
              router.push('/');
            },
            onError: (ctx) => {
              console.error("Login error:", ctx.error);
              setLoading(false);
              
              // Handle specific error cases
              if (ctx.error.status === 403) {
                setError("Please verify your email address before logging in");
              } else if (ctx.error.status === 401) {
                setError("Invalid email or password");
              } else {
                setError(ctx.error.message || "Login failed. Please try again.");
              }
            }
          });
          
          // This code will only run if the callbacks above don't handle the response
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
        <CardWrapper
        cardTitle="Sign In"
        cardDescription="Enter your email below to login to your account"
        cardFooterDescription="Don't have an account?"
        cardFooterLink="/sign-up"
        cardFooterLinkTitle="Sign up"
      >
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
  
            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:text-primary/80 font-medium hover:underline transition-colors duration-200"
              >
                Forgot your password?
              </Link>
            </div>
  
            {/* Login Button */}
            <Button
              disabled={loading}
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:scale-[1.02] disabled:transform-none disabled:opacity-60 shadow-lg shadow-primary/25 disabled:shadow-none"
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
          </form>
        </Form>
      </CardWrapper>
    )
  }
  
  export default SignIn
  