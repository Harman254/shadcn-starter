"use client"

import { useState, useRef, useEffect, type KeyboardEvent, type FormEvent } from "react"
import { Send, Loader2, Paperclip, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface ChatInputProps {
  onSubmit: (value: string, attachments?: string[]) => void
  isLoading: boolean
  disabled?: boolean
  input?: string
  handleInputChange?: (e: React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLInputElement>) => void
}

export function ChatInput({ onSubmit, isLoading, disabled = false, input, handleInputChange }: ChatInputProps) {
  const [internalValue, setInternalValue] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const [attachment, setAttachment] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isControlled = input !== undefined
  const value = isControlled ? input : internalValue

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [value])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("File too large. Please select an image under 5MB.")
        return
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          setAttachment(e.target.result)
        }
      }
      reader.readAsDataURL(file)
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
        fileInputRef.current.value = ''
    }
  }

  const cancelAttachment = () => {
    setAttachment(null)
  }

  const handleSubmit = async (e?: FormEvent) => {
    if (e) {
      e.preventDefault()
    }
    
    // Allow submit if there is an attachment even if text is empty
    if ((!value?.trim() && !attachment) || isLoading || disabled) {
      if (disabled) {
        //onSubmit('', []) // Don't submit
      }
      return
    }
    
    const messageToSend = value?.trim() || ''
    const attachmentsToSend = attachment ? [attachment] : undefined
    
    if (!isControlled) {
      setInternalValue("")
    }
    setAttachment(null)
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    
    try {
      await onSubmit(messageToSend, attachmentsToSend)
    } catch (error) {
      console.error('[ChatInput] Error submitting message:', error)
      if (!isControlled) {
        setInternalValue(messageToSend)
      }
      if (attachmentsToSend) {
        setAttachment(attachmentsToSend[0])
      }
    }
    
    textareaRef.current?.focus()
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (handleInputChange) {
      handleInputChange(e)
    } else {
      setInternalValue(e.target.value)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const hasValue = (value && value.trim().length > 0) || !!attachment

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="relative flex flex-col items-end gap-2">
        {/* Attachment Preview */}
        <AnimatePresence>
            {attachment && (
                <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="w-full flex justify-start pl-4"
                >
                    <div className="relative group">
                        <img 
                            src={attachment} 
                            alt="Attachment" 
                            className="h-20 w-auto rounded-lg border border-border shadow-sm object-cover"
                        />
                        <button
                            type="button"
                            onClick={cancelAttachment}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 shadow-md hover:bg-destructive/90 transition-colors"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        <motion.div
          className={cn(
            "relative flex-1 flex items-end gap-2 w-full",
            "bg-background/80 backdrop-blur-xl saturate-150", // Glass effect
            "border border-border/50",
            "rounded-[26px]",
            "shadow-lg shadow-black/5 dark:shadow-black/20",
            "transition-all duration-300 cubic-bezier(0.2, 0, 0, 1)",
            isFocused 
              ? "ring-1 ring-primary/20 border-primary/40 shadow-xl shadow-primary/5" 
              : "hover:border-primary/20 hover:shadow-md",
            "pl-3 pr-2 py-2"
          )}
          initial={false}
          animate={{
            y: isFocused ? -1 : 0,
          }}
        >
          {/* File Input */}
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || disabled || !!attachment}
            className={cn(
                "p-2 rounded-full transition-colors",
                "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                (isLoading || disabled) && "opacity-50 cursor-not-allowed",
                !!attachment && "text-primary opacity-50 cursor-not-allowed" // Disable adding more for now
            )}
            title="Attach image"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value || ""}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={disabled ? "Sign in to start chatting..." : "Ask anything about food..."}
            rows={1}
            autoFocus={!disabled}
            className={cn(
              "flex-1 resize-none bg-transparent border-none",
              "text-foreground text-[15px] sm:text-base",
              "leading-relaxed placeholder:text-muted-foreground/50",
              "focus:ring-0 focus:outline-none focus-visible:ring-0",
              "w-full font-sans antialiased",
              "min-h-[24px] max-h-[200px]",
              "scrollbar-thin scrollbar-thumb-border/50 scrollbar-track-transparent",
              "py-1.5"
            )}
            disabled={isLoading || disabled}
            aria-label={disabled ? "Sign in to start chatting" : "Chat message input"}
            onClick={disabled ? () => onSubmit('', []) : undefined}
            maxLength={4000}
          />
          
          {/* Send Button */}
          <div className="pb-0.5">
            <motion.button
              type="submit"
              disabled={isLoading || !hasValue || disabled}
              className={cn(
                "h-8 w-8",
                "rounded-full",
                "flex items-center justify-center",
                "transition-all duration-200",
                isLoading || !hasValue || disabled
                  ? "bg-muted text-muted-foreground/40 cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
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
                    transition={{ duration: 0.2 }}
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="send"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Send className="h-4 w-4 ml-0.5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.div>
      </form>
    </div>
  )
}