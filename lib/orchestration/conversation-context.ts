/**
 * @fileOverview
 * Conversation context tracking to maintain state across turns
 * Stores meal plan IDs, preferences, and other entities needed for follow-up requests
 * 
 * SCALABILITY UPDATE: Now uses Prisma/Database for persistence instead of in-memory storage.
 */

import prisma from '@/lib/prisma';

export interface ConversationEntity {
    mealPlanId?: string;
    groceryListId?: string;
    lastToolResult?: Record<string, any>;
    timestamp: Date;
}

const CONTEXT_TTL = 30 * 60 * 1000; // 30 minutes

export class ConversationContextManager {

    /**
     * Get context for a user session from database
     */
    async getContext(userId?: string, sessionId?: string): Promise<ConversationEntity | null> {
        if (!userId || !sessionId) return null;

        try {
            const context = await prisma.conversationContext.findUnique({
                where: {
                    userId_sessionId: {
                        userId,
                        sessionId
                    }
                }
            });

            if (!context) return null;

            // Check if expired
            if (context.expiresAt < new Date()) {
                // Async cleanup (don't block)
                this.clearContext(userId, sessionId).catch(console.error);
                return null;
            }

            return {
                mealPlanId: context.mealPlanId || undefined,
                groceryListId: context.groceryListId || undefined,
                lastToolResult: (context.metadata as any)?.lastToolResult,
                timestamp: context.updatedAt
            };
        } catch (error) {
            console.error('[ConversationContext] Error fetching context:', error);
            return null;
        }
    }

    /**
     * Update context with new data in database
     */
    async updateContext(
        userId: string,
        sessionId: string,
        update: Partial<Omit<ConversationEntity, 'timestamp'>>
    ): Promise<void> {
        try {
            const expiresAt = new Date(Date.now() + CONTEXT_TTL);

            // Prepare metadata update
            const metadata: any = {};
            if (update.lastToolResult) {
                metadata.lastToolResult = update.lastToolResult;
            }

            await prisma.conversationContext.upsert({
                where: {
                    userId_sessionId: {
                        userId,
                        sessionId
                    }
                },
                create: {
                    userId,
                    sessionId,
                    mealPlanId: update.mealPlanId,
                    groceryListId: update.groceryListId,
                    metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
                    expiresAt
                },
                update: {
                    mealPlanId: update.mealPlanId,
                    groceryListId: update.groceryListId,
                    metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
                    expiresAt
                }
            });
        } catch (error) {
            console.error('[ConversationContext] Error updating context:', error);
        }
    }

    /**
     * Extract and store meal plan ID from tool results
     */
    async extractAndStoreEntities(
        userId: string,
        sessionId: string,
        toolResults: Record<string, any>
    ): Promise<void> {
        try {
            const update: Partial<ConversationEntity> = {};

            // Extract meal plan ID if present
            if (toolResults.generateMealPlan?.mealPlan?.id) {
                update.mealPlanId = toolResults.generateMealPlan.mealPlan.id;
            }

            // Extract grocery list ID if present
            if (toolResults.generateGroceryList?.groceryList?.id) {
                update.groceryListId = toolResults.generateGroceryList.groceryList.id;
            }

            // Store last tool result for reference
            update.lastToolResult = toolResults;

            if (Object.keys(update).length > 0) {
                await this.updateContext(userId, sessionId, update);
            }
        } catch (error) {
            console.error('[ConversationContext] Error extracting entities:', error);
        }
    }

    /**
     * Clear context for a session
     */
    async clearContext(userId: string, sessionId: string): Promise<void> {
        try {
            await prisma.conversationContext.delete({
                where: {
                    userId_sessionId: {
                        userId,
                        sessionId
                    }
                }
            });
        } catch (error) {
            // Ignore error if record doesn't exist
        }
    }

    /**
     * Clean up expired contexts
     */
    async cleanupExpired(): Promise<void> {
        try {
            await prisma.conversationContext.deleteMany({
                where: {
                    expiresAt: {
                        lt: new Date()
                    }
                }
            });
        } catch (error) {
            console.error('[ConversationContext] Error cleaning up expired contexts:', error);
        }
    }
}

// Singleton instance
let contextManagerInstance: ConversationContextManager | null = null;

export function getContextManager(): ConversationContextManager {
    if (!contextManagerInstance) {
        contextManagerInstance = new ConversationContextManager();

        // Run cleanup every 5 minutes
        setInterval(() => {
            contextManagerInstance?.cleanupExpired();
        }, 5 * 60 * 1000);
    }
    return contextManagerInstance;
}
