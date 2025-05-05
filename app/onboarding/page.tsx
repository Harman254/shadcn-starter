import React from 'react'
import Onboard from './Onboard'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';


const Onboarding =async () => {
  // if ((await auth()).sessionClaims?.metadata.onboardingComplete === true) {
  //   redirect('/meal-plans/new')
  // }

  const session = await auth.api.getSession({
    headers: await headers()
  })


  return (
      <Onboard/>
      
  )
}

export default Onboarding 
