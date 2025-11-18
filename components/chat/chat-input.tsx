"use client"

import { useState, useRef, useEffect, type KeyboardEvent, type FormEvent } from "react"
import { Send } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
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
        onSubmit('')
      }
      return
    }
    
    const messageToSend = value.trim()
    setValue("")
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    
    try {
      await onSubmit(messageToSend)
    } catch (error) {
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

  const hasValue = value.trim().length > 0

  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-5">
        <form onSubmit={handleSubmit} className="relative">
          <motion.div
            className={cn(
              "relative flex items-end gap-2 sm:gap-3",
              "bg-muted/30 dark:bg-muted/20",
              "border border-border/60",
              "rounded-2xl sm:rounded-3xl",
              "transition-all duration-300 ease-out",
              "backdrop-blur-sm",
              isFocused && "ring-2 ring-primary/20 border-primary/40 shadow-lg shadow-primary/5",
              "px-3 sm:px-4 md:px-5 py-3 sm:py-3.5 md:py-4"
            )}
            animate={{
              scale: isFocused ? 1.01 : 1,
            }}
            transition={{ duration: 0.2 }}
          >
            {/* Decorative gradient on focus */}
            <div className={cn(
              "absolute inset-0 rounded-2xl sm:rounded-3xl",
              "bg-gradient-to-r from-primary/5 via-transparent to-secondary/5",
              "opacity-0 transition-opacity duration-300",
              isFocused && "opacity-100"
            )} />

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={disabled ? "Sign in to start chatting..." : "Type your message..."}
              rows={1}
              className={cn(
                "relative z-10 flex-1 resize-none bg-transparent border-none",
                "text-foreground text-[15px] sm:text-base",
                "leading-[1.6] placeholder:text-muted-foreground/50",
                "focus:ring-0 focus:outline-none focus-visible:ring-0",
                "w-full font-sans antialiased",
                "min-h-[24px] max-h-[200px]",
                "scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
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
            <motion.button
              type="submit"
              disabled={isLoading || !hasValue || disabled}
              className={cn(
                "relative z-10 shrink-0",
                "h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10",
                "rounded-xl sm:rounded-2xl",
                "flex items-center justify-center",
                "transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                isLoading || !hasValue || disabled
                  ? "bg-muted/50 text-muted-foreground cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 shadow-md shadow-primary/20"
              )}
              whileHover={!isLoading && hasValue && !disabled ? { scale: 1.05 } : {}}
              whileTap={!isLoading && hasValue && !disabled ? { scale: 0.95 } : {}}
              aria-label={disabled ? "Sign in to chat" : isLoading ? "Sending message" : "Send message"}
              aria-disabled={isLoading || !hasValue || disabled}
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, rotate: -180 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 180 }}
                    transition={{ duration: 0.2 }}
                    className="h-4 w-4 sm:h-5 sm:w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"
                  />
                ) : (
                  <motion.div
                    key="send"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>

          {/* Helper text - only show when not focused and empty */}
          <AnimatePresence>
            {!isFocused && !value && !disabled && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="text-xs text-muted-foreground/60 mt-2 px-1 text-center flex items-center justify-center gap-2"
              >
                <span className="hidden sm:inline">Press</span>
                <kbd className="px-1.5 py-0.5 bg-muted/80 dark:bg-muted/60 rounded text-[10px] font-mono border border-border/50">
                  Enter
                </kbd>
                <span className="hidden sm:inline">to send,</span>
                <kbd className="px-1.5 py-0.5 bg-muted/80 dark:bg-muted/60 rounded text-[10px] font-mono border border-border/50">
                  Shift + Enter
                </kbd>
                <span className="hidden sm:inline">for new line</span>
              </motion.p>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  )
}