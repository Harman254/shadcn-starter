'use client';

import { useState, useEffect } from 'react';
import { Menu, Wand2 } from 'lucide-react';
import { ChatPanel } from '@/components/chat/chat-panel';
import { ChatHistoryClient } from '@/components/chat/chat-history-client';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { UserPreference } from '@/types';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ChatPageClientProps {
  preferences?: UserPreference[];
  preferencesSummary?: string;
}

export function ChatPageClient({ preferences = [], preferencesSummary = '' }: ChatPageClientProps) {
  const [activeTab, setActiveTab] = useState('meal-log');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={cn(
      "min-h-screen w-full",
      "bg-gradient-to-br from-background via-background to-primary/5",
      "dark:from-background dark:via-background dark:to-primary/10",
      "flex items-center justify-center",
      "p-0 sm:p-3 md:p-4 lg:p-6",
      "font-[Inter] antialiased",
      "relative overflow-hidden"
    )}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className={cn(
        "relative z-10 w-full",
        "max-w-[1800px]",
        "h-[100dvh] sm:h-[calc(100dvh-24px)] md:h-[calc(100dvh-32px)] lg:h-[calc(100dvh-48px)]",
        "flex flex-col lg:flex-row gap-0 sm:gap-3 md:gap-4 lg:gap-6"
      )}>
        {/* Left Sidebar - Chat History (Desktop) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={cn(
            "hidden lg:flex lg:w-[380px] xl:w-[420px]",
            "flex-col h-full",
            "animate-in fade-in slide-in-from-left-4 duration-300"
          )}
        >
          <Card className={cn(
            "h-full flex flex-col",
            "bg-card/95 dark:bg-card/90",
            "backdrop-blur-xl backdrop-saturate-150",
            "border border-border/60",
            "shadow-xl shadow-black/5 dark:shadow-black/20",
            "rounded-2xl sm:rounded-3xl",
            "overflow-hidden",
            "transition-all duration-300"
          )}>
          <ChatHistoryClient 
            chatType={activeTab === 'meal-log' ? 'context-aware' : 'context-aware'} 
          />
        </Card>
        </motion.div>

        {/* Main Chat Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={cn(
            "flex-1 flex flex-col h-full",
            "bg-background/95 dark:bg-background/90",
            "backdrop-blur-xl backdrop-saturate-150",
            "border border-border/60",
            "shadow-xl shadow-black/5 dark:shadow-black/20",
            "rounded-none sm:rounded-2xl md:rounded-3xl",
            "overflow-hidden",
            "transition-all duration-300",
            "relative"
          )}>
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none opacity-50" />
          
          {/* Header */}
          <div className={cn(
            "relative z-10",
            "px-4 sm:px-5 md:px-6 lg:px-8",
            "py-3.5 sm:py-4",
            "border-b border-border/50",
            "bg-background/80 dark:bg-background/70",
            "backdrop-blur-sm",
            "shrink-0",
            "flex items-center justify-between",
            "safe-area-top" // Support for notched devices
          )}>
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                {/* Mobile Menu Button & Drawer */}
                <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                    className={cn(
                      "lg:hidden shrink-0",
                      "h-9 w-9 sm:h-10 sm:w-10",
                      "rounded-xl",
                      "hover:bg-muted/80",
                      "transition-all duration-200",
                      "hover:scale-105 active:scale-95"
                    )}
                    aria-label="Open chat history"
                    >
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                <SheetContent 
                  side="left" 
                  className={cn(
                    "w-[360px] sm:w-[400px] p-0 overflow-hidden",
                    "bg-card/95 dark:bg-card/90",
                    "backdrop-blur-xl",
                    "border-r border-border/60"
                  )}
                >
                    <SheetHeader className="sr-only">
                      <SheetTitle>Chat History</SheetTitle>
                      <SheetDescription>View and manage your conversation history</SheetDescription>
                    </SheetHeader>
                    <div className="h-full flex flex-col">
                      <ChatHistoryClient 
                        chatType={activeTab === 'meal-log' ? 'context-aware' : 'context-aware'}
                      onSessionSelect={() => setHistoryOpen(false)}
                      />
                    </div>
                  </SheetContent>
                </Sheet>

              {/* Title */}
              <div className="flex items-center gap-2 min-w-0">
                <div className={cn(
                  "p-1.5 sm:p-2 rounded-xl",
                  "bg-gradient-to-br from-primary/10 to-primary/5",
                  "border border-primary/20"
                )}>
                  <Wand2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <h1 className={cn(
                  "text-base sm:text-lg font-semibold text-foreground",
                  "truncate",
                  "hidden sm:block"
                )}>
                  Mealwise Chat
                </h1>
              </div>
            </div>
          </div>

          {/* Chat Panel Integration */}
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="flex-1 flex flex-col min-h-0 overflow-hidden w-full relative z-10"
          >
            <TabsContent 
              value="meal-log" 
              className={cn(
                "flex-1 m-0 flex flex-col min-h-0 overflow-hidden w-full h-full",
                "data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:duration-300"
              )}
            >
              <ChatPanel chatType="context-aware" preferencesSummary={preferencesSummary} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
