import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export default async function TestAuth() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    return <div>Auth Session Status: {session ? 'Logged In' : 'Logged Out'}</div>
  } catch (e: any) {
    return <div>Auth Error: {e.message} <pre>{JSON.stringify(e, null, 2)}</pre></div>
  }
}
