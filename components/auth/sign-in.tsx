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
import { signIn, } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import FormSuccess from '../form-success'
import Link from 'next/link'
import { FcGoogle } from 'react-icons/fc'
import { LogoIcons } from '../icons'
import { FiEye, FiEyeOff } from 'react-icons/fi'

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
          await signIn.email({
            email: values.email,
            password: values.password
          }, {
            onResponse: () => {
              setLoading(false)
            },
            onRequest: () => {
              resetState()
              setLoading(true)
            },
            onSuccess: () => {
                setSuccess("LoggedIn successfully")
                router.replace('/')
            },
// changes were made on onError option
            onError: (ctx) => {
                /* Whenever user tried to signin but email is not verified it catches the error and display the error */
                if(ctx.error.status === 403) {
                    setError("Please verify your email address")
                }
                /* handles other error */
              setError(ctx.error.message);
            },
          });
        } catch (error) {
          console.log(error)
          setError("Something went wrong")
        }
      }


      const googleSignIn = async () => {
        try {
            await signIn.social({
                provider: "google"
            }, {
                onResponse: () => {
                    setLoading(false)
                },
                onRequest: () => {
                    setSuccess("")
                    setError("")
                    setLoading(true)
                },
                onSuccess: () => {
                    setSuccess("Your are loggedIn successfully")
                    router.push('/')
                },
                onError: (ctx) => {
                    setError(ctx.error.message)
                }
            })
        } catch (error: unknown) {
            console.error(error)
            setError("Something went wrong")
        }
    }

    const githubSignIn = async () => {
        try {
            await signIn.social({
                provider: "github",
                callbackURL: "/"
            }, {
                onResponse: () => {
                    setLoading(false)
                },
                onRequest: () => {
                    setSuccess("")
                    setError("")
                    setLoading(true)
                },
                onSuccess: () => {
                    setSuccess("Your are loggedIn successfully")
                },
                onError: (ctx) => {
                    setError(ctx.error.message)
                }
            })
        } catch (error: unknown) {
            console.log(error)
            setError("Something went wrong")
        }
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    return (
        <CardWrapper
            cardTitle='Sign In'
            cardDescription='Enter your email below to login to your account'
            cardFooterDescription="Don't have an account?"
            cardFooterLink='/sign-up'
            cardFooterLinkTitle='Sign up'
        >
            <Form {...form}>
                <form className='space-y-4' onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input
                                    className='leading-6 text-md'
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
                                                <FiEyeOff className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                                            ) : (
                                                <FiEye className="h-5 w-5 text-gray-500 hover:text-gray-700" />
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
                    <Button disabled={loading} type="submit" className='w-full'>Login</Button>
                    <Link href="/forgot-password" className="text-xs underline ml-60">Forgot Password?</Link>
                 <SignInButton title="Sign in with Google"  provider="google"  callbackURL="/" icon={<LogoIcons.Google />} loading={googleLoading} setLoading={setGoogleLoading} />
                 <SignInButton title="Sign in with Github"  provider="github"  callbackURL="/" icon={<LogoIcons.Github />} loading={githubLoading} setLoading={setGithubLoading} />

                
                </form>
            </Form>
        </CardWrapper>
    )
}

export default SignIn
