import { ProductHero } from "./components/product-hero"
import { FeaturesGrid } from "./components/feature-grid"
import { HowItWorks } from "./components/howitworks"
import { PricingSection } from "./components/pricingsection"
import { TestimonialsSection } from "./components/testimonial"
import { CTASection } from "./components/cta-section"

export default function ProductsPage() {
  return (
    <div className="min-h-screen">
      <ProductHero />
      <FeaturesGrid />
      <HowItWorks />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
    </div>
  )
}
