import { Button } from "@/components/ui/button"
import { ArrowRight, Download } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-20 px-4 text-primary-foreground bg-gradient-to-r bg-background/95">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Transform Your Meal Planning?</h2>
        <p className="text-xl text-primary-foreground mb-8 max-w-2xl mx-auto">
          Join thousands of users who have already revolutionized their cooking routine with AI-powered meal planning.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 text-lg px-8 py-3">
            Start Free Trial
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-orange-600 text-lg px-8 py-3"
          >
            <Download className="w-5 h-5 mr-2" />
            Download App
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-2xl font-bold text-white mb-2">14-Day</div>
            <div className="text-orange-100">Free Trial</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white mb-2">No Setup</div>
            <div className="text-orange-100">Fees</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white mb-2">Cancel</div>
            <div className="text-orange-100">Anytime</div>
          </div>
        </div>
      </div>
    </section>
  )
}
