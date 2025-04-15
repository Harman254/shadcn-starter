import type * as React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { ChatSidebar } from "./chat-sidebar"


const ChatLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <ChatSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}

export default ChatLayout
