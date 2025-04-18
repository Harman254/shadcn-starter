import { ClerkProvider } from "@clerk/nextjs";




const ClerkPRovider = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <ClerkProvider>
        {children}
      </ClerkProvider>
      
    </div>
  )
}

export default ClerkPRovider
