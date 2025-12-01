'use client';

import { useState, useEffect } from 'react';
import { Menu, Wand2, Plus, History, MessageSquare } from 'lucide-react';
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
        <Skeleton key={i} className="h-12 w-full rounded-lg bg-muted/50" />
      ))}
    </div>
  ),
  ssr: false
});

import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { UserPreference } from '@/types';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/store/chat-store';

interface ChatPageClientProps {
  preferences?: UserPreference[];
  preferencesSummary?: string;
}

export function ChatPageClient({ preferences = [], preferencesSummary = '' }: ChatPageClientProps) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const createSession = useChatStore((state) => state.createSession);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNewChat = () => {
    createSession('context-aware');
    setHistoryOpen(false); // Close mobile menu if open
  };

  if (!mounted) return null;

  return (
    <div className="flex h-[100dvh] w-full bg-background overflow-hidden">
      {/* Sidebar (Desktop) */}
      <div className="hidden md:flex w-[260px] flex-col border-r border-border/40 bg-muted/5 h-full">
        <div className="flex-1 overflow-hidden">
          <ChatHistoryClient chatType="context-aware" />
        </div>
        <div className="p-4 border-t border-border/40">
           <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-primary/5 text-sm font-medium text-primary">
              <div className="p-1.5 bg-primary/10 rounded-md">
                <Wand2 className="h-4 w-4" />
              </div>
              <span>Mealwise AI</span>
           </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-background relative">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-20">
          <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="-ml-2">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0 flex flex-col">
              <SheetHeader className="p-4 border-b border-border/40 text-left">
                <SheetTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-primary" />
                  Mealwise
                </SheetTitle>
              </SheetHeader>
              <div className="p-4">
                 <Button onClick={handleNewChat} className="w-full justify-start gap-2" variant="outline">
                    <Plus className="h-4 w-4" />
                    New Chat
                 </Button>
              </div>
              <div className="flex-1 overflow-hidden">
                <ChatHistoryClient 
                  chatType="context-aware"
                  onSessionSelect={() => setHistoryOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Chat Area */}
        <div className="flex-1 relative min-h-0">
           <ChatPanel chatType="context-aware" preferencesSummary={preferencesSummary} />
        </div>
      </div>
    </div>
  );
}
