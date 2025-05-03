


'use client';
import { ClerkProvider } from "@clerk/nextjs";




const ClerkPRovider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkProvider>

        {children}
      
    </ClerkProvider>

  )
}

export default ClerkPRovider
