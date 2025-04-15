"use client"

import * as React from "react"
import {  MessageSquare, Search, Plus } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarGroupAction,
} from "@/components/ui/sidebar"

// Sample chat history data
const chatHistory = [
  {
    id: "1",
    title: "Project planning assistance",
    lastMessage: "Can you help me plan my next project?",
    isActive: true,
  },
  {
    id: "2",
    title: "Code review help",
    lastMessage: "Could you review this React component?",
    isActive: false,
  },
  {
    id: "3",
    title: "API integration questions",
    lastMessage: "How do I integrate with the OpenAI API?",
    isActive: false,
  },
  {
    id: "4",
    title: "Database schema design",
    lastMessage: "What's the best schema for my app?",
    isActive: false,
  },
]

export function ChatSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [chats, setChats] = React.useState(chatHistory)
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredChats = chats.filter((chat) => chat.title.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleNewChat = () => {
    const newChat = {
      id: `${chats.length + 1}`,
      title: "New conversation",
      lastMessage: "Start a new conversation",
      timestamp: "Just now",
      isActive: true,
    }

    // Set all other chats to inactive
    const updatedChats = chats.map((chat) => ({
      ...chat,
      isActive: false,
    }))

    setChats([newChat, ...updatedChats])
  }

  const handleSelectChat = (selectedId: string) => {
    const updatedChats = chats.map((chat) => ({
      ...chat,
      isActive: chat.id === selectedId,
    }))
    setChats(updatedChats)
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-between p-2">
          <h2 className="text-lg font-semibold">Chats</h2>
          <Button variant="ghost" size="icon" onClick={handleNewChat} title="New Chat">
            <MessageSquare className="h-5 w-5" />
          </Button>
        </div>
        <div className="px-2 pb-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search conversations..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Recent Conversations</SidebarGroupLabel>
          <SidebarGroupAction>
            <Plus className="h-4 w-4" />
            <span className="sr-only">New Chat</span>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredChats.map((chat) => (
                <SidebarMenuItem key={chat.id}>
                  <SidebarMenuButton className="p-4 m-3" isActive={chat.isActive} onClick={() => handleSelectChat(chat.id)}>
                    <MessageSquare className="h-4 w-4" />
                    <div className="flex flex-col overflow-hidden">
                      <span className="truncate">{chat.title}</span>
                      <span className="text-xs text-muted-foreground truncate">{chat.lastMessage}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
