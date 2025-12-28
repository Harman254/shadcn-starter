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
            className="absolute bottom-full left-0 mb-4 p-1.5 bg-background/40 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-2xl z-10 ring-1 ring-black/5 dark:ring-white/10"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-xl animate-pulse" />
              <img 
                src={imageUrl} 
                alt="Upload preview" 
                className="h-28 w-auto rounded-xl object-cover border border-white/30 shadow-sm relative z-10"
              />
              <button
                onClick={() => setImageUrl(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-all shadow-lg z-20 hover:scale-110 active:scale-90"
                type="button"
              >
                <X className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
            <div className="flex items-center justify-center gap-1.5 mt-1.5 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 w-fit mx-auto">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              <p className="text-[10px] text-primary font-bold uppercase tracking-wider">Image Ready</p>
            </div>
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
                      window: "#0F172A",
                      windowBorder: "#1E293B",
                      tabIcon: "#F97316",
                      menuIcons: "#94A3B8",
                      textDark: "#FFFFFF",
                      textLight: "#FFFFFF",
                      link: "#F97316",
                      action: "#F97316",
                      inactiveTabIcon: "#475569",
                      error: "#EF4444",
                      inProgress: "#3B82F6",
                      complete: "#22C55E",
                      sourceBg: "#1E293B"
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
                      "h-10 w-10",
                      "rounded-full",
                      "flex items-center justify-center",
                      "transition-all duration-300",
                      "relative group/btn",
                      imageUrl 
                        ? "bg-primary text-white shadow-lg shadow-primary/20" 
                        : "hover:bg-primary/10 text-muted-foreground hover:text-primary active:scale-95",
                      isLoading || disabled ? "opacity-30 cursor-not-allowed" : ""
                    )}
                    whileHover={!isLoading && !disabled ? { scale: 1.1 } : {}}
                    whileTap={!isLoading && !disabled ? { scale: 0.9 } : {}}
                    title="Upload image"
                  >
                    {/* Animated Outer Ring */}
                    <div className="absolute inset-0 rounded-full bg-primary/20 opacity-0 group-hover/btn:opacity-100 animate-ping duration-1000" />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/20 to-blue-500/20 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                    
                    <Camera className={cn(
                      "h-5 w-5 relative z-10 transition-transform",
                      imageUrl ? "scale-110" : "group-hover/btn:rotate-12"
                    )} />
                    
                    {/* Ready indicator dot */}
                    {imageUrl && (
                      <motion.div 
                        layoutId="dot"
                        className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full z-20"
                      />
                    )}
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