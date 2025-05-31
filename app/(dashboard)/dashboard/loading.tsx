import { Loader2 } from "lucide-react"
import React from "react"

const Loading = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <p className="text-lg font-medium text-muted-foreground">Loading</p>
      </div>
    </div>
  )
}

export default Loading


