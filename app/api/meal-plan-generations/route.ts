import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getMealPlanGenerationCount, incrementMealPlanGeneration } from "@/data"
import { headers } from "next/headers"

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await getMealPlanGenerationCount(session.user.id)
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

    const { action } = await request.json()

    if (action !== "increment") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const data = await incrementMealPlanGeneration(session.user.id)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error incrementing meal plan generations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 