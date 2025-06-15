import { betterAuth } from 'better-auth';
import prisma from '../lib/prisma';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { resend } from './helpers/email/resend';
import { nextCookies } from 'better-auth/next-js';
import type { User } from 'better-auth';
import { Polar } from "@polar-sh/sdk";
import { polar, checkout, portal, usage, webhooks } from "@polar-sh/better-auth";
import { addSubscriber, updateSubscriber, removeSubscriber, getSubscriberByCustomerId } from '@/data';
import { PolarWebhookPayload } from '@/types/polar-webhook';
import { headers } from 'next/headers';

const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  server: 'sandbox'
});

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
      redirectURI: "https://www.aimealwise.com/api/auth/callback/github",
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectURI: "https://www.aimealwise.com/api/auth/callback/google",
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
  plugins: [
    nextCookies(),
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
          checkout({
              products: [
                  {
                      productId: "9f883e4d-1955-468c-a20c-9bca0c931986",
                      slug: "Mealwise-Pro" // Custom slug for easy reference in Checkout URL, e.g. /checkout/Mealwise-Pro
                  }
              ],
              successUrl: process.env.POLAR_SUCCESS_URL,
              authenticatedUsersOnly: true
          }),
          portal(),
          usage(),
          webhooks({
            secret: process.env.POLAR_WEBHOOK_SECRET!,
            onSubscriptionCreated: async (payload: PolarWebhookPayload) => {
              try {
                console.log("🎉 Subscription created webhook received:", {
                  type: payload.type,
                  customerId: payload.data.id,
                  timestamp: new Date().toISOString()
                });

                const customerId = payload.data.id;
                
                // Get the current session to identify the user
                const session = await auth.api.getSession({
                  headers: await headers()
                });

                if (!session?.user?.id) {
                  console.error("❌ No authenticated user found in session");
                  throw new Error("User not authenticated");
                }

                const userId = session.user.id;
                console.log("👤 User ID from session:", userId);
            
                // Save subscription in your database
                const subscription = await addSubscriber(customerId, userId);
                
                console.log("✅ Subscription saved successfully:", {
                  subscriptionId: subscription.id,
                  customerId: subscription.CustomerID,
                  userId: subscription.userID
                });

                // Send welcome email to the user
                try {
                  await resend.emails.send({
                    from: "MealWise <onboarding@resend.dev>",
                    to: session.user.email,
                    subject: "Welcome to MealWise Pro! 🎉",
                    html: `
                      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #16a34a;">Welcome to MealWise Pro!</h1>
                        <p>Thank you for subscribing to MealWise Pro! You now have access to:</p>
                        <ul style="color: #374151;">
                          <li>✨ Unlimited meal plans</li>
                          <li>🎯 Advanced AI recommendations</li>
                          <li>📱 Priority support</li>
                          <li>🔒 Premium features</li>
                        </ul>
                        <p>Start exploring your personalized meal planning experience!</p>
                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
                           style="display: inline-block; 
                                  background-color: #16a34a; 
                                  color: white; 
                                  padding: 12px 24px; 
                                  text-decoration: none; 
                                  border-radius: 6px; 
                                  margin: 16px 0;">
                          Go to Dashboard
                        </a>
                      </div>
                    `,
                  });
                  console.log("📧 Welcome email sent successfully");
                } catch (emailError) {
                  console.error("❌ Failed to send welcome email:", emailError);
                  // Don't throw here - email failure shouldn't break the webhook
                }

              } catch (error) {
                console.error("❌ Error handling subscription creation:", error);
                // Re-throw to let Polar know the webhook failed
                throw error;
              }
            },
            onCustomerStateChanged: async (payload: PolarWebhookPayload) => {
              try {
                console.log("🔄 Customer state changed webhook received:", {
                  type: payload.type,
                  customerId: payload.data.id,
                  activeSubscriptions: payload.data.active_subscriptions?.length || 0,
                  activeBenefits: payload.data.active_benefits?.length || 0,
                  timestamp: new Date().toISOString()
                });

                const customerId = payload.data.id;
                const activeSubscriptions = payload.data.active_subscriptions || [];
                const activeBenefits = payload.data.active_benefits || [];

                // Check if customer has any active subscriptions
                const hasActiveSubscription = activeSubscriptions.length > 0;

                // Find the user associated with this customer
                const existingSubscription = await getSubscriberByCustomerId(customerId);
                
                if (!existingSubscription) {
                  console.log("⚠️ No subscription found for customer:", customerId);
                  return;
                }

                const userId = existingSubscription.userID;

                if (hasActiveSubscription) {
                  // Customer has active subscriptions - update their status
                  console.log("✅ Customer has active subscriptions, updating status");
                  await updateSubscriber(customerId, userId);
                  
                  // Send subscription reactivated email
                  try {
                    await resend.emails.send({
                      from: "MealWise <onboarding@resend.dev>",
                      to: existingSubscription.user.email,
                      subject: "Your MealWise Pro subscription is active! 🎉",
                      html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                          <h1 style="color: #16a34a;">Subscription Active!</h1>
                          <p>Great news! Your MealWise Pro subscription is now active again.</p>
                          <p>You have access to all premium features:</p>
                          <ul style="color: #374151;">
                            <li>✨ Unlimited meal plans</li>
                            <li>🎯 Advanced AI recommendations</li>
                            <li>📱 Priority support</li>
                            <li>🔒 Premium features</li>
                          </ul>
                          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
                             style="display: inline-block; 
                                    background-color: #16a34a; 
                                    color: white; 
                                    padding: 12px 24px; 
                                    text-decoration: none; 
                                    border-radius: 6px; 
                                    margin: 16px 0;">
                            Go to Dashboard
                          </a>
                        </div>
                      `,
                    });
                    console.log("📧 Subscription reactivated email sent");
                  } catch (emailError) {
                    console.error("❌ Failed to send reactivation email:", emailError);
                  }
                } else {
                  // Customer has no active subscriptions - remove their subscription
                  console.log("❌ Customer has no active subscriptions, removing subscription");
                  await removeSubscriber(userId);
                  
                  // Send subscription cancelled email
                  try {
                    await resend.emails.send({
                      from: "MealWise <onboarding@resend.dev>",
                      to: existingSubscription.user.email,
                      subject: "Your MealWise Pro subscription has ended",
                      html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                          <h1 style="color: #dc2626;">Subscription Ended</h1>
                          <p>Your MealWise Pro subscription has ended. You can still access basic features, but premium features are no longer available.</p>
                          <p>To continue enjoying premium features, you can resubscribe anytime:</p>
                          <a href="${process.env.NEXT_PUBLIC_APP_URL}/pricing" 
                             style="display: inline-block; 
                                    background-color: #16a34a; 
                                    color: white; 
                                    padding: 12px 24px; 
                                    text-decoration: none; 
                                    border-radius: 6px; 
                                    margin: 16px 0;">
                            Resubscribe Now
                          </a>
                          <p style="color: #6b7280; font-size: 14px;">
                            Thank you for being part of the MealWise community!
                          </p>
                        </div>
                      `,
                    });
                    console.log("📧 Subscription cancelled email sent");
                  } catch (emailError) {
                    console.error("❌ Failed to send cancellation email:", emailError);
                  }
                }

                console.log("✅ Customer state change processed successfully");

              } catch (error) {
                console.error("❌ Error handling customer state change:", error);
                throw error;
              }
            },
            onOrderPaid: async (payload: PolarWebhookPayload) => {
              try {
                console.log("💰 Order paid webhook received:", {
                  type: payload.type,
                  customerId: payload.data.customer_id,
                  orderId: payload.data.id,
                  amount: payload.data.total_amount,
                  currency: payload.data.currency,
                  timestamp: new Date().toISOString()
                });

                const customerId = payload.data.customer_id;
                const orderId = payload.data.id;
                const amount = payload.data.total_amount;
                const currency = payload.data.currency;

                // Find the user associated with this customer
                const existingSubscription = await getSubscriberByCustomerId(customerId);
                
                if (!existingSubscription) {
                  console.log("⚠️ No subscription found for customer:", customerId);
                  return;
                }

                // Send payment confirmation email
                try {
                  await resend.emails.send({
                    from: "MealWise <onboarding@resend.dev>",
                    to: existingSubscription.user.email,
                    subject: "Payment Confirmed - MealWise Pro",
                    html: `
                      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #16a34a;">Payment Confirmed!</h1>
                        <p>Thank you for your payment. Your MealWise Pro subscription is now active.</p>
                        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
                          <p><strong>Order ID:</strong> ${orderId}</p>
                          <p><strong>Amount:</strong> ${amount} ${currency}</p>
                          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                        </div>
                        <p>You now have access to all premium features. Enjoy your personalized meal planning experience!</p>
                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
                           style="display: inline-block; 
                                  background-color: #16a34a; 
                                  color: white; 
                                  padding: 12px 24px; 
                                  text-decoration: none; 
                                  border-radius: 6px; 
                                  margin: 16px 0;">
                          Go to Dashboard
                        </a>
                      </div>
                    `,
                  });
                  console.log("📧 Payment confirmation email sent");
                } catch (emailError) {
                  console.error("❌ Failed to send payment confirmation email:", emailError);
                }

                console.log("✅ Order payment processed successfully");

              } catch (error) {
                console.error("❌ Error handling order payment:", error);
                throw error;
              }
            },
            onPayload: async (payload: PolarWebhookPayload) => {
              try {
                console.log("📨 General webhook received:", {
                  type: payload.type,
                  timestamp: new Date().toISOString(),
                  data: JSON.stringify(payload.data, null, 2)
                });

                // Log all webhook events for debugging and monitoring
                // This is a catch-all handler for any webhook events not specifically handled above
                
                // You could add additional logic here for:
                // - Analytics tracking
                // - Audit logging
                // - Custom event handling
                // - Integration with other services

                console.log("✅ General webhook payload processed");

              } catch (error) {
                console.error("❌ Error handling general webhook payload:", error);
                throw error;
              }
            }
          })
       
      ],
    })
  ], // Make sure polar is the last plugin in the array
});
