import React from 'react'
import Preferences from './pref'
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

const PreferencesPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers() // you need to pass the headers object.
});

  if (!session) {
    redirect("/sign-in");
  }
  return (
    <Preferences userId={session.user.id}  />
  )
}

export default PreferencesPage