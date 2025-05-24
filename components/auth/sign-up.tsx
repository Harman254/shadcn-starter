"use client"
import React from 'react'
import CardWrapper from '../card-wrapper'
import FormError from '../form-error'
import { FcGoogle } from 'react-icons/fc'
import { SignInButton } from './social-button'

import { FaGithub } from 'react-icons/fa'
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
const SignUp = () => {
    const { error, success, loading, setLoading, setError, setSuccess, resetState } = useAuthState();
    const [googleLoading, setGoogleLoading] = React.useState(false)
    const [githubLoading, setGithubLoading] = React.useState(false)

    const form = useForm<z.infer<typeof SignupSchema>>({
        resolver: zodResolver(SignupSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
        }
    })

    const onSubmit = async (values: z.infer<typeof SignupSchema>) => {
        try {
            await signUp.email({
                name: values.name,
                email: values.email,
                password: values.password,
                callbackURL:'/' // redirect the user after email is verified
            }, {
                onResponse: () => {
                    setLoading(false)
                },
                onRequest: () => {
                    resetState()
                    setLoading(true)
                },
                onSuccess: () => {
                    // setSuccess("User has been created")
                    // router.replace('/')
                    setSuccess("Verification link has been sent to your mail")
                },
                onError: (ctx) => {
                    setError(ctx.error.message);
                },
            });
        } catch (error) {
            console.error(error)
            setError("Something went wrong")
        }

    }

    return (
        <CardWrapper
        cardTitle='SignUp'
        cardDescription='Create an new account'
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
                                        placeholder='john'
                                        {...field} />
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
                                    <Input
                                        disabled={loading}
                                        type="password"
                                        placeholder='********'
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>

                        )}
                    />
                    <FormError message={error} />
                    <FormSuccess message={success} />
                    <Button disabled={loading} type="submit" className='w-full'>Submit</Button>
                    <div>
                        <div>
                        <SignInButton title="Sign in with github"  provider="github"  callbackURL="/" icon={<LogoIcons.Github />} loading={githubLoading} setLoading={setGithubLoading}/>
                        <SignInButton title="Sign in with Google"  provider="google"  callbackURL="/" icon={<LogoIcons.Google />} loading={googleLoading} setLoading={setGoogleLoading} />

                            
                        </div>
                    </div>
                    
                </form>
            </Form>
        </CardWrapper>
    )
}

export default SignUp