import SignUp from '@/components/auth/sign-up'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'

const SignupPage = async () => {

    const session = await auth.api.getSession({
        headers: await headers()
    })
    if(session) {
        redirect('/dashboard')
    }
  return (
    <SignUp />
  )
}

export default SignupPage