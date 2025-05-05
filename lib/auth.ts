import { betterAuth } from 'better-auth';
import  prisma  from '../lib/prisma';
import { prismaAdapter } from 'better-auth/adapters/prisma';

export const auth = betterAuth({
    appName: "better_auth_nextjs",
    database: prismaAdapter(prisma, {
        provider: "postgresql"
    }),
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
        minPasswordLength: 8,
        maxPasswordLength: 20,
    },
});