"use client"

import { User, Loader2, Copy, Check, Clock, AlertCircle, Calendar, UtensilsCrossed, ChefHat, Star, ShoppingCart, MapPin, Tag, DollarSign } from "lucide-react"
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
import { saveMealPlanAction } from "@/actions/save-meal-plan"
import { QuickActions } from "./quick-actions"

interface ChatMessageProps {
  message?: Message
  isLoading?: boolean
  onActionClick?: (message: string) => void
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

export const ChatMessage = memo(function ChatMessage({ message, isLoading, onActionClick }: ChatMessageProps) {
  // All hooks must be called at the top level, before any conditional returns
  const [copied, setCopied] = useState(false)
  const [formattedTime, setFormattedTime] = useState('')
  const [isMounted, setIsMounted] = useState(false)
  const [savingMealPlan, setSavingMealPlan] = useState(false)
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
    <>
      {/* Regular message content - with max-width constraints */}
      <article
        id={message ? `message-${message.id}` : undefined}
        className={cn(
          "w-full py-3 sm:py-4 md:py-5",
          isAssistant ? "bg-muted/20" : "bg-background",
          "animate-in fade-in slide-in-from-bottom-2 duration-300",
          // Hide regular message container if tool call results are present
          (isAssistant && (message?.ui?.mealPlan || message?.ui?.groceryList)) && "hidden"
        )}
        role="article"
        aria-label={isAssistant ? "AI assistant message" : "Your message"}
        data-message-id={message?.id}
      >
        <div className={cn(
          "max-w-4xl mx-auto px-4 sm:px-6 md:px-8",
          isAssistant ? "flex justify-start" : "flex justify-end"
        )}>
          <div className={cn(
            "flex items-start gap-3 sm:gap-4",
            "max-w-[85%] sm:max-w-[80%] md:max-w-[75%]",
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
              !isAssistant && "flex flex-col items-end"
            )}>
              <div className="relative group/message">
                {isAssistant ? (
                  <div className={cn(
                    "prose prose-sm sm:prose-base lg:prose-lg max-w-none",
                    "font-sans antialiased",
                    "prose-headings:text-foreground prose-headings:font-bold prose-headings:tracking-tight",
                    "prose-h1:text-2xl sm:prose-h1:text-3xl prose-h1:font-extrabold prose-h1:mt-8 prose-h1:mb-6 prose-h1:leading-tight",
                    "prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-7 prose-h2:mb-5 prose-h2:leading-tight",
                    "prose-h3:text-lg sm:prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-4 prose-h3:leading-snug",
                    "prose-h4:text-base sm:prose-h4:text-lg prose-h4:font-semibold prose-h4:mt-5 prose-h4:mb-3",
                    "prose-p:text-foreground prose-p:leading-[1.75] prose-p:my-5",
                    "prose-p:text-[15px] sm:prose-p:text-base prose-p:tracking-normal",
                    "prose-p:font-normal prose-p:antialiased",
                    "prose-strong:text-foreground prose-strong:font-bold prose-strong:tracking-tight",
                    "prose-em:text-foreground prose-em:italic",
                    "prose-code:text-foreground prose-code:bg-muted/90 prose-code:px-1.5 prose-code:py-0.5",
                    "prose-code:rounded-md prose-code:text-[13px] sm:prose-code:text-sm",
                    "prose-code:font-mono prose-code:font-medium prose-code:tracking-tight",
                    "prose-code:before:content-[''] prose-code:after:content-['']",
                    "prose-pre:bg-muted/60 prose-pre:border prose-pre:border-border/60",
                    "prose-pre:rounded-xl prose-pre:p-5 sm:prose-pre:p-6",
                    "prose-pre:overflow-x-auto prose-pre:my-6",
                    "prose-pre:shadow-sm prose-pre:backdrop-blur-sm",
                    "prose-pre:font-mono prose-pre:text-[13px] sm:prose-pre:text-sm",
                    "prose-pre:leading-relaxed",
                    "prose-ul:text-foreground prose-ol:text-foreground",
                    "prose-ul:my-5 prose-ol:my-5",
                    "prose-ul:space-y-2 prose-ol:space-y-2",
                    "prose-li:text-foreground prose-li:my-2.5",
                    "prose-li:text-[15px] sm:prose-li:text-base prose-li:leading-relaxed",
                    "prose-li:marker:text-muted-foreground",
                    "prose-a:text-primary prose-a:font-medium prose-a:no-underline",
                    "hover:prose-a:underline hover:prose-a:decoration-2 hover:prose-a:underline-offset-2",
                    "prose-a:transition-all prose-a:duration-200",
                    "prose-blockquote:text-muted-foreground prose-blockquote:font-medium",
                    "prose-blockquote:border-l-4 prose-blockquote:border-primary/40",
                    "prose-blockquote:pl-5 prose-blockquote:pr-4 prose-blockquote:py-2",
                    "prose-blockquote:my-6 prose-blockquote:bg-muted/30 prose-blockquote:rounded-r-lg",
                    "prose-blockquote:italic prose-blockquote:leading-relaxed",
                    "prose-hr:border-border/60 prose-hr:my-8 prose-hr:border-t-2",
                    "prose-table:text-sm prose-table:w-full prose-table:my-6",
                    "prose-th:font-semibold prose-th:text-foreground prose-th:bg-muted/50",
                    "prose-td:border-t prose-td:border-border/50",
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
            </div>
          </div>
          
          <div className={cn(
            "flex items-center gap-2 mt-2",
            !isAssistant && "justify-end"
          )}>
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
              <span className={cn("text-xs text-muted-foreground/60")}>
                {formattedTime}
              </span>
            )}
          </div>
          
          {/* Quick Actions - Show after assistant messages, aligned with message content */}
          {isAssistant && onActionClick && !message?.ui?.mealPlan && !message?.ui?.groceryList && (
            <div className={cn(
              "mt-3",
              isAssistant ? "flex justify-start" : "flex justify-end"
            )}>
              <div className={cn(
                "max-w-[85%] sm:max-w-[80%] md:max-w-[75%]",
                "w-full"
              )}>
                <QuickActions 
                  onActionClick={onActionClick}
                  context="general"
                />
              </div>
            </div>
          )}
        </div>
      </article>

      {/* Tool call results (meal plan/grocery list) - Full width immersive display - BREAKS OUT OF CONTAINER */}
      {isAssistant && (message?.ui?.mealPlan || message?.ui?.groceryList) && (
        <div className={cn(
          "w-full",
          "relative -mx-0 sm:-mx-3 md:-mx-4 lg:-mx-6", // Negative margins to break out of container
          "px-0 sm:px-3 md:px-4 lg:px-6", // Restore padding for content
          "my-4 sm:my-6" // Vertical spacing
        )}>
          {/* Meal Plan Display - Full width immersive */}
          {message?.ui?.mealPlan && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "w-full",
                "animate-in fade-in slide-in-from-bottom-2 duration-300"
              )}
            >
              <div className={cn(
                "relative overflow-hidden w-full",
                "bg-gradient-to-br from-card via-card to-primary/5",
                "border-y border-border/50 sm:border-x sm:border-border/50 sm:rounded-2xl", // Edge-to-edge on mobile, rounded on larger screens
                "shadow-lg shadow-primary/5",
                "backdrop-blur-sm"
              )}>
                {/* Header with gradient accent */}
                <div className={cn(
                  "relative px-4 sm:px-5 md:px-6 py-4 sm:py-5",
                  "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent",
                  "border-b border-border/50"
                )}>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-xl",
                      "bg-gradient-to-br from-primary to-primary/80",
                      "text-primary-foreground",
                      "shadow-md shadow-primary/20"
                    )}>
                      <ChefHat className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg sm:text-xl text-foreground leading-tight">
                        {message.ui.mealPlan.title}
                      </h3>
                      <div className="flex items-center gap-4 mt-1.5 text-xs sm:text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{message.ui.mealPlan.duration} {message.ui.mealPlan.duration === 1 ? 'day' : 'days'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <UtensilsCrossed className="h-3.5 w-3.5" />
                          <span>{message.ui.mealPlan.mealsPerDay} meals/day</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Star className="h-3.5 w-3.5" />
                          <span>{message.ui.mealPlan.days.reduce((sum, day) => sum + day.meals.length, 0)} total meals</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Meal Plan Content */}
                <div className="p-4 sm:p-5 md:p-6">
                  <div className="space-y-5">
                    {message.ui.mealPlan.days.map((day, dayIndex) => (
                      <motion.div
                        key={dayIndex}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: dayIndex * 0.05 }}
                        className={cn(
                          "relative",
                          dayIndex < (message.ui?.mealPlan?.days.length ?? 0) - 1 && "pb-5 border-b border-border/30"
                        )}
                      >
                        {/* Day Header */}
                        <div className="flex items-center gap-2 mb-4">
                          <div className={cn(
                            "flex items-center justify-center",
                            "w-8 h-8 rounded-lg",
                            "bg-primary/10 text-primary",
                            "font-bold text-sm",
                            "border border-primary/20"
                          )}>
                            {day.day}
                          </div>
                          <h4 className="font-semibold text-base text-foreground">
                            Day {day.day}
                          </h4>
                        </div>

                        {/* Meals Grid */}
                        <div className="grid gap-3 sm:gap-4">
                          {day.meals.map((meal, mealIndex) => (
                            <motion.div
                              key={mealIndex}
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.2, delay: (dayIndex * 0.05) + (mealIndex * 0.03) }}
                              className={cn(
                                "group relative",
                                "p-4 rounded-xl",
                                "bg-muted/30 hover:bg-muted/40",
                                "border border-border/30 hover:border-primary/30",
                                "transition-all duration-200",
                                "hover:shadow-md hover:shadow-primary/5"
                              )}
                            >
                              {/* Meal Name */}
                              <div className="flex items-start gap-3">
                                <div className={cn(
                                  "mt-0.5 shrink-0",
                                  "w-2 h-2 rounded-full",
                                  "bg-primary/60 group-hover:bg-primary",
                                  "transition-colors duration-200"
                                )} />
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-semibold text-sm sm:text-base text-foreground mb-1.5">
                                    {meal.name}
                                  </h5>
                                  
                                  {/* Description */}
                                  {meal.description && (
                                    <p className="text-xs sm:text-sm text-muted-foreground mb-2.5 leading-relaxed">
                                      {meal.description}
                                    </p>
                                  )}
                                  
                                  {/* Ingredients */}
                                  {meal.ingredients && meal.ingredients.length > 0 && (
                                    <div className="mt-2.5 pt-2.5 border-t border-border/20">
                                      <div className="flex flex-wrap items-center gap-1.5">
                                        <span className="text-xs font-medium text-muted-foreground/80">Ingredients:</span>
                                        <div className="flex flex-wrap gap-1.5">
                                          {meal.ingredients.slice(0, 4).map((ingredient, ingIndex) => (
                                            <span
                                              key={ingIndex}
                                              className={cn(
                                                "inline-flex items-center",
                                                "px-2 py-0.5 rounded-md",
                                                "text-xs font-medium",
                                                "bg-primary/10 text-primary",
                                                "border border-primary/20"
                                              )}
                                            >
                                              {ingredient}
                                            </span>
                                          ))}
                                          {meal.ingredients.length > 4 && (
                                            <span className="text-xs text-muted-foreground font-medium">
                                              +{meal.ingredients.length - 4} more
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Grocery List Display - Full width immersive */}
          {message?.ui?.groceryList && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "w-full",
                "animate-in fade-in slide-in-from-bottom-2 duration-300"
              )}
            >
              <div className={cn(
                "relative overflow-hidden w-full",
                "bg-gradient-to-br from-card via-card to-secondary/5 dark:from-card dark:via-card dark:to-secondary/10",
                "border-y border-border/50 sm:border-x sm:border-border/50 sm:rounded-2xl",
                "shadow-lg shadow-secondary/10 dark:shadow-secondary/5",
                "backdrop-blur-sm"
              )}>
                {/* Header with gradient accent */}
                <div className={cn(
                  "relative px-4 sm:px-5 md:px-6 py-4 sm:py-5",
                  "bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent dark:from-secondary/15 dark:via-secondary/10",
                  "border-b border-border/50"
                )}>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2.5 rounded-xl",
                      "bg-gradient-to-br from-secondary to-secondary/80 dark:from-secondary/90 dark:to-secondary/70",
                      "text-secondary-foreground",
                      "shadow-md shadow-secondary/20 dark:shadow-secondary/30",
                      "ring-1 ring-secondary/20"
                    )}>
                      <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg sm:text-xl md:text-2xl text-foreground leading-tight">
                        Grocery List
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2 text-xs sm:text-sm">
                        {message.ui.groceryList.totalEstimatedCost && (
                          <div className={cn(
                            "flex items-center gap-1.5",
                            "px-2.5 py-1 rounded-lg",
                            "bg-secondary/10 dark:bg-secondary/20",
                            "border border-secondary/20"
                          )}>
                            <DollarSign className="h-3.5 w-3.5 text-secondary" />
                            <span className="font-bold text-foreground">
                              {message.ui.groceryList.totalEstimatedCost}
                            </span>
                          </div>
                        )}
                        {message.ui.groceryList.items && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <span className="font-medium">{message.ui.groceryList.items.length}</span>
                            <span>{message.ui.groceryList.items.length === 1 ? 'item' : 'items'}</span>
                          </div>
                        )}
                        {message.ui.groceryList.locationInfo?.localStores && message.ui.groceryList.locationInfo.localStores.length > 0 && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="truncate max-w-[150px] sm:max-w-none">
                              {message.ui.groceryList.locationInfo.localStores[0]}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grocery List Content */}
                {message.ui.groceryList.items && message.ui.groceryList.items.length > 0 && (
                  <div className="p-4 sm:p-5 md:px-6 md:py-5">
                    {/* Group items by category */}
                    {(() => {
                      const itemsByCategory = message.ui.groceryList.items.reduce((acc: Record<string, typeof message.ui.groceryList.items>, item: any) => {
                        const category = item.category || 'Other';
                        if (!acc[category]) acc[category] = [];
                        acc[category].push(item);
                        return acc;
                      }, {});

                      return Object.entries(itemsByCategory).map(([category, items], categoryIndex) => (
                        <motion.div
                          key={category}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: categoryIndex * 0.05 }}
                          className={cn(
                            "relative",
                            categoryIndex < Object.keys(itemsByCategory).length - 1 && "mb-6 pb-6 border-b border-border/30"
                          )}
                        >
                          {/* Category Header */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2.5">
                              <div className={cn(
                                "flex items-center justify-center gap-1.5",
                                "px-3 py-1.5 rounded-lg",
                                "bg-gradient-to-r from-secondary/15 to-secondary/10 dark:from-secondary/20 dark:to-secondary/15",
                                "text-secondary-foreground dark:text-secondary",
                                "font-semibold text-sm sm:text-base",
                                "border border-secondary/30 dark:border-secondary/40",
                                "shadow-sm"
                              )}>
                                <Tag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                <span>{category}</span>
                              </div>
                            </div>
                            <span className="text-xs sm:text-sm text-muted-foreground font-medium">
                              {items.length} {items.length === 1 ? 'item' : 'items'}
                            </span>
                          </div>

                          {/* Items Grid */}
                          <div className="grid gap-2.5 sm:gap-3">
                            {items.map((item: any, itemIndex: number) => (
                              <motion.div
                                key={item.id || itemIndex}
                                initial={{ opacity: 0, scale: 0.98, y: 5 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ 
                                  duration: 0.2, 
                                  delay: (categoryIndex * 0.05) + (itemIndex * 0.02),
                                  ease: [0.22, 1, 0.36, 1]
                                }}
                                whileHover={{ scale: 1.01, y: -2 }}
                                className={cn(
                                  "group relative",
                                  "p-3.5 sm:p-4 rounded-xl",
                                  "bg-gradient-to-br from-muted/40 via-muted/30 to-muted/20",
                                  "dark:from-muted/30 dark:via-muted/20 dark:to-muted/10",
                                  "hover:from-muted/50 hover:via-muted/40 hover:to-muted/30",
                                  "dark:hover:from-muted/40 dark:hover:via-muted/30 dark:hover:to-muted/20",
                                  "border border-border/40 hover:border-secondary/50 dark:border-border/30 dark:hover:border-secondary/40",
                                  "transition-all duration-300",
                                  "hover:shadow-lg hover:shadow-secondary/10 dark:hover:shadow-secondary/5",
                                  "backdrop-blur-sm"
                                )}
                              >
                                <div className="flex items-start justify-between gap-3 sm:gap-4">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start gap-3">
                                      <div className={cn(
                                        "mt-1 shrink-0",
                                        "w-2.5 h-2.5 rounded-full",
                                        "bg-gradient-to-br from-secondary to-secondary/70",
                                        "group-hover:from-secondary group-hover:to-secondary/90",
                                        "transition-all duration-300",
                                        "ring-2 ring-secondary/20 group-hover:ring-secondary/40"
                                      )} />
                                      <div className="flex-1 min-w-0">
                                        <h5 className="font-semibold text-sm sm:text-base md:text-lg text-foreground mb-1.5 leading-tight">
                                          {item.item}
                                        </h5>
                                        {item.quantity && (
                                          <div className={cn(
                                            "inline-flex items-center gap-1",
                                            "px-2 py-0.5 rounded-md",
                                            "text-xs font-medium",
                                            "bg-secondary/10 dark:bg-secondary/20",
                                            "text-secondary-foreground dark:text-secondary",
                                            "border border-secondary/20"
                                          )}>
                                            <span>{item.quantity}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-2 shrink-0">
                                    {item.estimatedPrice && (
                                      <div className={cn(
                                        "flex items-center gap-1",
                                        "px-2.5 py-1 rounded-lg",
                                        "bg-secondary/10 dark:bg-secondary/20",
                                        "border border-secondary/30 dark:border-secondary/40"
                                      )}>
                                        <DollarSign className="h-3.5 w-3.5 text-secondary" />
                                        <span className="font-bold text-sm sm:text-base text-foreground">
                                          {item.estimatedPrice}
                                        </span>
                                      </div>
                                    )}
                                    {item.suggestedLocation && (
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <MapPin className="h-3 w-3" />
                                        <span className="truncate max-w-[120px] sm:max-w-[150px]">
                                          {item.suggestedLocation}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      ));
                    })()}
                  </div>
                )}
              </div>
            </motion.div>
          )}
          
          {/* Quick Actions for meal plans */}
          {isAssistant && message?.ui?.mealPlan && onActionClick && (
            <div className="px-4 sm:px-5 md:px-6 pb-4">
              <QuickActions 
                onActionClick={onActionClick}
                context="meal-plan"
              />
            </div>
          )}
          
          {/* Quick Actions for grocery lists */}
          {isAssistant && message?.ui?.groceryList && onActionClick && (
            <div className="px-4 sm:px-5 md:px-6 pb-4">
              <QuickActions 
                onActionClick={onActionClick}
                context="grocery-list"
              />
            </div>
          )}
          
          {/* UI Action Buttons - rendered for assistant messages with UI metadata */}
          {isAssistant && message?.ui?.actions && message.ui.actions.length > 0 && (
            <div className={cn(
              "flex flex-wrap items-center gap-2 mt-3 sm:mt-4",
              "px-4 sm:px-5 md:px-6", // Match meal plan padding
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
                  onClick={async () => {
                    if (action.action === 'navigate' && action.url) {
                      router.push(action.url);
                    } else if (action.action === 'save' && action.data) {
                      // Handle save meal plan action
                      setSavingMealPlan(true);
                      try {
                      // Title should already be in action.data from generateMealPlan
                      // But ensure it exists as fallback
                      const title = action.data.title || `${action.data.duration}-Day Meal Plan (${action.data.mealsPerDay} meals/day)`;
                      
                      const saveData = {
                        title: title,
                        duration: action.data.duration,
                        mealsPerDay: action.data.mealsPerDay,
                        days: action.data.days,
                        createdAt: new Date().toISOString(),
                      };
                        
                        const result = await saveMealPlanAction(saveData);
                        
                        if (result.success && result.mealPlan) {
                          toast({
                            title: 'Meal Plan Saved!',
                            description: `"${action.data.title}" has been saved successfully.`,
                            duration: 3000,
                          });
                          
                          // Update the button to show success and navigate
                          setTimeout(() => {
                            router.push(`/meal-plans/${result.mealPlan.id}`);
                          }, 1000);
                        } else {
                          const errorMessage = 'error' in result ? result.error : 'Could not save meal plan. Please try again.';
                          toast({
                            title: 'Failed to Save',
                            description: errorMessage,
                            variant: 'destructive',
                            duration: 4000,
                          });
                        }
                      } catch (error) {
                        console.error('[ChatMessage] Error saving meal plan:', error);
                        toast({
                          title: 'Error',
                          description: 'Failed to save meal plan. Please try again.',
                          variant: 'destructive',
                          duration: 4000,
                        });
                      } finally {
                        setSavingMealPlan(false);
                      }
                    } else if (action.onClick) {
                      // Handle custom actions if needed
                      toast({
                        title: 'Action triggered',
                        description: `Executing ${action.onClick}`,
                      });
                    }
                  }}
                  disabled={savingMealPlan}
                >
                  {savingMealPlan && action.action === 'save' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    action.label
                  )}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
});
