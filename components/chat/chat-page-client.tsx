'use client';

import { useState } from 'react';
import { Leaf, Menu } from 'lucide-react';
import { ChatPanel } from '@/components/chat/chat-panel';
import { ChatHistoryClient } from '@/components/chat/chat-history-client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

export function ChatPageClient() {
  const [activeTab, setActiveTab] = useState('meal-log');
  const [historyOpen, setHistoryOpen] = useState(false);

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
                
                <div className="relative shrink-0">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-primary flex items-center justify-center shadow-medium">
                    <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-primary rounded-full border-2 border-white animate-pulse-soft" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-base sm:text-lg font-bold text-foreground truncate">Mealwise AI</h1>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Your nutrition companion</p>
                </div>
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto shrink-0">
                <TabsList className="bg-muted/80 backdrop-blur-sm p-1 h-9 sm:h-10 rounded-lg sm:rounded-xl border border-border/30">
                  <TabsTrigger 
                    value="meal-log" 
                    className="text-xs sm:text-sm px-3 sm:px-4 rounded-md sm:rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-soft data-[state=active]:text-primary transition-all"
                  >
                    Track Meals
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Chat Panel Integration */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 overflow-hidden w-full">
            <TabsContent value="meal-log" className="flex-1 m-0 flex flex-col min-h-0 overflow-hidden w-full h-full">
              <ChatPanel chatType="context-aware" />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

