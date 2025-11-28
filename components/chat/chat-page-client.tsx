'use client';

import { useState, useEffect } from 'react';
import { Menu, Wand2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load heavy components
const ChatPanel = dynamic(() => import('@/components/chat/chat-panel').then(mod => mod.ChatPanel), {
  loading: () => (
    <div className="flex-1 flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading chat...</p>
      </div>
    </div>
  ),
  ssr: false // Chat relies heavily on client state
});

const ChatHistoryClient = dynamic(() => import('@/components/chat/chat-history-client').then(mod => mod.ChatHistoryClient), {
  loading: () => (
    <div className="p-4 space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-16 w-full rounded-xl bg-muted/50" />
      ))}
    </div>
  ),
  ssr: false
});
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
    <div className="flex h-[100dvh] w-full bg-background overflow-hidden">
      {/* Left Sidebar - Chat History (Desktop) */}
      <div className={cn(
        "hidden lg:flex w-[300px] xl:w-[350px] border-r border-border/50 bg-muted/10",
        "flex-col h-full"
      )}>
        <ChatHistoryClient 
          chatType={activeTab === 'meal-log' ? 'context-aware' : 'context-aware'} 
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-background relative">
        {/* Header */}
        <div className={cn(
          "sticky top-0 z-20",
          "px-4 py-3 border-b border-border/50",
          "bg-background/80 backdrop-blur-md",
          "flex items-center justify-between",
          "safe-area-top"
        )}>
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden shrink-0 h-10 w-10"
                  aria-label="Open chat history"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] p-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>Chat History</SheetTitle>
                </SheetHeader>
                <ChatHistoryClient 
                  chatType={activeTab === 'meal-log' ? 'context-aware' : 'context-aware'}
                  onSessionSelect={() => setHistoryOpen(false)}
                />
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Wand2 className="h-4 w-4 text-primary" />
              </div>
              <h1 className="font-semibold text-lg hidden sm:block">Mealwise Chat</h1>
            </div>
          </div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 min-h-0 relative">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="h-full flex flex-col"
          >
            <TabsContent 
              value="meal-log" 
              className="flex-1 m-0 h-full"
            >
              <ChatPanel chatType="context-aware" preferencesSummary={preferencesSummary} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
