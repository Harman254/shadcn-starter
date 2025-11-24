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
    <div className="w-full safe-area-bottom fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none">
      <div className="max-w-4xl mx-auto pointer-events-auto">
        <form onSubmit={handleSubmit} className="relative">
          <motion.div
            className={cn(
              "relative flex items-end gap-2 sm:gap-3",
              "bg-background/60 dark:bg-background/40",
              "backdrop-blur-xl saturate-150",
              "border border-border/40",
              "rounded-[2rem]",
              "shadow-2xl shadow-primary/5",
              "transition-all duration-300 ease-out",
              isFocused && "ring-2 ring-primary/20 border-primary/40 shadow-primary/10 bg-background/80",
              "px-4 py-3"
            )}
            animate={{
              scale: isFocused ? 1.005 : 1,
              y: isFocused ? -2 : 0,
            }}
            transition={{ duration: 0.2 }}
          >
            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={disabled ? "Sign in to start chatting..." : "Ask anything about food..."}
              rows={1}
              className={cn(
                "relative z-10 flex-1 resize-none bg-transparent border-none",
                "text-foreground text-base",
                "leading-[1.5] placeholder:text-muted-foreground/60",
                "focus:ring-0 focus:outline-none focus-visible:ring-0",
                "w-full font-sans antialiased",
                "min-h-[24px] max-h-[200px]",
                "scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent",
                "py-2"
              )}
              disabled={isLoading || disabled}
              aria-label={disabled ? "Sign in to start chatting" : "Chat message input"}
              onClick={disabled ? () => onSubmit('') : undefined}
              maxLength={4000}
            />
            
            {/* Send Button */}
            <motion.button
              type="submit"
              disabled={isLoading || !hasValue || disabled}
              className={cn(
                "relative z-10 shrink-0",
                "h-10 w-10 sm:h-11 sm:w-11",
                "rounded-full",
                "flex items-center justify-center",
                "transition-all duration-200",
                isLoading || !hasValue || disabled
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg"
              )}
              whileHover={!isLoading && hasValue && !disabled ? { scale: 1.05 } : {}}
              whileTap={!isLoading && hasValue && !disabled ? { scale: 0.95 } : {}}
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, rotate: -180 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 180 }}
                    className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin"
                  />
                ) : (
                  <motion.div
                    key="send"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Send className="h-5 w-5 ml-0.5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        </form>
      </div>
    </div>
  )
}