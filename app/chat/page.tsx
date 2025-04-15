"use client"

import type React from "react"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useChat } from "@ai-sdk/react"





import {
  ChefHat,
  Send,
  Loader2,
  UtensilsCrossed,
  BookmarkPlus,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  Search,
} from "lucide-react"
import { useRef, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export default function KitchenAssistant() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, reload, stop } = useChat({
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hello! I'm your kitchen assistant. Ask me about recipes, cooking techniques, ingredient substitutions, or any other kitchen-related questions!",
      },
    ],
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [quickPrompts, setQuickPrompts] = useState([
    "Suggest a quick dinner recipe",
    "How do I substitute eggs in baking?",
    "What can I make with chicken and pasta?",
    "Tips for meal prepping",
    "Healthy breakfast ideas",
    "How to properly store leftovers",
  ])
  const [savedResponses, setSavedResponses] = useState<{ id: string; content: string; timestamp: string }[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("chat")

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+N to focus on input
      if (e.altKey && e.key === "n") {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleQuickPrompt = (prompt: string) => {
    const fakeEvent = {
      preventDefault: () => {},
      currentTarget: { reset: () => {} },
    } as unknown as React.FormEvent<HTMLFormElement>

    handleInputChange({ target: { value: prompt } } as React.ChangeEvent<HTMLInputElement>)
    setTimeout(() => handleSubmit(fakeEvent), 100)
  }

  const saveResponse = (id: string, content: string) => {
    const timestamp = new Date().toLocaleString()
    setSavedResponses([...savedResponses, { id, content, timestamp }])
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const clearChat = () => {
    reload()
  }

  const formatMessageContent = (content: string) => {
    // Format recipe steps with numbers
    const formattedContent = content
      .replace(/(\d+\.\s)/g, '<span class="font-semibold">$1</span>')
      // Bold ingredient names
      .replace(
        /(\b(?:flour|sugar|butter|eggs|milk|salt|pepper|oil|water|chicken|beef|pork|fish)\b)/gi,
        '<span class="font-semibold text-amber-800">$1</span>',
      )
      // Format cooking times
      .replace(/(\d+\s(?:minutes|hours|mins|hrs))/gi, '<span class="text-amber-700">$1</span>')
      // Format temperature
      .replace(/(\d+(?:°F|°C|degrees))/g, '<span class="text-amber-700">$1</span>')

    return <div dangerouslySetInnerHTML={{ __html: formattedContent }} />
  }

  return (
    <div className="flex flex-col shadow-md m-3 h-full">
      <header className="flex h-14 items-center gap-4 border-b px-4 bg-amber-50">
        <SidebarTrigger />
        <div className="flex items-center gap-2">
          <ChefHat className="h-6 w-6 text-amber-600" />
          <h1 className="font-semibold text-amber-800">Kitchen Assistant</h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 border-amber-200 text-amber-700"
                  onClick={clearChat}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>New conversation</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b bg-amber-50/50 px-4">
          <TabsList className="bg-amber-100/50 w-full justify-start h-10 p-1">
            <TabsTrigger value="chat" className="data-[state=active]:bg-white">
              Chat
            </TabsTrigger>
            <TabsTrigger value="saved" className="data-[state=active]:bg-white">
              Saved Recipes
              {savedResponses.length > 0 && (
                <Badge variant="secondary" className="ml-2 bg-amber-200 text-amber-800">
                  {savedResponses.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="chat" className="flex-1 flex flex-col p-0 m-0">
          <div className="flex-1 overflow-y-auto p-4 bg-[#FFF8F0]">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={cn(
                    "p-3 rounded-lg max-w-[85%] relative group",
                    message.role === "user"
                      ? "bg-amber-500 text-white rounded-tr-none"
                      : "bg-white text-gray-800 rounded-tl-none border border-amber-100 shadow-sm",
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="absolute -top-2 -left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7 rounded-full bg-white border-amber-200"
                              onClick={() => saveResponse(message.id, message.content)}
                            >
                              <BookmarkPlus className="h-3.5 w-3.5 text-amber-600" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Save this recipe</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}

                  {message.role === "assistant" ? (
                    <div>
                      {formatMessageContent(message.content)}

                      <div className="mt-2 pt-2 border-t border-amber-100 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs text-amber-400">
                          {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs text-amber-600"
                          onClick={() => copyToClipboard(message.content, message.id)}
                        >
                          {copiedId === message.id ? (
                            <Check className="h-3 w-3 mr-1" />
                          ) : (
                            <Copy className="h-3 w-3 mr-1" />
                          )}
                          {copiedId === message.id ? "Copied" : "Copy"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="p-3 rounded-lg bg-white text-gray-800 rounded-tl-none border border-amber-100 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 rounded-full bg-amber-400 animate-bounce" />
                      <div
                        className="h-2 w-2 rounded-full bg-amber-500 animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                      <div
                        className="h-2 w-2 rounded-full bg-amber-600 animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      />
                    </div>
                    <span className="text-amber-700 text-sm font-medium">Cooking up a response...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-amber-50 border-t border-amber-100">
            <p className="text-sm text-amber-800 mb-2 font-medium">Quick questions:</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {quickPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="bg-white border-amber-200 hover:bg-amber-100 text-amber-800 text-xs"
                  onClick={() => handleQuickPrompt(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-white border-t border-amber-100">
            <form onSubmit={handleSubmit} className="flex w-full gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                placeholder="Ask about recipes, cooking tips, etc... (Alt+N)"
                className="flex-grow border-amber-200 focus-visible:ring-amber-500"
                aria-label="Your message"
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className="bg-amber-500 hover:bg-amber-600 text-white"
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      <span className="sr-only">Send message</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Send message (Enter)</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </form>
            <div className="mt-2 text-amber-800/60 text-xs flex items-center justify-center gap-1">
              <UtensilsCrossed className="h-3 w-3" />
              <span>Press Alt+N to quickly focus the input</span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="saved" className="flex-1 overflow-y-auto p-4 m-0 bg-[#FFF8F0]">
          {savedResponses.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-amber-700">
              <BookmarkPlus className="h-12 w-12 mb-2 text-amber-300" />
              <h3 className="text-lg font-medium mb-1">No saved recipes yet</h3>
              <p className="text-sm text-amber-600 text-center max-w-md">
                When you find a helpful recipe or tip, click the bookmark icon to save it for later reference.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-amber-800">Your Saved Recipes</h2>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-amber-500" />
                  <Input
                    placeholder="Search saved recipes..."
                    className="pl-9 border-amber-200 focus-visible:ring-amber-500"
                  />
                </div>
              </div>

              {savedResponses.map((item) => (
                <Card key={item.id} className="border-amber-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        {item.timestamp}
                      </Badge>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-amber-600"
                          onClick={() => copyToClipboard(item.content, item.id)}
                        >
                          {copiedId === item.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-amber-600"
                          onClick={() => setSavedResponses(savedResponses.filter((r) => r.id !== item.id))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-800 mt-2">{formatMessageContent(item.content)}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
