import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { MealPlanCalendarProps } from "../components/types"
import CalendarDayCard from "./calendar-day-card"

export const MealPlanCalendar = ({ days }: MealPlanCalendarProps) => {
  return (
    <Card className="mb-8">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Calendar Timeline</h2>
            <p className="text-muted-foreground">Click any day to jump to its meals</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="w-full">
          <div className="flex gap-3 p-4 pb-6 min-w-max">
            {days.map((day) => {
              const isToday = new Date().toDateString() === new Date(day.date).toDateString()
              return (
                <div key={day.id} className="flex-shrink-0 w-32 sm:w-36 md:w-40">
                  <CalendarDayCard day={day} isToday={isToday} />
                </div>
              )
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export default MealPlanCalendar
