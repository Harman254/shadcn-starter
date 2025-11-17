"use client"

import { useState, useRef, useEffect, type KeyboardEvent, type FormEvent } from "react"
import { Send, Link2, Folder, Mic } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ChatInputProps {
  onSubmit: (value: string) => void
  isLoading: boolean
  disabled?: boolean
}

export function ChatInput({ onSubmit, isLoading, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [value])

  const handleSubmit = async (e?: FormEvent) => {
    if (e) {
      e.preventDefault()
    }
    if (!value.trim() || isLoading || disabled) {
      if (disabled) {
        // If disabled (not authenticated), trigger auth modal
        onSubmit('')
      }
      return
    }
    
    // Store the value before clearing
    const messageToSend = value.trim()
    
    // Clear input optimistically for better UX
    setValue("")
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    
    try {
      // Call onSubmit - if it's async and fails, we could restore the value
      // But for now, we'll clear optimistically since the message should be added to store immediately
      await onSubmit(messageToSend)
    } catch (error) {
      // If onSubmit throws an error, restore the input value
      // This is a safety net in case of unexpected errors
      console.error('[ChatInput] Error submitting message:', error)
      setValue(messageToSend)
      if (textareaRef.current) {
        textareaRef.current.focus()
      }
    }
    
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="w-full bg-background border-t border-border/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-5">
        <form onSubmit={handleSubmit} className="relative">
          <div className={cn(
            "relative flex items-end gap-3",
            "bg-background border border-border rounded-2xl",
            "transition-all duration-200",
            isFocused && "border-primary/50 shadow-sm",
            "px-4 py-3 sm:px-5 sm:py-4"
          )}>
            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={disabled ? "Sign in to start chatting..." : "Message"}
              rows={1}
              className={cn(
                "flex-1 resize-none bg-transparent border-none",
                "text-foreground text-[15px] sm:text-base",
                "leading-[1.5] placeholder:text-muted-foreground/60",
                "focus:ring-0 focus:outline-none focus-visible:ring-0",
                "w-full font-sans antialiased",
                "min-h-[24px] max-h-[200px]"
              )}
              disabled={isLoading || disabled}
              aria-label={disabled ? "Sign in to start chatting" : "Chat message input"}
              aria-describedby={disabled ? "auth-required" : undefined}
              aria-required="false"
              onClick={disabled ? () => onSubmit('') : undefined}
              maxLength={4000}
            />
            {disabled && (
              <span id="auth-required" className="sr-only">
                Sign in required to send messages
              </span>
            )}

            {/* Send Button */}
            <button
              type="submit"
              disabled={isLoading || !value.trim() || disabled}
              className={cn(
                "shrink-0 h-8 w-8 sm:h-9 sm:w-9 rounded-lg",
                "flex items-center justify-center",
                "transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                isLoading || !value.trim() || disabled
                  ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95"
              )}
              aria-label={disabled ? "Sign in to chat" : isLoading ? "Sending message" : "Send message"}
              aria-disabled={isLoading || !value.trim() || disabled}
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                />
              ) : (
                <Send className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </button>
          </div>

          {/* Helper text - only show when not focused and empty */}
          {!isFocused && !value && !disabled && (
            <p className="text-xs text-muted-foreground/60 mt-2 px-1 text-center">
              Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Shift + Enter</kbd> for new line
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
