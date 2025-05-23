import { betterAuth } from 'better-auth';
import  prisma from '../lib/prisma'
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { resend } from './helpers/email/resend';
import { nextCookies } from 'better-auth/next-js';

// export const auth = betterAuth({
//     appName: "better_auth_nextjs",
//     database: prismaAdapter(prisma, {
//       provider: "postgresql",
//     }),
//     emailAndPassword: {
//       enabled: true,
//       autoSignIn: true,
//       minPasswordLength: 8,
//       maxPasswordLength: 20,
//       requireEmailVerification: true, //It does not allow user to login without email verification [!code highlight]
//     },
//   emailVerification: {
//       sendOnSignUp: true, // Automatically sends a verification email at signup
//       autoSignInAfterVerification: true, // Automatically signIn the user after verification
//       sendVerificationEmail: async ({ user, url }) => {
//         await resend.emails.send({
//           from: "Acme <onboarding@resend.dev>", // You could add your custom domain
//           to: user.email, // email of the user to want to end
//           subject: "Email Verification", // Main subject of the email
//           html: `Click the link to verify your email: ${url}`, // Content of the email
//           // you could also use "React:" option for sending the email template and there content to user
//         });
//       },
//     },
//   // ignore this if your not adding OAuth
//     socialProviders: {
//       google: {
//         clientId: process.env.GOOGLE_CLIENT_ID!,
//         clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//         // redirectURI: process.env.BETTER_AUTH_URL + "api/auth/callback/google",
//       },
//       github: {
//         clientId: process.env.GITHUB_CLIENT_ID!,
//         clientSecret: process.env.GITHUB_CLIENT_SECRET!,
//         // redirectURI: process.env.BETTER_AUTH_URL + "api/auth/callback/github",
//       },
//     },
//     cookies: nextCookies(),
//   });


export const auth = betterAuth({
  appName: "better_auth_nextjs",
    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),

    socialProviders: {
      // github: {
      //   clientId: env.GITHUB_CLIENT_ID,
      //   clientSecret: env.GITHUB_CLIENT_SECRET,
      // },
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
      // discord: {
      //   clientId: env.DISCORD_CLIENT_ID,
      //   clientSecret: env.DISCORD_CLIENT_SECRET,
      // }
    },
    plugins: [nextCookies()]
  });
  
