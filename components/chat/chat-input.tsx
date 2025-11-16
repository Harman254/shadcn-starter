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
    <div className="w-full bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-3 sm:py-4">
        <div className="relative">
          {/* Animated Circle and Greeting */}
          <div className="flex flex-row items-center mb-2">
            <motion.div
              className="relative flex items-center justify-center z-10"
              animate={{
                y: isFocused ? 50 : 0,
                opacity: isFocused ? 0 : 1,
                filter: isFocused ? "blur(4px)" : "blur(0px)",
                rotate: isFocused ? 180 : 0,
              }}
              transition={{
                duration: 0.5,
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
            >
              {/* Animated Circle with gradient effect */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 rounded-full blur-xl animate-pulse" />
                <div className="relative z-10 bg-primary/10 h-11 w-11 rounded-full backdrop-blur-sm border border-primary/20 flex items-center justify-center">
                  <div className="h-[2px] w-[2px] bg-primary rounded-full absolute top-4 left-4 blur-[1px]" />
                  <div className="h-[2px] w-[2px] bg-primary rounded-full absolute top-3 left-7 blur-[0.8px]" />
                  <div className="h-[2px] w-[2px] bg-primary rounded-full absolute top-8 left-2 blur-[1px]" />
                  <div className="h-[2px] w-[2px] bg-primary rounded-full absolute top-5 left-9 blur-[0.8px]" />
                  <div className="h-[2px] w-[2px] bg-primary rounded-full absolute top-7 left-7 blur-[1px]" />
                </div>
              </div>
            </motion.div>

            <motion.p
              className="text-muted-foreground/70 text-sm sm:text-base font-normal z-10 ml-3 leading-relaxed"
              animate={{
                y: isFocused ? 50 : 0,
                opacity: isFocused ? 0 : 1,
                filter: isFocused ? "blur(4px)" : "blur(0px)",
              }}
              transition={{
                duration: 0.5,
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
            >
              {disabled ? "Sign in to start chatting..." : "Hey there! I'm here to help with anything you need"}
            </motion.p>
          </div>

          {/* Input Container with Pulsing Border */}
          <div className="relative">
            {/* Pulsing Border Effect */}
            <motion.div
              className="absolute inset-0 rounded-2xl z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: isFocused ? 0.3 : 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/30 via-primary/20 to-primary/30 blur-sm animate-pulse" />
              <div className="absolute inset-[1px] rounded-2xl bg-background" />
            </motion.div>

            <motion.div
              className="relative bg-card/50 backdrop-blur-sm rounded-2xl p-4 z-10 border"
              animate={{
                borderColor: isFocused ? "hsl(var(--primary))" : "hsl(var(--border))",
              }}
              transition={{
                duration: 0.6,
                delay: 0.1,
              }}
            >
              <form onSubmit={handleSubmit} className="relative">
                {/* Message Input */}
                <div className="relative mb-4">
                  <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={disabled ? "Sign in to start chatting..." : "Type your message..."}
                    rows={1}
                    className="min-h-[80px] resize-none bg-transparent border-none text-foreground text-base sm:text-[15px] leading-relaxed placeholder:text-muted-foreground/50 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none w-full font-sans antialiased"
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
                </div>

                <div className="flex items-center justify-between">
                  {/* Left side icons */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      type="button"
                      className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground p-0 flex items-center justify-center transition-all"
                      aria-label="AI tools"
                    >
                      <Mic className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground p-0 flex items-center justify-center transition-all"
                      aria-label="Attach link"
                    >
                      <Link2 className="h-4 w-4" />
                    </button>
                    
                    {/* Model selector - hidden on mobile */}
                    <div className="hidden sm:flex items-center">
                      <select 
                        defaultValue="gpt-4" 
                        disabled
                        className="bg-muted border-border text-foreground hover:bg-muted/80 text-xs rounded-full px-2 h-8 min-w-[120px] focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                      >
                        <option value="gpt-4">⚡ GPT-4</option>
                        <option value="gemini">✨ Gemini</option>
                      </select>
                    </div>
                  </div>

                  {/* Right side icons */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      type="button"
                      className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground p-0 hidden sm:flex items-center justify-center transition-all"
                      aria-label="Folders"
                    >
                      <Folder className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button
                      type="button"
                      className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground p-0 hidden sm:flex items-center justify-center transition-all"
                      aria-label="Voice input"
                    >
                      <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || !value.trim() || disabled}
                      className={cn(
                        "h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-full transition-all flex items-center justify-center",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                        isLoading || !value.trim() || disabled
                          ? "bg-muted text-muted-foreground hover:bg-muted cursor-not-allowed"
                          : "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 shadow-sm"
                      )}
                      aria-label={disabled ? "Sign in to chat" : isLoading ? "Sending message" : "Send message"}
                      aria-disabled={isLoading || !value.trim() || disabled}
                    >
                      <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
