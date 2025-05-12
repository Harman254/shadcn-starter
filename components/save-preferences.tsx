'use client'

import { useFormStatus } from 'react-dom'
import { Button } from './ui/button'

const SaveButton = () => {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="ml-auto" disabled={pending} aria-disabled={pending}>
      {pending ? (
        <span className="flex items-center">
          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
          </svg>
          Saving...
        </span>
      ) : (
        "Save Preferences"
      )}
    </Button>
  )
}

export default SaveButton
