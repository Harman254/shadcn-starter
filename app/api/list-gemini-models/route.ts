import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

// Ensure this route runs in the Node.js runtime
export const runtime = 'nodejs'

export async function GET() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      {
        error: 'Missing GOOGLE_GENERATIVE_AI_API_KEY / GEMINI_API_KEY env var',
      },
      { status: 500 },
    )
  }

  try {
    const client = new GoogleGenAI({ apiKey })

    // Try to list models - the API method may vary
    // Check if listModels exists, otherwise return known models
    let models: any[] = []
    
    try {
      // Try different possible method names
      const clientAny = client as any
      if (typeof clientAny.listModels === 'function') {
        models = await clientAny.listModels()
      } else if (clientAny.models && typeof clientAny.models.list === 'function') {
        models = await clientAny.models.list()
      } else {
        // If listing isn't available, return known model names
        return NextResponse.json({
          ok: true,
          note: 'Model listing API not available in this SDK version. Using known models.',
          knownModels: [
            'gemini-2.5-flash-image',
            'gemini-2.5-flash',
            'gemini-2.0-flash',
            'gemini-3.0-flash',
            'gemini-3-flash',
          ],
          message: 'Use /api/test-gemini3 or /api/test-image-generation to test specific models',
        })
      }

      // Filter for Flash models and format response
      const flashModels = models
        .filter((model) => 
          model.name?.toLowerCase().includes('flash') || 
          model.name?.toLowerCase().includes('gemini')
        )
        .map((model) => ({
          name: model.name,
          displayName: model.displayName,
          description: model.description,
          supportedGenerationMethods: model.supportedGenerationMethods,
        }))

      return NextResponse.json({
        ok: true,
        totalModels: models.length,
        flashModels,
        allModels: models.map((m) => m.name),
        message: 'Look for models with "3" or "3.0" in the name for Gemini 3 Flash',
      })
    } catch (listError) {
      // If listing fails, return known models
      return NextResponse.json({
        ok: true,
        note: 'Model listing failed. Using known models.',
        knownModels: [
          'gemini-2.5-flash-image',
          'gemini-2.5-flash',
          'gemini-2.0-flash',
          'gemini-3.0-flash',
          'gemini-3-flash',
        ],
        error: listError instanceof Error ? listError.message : String(listError),
        message: 'Use /api/test-gemini3 or /api/test-image-generation to test specific models',
      })
    }
  } catch (error: unknown) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : typeof error === 'string'
            ? error
            : 'Unknown error',
        note: 'This endpoint uses the low-level GoogleGenAI client. If it fails, Gemini 3 Flash may not be available in your region/account yet.',
      },
      { status: 500 },
    )
  }
}
