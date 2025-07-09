"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Home, Settings, Bell, User, ChevronLeft, ChevronRight } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

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
    icon: <Settings className="h-4 w-4 sm:h-5 sm:w-5" />,
    label: "Nutrition",
    value: "nutrition",
    gradient: "radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(22,163,74,0.06) 50%, rgba(21,128,61,0) 100%)",
    iconColor: "text-green-500",
    pro: true,
  },
  {
    icon: <Settings className="h-4 w-4 sm:h-5 sm:w-5" />,
    label: "Planning",
    value: "planning",
    gradient: "radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(22,163,74,0.06) 50%, rgba(21,128,61,0) 100%)",
    iconColor: "text-green-500",
    pro: true,
  },
  {
    icon: <User className="h-4 w-4 sm:h-5 sm:w-5" />,
    label: "Recipes",
    value: "recipes",
    gradient: "radial-gradient(circle, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.06) 50%, rgba(185,28,28,0) 100%)",
    iconColor: "text-red-500",
    pro: true,
  },
  {
    icon: <Bell className="h-4 w-4 sm:h-5 sm:w-5" />,
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
    scale: 1.5,
    transition: {
      opacity: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
      scale: { duration: 0.3, type: "spring", stiffness: 300, damping: 25 },
    },
  },
}

const navGlowVariants = {
  initial: { opacity: 0 },
  hover: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

const sharedTransition = {
  type: "spring",
  stiffness: 120,
  damping: 20,
  duration: 0.3,
}

const MenuBar: React.FC<MenuBarProps> = ({ selected, onSelect, pro }) => {
  const { theme } = useTheme()
  const isDarkTheme = (theme ?? "light") === "dark"
  const [hovered, setHovered] = React.useState<string | null>(null)
  const [showScrollButtons, setShowScrollButtons] = React.useState(false)
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const [canScrollRight, setCanScrollRight] = React.useState(false)
  const scrollContainerRef = React.useRef<HTMLUListElement>(null)
  const [isMobile, setIsMobile] = React.useState(false)

  // Check if device is mobile and handle scroll buttons
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    const checkScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
        setCanScrollLeft(scrollLeft > 0)
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
        setShowScrollButtons(scrollWidth > clientWidth)
      }
    }

    checkMobile()
    checkScroll()

    window.addEventListener("resize", checkMobile)
    window.addEventListener("resize", checkScroll)

    return () => {
      window.removeEventListener("resize", checkMobile)
      window.removeEventListener("resize", checkScroll)
    }
  }, [])

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200
      const newScrollLeft =
        direction === "left"
          ? scrollContainerRef.current.scrollLeft - scrollAmount
          : scrollContainerRef.current.scrollLeft + scrollAmount

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      })
    }
  }

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, isDisabled: boolean, value: string) => {
    if (isDisabled) return
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onSelect(value)
    }
  }

  // Focus management for keyboard navigation
  const handleArrowNavigation = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault()
      const currentIndex = menuItems.findIndex((item) => item.value === selected)
      const nextIndex =
        e.key === "ArrowRight" ? Math.min(currentIndex + 1, menuItems.length - 1) : Math.max(currentIndex - 1, 0)

      const nextItem = menuItems[nextIndex]
      if (nextItem && !(nextItem.pro && !pro)) {
        onSelect(nextItem.value)
      }
    }
  }

  return (
    <div className="relative w-full mb-4 sm:mb-6 md:mb-8">
      <motion.nav
        className="relative p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-gradient-to-b from-background/80 to-background/40 backdrop-blur-lg border border-border/40 shadow-lg"
        initial="initial"
        whileHover="hover"
        onKeyDown={handleArrowNavigation}
        style={{
          minHeight: isMobile ? "52px" : "64px",
          contain: "layout style paint",
          isolation: "isolate",
        }}
      >
        <motion.div
          className={`absolute -inset-1 sm:-inset-2 bg-gradient-radial from-transparent ${
            isDarkTheme ? "blue-400/20" : "blue-400/15"
          } to-transparent rounded-2xl sm:rounded-3xl pointer-events-none`}
          variants={navGlowVariants}
          style={{
            zIndex: 0,
            willChange: "opacity",
          }}
        />

        {/* Scroll buttons for mobile */}
        <AnimatePresence>
          {showScrollButtons && isMobile && (
            <>
              {canScrollLeft && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="absolute left-1 top-1/2 -translate-y-1/2 z-20"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => scroll("left")}
                    className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm border border-border/40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
              {canScrollRight && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 z-20"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => scroll("right")}
                    className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm border border-border/40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>

        <ul
          ref={scrollContainerRef}
          className={`flex items-center gap-0.5 sm:gap-1 md:gap-2 lg:gap-3 relative z-10 overflow-x-auto scrollbar-hide h-10 sm:h-12 ${
            showScrollButtons && isMobile ? "px-10" : ""
          }`}
          onScroll={handleScroll}
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {menuItems.map((item, index) => {
            const isDisabled = !!(item.pro && !pro)
            const isSelected = selected === item.value
            const isHovered = hovered === item.value

            return (
              <motion.li key={item.value} className="relative flex-shrink-0" style={{ minWidth: "fit-content" }}>
                <motion.div
                  className={`block rounded-lg sm:rounded-xl group relative transition-opacity duration-200 ${
                    isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  }`}
                  style={{
                    perspective: "600px",
                    transformStyle: "preserve-3d",
                    contain: "layout style paint",
                  }}
                  whileHover={!isDisabled && !isMobile ? "hover" : undefined}
                  whileTap={!isDisabled ? { scale: 0.95 } : undefined}
                  initial="initial"
                  onClick={() => !isDisabled && onSelect(item.value)}
                  tabIndex={isDisabled ? -1 : 0}
                  aria-disabled={isDisabled}
                  aria-label={`${item.label}${item.pro && !pro ? " (Pro feature)" : ""}`}
                  onKeyDown={(e) => handleKeyDown(e, isDisabled, item.value)}
                  onMouseEnter={() => !isMobile && setHovered(item.value)}
                  onMouseLeave={() => !isMobile && setHovered(null)}
                  role="button"
                  aria-pressed={isSelected}
                >
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    variants={glowVariants}
                    style={{
                      background: item.gradient,
                      opacity: 0,
                      borderRadius: isMobile ? "8px" : "12px",
                      zIndex: 0,
                      willChange: "opacity, transform",
                    }}
                  />

                  <MenuItemContent
                    item={item}
                    isSelected={isSelected}
                    isHovered={isHovered}
                    pro={pro}
                    isMobile={isMobile}
                    variants={itemVariants}
                    transition={sharedTransition}
                  />

                  <MenuItemContent
                    item={item}
                    isSelected={isSelected}
                    isHovered={isHovered}
                    pro={pro}
                    isMobile={isMobile}
                    variants={backVariants}
                    transition={sharedTransition}
                    isBack={true}
                  />
                </motion.div>
              </motion.li>
            )
          })}
        </ul>
      </motion.nav>
    </div>
  )
}

interface MenuItemContentProps {
  item: MenuItem
  isSelected: boolean
  isHovered: boolean
  pro?: boolean
  isMobile: boolean
  variants: any
  transition: any
  isBack?: boolean
}

const MenuItemContent: React.FC<MenuItemContentProps> = ({
  item,
  isSelected,
  isHovered,
  pro,
  isMobile,
  variants,
  transition,
  isBack = false,
}) => {
  return (
    <motion.div
      className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 relative bg-transparent rounded-lg sm:rounded-xl transition-colors duration-200 ${
        isSelected ? "bg-zinc-200 dark:bg-zinc-800" : ""
      } ${isBack ? "absolute inset-0" : ""}`}
      variants={variants}
      transition={transition}
      style={{
        transformStyle: "preserve-3d",
        transformOrigin: isBack ? "center top" : "center bottom",
        zIndex: 10,
        minHeight: isMobile ? "36px" : "44px",
        willChange: "transform, opacity",
        ...(isBack && { rotateX: 90 }),
      }}
    >
      <span
        className={`transition-colors duration-300 flex-shrink-0 ${isHovered ? item.iconColor : "text-foreground"}`}
      >
        {item.icon}
      </span>

      <span
        className={`whitespace-nowrap font-medium transition-colors duration-300 ${
          isMobile ? "text-sm" : "text-sm sm:text-base"
        } ${isSelected ? "text-foreground" : "text-muted-foreground"}`}
      >
        {isMobile && item.label.length > 8 ? item.label.slice(0, 8) + "..." : item.label}
      </span>

      {item.pro && !pro && (
        <span
          className={`text-xs text-muted-foreground whitespace-nowrap flex-shrink-0 ${isMobile ? "hidden" : "ml-1"}`}
        >
          Pro
        </span>
      )}
    </motion.div>
  )
}

export default MenuBar
