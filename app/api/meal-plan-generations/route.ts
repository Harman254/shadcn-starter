import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getSafeMealPlanGenerationCount, checkMealPlanGenerationLimit, rollbackMealPlanGeneration } from "@/data"
import { headers } from "next/headers"

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await getSafeMealPlanGenerationCount(session.user.id)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error getting meal plan generations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let action: string
    try {
      const body = await request.json()
      action = body.action
    } catch (jsonError) {
      console.error("Error parsing request JSON:", jsonError)
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    if (action === "validate-only") {
      // For read-only validation (no increment)
      const data = await checkMealPlanGenerationLimit(session.user.id)
      return NextResponse.json(data)
    } else if (action === "decrement") {
      // Decrement generation count (used when a meal plan is saved)
      // This function needs to be implemented in your @/data layer
      // It should decrement the count and return the new count and maxGenerations
      // Example: const data = await decrementMealPlanGeneration(session.user.id)
      // For now, using rollbackMealPlanGeneration as a placeholder if it fits the logic
      const data = await rollbackMealPlanGeneration(session.user.id)
      return NextResponse.json(data)
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error handling meal plan generations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

