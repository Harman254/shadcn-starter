import Cta10 from "../components/cta";
import Feature17 from "@/components/features";
import Testimonial14 from "@/components/testimonials";
import SignOut from "@/components/auth/sign-out";
import HeroSection from "@/components/hero";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";


export default async function IndexPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  const user = session?.user
 
  return (
    <>
    <HeroSection user={user} />
    <Feature17 />
    <Testimonial14 />
    <Cta10 heading="Welcome Ai in to your Kitchen ecosystem" description="Let's get started with personalized meal planning powered by AI to make your cooking journey smarter and easier." />
    

    
    
    
    </>
    
    
  )
}
