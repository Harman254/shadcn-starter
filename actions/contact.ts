"use server"

import { z } from "zod"

const contactFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(1, "Please select a subject"),
  message: z.string().min(10, "Message must be at least 10 characters long"),
})

export async function submitContactForm(formData: FormData) {
  try {
    // Extract form data
    const data = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
    }

    // Validate the data
    const validatedData = contactFormSchema.parse(data)

    // Here you would typically:
    // 1. Save to database
    // 2. Send email notification
    // 3. Integrate with your CRM
    // 4. Send confirmation email to user

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // For demo purposes, we'll just log the data
    console.log("Contact form submission:", {
      ...validatedData,
      submittedAt: new Date().toISOString(),
    })

    // You could integrate with services like:
    // - Resend for email notifications
    // - Supabase for database storage
    // - Slack for team notifications
    // - Notion for CRM integration

    return { success: true }
  } catch (error) {
    console.error("Contact form error:", error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      }
    }

    return {
      success: false,
      error: "Failed to submit form. Please try again.",
    }
  }
}
