'use server'
import { google } from "@ai-sdk/google"
import { wrapLanguageModel } from "ai"
import { customMiddleware } from "./customMiddleware"







export const geminiFlashModel = wrapLanguageModel(
    {
        model: google("gemini-2.5-pro-exp-03-25"),
    middleware: customMiddleware
    }
)
    
    




