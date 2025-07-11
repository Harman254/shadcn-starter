import * as React from "react"
import { motion } from "framer-motion"
import { Home, BarChart3, Calendar, ChefHat, TrendingUp, Bell } from "lucide-react"

const menuItems = [
  {
    icon: <Home className="h-4 w-4 sm:h-5 sm:w-5" />,
    label: "Overview",
    value: "overview",
    gradient: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.06) 50%, rgba(29,78,216,0) 100%)",
    iconColor: "text-blue-500",
  },
  {
    icon: <Bell className="h-4 w-4 sm:h-5 sm:w-5" />,
    label: "Achievements",
    value: "achievements",
    gradient: "radial-gradient(circle, rgba(249,115,22,0.15) 0%, rgba(234,88,12,0.06) 50%, rgba(194,65,12,0) 100%)",
    iconColor: "text-orange-500",
  },
  {
    icon: <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />,
    label: "Nutrition",
    value: "nutrition",
    gradient: "radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(22,163,74,0.06) 50%, rgba(21,128,61,0) 100%)",
    iconColor: "text-green-500",
    pro: true,
  },
  {
    icon: <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />,
    label: "Planning",
    value: "planning",
    gradient: "radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(22,163,74,0.06) 50%, rgba(21,128,61,0) 100%)",
    iconColor: "text-green-500",
    pro: true,
  },
  {
    icon: <ChefHat className="h-4 w-4 sm:h-5 sm:w-5" />,
    label: "Recipes",
    value: "recipes",
    gradient: "radial-gradient(circle, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.06) 50%, rgba(185,28,28,0) 100%)",
    iconColor: "text-red-500",
    pro: true,
  },
  {
    icon: <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />,
    label: "Trends",
    value: "trends",
    gradient: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.06) 50%, rgba(29,78,216,0) 100%)",
    iconColor: "text-blue-500",
    pro: true,
  },
]

const itemVariants = {
  initial: { scale: 1, opacity: 1 },
  hover: { scale: 1.05, opacity: 1 },
}

const glowVariants = {
  initial: { opacity: 0, scale: 0.8 },
  hover: {
    opacity: 1,
    scale: 1.2,
    transition: {
      opacity: { duration: 0.3, ease: "easeOut" },
      scale: { duration: 0.3, type: "spring", stiffness: 300, damping: 25 },
    },
  },
}

const sharedTransition = {
  type: "spring",
  stiffness: 200,
  damping: 20,
  duration: 0.3,
}

// Add prop types for MenuBar
interface MenuBarProps {
  selected: string;
  onSelect: (value: string) => void;
  pro?: boolean;
}

const MenuBar = ({ selected, onSelect, pro }: MenuBarProps) => {
  const [hovered, setHovered] = React.useState<string | null>(null)

  // Keyboard accessibility handler
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    isDisabled: boolean,
    value: string
  ) => {
    if (isDisabled) return
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onSelect(value)
    }
  }

  return (
    <motion.nav
      className="p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-gradient-to-b from-background/80 to-background/40 backdrop-blur-lg border border-border/40 shadow-lg relative mb-6 sm:mb-8"
      initial="initial"
      whileHover="hover"
      style={{
        minHeight: '56px',
        contain: 'layout style paint',
        isolation: 'isolate',
      }}
    >
      <ul className="flex flex-nowrap items-center gap-1 sm:gap-2 relative z-10 overflow-x-auto w-full scrollbar-hide h-10 sm:h-12">
        {menuItems.map((item) => {
          const isDisabled = !!(item.pro && !pro)
          const isSelected = selected === item.value
          const isHovered = hovered === item.value
          return (
            <motion.li key={item.value} className="relative flex-shrink-0">
              <motion.div
                className={`block rounded-lg sm:rounded-xl group relative ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                style={{ 
                  perspective: "600px",
                  transformStyle: "preserve-3d",
                  contain: 'layout style paint',
                  minWidth: 'fit-content',
                }}
                whileHover={!isDisabled ? "hover" : undefined}
                initial="initial"
                onClick={() => !isDisabled && onSelect(item.value)}
                tabIndex={isDisabled ? -1 : 0}
                aria-disabled={isDisabled}
                onKeyDown={(e) => handleKeyDown(e, isDisabled, item.value)}
                onMouseEnter={() => setHovered(item.value)}
                onMouseLeave={() => setHovered(null)}
                role="button"
                aria-pressed={isSelected}
              >
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  variants={glowVariants}
                  style={{
                    background: item.gradient,
                    opacity: 0,
                    borderRadius: "12px",
                    zIndex: 0,
                    willChange: 'opacity, transform',
                  }}
                />
                <motion.div
                  className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 relative bg-transparent rounded-lg sm:rounded-xl transition-colors ${
                    isSelected ? "bg-zinc-200 dark:bg-zinc-800" : ""
                  }`}
                  variants={itemVariants}
                  transition={sharedTransition}
                  style={{ 
                    transformStyle: "preserve-3d", 
                    zIndex: 10,
                    minHeight: '36px',
                    willChange: 'transform, opacity',
                  }}
                >
                  <span className={`transition-colors duration-300 ${isHovered ? item.iconColor : "text-foreground"}`}> 
                    {item.icon}
                  </span>
                  <span className="whitespace-nowrap text-xs sm:text-sm font-medium">{item.label}</span>
                  {item.pro && !pro && (
                    <span className="ml-1 text-xs text-muted-foreground whitespace-nowrap">Pro</span>
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

export default MenuBar

