"use client"

import { User, Loader2, Copy, Check, Clock, AlertCircle, Calendar, UtensilsCrossed, ChefHat, Star, ShoppingCart, MapPin, Tag, DollarSign, Save, MoreHorizontal, ExternalLink } from "lucide-react"
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

import { QuickActions } from "./quick-actions"
import { ToolProgress, type ExecutionProgressData, type ToolProgressData } from "./tool-progress"

import { VerifiedBadge } from "./verified-badge"
import { MealPlanDisplay } from "./tools/meal-plan-display"
import { GroceryListDisplay } from "./tools/grocery-list-display"
import { NutritionDisplay } from "./tools/nutrition-display"
import { RecipeDisplay } from "./tools/recipe-display"
import { PricingDisplay } from "./tools/pricing-display"
import { MealSuggestions } from "./tools/meal-suggestions"
import { OptimizeGroceryListDisplay } from "./tools/optimize-grocery-list-display"
import { SubstitutionDisplay } from "./tools/substitution-display"
import { SeasonalDisplay } from "./tools/seasonal-display"
import { InventoryPlanDisplay } from "./tools/inventory-plan-display"
import { PrepTimelineDisplay } from "./tools/prep-timeline-display"
import { FoodDataDisplay } from "./tools/food-data-display"

interface ChatMessageProps {
  message?: Message
  isLoading?: boolean
  onActionClick?: (message: string) => void
  data?: any[]
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
  
  // Guard against null/undefined content to prevent render issues
  if (!content) return null
  
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Enhanced headings with better typography
        h1: ({ children }) => (
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4 mt-6 text-foreground border-b border-border/40 pb-2">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 mt-5 text-foreground">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-lg sm:text-xl font-semibold mb-2 mt-4 text-foreground">
            {children}
          </h3>
        ),
        
        // Enhanced links with external link indicator
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-primary hover:text-primary/80 underline decoration-primary/30 hover:decoration-primary/60 transition-colors font-medium inline-flex items-center gap-1"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
            {href?.startsWith('http') && (
              <ExternalLink className="inline h-3 w-3" />
            )}
          </a>
        ),
        
        // Enhanced blockquotes
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-primary/30 pl-4 py-1 italic my-4 text-muted-foreground bg-accent/30 rounded-r-lg">
            {children}
          </blockquote>
        ),
        
        // Enhanced tables with responsive wrapper
        table: ({ children }) => (
          <div className="overflow-x-auto my-6 rounded-lg border border-border shadow-sm">
            <table className="w-full divide-y divide-border">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-muted/50">
            {children}
          </thead>
        ),
        th: ({ children }) => (
          <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-4 py-3 text-sm text-foreground">
            {children}
          </td>
        ),
        
        // Enhanced lists with better spacing
        ul: ({ children }) => (
          <ul className="space-y-2 my-4 ml-6">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="space-y-2 my-4 ml-6 list-decimal">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="text-[15px] sm:text-base leading-relaxed">
            {children}
          </li>
        ),
        
        // Enhanced paragraphs
        p: ({ children }) => (
          <p className="text-[15px] sm:text-base leading-relaxed mb-4 text-foreground">
            {children}
          </p>
        ),
        
        // Code blocks with syntax highlighting
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
                className="rounded-xl !mt-0 !mb-0 !pt-10 !pb-4  !px-4 shadow-sm border border-border/50"
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
              "bg-accent/50 px-1.5 py-0.5 rounded-md text-[13px] sm:text-sm font-mono font-medium border border-accent",
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


export const ChatMessage = memo(function ChatMessage({ message, isLoading, onActionClick, data }: ChatMessageProps) {
  // All hooks must be called at the top level, before any conditional returns
  const [copied, setCopied] = useState(false)
  const [formattedTime, setFormattedTime] = useState('')
  const [isMounted, setIsMounted] = useState(false)
  const [savingMealPlan, setSavingMealPlan] = useState(false)
  const [savedMealPlanId, setSavedMealPlanId] = useState<string | null>(null)
  const [savingGroceryList, setSavingGroceryList] = useState(false)
  const [savedGroceryListId, setSavedGroceryListId] = useState<string | null>(null)
  const [savingRecipe, setSavingRecipe] = useState(false)
  const [savedRecipeId, setSavedRecipeId] = useState<string | null>(null)
  const { toast } = useToast()
  const { theme, systemTheme } = useTheme()
  const router = useRouter()
  const currentTheme = theme === 'system' ? systemTheme : theme
  const isDark = currentTheme === 'dark'

  // Clean message content by removing UI data markers
  const cleanContent = useMemo(() => {
    if (!message?.content) return '';
    return message.content
      .replace(/<!-- UI_DATA_START:[\s\S]*?:UI_DATA_END -->/g, '')
      .replace(/\[UI_METADATA:[^\]]+\]/g, '')
      .trim();
  }, [message?.content]);

  // Extract UI data from either legacy .ui property, embedded content, or toolInvocations
  const uiData = useMemo(() => {
    if (!message) return null;
    
    // 1. Prioritize direct .ui property (from ChatPanel)
    if (message.ui) return message.ui;
    
    // 2. Check for embedded UI data in the message content
    // Format: <!-- UI_DATA_START:BASE64_JSON:UI_DATA_END --> OR [UI_METADATA:BASE64_JSON]
    if (message.content) {
      // Try standard format first
      let match = message.content.match(/<!-- UI_DATA_START:([^:]+):UI_DATA_END -->/);
      
      // Try alternative format if not found
      if (!match) {
        match = message.content.match(/\[UI_METADATA:([^\]]+)\]/);
      }

      if (match && match[1]) {
        try {
          const decoded = Buffer.from(match[1], 'base64').toString('utf-8');
          const parsed = JSON.parse(decoded);
          console.log('[ChatMessage] Extracted embedded UI data:', parsed);
          return parsed;
        } catch (e) {
          console.error('[ChatMessage] Failed to parse embedded UI data:', e);
        }
      }
    }
    
    // 3. Fallback to toolInvocations (legacy)
    if (message.toolInvocations) {
      for (const tool of message.toolInvocations) {
        if (tool.state === 'result') {
          if (tool.toolName === 'generateMealPlan' && tool.result?.success) {
             return { mealPlan: tool.result.mealPlan };
          }
          if (tool.toolName === 'generateGroceryList' && tool.result?.success) {
             return { groceryList: tool.result.groceryList };
          }
          if (tool.toolName === 'getMealSuggestions' && tool.result?.success) {
             return { mealSuggestions: tool.result.suggestions };
          }
          if (tool.toolName === 'generateMealRecipe' && tool.result?.success) {
             return { mealRecipe: tool.result.recipe };
          }
          if (tool.toolName === 'analyzeNutrition' && tool.result?.success) {
             // Construct nutrition object to match UI expectation
             return { 
               nutrition: {
                 total: tool.result.totalNutrition,
                 dailyAverage: tool.result.dailyAverage,
                 insights: tool.result.insights,
                 healthScore: tool.result.healthScore,
                 summary: tool.result.summary,
                 type: 'plan' // Default assumption if missing
               }
             };
          }
          if (tool.toolName === 'getGroceryPricing' && tool.result?.success) {
             return { prices: tool.result.prices };
          }
          if (tool.toolName === 'searchRecipes' && tool.result?.success) {
             return { recipeResults: tool.result.recipes, query: tool.result.query };
          }
          if (tool.toolName === 'modifyMealPlan' && tool.result?.success) {
             return { mealPlan: tool.result.mealPlan };
          }
          if (tool.toolName === 'swapMeal' && tool.result?.success) {
             return { mealPlan: tool.result.mealPlan };
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
      if (active.toolName === 'searchRecipes') return 'Searching recipes...';
    }
    return null;
  }, [message]);

  // Determine active status from streaming data
  const statusMessage = useMemo(() => {
    if (!data || data.length === 0) return 'Thinking...';
    
    // Find the last status update
    for (let i = data.length - 1; i >= 0; i--) {
      const item = data[i];
      if (item && typeof item === 'object' && item.type === 'status') {
        return item.content;
      }
    }
    return 'Thinking...';
  }, [data]);

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
                    <span className="text-sm text-muted-foreground font-medium min-w-[80px] animate-pulse">
                      {statusMessage}
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
      await navigator.clipboard.writeText(cleanContent)
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
        "w-full py-6 sm:py-8",
        "animate-in fade-in slide-in-from-bottom-2 duration-300",
        "border-b border-border/5 last:border-0"
      )}
      role="article"
      aria-label={isAssistant ? "AI assistant message" : "Your message"}
      data-message-id={message?.id}
    >
      <div className={cn(
        "max-w-4xl mx-auto px-4 sm:px-6",
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
                  <MarkdownContent content={cleanContent} isDark={isDark} />
                </div>
                {/* Timestamp for Assistant */}
                {isMounted && message?.timestamp && formattedTime && (
                  <div className="flex justify-end mt-2 select-none">
                    <span className="text-[10px] sm:text-xs text-muted-foreground/60 font-medium">
                      {formattedTime}
                    </span>
                  </div>
                )}
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
                    {cleanContent}
                  </p>
                  {/* Timestamp & Status for User */}
                  <div className="flex items-center justify-end gap-1.5 mt-1.5 select-none">
                    {isMounted && message?.timestamp && formattedTime && (
                      <span className="text-[10px] sm:text-xs text-primary-foreground/70 font-medium">
                        {formattedTime}
                      </span>
                    )}
                    {!isAssistant && message?.status && (
                      <div className="flex items-center">
                        {message.status === 'sending' && (
                          <Clock className="h-3 w-3 text-primary-foreground/70 animate-pulse" aria-label="Sending" />
                        )}
                        {message.status === 'sent' && (
                          <Check className="h-3 w-3 text-primary-foreground/70" aria-label="Sent" />
                        )}
                        {message.status === 'failed' && (
                          <AlertCircle className="h-3 w-3 text-destructive-foreground" aria-label="Failed to send" />
                        )}
                      </div>
                    )}
                  </div>
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
      {isAssistant && (uiData?.mealPlan || uiData?.groceryList || uiData?.mealSuggestions || uiData?.mealRecipe || uiData?.nutrition || uiData?.prices || uiData?.recipeResults || uiData?.substitutions || uiData?.seasonal || uiData?.inventoryPlan || uiData?.prepTimeline || uiData?.foodData) && (
        <div className={cn(
          "w-full max-w-3xl mx-auto", // Constrain to same width
          "px-0 sm:px-0", // Remove padding for immersive feel
          "my-4 sm:my-6" // Vertical spacing
        )}>
          {/* Meal Plan Display */}
          {uiData?.mealPlan && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <MealPlanDisplay 
                mealPlan={uiData.mealPlan} 
                onActionClick={onActionClick} 
              />
            </motion.div>
          )}
          
          {/* Grocery List Display */}
          {uiData?.groceryList && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <GroceryListDisplay 
                groceryList={uiData.groceryList} 
                mealPlanId={uiData.mealPlan?.id}
                onActionClick={onActionClick} 
              />
            </motion.div>
          )}

          {/* Optimize Grocery List Display */}
          {uiData?.optimization && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-xl mx-auto"
            >
              <OptimizeGroceryListDisplay 
                optimization={uiData.optimization} 
                onActionClick={onActionClick} 
              />
            </motion.div>
          )}

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
                results={uiData.mealSuggestions} 
                onActionClick={(action: string) => {
                  onActionClick?.(action);
                }}
              />
            </motion.div>
          )}

          {/* Meal Recipe Display */}
          {uiData?.mealRecipe && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-2xl mx-auto"
            >
              <RecipeDisplay 
                recipe={uiData.mealRecipe} 
                onActionClick={onActionClick} 
              />
            </motion.div>
          )}
          {/* Nutrition Analysis Display */}
          {uiData?.nutrition && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-2xl mx-auto"
            >
              <NutritionDisplay nutrition={uiData.nutrition} onActionClick={onActionClick} />
            </motion.div>
          )}

          {/* Grocery Pricing Display */}
          {uiData?.prices && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-xl mx-auto"
            >
              <PricingDisplay 
                prices={uiData.prices} 
                onActionClick={onActionClick} 
              />
            </motion.div>
          )}

          {/* Recipe Search Results Display */}
          {uiData?.recipeResults && (
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
                results={uiData.recipeResults} 
                title={`Found ${uiData.recipeResults.length} recipes for "${uiData.query}"`}
                onActionClick={(action: string) => {
                  onActionClick?.(action);
                }}
              />
            </motion.div>
          )}

          {/* Ingredient Substitutions Display */}
          {uiData?.substitutions && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-2xl mx-auto"
            >
              <SubstitutionDisplay data={uiData.substitutions} />
            </motion.div>
          )}

          {/* Seasonal Ingredients Display */}
          {uiData?.seasonal && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-2xl mx-auto"
            >
              <SeasonalDisplay data={uiData.seasonal} onActionClick={onActionClick} />
            </motion.div>
          )}

          {/* Inventory Plan Display */}
          {uiData?.inventoryPlan && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-2xl mx-auto"
            >
              <InventoryPlanDisplay 
                data={uiData.inventoryPlan} 
                onActionClick={onActionClick} 
              />
            </motion.div>
          )}

          {/* Prep Timeline Display */}
          {uiData?.prepTimeline && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-2xl mx-auto"
            >
              <PrepTimelineDisplay data={uiData.prepTimeline} />
            </motion.div>
          )}

          {/* Food Data Display (searchFoodData) */}
          {uiData?.foodData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-2xl mx-auto"
            >
              <FoodDataDisplay data={uiData.foodData} onActionClick={onActionClick} />
            </motion.div>
          )}
        </div>
      )}
    </>
  )
})
