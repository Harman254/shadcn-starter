import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

const Loading = () => {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4">
    <div className="flex h-16 w-16 animate-spin items-center justify-center rounded-full border-4 border-transparent border-t-blue-400 text-4xl text-blue-400">
      <div className="flex h-12 w-12 animate-spin items-center justify-center rounded-full border-4 border-transparent border-t-red-400 text-2xl text-red-400"></div>
    </div>
  </div>
  )
}

export default Loading