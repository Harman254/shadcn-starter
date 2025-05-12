import { headers } from "next/headers"
import { auth } from "./auth"

export const requireUser = async () => {

    const session = await auth.api.getSession({
        headers: await headers()
      })
    
    if (!session?.user?.id || typeof session.user.id !== "string") {
        throw new Error("Unauthorized")
    }
    return session.user
}