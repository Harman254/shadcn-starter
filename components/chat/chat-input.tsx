"use client"

import { useState, useRef, useEffect, type KeyboardEvent, type FormEvent } from "react"
import { Send, Loader2, Camera, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { CldUploadWidget } from 'next-cloudinary';

interface ChatInputProps {
  onSubmit: (value: string) => void
  isLoading: boolean
  disabled?: boolean
  input?: string
  handleInputChange?: (e: React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLInputElement>) => void
}

export function ChatInput({ onSubmit, isLoading, disabled = false, input, handleInputChange }: ChatInputProps) {
  const [internalValue, setInternalValue] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const isControlled = input !== undefined
  const value = isControlled ? input : internalValue

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
    
    // Allow submit if there's an image, even if text is empty
    const hasContent = (value && value.trim().length > 0) || (imageUrl && imageUrl.length > 0);
    
    if (!hasContent || isLoading || disabled) {
      if (disabled) {
        onSubmit('')
      }
      return
    }
    
    let messageToSend = value?.trim() || ""
    
    // Append image URL if present - this trigger's the AI's vision capability via ai-tools.ts
    // The prompt logic there looks for a URL to execute analyzePantryImage
    if (imageUrl) {
      if (messageToSend) {
        messageToSend += `\n\n[IMAGE_CONTEXT]: ${imageUrl}`;
      } else {
        messageToSend = `Analyze this image: ${imageUrl}`;
      }
    }

    if (!isControlled) {
      setValue("")
    }
    // Clear image after send
    setImageUrl(null); 
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    
    try {
      await onSubmit(messageToSend)
    } catch (error) {
      console.error('[ChatInput] Error submitting message:', error)
      if (!isControlled) {
        // Restore text on error
        setValue(value?.trim() || "") 
      }
      // Note: We don't restore the image automatically to avoid stuck state, 
      // but user can easily re-upload if needed.
      if (textareaRef.current) {
        textareaRef.current.focus()
      }
    }
    
    textareaRef.current?.focus()
  }

  const setValue = (newValue: string) => {
    if (isControlled) {
      return
    }
    setInternalValue(newValue)
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

  const hasValue = (value && value.trim().length > 0) || imageUrl !== null

  return (
    <div className="relative w-full">
      {/* Image Preview */}
      <AnimatePresence>
        {imageUrl && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full left-0 mb-2 p-2 bg-background/95 backdrop-blur-sm rounded-xl border border-border shadow-lg z-10"
          >
            <div className="relative group">
              <img 
                src={imageUrl} 
                alt="Upload preview" 
                className="h-24 w-auto rounded-lg object-cover border border-border/50"
              />
              <button
                onClick={() => setImageUrl(null)}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90 transition-colors shadow-sm opacity-100 sm:opacity-0 group-hover:opacity-100"
                type="button"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 text-center font-medium">Ready to send</p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
        <motion.div
          className={cn(
            "relative flex-1 flex items-end gap-2",
            "bg-background/80 backdrop-blur-xl saturate-150", 
            "border border-border/50",
            "rounded-[26px]",
            "shadow-lg shadow-black/5 dark:shadow-black/20",
            "transition-all duration-300 cubic-bezier(0.2, 0, 0, 1)",
            isFocused 
              ? "ring-1 ring-primary/20 border-primary/40 shadow-xl shadow-primary/5" 
              : "hover:border-primary/20 hover:shadow-md",
            "pl-2 pr-2 py-2"
          )}
          initial={false}
          animate={{
            y: isFocused ? -1 : 0,
          }}
        >
          {/* Upload Button */}
          <div className="pb-0.5 pl-1">
             <CldUploadWidget
                uploadPreset="mealwise"
                onSuccess={(result: any) => {
                  // Type guard for Cloudinary result
                  if (typeof result?.info === 'object' && result.info?.secure_url) {
                    setImageUrl(result.info.secure_url);
                  }
                }}
                options={{
                  sources: ['local', 'camera', 'url'],
                  multiple: false,
                  maxFiles: 1,
                  clientAllowedFormats: ['image'],
                  maxImageFileSize: 5000000, // 5MB
                  styles: {
                    palette: {
                      window: "#FFFFFF",
                      windowBorder: "#90A0B3",
                      tabIcon: "#0078FF",
                      menuIcons: "#5A616A",
                      textDark: "#000000",
                      textLight: "#FFFFFF",
                      link: "#0078FF",
                      action: "#FF620C",
                      inactiveTabIcon: "#0E2F5A",
                      error: "#F44235",
                      inProgress: "#0078FF",
                      complete: "#20B832",
                      sourceBg: "#E4EBF1"
                    }
                  }
                }}
              >
                {({ open }) => (
                  <motion.button
                    type="button"
                    onClick={() => open?.()}
                    disabled={isLoading || disabled}
                    className={cn(
                      "h-8 w-8",
                      "rounded-full",
                      "flex items-center justify-center",
                      "transition-all duration-200",
                      "hover:bg-muted text-muted-foreground hover:text-foreground active:scale-95",
                      isLoading || disabled ? "opacity-50 cursor-not-allowed" : ""
                    )}
                    whileHover={!isLoading && !disabled ? { scale: 1.05 } : {}}
                    title="Upload image"
                  >
                   <Camera className="h-5 w-5" />
                  </motion.button>
                )}
              </CldUploadWidget>
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={disabled ? "Sign in to start chatting..." : (imageUrl ? "Describe what's in the image..." : "Type a message or snap a photo...")}
            rows={1}
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
            // onClick handler removed as it interferes with selection
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