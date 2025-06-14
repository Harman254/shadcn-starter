import Cta10 from "../components/cta";
import Feature17 from "@/components/features";
import Testimonial14 from "@/components/testimonials";
import  { Hero1 } from "@/components/hero";
import CTA from "../components/cta";


export default async function IndexPage() {
  const image = {
    src: "/image01.jpg",
    alt: "Hero section demo image showing interface components",
  };

 
  return (
    <>
    <Hero1 heading="Personalized AI Meal Plans for Your Lifestyle" image={image} description='this is all you need' />
    <Feature17 />
    <Testimonial14 />
    <CTA />
    

    
    
    
    </>
    
    
  )
}
