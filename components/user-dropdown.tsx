"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserCog, User, LogOut, ChevronDown } from "lucide-react"
import { signOut } from "@/lib/auth-client"
import SignOut from "./auth/sign-out"
import { useRouter } from "next/navigation"

interface UserDropdownProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

// Get user initials for avatar fallback
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function UserDropdown({ user }: UserDropdownProps) {

  const router = useRouter()
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="group relative w-full justify-start gap-3 h-auto p-3 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 ease-out rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50"
        >
          <div className="relative">
            <Avatar className="h-10 w-10 ring-2 ring-slate-200 dark:ring-slate-700 group-hover:ring-slate-300 dark:group-hover:ring-slate-600 transition-all duration-300">
              <AvatarImage src={user.image || ""} alt={user.name || ""} />
              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm font-bold shadow-inner">
                {getInitials(user.name || "User")}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm"></div>
          </div>

          <div className="flex flex-col items-start text-left min-w-0 flex-1">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate w-full group-hover:text-slate-800 dark:group-hover:text-white transition-colors">
              {user.name || "User"}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 truncate w-full group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
              {user.email}
            </span>
          </div>

          <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-all duration-300 group-hover:rotate-180" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 p-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl shadow-slate-900/10 dark:shadow-slate-900/50 rounded-2xl"
        sideOffset={8}
      >
        <div className="px-3 py-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl mb-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 ring-2 ring-white dark:ring-slate-600 shadow-lg">
              <AvatarImage src={user.image || ""} alt={user.name || ""} />
              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold">
                {getInitials(user.name || "User")}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">{user.name || "User"}</span>
              <span className="text-sm text-slate-600 dark:text-slate-400 truncate">{user.email}</span>
            </div>
          </div>
        </div>

        <DropdownMenuLabel className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3">
          Account
        </DropdownMenuLabel>

        <DropdownMenuItem className="group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 focus:bg-slate-100 dark:focus:bg-slate-800">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <Button onClick={() =>router.push('/dashboard/profile') } className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100">
            Profile
          </Button>
        </DropdownMenuItem>

        <DropdownMenuItem className="group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 focus:bg-slate-100 dark:focus:bg-slate-800">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
            <UserCog className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100">
            Settings
          </span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-2 bg-slate-200 dark:bg-slate-700" />

        <DropdownMenuItem asChild className="cursor-pointer group">
          <SignOut />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
