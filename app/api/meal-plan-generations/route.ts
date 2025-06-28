import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getSafeMealPlanGenerationCount, validateAndIncrementMealPlanGeneration, checkMealPlanGenerationLimit } from "@/data"
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
    } else if (action === "validate-and-increment") {
      // Use atomic validation and increment for maximum security
      const data = await validateAndIncrementMealPlanGeneration(session.user.id)
      
      if (!data.success) {
        // Type guard to ensure data contains currentCount and maxGenerations
        const errorData = data as { success: false; canGenerate: false; error: string; currentCount: number; maxGenerations: number; };
        return NextResponse.json({
          error: errorData.error,
          canGenerate: errorData.canGenerate,
          currentCount: errorData.currentCount,
          maxGenerations: errorData.maxGenerations
        }, { status: 429 })
      }
      
      return NextResponse.json(data)
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error handling meal plan generations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 