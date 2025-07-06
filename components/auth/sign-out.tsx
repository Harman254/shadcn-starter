"use client"
import React, { useState } from 'react'
import { Button } from '../ui/button'
import { signOut } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { LogOut, Loader2 } from 'lucide-react'

const SignOut = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    try {
      setIsLoading(true)
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/meal-plans/new")
          },
          onError: () => {
            setIsLoading(false)
          }
        }
      })
    } catch (error) {
      setIsLoading(false)
      console.error('Sign out error:', error)
    }
  }

  return (
    <Button
      onClick={handleSignOut}
      disabled={isLoading}
      variant="ghost"
      size="sm"
      className="w-full justify-start gap-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors duration-200 px-3 py-2 h-auto"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin text-zinc-500 dark:text-zinc-400" />
      ) : (
        <LogOut className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
      )}
      <span className="text-md text-red-500 font-medium">
        {isLoading ? 'Signing out...' : 'Sign Out'}
      </span>
    </Button>
  )
}

export default SignOut