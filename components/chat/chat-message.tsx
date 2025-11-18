"use client"

import { User, Loader2, Copy, Check, Clock, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Message } from "@/types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { useState, memo, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

interface ChatMessageProps {
  message?: Message
  isLoading?: boolean
}

function formatTimestamp(date?: Date): string {
  if (!date) return ''
  // Only format on client to avoid hydration mismatch
  if (typeof window === 'undefined') return ''
  
  const now = new Date()
  const messageDate = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - messageDate.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  
  // Show time if today, date if older
  const isToday = messageDate.toDateString() === now.toDateString()
  if (isToday) {
    return messageDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }
  return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export const ChatMessage = memo(function ChatMessage({ message, isLoading }: ChatMessageProps) {
  // All hooks must be called at the top level, before any conditional returns
  const [copied, setCopied] = useState(false)
  const [formattedTime, setFormattedTime] = useState('')
  const [isMounted, setIsMounted] = useState(false)
  const { toast } = useToast()
  const { theme, systemTheme } = useTheme()
  const router = useRouter()
  const currentTheme = theme === 'system' ? systemTheme : theme
  const isDark = currentTheme === 'dark'

  // Only format timestamp on client to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true)
    if (message?.timestamp) {
      setFormattedTime(formatTimestamp(message.timestamp))
    }
  }, [message?.timestamp])

  // Handle loading state with engaging animation
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "w-full py-4 sm:py-6 md:py-8",
          "bg-muted/20",
        )}
      >
        <div className={cn(
          "max-w-4xl mx-auto px-4 sm:px-6 md:px-8",
          "flex items-start gap-3 sm:gap-4"
        )}>
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Avatar className={cn(
              "h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 shrink-0",
              "ring-2 ring-primary/20 ring-offset-2 ring-offset-background"
            )}>
              <AvatarFallback className={cn(
                "transition-all text-xs font-semibold",
                "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground",
                "relative overflow-hidden"
              )}>
                <Icons.moon className="h-4 w-4 sm:h-5 sm:w-5 relative z-10" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              </AvatarFallback>
            </Avatar>
          </motion.div>
          
          <div className="flex-1 min-w-0">
            <div className={cn(
              "inline-block",
              "bg-muted/60 rounded-2xl rounded-tl-sm px-5 py-3 sm:px-6 sm:py-3.5",
              "border border-border/50",
              "shadow-sm backdrop-blur-sm"
            )}>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground font-medium">
                  AI is thinking
                </span>
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map((index) => (
                    <motion.div
                      key={index}
                      className="w-1.5 h-1.5 rounded-full bg-primary"
                      animate={{
                        y: [0, -8, 0],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: index * 0.2,
                        ease: "easeInOut"
                      }}
                    />
                  ))}
                </div>
              </div>
              
              {/* Animated sparkles for extra visual appeal */}
              <div className="relative mt-2 h-1 overflow-hidden rounded-full bg-muted/40">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary/0 via-primary/60 to-primary/0"
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              </div>
            </div>
            
            {/* Optional: Subtle floating particles effect */}
            <div className="relative mt-2 h-4">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-primary/30"
                  style={{
                    left: `${20 + i * 30}%`,
                  }}
                  animate={{
                    y: [0, -10, 0],
                    opacity: [0.3, 0.6, 0.3],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 2 + i * 0.3,
                    repeat: Infinity,
                    delay: i * 0.4,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  // Handle missing message
  if (!message) {
    return null
  }

  const role = message.role
  const isAssistant = role === "assistant"

  const handleCopy = async () => {
    if (!message?.content) return
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      toast({
        title: 'Copied to clipboard',
        duration: 2000,
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: 'Failed to copy',
        variant: 'destructive',
      })
    }
  }

  return (
    <article
      id={message ? `message-${message.id}` : undefined}
      className={cn(
        "w-full py-3 sm:py-4 md:py-5",
        isAssistant ? "bg-muted/20" : "bg-background",
        "animate-in fade-in slide-in-from-bottom-2 duration-300"
      )}
      role="article"
      aria-label={isAssistant ? "AI assistant message" : "Your message"}
      data-message-id={message?.id}
    >
      <div className={cn(
        "max-w-4xl mx-auto px-4 sm:px-6 md:px-8",
        // Container alignment: assistant messages align left, user messages align right
        isAssistant ? "flex justify-start" : "flex justify-end"
      )}>
        <div className={cn(
          "flex items-start gap-3 sm:gap-4",
          // Max width for message bubble
          "max-w-[85%] sm:max-w-[80%] md:max-w-[75%]",
          // Assistant: avatar left, content left
          // User: avatar right, content right (reverse order)
        isAssistant ? "flex-row" : "flex-row-reverse"
      )}>
        <Avatar
          className={cn(
            "h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 shrink-0 transition-transform hover:scale-105",
          )}
        >
          <AvatarFallback
            className={cn(
              "transition-all text-xs font-semibold",
              isAssistant
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            {isAssistant ? (
              <Icons.moon className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <User className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </AvatarFallback>
        </Avatar>

        <div className={cn(
          "flex-1 min-w-0",
            // User messages: align content to right
          !isAssistant && "flex flex-col items-end"
        )}>
          <div className="relative group/message">
            {isAssistant ? (
              <div className={cn(
                    "prose prose-sm sm:prose-base lg:prose-lg max-w-none",
                    // Premium typography settings
                    "font-sans antialiased",
                    // Headings - premium styling
                    "prose-headings:text-foreground prose-headings:font-bold prose-headings:tracking-tight",
                    "prose-h1:text-2xl sm:prose-h1:text-3xl prose-h1:font-extrabold prose-h1:mt-8 prose-h1:mb-6 prose-h1:leading-tight",
                    "prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-7 prose-h2:mb-5 prose-h2:leading-tight",
                    "prose-h3:text-lg sm:prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-4 prose-h3:leading-snug",
                    "prose-h4:text-base sm:prose-h4:text-lg prose-h4:font-semibold prose-h4:mt-5 prose-h4:mb-3",
                    // Paragraphs - premium readability
                    "prose-p:text-foreground prose-p:leading-[1.75] prose-p:my-5",
                    "prose-p:text-[15px] sm:prose-p:text-base prose-p:tracking-normal",
                    "prose-p:font-normal prose-p:antialiased",
                    // Strong and emphasis
                    "prose-strong:text-foreground prose-strong:font-bold prose-strong:tracking-tight",
                    "prose-em:text-foreground prose-em:italic",
                    // Code - premium styling
                    "prose-code:text-foreground prose-code:bg-muted/90 prose-code:px-1.5 prose-code:py-0.5",
                    "prose-code:rounded-md prose-code:text-[13px] sm:prose-code:text-sm",
                    "prose-code:font-mono prose-code:font-medium prose-code:tracking-tight",
                    "prose-code:before:content-[''] prose-code:after:content-['']",
                    // Code blocks - premium styling
                    "prose-pre:bg-muted/60 prose-pre:border prose-pre:border-border/60",
                    "prose-pre:rounded-xl prose-pre:p-5 sm:prose-pre:p-6",
                    "prose-pre:overflow-x-auto prose-pre:my-6",
                    "prose-pre:shadow-sm prose-pre:backdrop-blur-sm",
                    "prose-pre:font-mono prose-pre:text-[13px] sm:prose-pre:text-sm",
                    "prose-pre:leading-relaxed",
                    // Lists - premium spacing
                    "prose-ul:text-foreground prose-ol:text-foreground",
                    "prose-ul:my-5 prose-ol:my-5",
                    "prose-ul:space-y-2 prose-ol:space-y-2",
                    "prose-li:text-foreground prose-li:my-2.5",
                    "prose-li:text-[15px] sm:prose-li:text-base prose-li:leading-relaxed",
                    "prose-li:marker:text-muted-foreground",
                    // Links - premium hover effects
                    "prose-a:text-primary prose-a:font-medium prose-a:no-underline",
                    "hover:prose-a:underline hover:prose-a:decoration-2 hover:prose-a:underline-offset-2",
                    "prose-a:transition-all prose-a:duration-200",
                    // Blockquotes - premium styling
                    "prose-blockquote:text-muted-foreground prose-blockquote:font-medium",
                    "prose-blockquote:border-l-4 prose-blockquote:border-primary/40",
                    "prose-blockquote:pl-5 prose-blockquote:pr-4 prose-blockquote:py-2",
                    "prose-blockquote:my-6 prose-blockquote:bg-muted/30 prose-blockquote:rounded-r-lg",
                    "prose-blockquote:italic prose-blockquote:leading-relaxed",
                    // Horizontal rules
                    "prose-hr:border-border/60 prose-hr:my-8 prose-hr:border-t-2",
                    // Tables - premium styling
                    "prose-table:text-sm prose-table:w-full prose-table:my-6",
                    "prose-th:font-semibold prose-th:text-foreground prose-th:bg-muted/50",
                    "prose-td:border-t prose-td:border-border/50",
                    // General prose improvements
                    "prose-img:rounded-lg prose-img:shadow-md prose-img:my-6",
                    "dark:prose-invert dark:prose-pre:bg-muted/40"
                  )}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ node, inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || '')
                          const language = match ? match[1] : ''
                          return !inline && language ? (
                            <div className="relative group/code">
                              <div className="absolute top-2 left-3 text-xs font-medium text-muted-foreground/70 z-10">
                                {language}
                              </div>
                              <SyntaxHighlighter
                                style={isDark ? oneDark : oneLight}
                                language={language}
                                PreTag="div"
                                className="rounded-xl !mt-4 !mb-4 !pt-8 !pb-4 !px-4 sm:!px-5 shadow-sm border border-border/60"
                                customStyle={{
                                  background: isDark ? 'hsl(var(--muted) / 0.4)' : 'hsl(var(--muted) / 0.6)',
                                  fontSize: '0.875rem',
                                  lineHeight: '1.7',
                                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
                                }}
                                {...props}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-3 right-3 h-8 w-8 opacity-0 group-hover/code:opacity-100 transition-all bg-background/90 backdrop-blur-sm border border-border/50 shadow-sm hover:bg-background"
                                onClick={() => {
                                  navigator.clipboard.writeText(String(children))
                                  toast({
                                    title: 'Code copied',
                                    duration: 2000,
                                  })
                                }}
                                aria-label="Copy code"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <code className={cn(
                              "bg-muted/90 px-1.5 py-0.5 rounded-md text-[13px] sm:text-sm font-mono font-medium",
                              "text-foreground tracking-tight",
                              "border border-border/30",
                              className
                            )} {...props}>
                              {children}
                            </code>
                          )
                        },
                        p({ children, ...props }: any) {
                          return (
                            <p className="my-5 leading-[1.75] text-[15px] sm:text-base tracking-normal font-normal antialiased" {...props}>
                              {children}
                            </p>
                          )
                        },
                        strong({ children, ...props }: any) {
                          return (
                            <strong className="font-bold text-foreground tracking-tight" {...props}>
                              {children}
                            </strong>
                          )
                        },
                        em({ children, ...props }: any) {
                          return (
                            <em className="italic font-medium" {...props}>
                              {children}
                            </em>
                          )
                        },
                        a({ children, ...props }: any) {
                          return (
                            <a 
                              className="text-primary font-medium no-underline hover:underline hover:decoration-2 hover:underline-offset-2 transition-all duration-200" 
                              {...props}
                            >
                              {children}
                            </a>
                          )
                        },
                        blockquote({ children, ...props }: any) {
                          return (
                            <blockquote 
                              className="border-l-4 border-primary/40 pl-5 pr-4 py-2 my-6 bg-muted/30 rounded-r-lg italic leading-relaxed text-muted-foreground font-medium" 
                              {...props}
                            >
                              {children}
                            </blockquote>
                          )
                        },
                        ul({ children, ...props }: any) {
                          return (
                            <ul className="my-5 space-y-2 list-disc list-outside pl-6" {...props}>
                              {children}
                            </ul>
                          )
                        },
                        ol({ children, ...props }: any) {
                          return (
                            <ol className="my-5 space-y-2 list-decimal list-outside pl-6" {...props}>
                              {children}
                            </ol>
                          )
                        },
                        li({ children, ...props }: any) {
                          return (
                            <li className="my-2.5 text-[15px] sm:text-base leading-relaxed marker:text-muted-foreground" {...props}>
                              {children}
                            </li>
                          )
                        },
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className={cn(
                    "inline-block",
                    "bg-muted/60 rounded-2xl rounded-tr-sm px-5 py-3 sm:px-6 sm:py-3.5",
                    "border border-border/50",
                    "shadow-sm backdrop-blur-sm",
                    "transition-all hover:shadow-md"
                  )}>
                  <p
                    className={cn(
                        "text-[15px] sm:text-base leading-[1.75] whitespace-pre-wrap break-words",
                        "text-foreground tracking-normal",
                        "font-sans font-normal antialiased"
                    )}
                  >
                    {message.content}
                  </p>
                  </div>
                )}
            {message && (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "absolute opacity-0 group-hover/message:opacity-100 transition-opacity h-8 w-8 rounded-md",
                  "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  isAssistant ? "-top-2 right-0" : "-top-2 left-0"
                )}
                onClick={handleCopy}
                aria-label="Copy message"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
          
          {/* UI Action Buttons - rendered for assistant messages with UI metadata */}
          {isAssistant && message?.ui?.actions && message.ui.actions.length > 0 && (
            <div className={cn(
              "flex flex-wrap items-center gap-2 mt-3",
              "animate-in fade-in slide-in-from-bottom-2 duration-300"
            )}>
              {message.ui.actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.action === 'navigate' ? 'default' : 'outline'}
                  size="sm"
                  className={cn(
                    "text-sm font-medium",
                    "transition-all hover:scale-105"
                  )}
                  onClick={() => {
                    if (action.action === 'navigate' && action.url) {
                      router.push(action.url);
                    } else if (action.onClick) {
                      // Handle custom actions if needed
                      toast({
                        title: 'Action triggered',
                        description: `Executing ${action.onClick}`,
                      });
                    }
                  }}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
          
          <div className={cn(
            "flex items-center gap-2 mt-2",
            !isAssistant && "justify-end"
          )}>
            {/* Message status indicator - only for user messages */}
            {!isAssistant && message?.status && (
              <div className="flex items-center gap-1">
                {message.status === 'sending' && (
                  <Clock className="h-3 w-3 text-muted-foreground/60 animate-pulse" aria-label="Sending" />
                )}
                {message.status === 'sent' && (
                  <Check className="h-3 w-3 text-primary" aria-label="Sent" />
                )}
                {message.status === 'failed' && (
                  <AlertCircle className="h-3 w-3 text-destructive" aria-label="Failed to send" />
                )}
              </div>
            )}
          {isMounted && message?.timestamp && formattedTime && (
            <span className={cn(
                "text-xs text-muted-foreground/60"
            )}>
              {formattedTime}
            </span>
          )}
        </div>
      </div>
    </div>
      </div>
    </article>
  )
});
