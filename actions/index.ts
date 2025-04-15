'use server'
import { google } from "@ai-sdk/google"
import { wrapLanguageModel } from "ai"
import { customMiddleware } from "./customMiddleware"







export const geminiFlashModel = wrapLanguageModel(
    {
        model: google("gemini-1.5-flash"),
    middleware: customMiddleware
    }
)
    
    




