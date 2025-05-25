import React from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getAccount, getDBSession } from '@/data';
import OnboardingPage from './Onboard';


const Onboarding =async () => {
  // if ((await auth()).sessionClaims?.metadata.onboardingComplete === true) {
  //   redirect('/meal-plans/new')
  // }

  const session = await auth.api.getSession({
    headers: await headers()
  })
  const userId = session?.user?.id
  if (!userId) redirect('/sign-in')


  const checkOnboard = await getAccount(userId)
  const isOnboarded = checkOnboard?.isOnboardingComplete
  if (isOnboarded) {
    redirect('/meal-plans/new')
  }


  return (
    <OnboardingPage />
      
  )
}

export default Onboarding 
