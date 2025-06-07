import { Card, CardContent } from "@/components/ui/card"
import type { CalendarDayCardProps } from "./types"

const CalendarDayCard = ({ day, isToday }: CalendarDayCardProps) => {
  const date = new Date(day.date)
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
  const dayNumber = date.getDate()
  const monthName = date.toLocaleDateString('en-US', { month: 'short' })

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md min-h-[80px] ${
        isToday ? 'ring-2 ring-primary bg-primary/5' : ''
      }`}
    >
      <CardContent className="p-2 text-center h-full flex flex-col justify-center">
        <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">
          {dayName}
        </div>
        <div className={`text-sm sm:text-lg font-semibold ${isToday ? 'text-primary' : ''}`}>
          {dayNumber}
        </div>
        <div className="text-[10px] sm:text-xs text-muted-foreground">
          {monthName}
        </div>
        {day.meals && (
          <div className="mt-1 text-[9px] sm:text-xs text-muted-foreground">
            {day.meals.length}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default CalendarDayCard