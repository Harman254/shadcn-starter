"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Home, Settings, Bell, User } from "lucide-react"
import { useTheme } from "next-themes"

interface MenuItem {
  icon: React.ReactNode
  label: string
  value: string
  gradient: string
  iconColor: string
  pro?: boolean
}

interface MenuBarProps {
  selected: string
  onSelect: (value: string) => void
  pro?: boolean
}

const menuItems: MenuItem[] = [
  {
    icon: <Home className="h-5 w-5" />,
    label: "Overview",
    value: "overview",
    gradient: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.06) 50%, rgba(29,78,216,0) 100%)",
    iconColor: "text-blue-500",
  },
  {
    icon: <Bell className="h-5 w-5" />,
    label: "Achievements",
    value: "achievements",
    gradient: "radial-gradient(circle, rgba(249,115,22,0.15) 0%, rgba(234,88,12,0.06) 50%, rgba(194,65,12,0) 100%)",
    iconColor: "text-orange-500",
  },
  {
    icon: <Settings className="h-5 w-5" />,
    label: "Nutrition",
    value: "nutrition",
    gradient: "radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(22,163,74,0.06) 50%, rgba(21,128,61,0) 100%)",
    iconColor: "text-green-500",
    pro: true,
  },
  {
    icon: <Settings className="h-5 w-5" />,
    label: "Planning",
    value: "planning",
    gradient: "radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(22,163,74,0.06) 50%, rgba(21,128,61,0) 100%)",
    iconColor: "text-green-500",
    pro: true,
  },
  {
    icon: <User className="h-5 w-5" />,
    label: "Recipes",
    value: "recipes",
    gradient: "radial-gradient(circle, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.06) 50%, rgba(185,28,28,0) 100%)",
    iconColor: "text-red-500",
    pro: true,
  },
  {
    icon: <Bell className="h-5 w-5" />,
    label: "Trends",
    value: "trends",
    gradient: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.06) 50%, rgba(29,78,216,0) 100%)",
    iconColor: "text-blue-500",
    pro: true,
  },
]

const itemVariants = {
  initial: { rotateX: 0, opacity: 1 },
  hover: { rotateX: -90, opacity: 0 },
}

const backVariants = {
  initial: { rotateX: 90, opacity: 0 },
  hover: { rotateX: 0, opacity: 1 },
}

const glowVariants = {
  initial: { opacity: 0, scale: 0.8 },
  hover: {
    opacity: 1,
    scale: 2,
    transition: {
      opacity: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
      scale: { duration: 0.5, type: "spring", stiffness: 300, damping: 25 },
    },
  },
}

const navGlowVariants = {
  initial: { opacity: 0 },
  hover: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

const sharedTransition = {
  type: "spring",
  stiffness: 100,
  damping: 20,
  duration: 0.5,
}

const MenuBar: React.FC<MenuBarProps> = ({ selected, onSelect, pro }) => {
  const { theme } = useTheme()
  const isDarkTheme = theme === "dark"

  return (
    <motion.nav
      className="p-2 rounded-2xl bg-gradient-to-b from-background/80 to-background/40 backdrop-blur-lg border border-border/40 shadow-lg relative overflow-hidden mb-8"
      initial="initial"
      whileHover="hover"
    >
      <motion.div
        className={`absolute -inset-2 bg-gradient-radial from-transparent ${
          isDarkTheme
            ? "blue-400/30 "
            : "blue-400/20 "
        } to-transparent rounded-3xl z-0 pointer-events-none`}
        variants={navGlowVariants}
      />
      <ul className="flex items-center gap-2 relative z-10">
        {menuItems.map((item) => {
          const isDisabled = item.pro && !pro
          const isSelected = selected === item.value
          return (
            <motion.li key={item.value} className="relative">
              <motion.div
                className={`block rounded-xl overflow-visible group relative ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                style={{ perspective: "600px" }}
                whileHover={!isDisabled ? "hover" : undefined}
                initial="initial"
                onClick={() => !isDisabled && onSelect(item.value)}
                tabIndex={isDisabled ? -1 : 0}
                aria-disabled={isDisabled}
              >
                <motion.div
                  className="absolute inset-0 z-0 pointer-events-none"
                  variants={glowVariants}
                  style={{
                    background: item.gradient,
                    opacity: 0,
                    borderRadius: "16px",
                  }}
                />
                <motion.div
                  className={`flex items-center gap-2 px-4 py-2 relative z-10 bg-transparent rounded-xl transition-colors ${isSelected ? "bg-zinc-200 dark:bg-zinc-800" : ""}`}
                  variants={itemVariants}
                  transition={sharedTransition}
                  style={{ transformStyle: "preserve-3d", transformOrigin: "center bottom" }}
                >
                  <span className={`transition-colors duration-300 group-hover:${item.iconColor} text-foreground`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {item.pro && !pro && (
                    <span className="ml-1 text-xs text-muted-foreground">Pro</span>
                  )}
                </motion.div>
                <motion.div
                  className={`flex items-center gap-2 px-4 py-2 absolute inset-0 z-10 bg-transparent rounded-xl transition-colors ${isSelected ? "bg-zinc-200 dark:bg-zinc-800" : ""}`}
                  variants={backVariants}
                  transition={sharedTransition}
                  style={{ transformStyle: "preserve-3d", transformOrigin: "center top", rotateX: 90 }}
                >
                  <span className={`transition-colors duration-300 group-hover:${item.iconColor} text-foreground`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {item.pro && !pro && (
                    <span className="ml-1 text-xs text-muted-foreground">Pro</span>
                  )}
                </motion.div>
              </motion.div>
            </motion.li>
          )
        })}
      </ul>
    </motion.nav>
  )
}

export default MenuBar;
