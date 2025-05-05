import SignIn from '@/components/auth/sign-in'
import { auth } from '@/lib/auth'
import { authClient } from '@/lib/auth-client'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'

const SignInPage = async () => {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if(session) {
        redirect('/dashboard')
    }
   

  return (
    



    <SignIn />
  )
}

export default SignInPage