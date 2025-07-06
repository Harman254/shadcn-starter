"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Alert, AlertDescription } from "@/components/ui/alert-dialog"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { submitContactForm } from "@/actions/contact"

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Sending Message...
        </>
      ) : (
        "Send Message"
      )}
    </Button>
  )
}

export function ContactForm() {
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  async function handleSubmit(formData: FormData) {
    setSubmitStatus("idle")

    try {
      const result = await submitContactForm(formData)

      if (result.success) {
        setSubmitStatus("success")
        setMessage("Thank you for your message! We'll get back to you soon.")
        // Reset form
        const form = document.getElementById("contact-form") as HTMLFormElement
        form?.reset()
      } else {
        setSubmitStatus("error")
        setMessage(result.error || "Something went wrong. Please try again.")
      }
    } catch (error) {
      setSubmitStatus("error")
      setMessage("Something went wrong. Please try again.")
    }
  }

  return (
    <form id="contact-form" action={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input id="firstName" name="firstName" required placeholder="Enter your first name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input id="lastName" name="lastName" required placeholder="Enter your last name" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="Enter your email address"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Subject *</Label>
        <Select name="subject" required>
          <SelectTrigger>
            <SelectValue placeholder="Select a subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General Inquiry</SelectItem>
            <SelectItem value="recipe-suggestion">Recipe Suggestion</SelectItem>
            <SelectItem value="technical-support">Technical Support</SelectItem>
            <SelectItem value="feedback">Feedback</SelectItem>
            <SelectItem value="feature-request">Feature Request</SelectItem>
            <SelectItem value="dietary-help">Dietary Restrictions Help</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message *</Label>
        <Textarea
          id="message"
          name="message"
          required
          placeholder="Tell us how we can help you..."
          className="min-h-[120px]"
        />
      </div>

      {/* {submitStatus !== "idle" && (
        <Alert className={submitStatus === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          {submitStatus === "success" ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={submitStatus === "success" ? "text-green-800" : "text-red-800"}>
            {message}
          </AlertDescription>
        </Alert>
      )} */}

      <SubmitButton />

      <p className="text-sm text-gray-500 text-center">
        By submitting this form, you agree to our privacy policy and terms of service.
      </p>
    </form>
  )
}
