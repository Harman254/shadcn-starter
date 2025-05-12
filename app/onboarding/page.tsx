import React from 'react'
import Onboard from './Onboard'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getDBSession } from '@/data';


const Onboarding =async () => {
  // if ((await auth()).sessionClaims?.metadata.onboardingComplete === true) {
  //   redirect('/meal-plans/new')
  // }

  const session = await auth.api.getSession({
    headers: await headers()
  })
  const userId = session?.user?.id
  if (!userId) redirect('/sign-in')


  const DBsession = await getDBSession(userId)
  const isOnboarded = DBsession?.isOnboardingComplete
  if (isOnboarded) {
    redirect('/meal-plans/new')
  }


  return (
      <Onboard/>
      
  )
}

export default Onboarding 
