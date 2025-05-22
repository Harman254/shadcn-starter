"use client"
import { useForm } from 'react-hook-form'
import CardWrapper from '@/components/card-wrapper'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

import FormError from '@/components/form-error'
import  FormSuccess  from '@/components/form-success'
import { useAuthState } from '@/lib/use-AuthState'
import { authClient } from '@/lib/auth-client'
import { ForgotPasswordSchema } from '@/lib/helpers/zod/forgot-password-schema'

const ForgotPassword = () => {
  const { error, success, loading, setError, setSuccess, setLoading, resetState } = useAuthState()

  const form = useForm<z.infer<typeof ForgotPasswordSchema>>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: '',
    }
  })

  const onSubmit = async (values: z.infer<typeof ForgotPasswordSchema>) => {
    try {
        // Call the authClient's forgetPassword method, passing the email and a redirect URL.
        await authClient.forgetPassword({
        email: values.email, // Email to which the reset password link should be sent.
        redirectTo: "/reset-password" // URL to redirect the user after resetting the password.
      }, {
        // Lifecycle hooks to handle different stages of the request.
        onResponse: () => {
          setLoading(false)
        },
        onRequest: () => {
          resetState()
          setLoading(true)
        },
        onSuccess: () => {
          setSuccess("Reset password link has been sent")
        },
        onError: (ctx) => {
          setError(ctx.error.message);
        },
      });

    } catch (error) { // catch the error
      console.log(error)
      setError("Something went wrong")
    }
  }

  return (
    <CardWrapper
      cardTitle='Forgot Password'
      cardDescription='Enter your email to send link to reset password'
      cardFooterDescription="Remember your password?"
      cardFooterLink='/sign-in'
      cardFooterLinkTitle='Signin'
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button disabled={loading} type="submit" className='w-full'>Submit</Button>
        </form>
      </Form>

    </CardWrapper>
  )
}

export default ForgotPassword