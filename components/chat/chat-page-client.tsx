'use client';

import { useState } from 'react';
import { Leaf, Menu } from 'lucide-react';
import { ChatPanel } from '@/components/chat/chat-panel';
import { ChatHistoryClient } from '@/components/chat/chat-history-client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useMemo } from 'react';
import { UserPreference } from '@/types';
import { formatPreferencesForAI, type FormattedUserPreference } from '@/lib/utils/preferences';

interface ChatPageClientProps {
  preferences?: UserPreference[];
}

export function ChatPageClient({ preferences = [] }: ChatPageClientProps) {
  const [activeTab, setActiveTab] = useState('meal-log');
  const [historyOpen, setHistoryOpen] = useState(false);

  // Memoize formatted preferences to avoid re-computation on every render
  const formattedPreferences = useMemo<FormattedUserPreference[] | undefined>(
    () => formatPreferencesForAI(preferences),
    [preferences]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 flex items-center justify-center p-2 sm:p-4 font-[Inter]">
      <div className="w-full max-w-[1600px] h-[95vh] sm:h-[92vh] md:h-[90vh] lg:h-[88vh] flex gap-2 sm:gap-4">
        
        {/* Left Sidebar - Chat History (Desktop) */}
        <Card className="w-[360px] hidden lg:flex flex-col bg-card/80 backdrop-blur-xl border-border/50 shadow-medium overflow-hidden animate-fade-in">
          <ChatHistoryClient 
            chatType={activeTab === 'meal-log' ? 'context-aware' : 'context-aware'} 
          />
        </Card>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-background border border-border/50 rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden animate-scale-in">
          
          {/* Header */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border/50 bg-background shrink-0">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                {/* Mobile Menu Button & Drawer */}
                <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="lg:hidden shrink-0"
                    >
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[360px] sm:w-[400px] p-0 overflow-hidden">
                    <SheetHeader className="sr-only">
                      <SheetTitle>Chat History</SheetTitle>
                      <SheetDescription>View and manage your conversation history</SheetDescription>
                    </SheetHeader>
                    <div className="h-full flex flex-col">
                      <ChatHistoryClient 
                        chatType={activeTab === 'meal-log' ? 'context-aware' : 'context-aware'}
                        onSessionSelect={() => setHistoryOpen(false)} // Close drawer when session selected
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>

          {/* Chat Panel Integration */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 overflow-hidden w-full">
            <TabsContent value="meal-log" className="flex-1 m-0 flex flex-col min-h-0 overflow-hidden w-full h-full">
              <ChatPanel chatType="context-aware" userPreferences={formattedPreferences} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

