'use client'

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import type { MealPlanCalendarProps } from "./types"
import CalendarDayCard from "./calendar-day-card"

export const MealPlanCalendar = ({ days, onDayClick }: MealPlanCalendarProps & { onDayClick?: (dayId: string) => void }) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)
  const [visibleDays, setVisibleDays] = useState(5) // Default visible days

  // Determine number of visible days based on screen width
  useEffect(() => {
    const handleResize = () => {
      // Adjust number of visible days based on screen width
      if (window.innerWidth < 640) { // sm breakpoint
        setVisibleDays(3) // Show 3 days on very small screens
      } else if (window.innerWidth < 768) { // md breakpoint
        setVisibleDays(4) // Show 4 days on small screens
      } else {
        setVisibleDays(5) // Show 5 days on larger screens
      }
    }

    // Initial calculation
    handleResize()

    // Add event listener
    window.addEventListener('resize', handleResize)
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Check scroll position to show/hide arrows
  const checkScrollPosition = () => {
    if (!scrollRef.current) return
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setShowLeftArrow(scrollLeft > 5) // Small threshold to account for rounding errors
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5)
  }

  useEffect(() => {
    const scrollElement = scrollRef.current
    if (scrollElement) {
      scrollElement.addEventListener('scroll', checkScrollPosition)
      // Initial check
      checkScrollPosition()
      
      return () => {
        scrollElement.removeEventListener('scroll', checkScrollPosition)
      }
    }
  }, [])

  // Find today's date index
  const todayIndex = days.findIndex(day => 
    new Date().toDateString() === new Date(day.date).toDateString()
  )

  // Scroll to today's date on initial load
  useEffect(() => {
    if (todayIndex >= 0) {
      scrollToDay(days[todayIndex].id)
    }
  }, [])

  const scrollToDay = (dayId: string) => {
    const dayElement = document.getElementById(`day-${dayId}`)
    if (dayElement && scrollRef.current) {
      dayElement.scrollIntoView({ behavior: 'smooth', inline: 'center' })
    }
  }

  const scrollLeft = () => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.clientWidth / visibleDays
      scrollRef.current.scrollBy({ left: -cardWidth * 2, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.clientWidth / visibleDays
      scrollRef.current.scrollBy({ left: cardWidth * 2, behavior: 'smooth' })
    }
  }

  // Calculate card width based on visible days
  const getCardWidth = () => {
    return `calc((100% - ${(visibleDays - 1) * 8}px) / ${visibleDays})`
  }

  return (
    <Card className="mb-8 w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Calendar Timeline</h2>
            <p className="text-muted-foreground">Click any day to jump to its meals</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={scrollLeft}
              className={!showLeftArrow ? "opacity-50 cursor-not-allowed" : ""}
              disabled={!showLeftArrow}
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={scrollRight}
              className={!showRightArrow ? "opacity-50 cursor-not-allowed" : ""}
              disabled={!showRightArrow}
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative w-full overflow-hidden">
          {/* Gradient indicators for scroll */}
          {showLeftArrow && (
            <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          )}
          {showRightArrow && (
            <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          )}
          
          <div 
            ref={scrollRef}
            className="flex gap-2 p-4 pb-6 overflow-x-auto scrollbar-hide"
            style={{ 
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              msOverflowStyle: 'none',  /* IE and Edge */
              scrollbarWidth: 'none',   /* Firefox */
            }}
          >
            {days.map((day) => {
              const isToday = new Date().toDateString() === new Date(day.date).toDateString()
              return (
                <div 
                  key={day.id} 
                  id={`day-${day.id}`}
                  style={{ 
                    width: getCardWidth(),
                    flexShrink: 0,
                    scrollSnapAlign: 'center'
                  }}
                  onClick={() => onDayClick ? onDayClick(day.id) : scrollToDay(day.id)}
                >
                  <CalendarDayCard day={day} isToday={isToday} />
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default MealPlanCalendar

