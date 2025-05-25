import { betterAuth } from 'better-auth';
import prisma from '../lib/prisma';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { resend } from './helpers/email/resend';
import { nextCookies } from 'better-auth/next-js';
import type { User } from 'better-auth';

export const auth = betterAuth({
  appName: "MealWise",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  
  // API route path - must match the route file location
  apiPath: "/api/auth",
  
  // Email and Password Configuration
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
    maxPasswordLength: 20,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }: { user: User; url: string }) => {
      await resend.emails.send({
        from: "MealWise <onboarding@resend.dev>",
        to: user.email,
        subject: "Reset your MealWise password",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #16a34a;">Reset Your Password</h1>
            <p>You requested to reset your password. Click the link below to set a new password:</p>
            <a href="${url}" 
               style="display: inline-block; 
                      background-color: #16a34a; 
                      color: white; 
                      padding: 12px 24px; 
                      text-decoration: none; 
                      border-radius: 6px; 
                      margin: 16px 0;">
              Reset Password
            </a>
            <p>If you didn't request this password reset, you can safely ignore this email.</p>
            <p style="color: #666; font-size: 14px; margin-top: 24px;">
              This link will expire in 1 hour for security reasons.
            </p>
          </div>
        `,
      });
    },
    tokenExpiration: 3600, // in seconds
  },
  
  // Email Verification Settings
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }: { user: User; url: string }) => {
      await resend.emails.send({
        from: "MealWise <onboarding@resend.dev>",
        to: user.email,
        subject: "Verify your MealWise account",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #16a34a;">Welcome to MealWise!</h1>
            <p>Please verify your email address by clicking the link below:</p>
            <a href="${url}" 
               style="display: inline-block; 
                      background-color: #16a34a; 
                      color: white; 
                      padding: 12px 24px; 
                      text-decoration: none; 
                      border-radius: 6px; 
                      margin: 16px 0;">
              Verify Email Address
            </a>
            <p>If you didn't create this account, you can safely ignore this email.</p>
          </div>
        `,
      });
    },
  },

  // Social Authentication Providers
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      redirectURI: "https://mealwise-lemon.vercel.app/api/auth/callback/github",
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectURI: "https://mealwise-lemon.vercel.app/api/auth/callback/google",
    },
  },

  // Session configuration
  session: {
    // How long until the session expires (in seconds)
    expiresIn: 30 * 24 * 60 * 60, // 30 days
    // Whether to use a refresh token to extend the session
    refreshToken: true,
    // Cookie settings
    cookie: {
      // Cookie name prefix
      prefix: "mealwise",
      // Cookie security settings
      sameSite: "lax",
      // Set to true in production
      secure: process.env.NODE_ENV === "production",
    },
  },

  // Cookie Configuration - essential for Next.js integration
  plugins: [nextCookies()], // Make sure this is the last plugin in the array
});
