"use client"


import React, { useState } from 'react'
import { Button } from '../ui/button'
import { IconType } from 'react-icons'


interface SocialButtonProps {
  provider: string
  onClick: () => void
  icon: React.ReactNode
  label: string
  disabled?: boolean
}

const SocialButton: React.FC<SocialButtonProps> = ({  provider, onClick, label, disabled , icon}: SocialButtonProps) => {
  const [isLoading, setIsLoading] = useState(false)
  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      className="w-full flex items-center gap-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800"
      variant="ghost"
    >
      {label}
    </Button>
  )
}

export default SocialButton