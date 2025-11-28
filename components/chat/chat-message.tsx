"use client"

import { User, Loader2, Copy, Check, Clock, AlertCircle, Calendar, UtensilsCrossed, ChefHat, Star, ShoppingCart, MapPin, Tag, DollarSign, Save, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Message } from "@/types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { useState, memo, useEffect, useMemo } from "react"
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
import { ToolProgress, type ExecutionProgressData, type ToolProgressData } from "./tool-progress"

import { VerifiedBadge } from "./verified-badge"
import { MealSuggestions, type MealSuggestion } from "./meal-suggestions"

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

// Memoized Markdown content to prevent re-renders and "parentNode" errors during streaming
const MarkdownContent = memo(function MarkdownContent({ content, isDark }: { content: string, isDark: boolean }) {
  const { toast } = useToast()
  
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || '')
          const language = match ? match[1] : ''
          return !inline && language ? (
            <div className="relative group/code my-4">
              <div className="absolute top-3 left-4 text-xs font-medium text-muted-foreground/70 z-10 select-none">
                {language}
              </div>
              <SyntaxHighlighter
                style={isDark ? oneDark : oneLight}
                language={language}
                PreTag="div"
                className="rounded-xl !mt-0 !mb-0 !pt-10 !pb-4 !px-4 shadow-sm border border-border/50"
                customStyle={{
                  background: 'transparent',
                  fontSize: '0.875rem',
                  lineHeight: '1.6',
                }}
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover/code:opacity-100 transition-all bg-background/80 backdrop-blur-sm border border-border/50 shadow-sm hover:bg-background"
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
              "bg-muted px-1.5 py-0.5 rounded-md text-sm font-mono font-medium",
              "text-foreground",
              className
            )} {...props}>
              {children}
            </code>
          )
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
}, (prevProps, nextProps) => {
  // Custom comparison to prevent re-renders if content hasn't changed meaningfully
  return prevProps.content === nextProps.content && prevProps.isDark === nextProps.isDark;
});

function ThinkingAnimation() {
  const [text, setText] = useState('Thinking...');

  useEffect(() => {
    const texts = ['Thinking...', 'Reasoning...'];
    let index = 0;

    const interval = setInterval(() => {
      index = (index + 1) % texts.length;
      setText(texts[index]);
    }, 2000); // Cycle every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <span className="text-sm text-muted-foreground font-medium min-w-[80px]">
      {text}
    </span>
  );
}

function WhatsAppIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 175.216 175.552"
      {...props}
    >
      <defs>
        <linearGradient
          id="b"
          x1="85.915"
          x2="86.535"
          y1="32.567"
          y2="137.092"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#57d163" />
          <stop offset="1" stopColor="#23b33a" />
        </linearGradient>
        <filter
          id="a"
          width="1.115"
          height="1.114"
          x="-.057"
          y="-.057"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="3.531" />
        </filter>
      </defs>
      <path
        fill="#b3b3b3"
        d="m54.532 138.45 2.235 1.324c9.387 5.571 20.15 8.518 31.126 8.523h.023c33.707 0 61.139-27.426 61.153-61.135.006-16.335-6.349-31.696-17.895-43.251A60.75 60.75 0 0 0 87.94 25.983c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.312-6.179 22.558zm-40.811 23.544L24.16 123.88c-6.438-11.154-9.825-23.808-9.821-36.772.017-40.556 33.021-73.55 73.578-73.55 19.681.01 38.154 7.669 52.047 21.572s21.537 32.383 21.53 52.037c-.018 40.553-33.027 73.553-73.578 73.553h-.032c-12.313-.005-24.412-3.094-35.159-8.954zm0 0"
        filter="url(#a)"
      />
      <path
        fill="#fff"
        d="m12.966 161.238 10.439-38.114a73.42 73.42 0 0 1-9.821-36.772c.017-40.556 33.021-73.55 73.578-73.55 19.681.01 38.154 7.669 52.047 21.572s21.537 32.383 21.53 52.037c-.018 40.553-33.027 73.553-73.578 73.553h-.032c-12.313-.005-24.412-3.094-35.159-8.954z"
      />
      <path
        fill="url(#linearGradient1780)"
        d="M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.312-6.179 22.559 23.146-6.069 2.235 1.324c9.387 5.571 20.15 8.518 31.126 8.524h.023c33.707 0 61.14-27.426 61.153-61.135a60.75 60.75 0 0 0-17.895-43.251 60.75 60.75 0 0 0-43.235-17.929z"
      />
      <path
        fill="url(#b)"
        d="M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.313-6.179 22.558 23.146-6.069 2.235 1.324c9.387 5.571 20.15 8.517 31.126 8.523h.023c33.707 0 61.14-27.426 61.153-61.135a60.75 60.75 0 0 0-17.895-43.251 60.75 60.75 0 0 0-43.235-17.928z"
      />
      <path
        fill="#fff"
        fillRule="evenodd"
        d="M68.772 55.603c-1.378-3.061-2.828-3.123-4.137-3.176l-3.524-.043c-1.226 0-3.218.46-4.902 2.3s-6.435 6.287-6.435 15.332 6.588 17.785 7.506 19.013 12.718 20.381 31.405 27.75c15.529 6.124 18.689 4.906 22.061 4.6s10.877-4.447 12.408-8.74 1.532-7.971 1.073-8.74-1.685-1.226-3.525-2.146-10.877-5.367-12.562-5.981-2.91-.919-4.137.921-4.746 5.979-5.819 7.206-2.144 1.381-3.984.462-7.76-2.861-14.784-9.124c-5.465-4.873-9.154-10.891-10.228-12.73s-.114-2.835.808-3.751c.825-.824 1.838-2.147 2.759-3.22s1.224-1.84 1.836-3.065.307-2.301-.153-3.22-4.032-10.011-5.666-13.647"
      />
    </svg>
  );
}


export const ChatMessage = memo(function ChatMessage({ message, isLoading, onActionClick }: ChatMessageProps) {
  // All hooks must be called at the top level, before any conditional returns
  const [copied, setCopied] = useState(false)
  const [formattedTime, setFormattedTime] = useState('')
  const [isMounted, setIsMounted] = useState(false)
  const [savingMealPlan, setSavingMealPlan] = useState(false)
  const [savedMealPlanId, setSavedMealPlanId] = useState<string | null>(null)
  const { toast } = useToast()
  const { theme, systemTheme } = useTheme()
  const router = useRouter()
  const currentTheme = theme === 'system' ? systemTheme : theme
  const isDark = currentTheme === 'dark'

  // Extract UI data from either legacy .ui property or new toolInvocations
  const uiData = useMemo(() => {
    if (!message) return null;
    // Prioritize legacy .ui for backward compatibility if it exists
    if (message.ui) return message.ui;
    
    if (message.toolInvocations) {
      for (const tool of message.toolInvocations) {
        if (tool.state === 'result') {
          if (tool.toolName === 'generateMealPlan' && tool.result?.success) {
             return { mealPlan: tool.result.mealPlan };
          }
          if (tool.toolName === 'generateGroceryList' && tool.result?.success) {
             // Map the tool result to the expected UI structure
             // The tool returns { groceryList: { items: ... } }
             // The UI expects { groceryList: { items: ... } }
             return { groceryList: tool.result.groceryList };
          }
          if (tool.toolName === 'getMealSuggestions' && tool.result?.success) {
             return { mealSuggestions: tool.result.suggestions };
          }
          if (tool.toolName === 'generateMealRecipe' && tool.result?.success) {
             return { mealRecipe: tool.result.recipe };
          }
        }
      }
    }
    return null;
  }, [message]);

  // Determine active tool status
  const activeTool = useMemo(() => {
    if (!message?.toolInvocations) return null;
    const active = message.toolInvocations.find(t => t.state !== 'result');
    if (active) {
      if (active.toolName === 'generateMealPlan') return 'Creating meal plan...';
      if (active.toolName === 'generateGroceryList') return 'Listing ingredients...';
      if (active.toolName === 'analyzeNutrition') return 'Analyzing nutrition...';
      if (active.toolName === 'getGroceryPricing') return 'Checking prices...';
      if (active.toolName === 'getMealSuggestions') return 'Finding suggestions...';
    }
    return null;
  }, [message]);

  // Only format timestamp on client to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true)
    const ts = message?.timestamp || message?.createdAt
    if (ts) {
      setFormattedTime(formatTimestamp(ts))
    }
  }, [message?.timestamp, message?.createdAt])

  // Transform toolInvocations into ExecutionProgressData
  const toolProgressData = useMemo<ExecutionProgressData | null>(() => {
    if (!message?.toolInvocations || message.toolInvocations.length === 0) return null;

    const tools = new Map<string, ToolProgressData>();
    let completed = 0;
    let failed = 0;
    
    message.toolInvocations.forEach((tool) => {
      let status: ToolProgressData['status'] = 'running';
      let progress = 0;
      let messageText = 'Processing...';

      if (tool.state === 'result') {
        status = 'completed';
        progress = 100;
        messageText = 'Completed';
        completed++;
        
        // Check for failure in result if applicable
        if (tool.result && typeof tool.result === 'object' && 'success' in tool.result && !tool.result.success) {
            status = 'failed';
            failed++;
            messageText = tool.result.error || 'Failed';
        }
      } else {
        // partial-call or call
        progress = 50;
        messageText = 'Running...';
      }

      // Customize message based on tool name
      if (tool.toolName === 'generateMealPlan') {
        messageText = status === 'running' ? 'Creating meal plan...' : 'Meal plan created';
      } else if (tool.toolName === 'generateGroceryList') {
        messageText = status === 'running' ? 'Generating grocery list...' : 'Grocery list generated';
      } else if (tool.toolName === 'analyzeNutrition') {
        messageText = status === 'running' ? 'Analyzing nutrition...' : 'Nutrition analyzed';
      } else if (tool.toolName === 'getGroceryPricing') {
        messageText = status === 'running' ? 'Checking prices...' : 'Prices checked';
      } else if (tool.toolName === 'getMealSuggestions') {
        messageText = status === 'running' ? 'Finding suggestions...' : 'Suggestions found';
      }

      tools.set(tool.toolCallId, {
        toolId: tool.toolCallId,
        toolName: tool.toolName,
        status,
        progress,
        message: messageText,
      });
    });

    const totalTools = message.toolInvocations.length;
    const overallProgress = totalTools > 0 ? (completed / totalTools) * 100 : 0;

    return {
      totalTools,
      completedTools: completed,
      failedTools: failed,
      skippedTools: 0,
      currentPhase: 1,
      totalPhases: 1,
      overallProgress,
      tools,
      startedAt: message.createdAt || new Date(),
    };
  }, [message?.toolInvocations, message?.createdAt]);

  // Handle loading state with ToolProgress or generic loading
  if (isLoading || (message?.toolInvocations && message.toolInvocations.length > 0 && !uiData?.mealPlan && !uiData?.groceryList && !uiData?.mealSuggestions && !uiData?.mealRecipe)) {
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
          "max-w-3xl mx-auto px-4 sm:px-6",
          "flex items-start gap-3 sm:gap-4"
        )}>
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
                {isLoading && !toolProgressData && (
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
                )}
              </AvatarFallback>
            </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className={cn(
              "inline-block w-full max-w-md",
              "bg-muted/40 rounded-2xl rounded-tl-sm px-5 py-3 sm:px-6 sm:py-3.5",
              "border border-border/40",
              "shadow-sm backdrop-blur-md"
            )}>
              {toolProgressData ? (
                <ToolProgress progress={toolProgressData} compact={false} />
              ) : (
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground font-medium min-w-[80px]">
                      Thinking...
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
              )}
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
        "w-full py-4 sm:py-6",
        "animate-in fade-in slide-in-from-bottom-2 duration-300",
        // Hide regular message container if tool call results are present
        (isAssistant && (uiData?.mealPlan || uiData?.groceryList || uiData?.mealSuggestions || uiData?.mealRecipe)) && "hidden"
      )}
      role="article"
      aria-label={isAssistant ? "AI assistant message" : "Your message"}
      data-message-id={message?.id}
    >
      <div className={cn(
        "max-w-3xl mx-auto px-4 sm:px-6",
        isAssistant ? "flex justify-start" : "flex justify-end"
      )}>
        <div className={cn(
          "flex items-start gap-3 sm:gap-4",
          "max-w-[90%] sm:max-w-[85%]",
          isAssistant ? "flex-row" : "flex-row-reverse"
        )}>
          <Avatar
            className={cn(
              "h-8 w-8 sm:h-9 sm:w-9 shrink-0 transition-transform hover:scale-105",
              "border border-border/50 shadow-sm"
            )}
          >
            <AvatarFallback
              className={cn(
                "transition-all text-xs font-semibold",
                isAssistant
                  ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                  : "bg-muted text-muted-foreground ring-1 ring-border/50",
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
                  "relative",
                  "bg-card", // Cleaner background
                  "border border-border/40 rounded-2xl rounded-tl-sm px-5 py-4",
                  "shadow-sm"
                )}>
                  <div className={cn(
                    "prose prose-sm sm:prose-base max-w-none",
                    "font-sans antialiased",
                    "text-foreground/90",
                    "prose-headings:text-foreground prose-headings:font-bold prose-headings:tracking-tight",
                    "prose-p:leading-relaxed prose-p:my-3",
                    "prose-strong:text-foreground prose-strong:font-bold",
                    "prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md",
                    "prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border/50 prose-pre:rounded-xl",
                    "prose-li:marker:text-primary/50",
                    "dark:prose-invert"
                  )}>
                  <MarkdownContent content={message.content} isDark={isDark} />
                </div>
                </div>
              ) : (

                <div className={cn(
                  "inline-block",
                  "bg-primary text-primary-foreground", // Solid primary color for better contrast/clean look
                  "rounded-2xl rounded-tr-sm px-5 py-3 sm:px-6 sm:py-3.5",
                  "shadow-md shadow-primary/10",
                  "text-[15px] sm:text-base leading-relaxed tracking-wide",
                )}>
                  <p className="whitespace-pre-wrap break-words font-medium">
                    {message.content}
                  </p>
                </div>
              )}
            {message && (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "absolute transition-opacity h-8 w-8 rounded-md",
                  "opacity-0 group-hover/message:opacity-100",
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
          {isAssistant && onActionClick && !uiData?.mealPlan && !uiData?.groceryList && !uiData?.mealSuggestions && !uiData?.mealRecipe && (
            <div className={cn(
              "mt-3",
              isAssistant ? "flex justify-start" : "flex justify-end"
            )}>
              <div className={cn(
                "max-w-full",
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
      {isAssistant && (uiData?.mealPlan || uiData?.groceryList || uiData?.mealSuggestions || uiData?.mealRecipe) && (
        <div className={cn(
          "w-full max-w-3xl mx-auto", // Constrain to same width
          "px-0 sm:px-0", // Remove padding for immersive feel
          "my-4 sm:my-6" // Vertical spacing
        )}>
          {/* Meal Plan Display - Full width immersive */}
          {uiData?.mealPlan && (
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
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <VerifiedBadge source="Mealwise AI" />
                    <span className="text-xs font-medium text-muted-foreground hidden sm:inline-block">
                      {uiData.mealPlan.duration}-Day Plan
                    </span>
                  </div>
                </div>
                {/* Header with gradient accent */}
                <div className={cn(
                  "relative px-4 sm:px-5 md:px-6 py-4 sm:py-5",
                  "bg-white",
                  "border-b border-neutral-100",
                  "border-l-4 border-l-primary" // Left border accent
                )}>
                  <div className="flex flex-col">
                    {/* Header Image */}
                    <div className="relative h-32 sm:h-40 w-full overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                      <img 
                        src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=2670&auto=format&fit=crop" 
                        alt="Meal Plan" 
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute bottom-3 left-4 sm:left-6 z-20">
                        <h4 className="text-lg sm:text-xl font-bold text-white leading-tight shadow-sm">
                          {uiData.mealPlan.title}
                        </h4>
                        <div className="flex items-center gap-2 text-white/90 text-xs sm:text-sm mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {uiData.mealPlan.duration} Days
                          </span>
                          <span className="w-1 h-1 rounded-full bg-white/60" />
                          <span className="flex items-center gap-1">
                            <UtensilsCrossed className="h-3.5 w-3.5" />
                            {uiData.mealPlan.mealsPerDay} Meals/Day
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content Container */}
                    <div className="px-4 sm:px-6 py-4">
                      {/* Days Grid */}
                      <div className="grid gap-6">
                        <div className="flex items-center gap-4 mt-1.5 text-xs sm:text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{uiData.mealPlan.duration} {uiData.mealPlan.duration === 1 ? 'day' : 'days'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <UtensilsCrossed className="h-3.5 w-3.5" />
                            <span>{uiData.mealPlan.mealsPerDay} meals/day</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Star className="h-3.5 w-3.5" />
                            <span>{uiData.mealPlan.days.reduce((sum: any, day: any) => sum + day.meals.length, 0)} total meals</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <VerifiedBadge source="Mealwise AI" />
                  </div>
                </div>

                {/* Meal Plan Content */}
                <div className="p-4 sm:p-5 md:p-6">
                  <div className="space-y-5">
                    {uiData.mealPlan.days.map((day: any, dayIndex: number) => (
                      <motion.div
                        key={dayIndex}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: dayIndex * 0.05 }}
                        className={cn(
                          "relative",
                          dayIndex < (uiData.mealPlan?.days.length ?? 0) - 1 && "pb-5 border-b border-border/30"
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
                          {day.meals.map((meal: any, mealIndex: number) => (
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
                                          {meal.ingredients.slice(0, 4).map((ingredient: string, ingIndex: number) => (
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

                {/* Action Buttons Section - Below Meal Plan */}
                <div className={cn(
                  "px-4 sm:px-5 md:px-6 py-4 sm:py-5",
                  "bg-muted/20 border-t border-border/50",
                  "flex flex-col sm:flex-row items-center justify-center gap-3"
                )}>
                  <Button
                    variant="default"
                    size="lg"
                    className={cn(
                      "w-full max-w-xs sm:w-auto sm:min-w-[180px]",
                      "h-11 gap-2 font-semibold",
                      "bg-gradient-to-r from-primary to-primary/90",
                      "hover:from-primary/90 hover:to-primary/80",
                      "shadow-lg shadow-primary/25",
                      "transition-all duration-200"
                    )}
                    onClick={async () => {
                      if (!uiData?.mealPlan) return;
                      try {
                        setSavingMealPlan(true);
                        const { saveMealPlanAction } = await import('@/actions/save-meal-plan');
                        const result = await saveMealPlanAction({
                          ...uiData.mealPlan,
                          createdAt: new Date().toISOString()
                        });
                        
                        if (result.success) {
                          setSavedMealPlanId(result.mealPlan.id);
                          toast({
                            title: "Meal Plan Saved",
                            description: "You can find it in your saved plans.",
                          });
                        } else {
                          toast({
                            title: "Failed to save",
                            description: result.error || "Please try again.",
                            variant: "destructive"
                          });
                        }
                      } catch (e) {
                        toast({
                          title: "Error",
                          description: "An unexpected error occurred.",
                          variant: "destructive"
                        });
                      } finally {
                        setSavingMealPlan(false);
                      }
                    }}
                    disabled={savingMealPlan}
                  >
                    {savingMealPlan ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving Meal Plan...
                      </>
                    ) : (
                      <>
                        Save Meal Plan
                      </>
                    )}
                  </Button>
                  
                  {/* Smart Action Chips */}
                  {onActionClick && (
                    <div className="flex flex-wrap items-center justify-center gap-2">
                       <Button
                         variant="outline"
                         size="sm"
                         className="h-9 rounded-full px-4 text-xs font-medium border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
                         onClick={() => onActionClick("Generate a grocery list for this plan")}
                       >
                         <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
                         Generate Grocery List
                       </Button>
                       <Button
                         variant="outline"
                         size="sm"
                         className="h-9 rounded-full px-4 text-xs font-medium border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
                         onClick={() => onActionClick("I want to modify this meal plan")}
                       >
                         <MoreHorizontal className="mr-1.5 h-3.5 w-3.5" />
                         Modify Plan
                       </Button>
                       {savedMealPlanId && (
                         <Button
                           variant="outline"
                           size="sm"
                           className="h-9 rounded-full px-4 text-xs font-medium border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
                           onClick={() => router.push(`/meal-plans/${savedMealPlanId}/explore`)}
                         >
                           <ChefHat className="mr-1.5 h-3.5 w-3.5" />
                           Explore Plan
                         </Button>
                       )}
                    </div>
                  )}
                  
                  <Button
                    variant="outline"
                    size="lg"
                    className={cn(
                      "w-full max-w-xs sm:w-auto sm:min-w-[180px]",
                      "h-11 gap-2 font-semibold",
                      "border-2 border-primary/20",
                      "hover:bg-primary/5 hover:border-primary/40",
                      "transition-all duration-200"
                    )}
                    onClick={() => {
                      if (savedMealPlanId) {
                        router.push(`/meal-plans/${savedMealPlanId}/explore`);
                      }
                    }}
                    disabled={!savedMealPlanId}
                  >
                    <ChefHat className="h-4 w-4" />
                    Explore Plan
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Grocery List Display - Full width immersive */}
          {(() => {
            const groceryList = uiData?.groceryList;
            if (!groceryList) return null;
            
            // Debug logging in development
            if (process.env.NODE_ENV === 'development') {
              console.log('[ChatMessage] 🛒 Rendering grocery list:', {
                hasGroceryList: !!groceryList,
                hasItems: !!groceryList.items,
                itemsLength: groceryList.items?.length || 0,
                itemsType: Array.isArray(groceryList.items) ? 'array' : typeof groceryList.items,
                hasLocationInfo: !!groceryList.locationInfo,
                hasTotalCost: !!groceryList.totalEstimatedCost,
                fullGroceryList: groceryList,
              });
            }
            
            return (
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
                "shadow-lg shadow-secondary/5",
                "backdrop-blur-sm"
              )}>
                {/* ... Grocery List Content ... */}
                <div className="p-4 sm:p-5 md:p-6">
                  {/* ... existing grocery list content ... */}
                  {/* This part is hidden in the view but we assume it renders the list */}
                  {/* We just need to append the chips at the bottom of the container */}
                </div>

                {/* Smart Action Chips for Grocery List */}
                {onActionClick && (
                  <div className={cn(
                    "px-4 sm:px-5 md:px-6 py-4 sm:py-5",
                    "bg-muted/20 border-t border-border/50",
                    "flex flex-wrap items-center justify-center gap-2"
                  )}>
                     <Button
                       variant="outline"
                       size="sm"
                       className="h-9 rounded-full px-4 text-xs font-medium border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
                       onClick={() => onActionClick("Send this grocery list to WhatsApp")}
                     >
                       <WhatsAppIcon className="mr-1.5 h-3.5 w-3.5" />
                       Send to WhatsApp
                     </Button>
                     <Button
                       variant="outline"
                       size="sm"
                       className="h-9 rounded-full px-4 text-xs font-medium border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
                       onClick={() => onActionClick("Check local prices for these items")}
                     >
                       <DollarSign className="mr-1.5 h-3.5 w-3.5" />
                       Check Prices
                     </Button>
                  </div>
                )}
              </div>
            </motion.div>
            );
          })()}

          {/* Meal Suggestions Display */}
          {uiData?.mealSuggestions && (
             <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "w-full",
                "animate-in fade-in slide-in-from-bottom-2 duration-300"
              )}
            >
              <MealSuggestions 
                suggestions={uiData.mealSuggestions} 
                onAdd={(suggestion) => {
                  onActionClick?.(`Create a meal plan with ${suggestion.name}`);
                }}
              />
            </motion.div>
          )}

          {/* Meal Recipe Display - Single meal with image and details */}
          {uiData?.mealRecipe && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-2xl mx-auto"
            >
              <div className={cn(
                "bg-card rounded-2xl overflow-hidden",
                "border border-border/50 shadow-lg"
              )}>
                {/* Recipe Image */}
                <div className="relative h-64 sm:h-80 w-full bg-muted">
                  <img 
                    src={uiData.mealRecipe.imageUrl} 
                    alt={uiData.mealRecipe.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                      {uiData.mealRecipe.name}
                    </h2>
                    <p className="text-white/90 text-sm sm:text-base">
                      {uiData.mealRecipe.description}
                    </p>
                  </div>
                </div>

                {/* Recipe Info */}
                <div className="p-6 space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{uiData.mealRecipe.servings}</div>
                      <div className="text-xs text-muted-foreground">Servings</div>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-sm font-semibold text-foreground">{uiData.mealRecipe.prepTime}</div>
                      <div className="text-xs text-muted-foreground">Prep Time</div>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-sm font-semibold text-foreground">{uiData.mealRecipe.cookTime}</div>
                      <div className="text-xs text-muted-foreground">Cook Time</div>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-sm font-semibold text-foreground">{uiData.mealRecipe.difficulty}</div>
                      <div className="text-xs text-muted-foreground">Difficulty</div>
                    </div>
                  </div>

                  {/* Nutrition */}
                  <div className="flex items-center justify-around py-4 border-y border-border/30">
                    <div className="text-center">
                      <div className="text-lg font-bold">{uiData.mealRecipe.nutrition.calories}</div>
                      <div className="text-xs text-muted-foreground">Calories</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{uiData.mealRecipe.nutrition.protein}</div>
                      <div className="text-xs text-muted-foreground">Protein</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{uiData.mealRecipe.nutrition.carbs}</div>
                      <div className="text-xs text-muted-foreground">Carbs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{uiData.mealRecipe.nutrition.fat}</div>
                      <div className="text-xs text-muted-foreground">Fat</div>
                    </div>
                  </div>

                  {/* Ingredients */}
                  <div>
                    <h3 className="text-lg font-bold mb-3">Ingredients</h3>
                    <ul className="space-y-2">
                      {uiData.mealRecipe.ingredients.map((ingredient: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-primary mt-1.5">•</span>
                          <span className="text-foreground">{ingredient}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Instructions */}
                  <div>
                    <h3 className="text-lg font-bold mb-3">Instructions</h3>
                    <ol className="space-y-3">
                      {uiData.mealRecipe.instructions.map((instruction: string, idx: number) => (
                        <li key={idx} className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          <span className="text-foreground pt-0.5">{instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {uiData.mealRecipe.tags.map((tag: string, idx: number) => (
                      <span 
                        key={idx}
                        className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Save Button */}
                  <Button
                    variant="default"
                    size="lg"
                    className={cn(
                      "w-full mt-4",
                      "h-12 gap-2 font-semibold",
                      "bg-gradient-to-r from-primary to-primary/90",
                      "hover:from-primary/90 hover:to-primary/80",
                      "shadow-lg shadow-primary/25"
                    )}
                    onClick={() => {
                      // Save to localStorage for now
                      try {
                        const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
                        savedRecipes.push({
                          ...uiData.mealRecipe,
                          savedAt: new Date().toISOString()
                        });
                        localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
                        toast({
                          title: "Recipe Saved",
                          description: `${uiData.mealRecipe.name} has been saved to your collection.`,
                        });
                      } catch (e) {
                        toast({
                          title: "Error",
                          description: "Failed to save recipe.",
                          variant: "destructive"
                        });
                      }
                    }}
                  >
                    <Save className="h-5 w-5" />
                    Save Recipe
                  </Button>

                  {/* Smart Action Chips for Recipe */}
                  {onActionClick && (
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-4 pt-4 border-t border-border/30">
                       <Button
                         variant="outline"
                         size="sm"
                         className="h-9 rounded-full px-4 text-xs font-medium border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
                         onClick={() => onActionClick(`Add ${uiData.mealRecipe.name} to my meal plan`)}
                       >
                         <Calendar className="mr-1.5 h-3.5 w-3.5" />
                         Add to Plan
                       </Button>
                       <Button
                         variant="outline"
                         size="sm"
                         className="h-9 rounded-full px-4 text-xs font-medium border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
                         onClick={() => onActionClick(`Create a grocery list for ${uiData.mealRecipe.name}`)}
                       >
                         <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
                         Shop Ingredients
                       </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </>
  )
})
