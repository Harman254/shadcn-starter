import React from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getAccount, getDBSession } from '@/data';
import OnboardingPage from './Onboard';
import Footer from '@/components/footer';


const Onboarding =async () => {
  

  const session = await auth.api.getSession({
    headers: await headers()
  })
  const userId = session?.user?.id
  if (!userId) redirect('/sign-in')


  const checkOnboard = await getAccount(userId)
  const isOnboarded = checkOnboard?.isOnboardingComplete
  if (isOnboarded) {
    redirect('/chat') // Redirect to chat page after onboarding
  }


  return (
    <>
    <OnboardingPage />
    <Footer />
    </>
      
  )
}

export default Onboarding 
