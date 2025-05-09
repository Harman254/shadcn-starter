"use client"

import React from 'react'
import { Button } from '../ui/button'
import { IconType } from 'react-icons'


interface SocialButtonProps {
  onClick: () => void
  label: string
  disabled?: boolean
}

const SocialButton: React.FC<SocialButtonProps> = ({  onClick, label, disabled }) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center gap-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800"
      variant="ghost"
    >
      {label}
    </Button>
  )
}

export default SocialButton