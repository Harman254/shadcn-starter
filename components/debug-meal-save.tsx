"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DebugMealSave() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testMealSave = async () => {
    setLoading(true)
    try {
      const testData = {
        title: "Debug Test Meal Plan",
        duration: 1,
        mealsPerDay: 1,
        days: [
          {
            day: 1,
            meals: [
              {
                name: "Debug Test Meal",
                description: "A test meal for debugging",
                ingredients: ["test ingredient 1", "test ingredient 2"],
                instructions: "1. Test step 1\n2. Test step 2",
                imageUrl: "https://example.com/test.jpg"
              }
            ]
          }
        ],
        createdAt: new Date().toISOString()
      }

      console.log("Sending test data:", testData)

      const response = await fetch("/api/savemealplan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData),
      })

      const data = await response.json()
      
      setDebugInfo({
        status: response.status,
        statusText: response.statusText,
        data: data,
        headers: Object.fromEntries(response.headers.entries())
      })

      console.log("Debug response:", {
        status: response.status,
        statusText: response.statusText,
        data: data,
        headers: Object.fromEntries(response.headers.entries())
      })

    } catch (error) {
      console.error("Debug test failed:", error)
      setDebugInfo({
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Debug Meal Save</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testMealSave} disabled={loading}>
          {loading ? "Testing..." : "Test Meal Save"}
        </Button>
        
        {debugInfo && (
          <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <h3 className="font-semibold mb-2">Debug Info:</h3>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 