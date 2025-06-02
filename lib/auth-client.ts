import { polarClient } from "@polar-sh/better-auth";
import {
    createAuthClient
} from "better-auth/react";

export const authClient = createAuthClient({
    
    baseURL: process.env.NEXT_PUBLIC_APP_URL,
    redirectURL: '/',
    plugins: [polarClient(),]
})

export const {
    signIn,
    signOut,
    signUp,
    useSession
} = authClient;
