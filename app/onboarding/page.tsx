import React from 'react'
import Onboard from './Onboard'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

const Onboarding =async () => {
  if ((await auth()).sessionClaims?.metadata.onboardingComplete === true) {
    redirect('/meal-plans/new')
  }

  return (
      <Onboard/>
      
  )
}

export default Onboarding 
