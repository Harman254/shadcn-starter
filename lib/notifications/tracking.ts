/**
 * Notification Tracking Utilities
 * 
 * Handles click tracking, conversion tracking, and analytics
 */

import prisma from "@/lib/prisma";
import crypto from "crypto";

export interface TrackingData {
  userId: string;
  notificationId: string;
  type: string;
  channel: string;
  actionUrl?: string;
}

/**
 * Generate a tracking token for click tracking
 */
export function generateTrackingToken(data: TrackingData): string {
  const payload = JSON.stringify({
    userId: data.userId,
    notificationId: data.notificationId,
    type: data.type,
    channel: data.channel,
    timestamp: Date.now(),
  });

  // Create a secure token
  const secret = process.env.NOTIFICATION_TRACKING_SECRET || 'default-secret-change-in-production';
  const hash = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  
  // Return base64 encoded token
  return Buffer.from(`${payload}:${hash}`).toString('base64');
}

/**
 * Decode and verify tracking token
 */
export function decodeTrackingToken(token: string): TrackingData | null {
  try {
    // Try to decode as base64 first
    let decoded: string;
    try {
      decoded = Buffer.from(token, 'base64').toString('utf-8');
    } catch {
      // If not base64, try direct JSON parse (for simple tokens)
      try {
        const data = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
        return {
          userId: data.userId || data.userId,
          notificationId: data.notificationId || data.id,
          type: data.type,
          channel: data.channel,
        };
      } catch {
        return null;
      }
    }

    // Try hash verification format
    const [payload, hash] = decoded.split(':');
    
    if (payload && hash) {
      // Verify hash
      const secret = process.env.NOTIFICATION_TRACKING_SECRET || 'default-secret-change-in-production';
      const expectedHash = crypto.createHmac('sha256', secret).update(payload).digest('hex');
      
      if (hash !== expectedHash) return null;

      const data = JSON.parse(payload);
      return {
        userId: data.userId,
        notificationId: data.notificationId,
        type: data.type,
        channel: data.channel,
      };
    }

    // Try direct JSON parse
    const data = JSON.parse(decoded);
    return {
      userId: data.userId,
      notificationId: data.notificationId || data.id,
      type: data.type,
      channel: data.channel,
    };
  } catch (error) {
    console.error('[Tracking] Failed to decode token:', error);
    return null;
  }
}

/**
 * Create a tracked URL with UTM parameters and tracking token
 */
export function createTrackedUrl(
  baseUrl: string,
  trackingData: TrackingData,
  utmSource: string = 'notification',
  utmMedium: string = 'email',
  utmCampaign?: string
): string {
  const url = new URL(baseUrl, process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
  
  // Add UTM parameters
  url.searchParams.set('utm_source', utmSource);
  url.searchParams.set('utm_medium', utmMedium);
  url.searchParams.set('utm_campaign', utmCampaign || trackingData.type);
  url.searchParams.set('utm_content', trackingData.channel);
  
  // Add tracking token
  const token = generateTrackingToken(trackingData);
  url.searchParams.set('nt', token); // nt = notification token
  
  return url.toString();
}

/**
 * Track notification click
 */
export async function trackClick(
  token: string,
  userAgent?: string,
  ipAddress?: string
): Promise<{ success: boolean; notificationId?: string }> {
  const trackingData = decodeTrackingToken(token);
  
  if (!trackingData) {
    return { success: false };
  }

  try {
    // Update NotificationLog
    const notificationLog = await (prisma as any).notificationLog.findFirst({
      where: {
        userId: trackingData.userId,
        type: trackingData.type,
        channel: trackingData.channel,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (notificationLog) {
      // Update with only fields that exist
      const updateData: any = {
        clicked: true,
      };
      
      // Only add optional fields if they might exist
      try {
        await (prisma as any).notificationLog.update({
          where: { id: notificationLog.id },
          data: updateData,
        });
      } catch (error: any) {
        // If update fails, try with minimal data
        try {
          await (prisma as any).notificationLog.update({
            where: { id: notificationLog.id },
            data: { clicked: true },
          });
        } catch (e) {
          console.warn('[Tracking] Failed to update click status:', e);
        }
      }
    }

    // Track conversion event if applicable
    await trackConversionEvent(trackingData, 'click');

    return { success: true, notificationId: notificationLog?.id };
  } catch (error) {
    console.error('[Tracking] Failed to track click:', error);
    return { success: false };
  }
}

/**
 * Track notification open (for emails with tracking pixels)
 */
export async function trackOpen(
  token: string,
  userAgent?: string,
  ipAddress?: string
): Promise<{ success: boolean }> {
  const trackingData = decodeTrackingToken(token);
  
  if (!trackingData) {
    return { success: false };
  }

  try {
    const notificationLog = await (prisma as any).notificationLog.findFirst({
      where: {
        userId: trackingData.userId,
        type: trackingData.type,
        channel: trackingData.channel,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (notificationLog && !notificationLog.read) {
      // Update with only fields that exist
      const updateData: any = {
        read: true,
      };
      
      try {
        await (prisma as any).notificationLog.update({
          where: { id: notificationLog.id },
          data: updateData,
        });
      } catch (error: any) {
        // If update fails, try with minimal data
        try {
          await (prisma as any).notificationLog.update({
            where: { id: notificationLog.id },
            data: { read: true },
          });
        } catch (e) {
          console.warn('[Tracking] Failed to update read status:', e);
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error('[Tracking] Failed to track open:', error);
    return { success: false };
  }
}

/**
 * Track conversion events (e.g., user upgraded after expiration warning)
 */
export async function trackConversionEvent(
  trackingData: TrackingData,
  eventType: 'click' | 'upgrade' | 'meal_plan_created' | 'recipe_saved' | 'pantry_updated',
  metadata?: Record<string, any>
): Promise<void> {
  try {
    // Create conversion log
    await (prisma as any).notificationConversion.create({
      data: {
        userId: trackingData.userId,
        notificationType: trackingData.type,
        notificationChannel: trackingData.channel,
        eventType,
        metadata: metadata || {},
      },
    });
  } catch (error) {
    // Conversion log table might not exist yet
    console.warn('[Tracking] Conversion logging not available:', error);
  }
}

/**
 * Get notification analytics for admin dashboard
 */
export async function getNotificationAnalytics(
  startDate?: Date,
  endDate?: Date
): Promise<{
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  openRate: number;
  clickRate: number;
  clickToOpenRate: number;
  byType: Record<string, {
    sent: number;
    opened: number;
    clicked: number;
    openRate: number;
    clickRate: number;
  }>;
  byChannel: Record<string, {
    sent: number;
    opened: number;
    clicked: number;
    openRate: number;
    clickRate: number;
  }>;
  conversions: {
    upgrades: number;
    mealPlansCreated: number;
    recipesSaved: number;
  };
  topPerforming: Array<{
    type: string;
    channel: string;
    sent: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
  }>;
}> {
  try {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: last 30 days
    const end = endDate || new Date();

    // Get all notifications in date range
    const notifications = await (prisma as any).notificationLog.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });

    // Calculate metrics
    const totalSent = notifications.length;
    const totalOpened = notifications.filter((n: any) => n.read).length;
    const totalClicked = notifications.filter((n: any) => n.clicked).length;
    const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
    const clickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;
    const clickToOpenRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0;

    // Group by type
    const byType: Record<string, any> = {};
    notifications.forEach((n: any) => {
      if (!byType[n.type]) {
        byType[n.type] = { sent: 0, opened: 0, clicked: 0 };
      }
      byType[n.type].sent++;
      if (n.read) byType[n.type].opened++;
      if (n.clicked) byType[n.type].clicked++;
    });

    // Calculate rates for each type
    Object.keys(byType).forEach((type) => {
      const stats = byType[type];
      stats.openRate = stats.sent > 0 ? (stats.opened / stats.sent) * 100 : 0;
      stats.clickRate = stats.sent > 0 ? (stats.clicked / stats.sent) * 100 : 0;
    });

    // Group by channel
    const byChannel: Record<string, any> = {};
    notifications.forEach((n: any) => {
      if (!byChannel[n.channel]) {
        byChannel[n.channel] = { sent: 0, opened: 0, clicked: 0 };
      }
      byChannel[n.channel].sent++;
      if (n.read) byChannel[n.channel].opened++;
      if (n.clicked) byChannel[n.channel].clicked++;
    });

    // Calculate rates for each channel
    Object.keys(byChannel).forEach((channel) => {
      const stats = byChannel[channel];
      stats.openRate = stats.sent > 0 ? (stats.opened / stats.sent) * 100 : 0;
      stats.clickRate = stats.sent > 0 ? (stats.clicked / stats.sent) * 100 : 0;
    });

    // Get conversions
    const conversions = {
      upgrades: 0,
      mealPlansCreated: 0,
      recipesSaved: 0,
    };

    try {
      const conversionEvents = await (prisma as any).notificationConversion.findMany({
        where: {
          createdAt: {
            gte: start,
            lte: end,
          },
        },
      });

      conversionEvents.forEach((event: any) => {
        if (event.eventType === 'upgrade') conversions.upgrades++;
        if (event.eventType === 'meal_plan_created') conversions.mealPlansCreated++;
        if (event.eventType === 'recipe_saved') conversions.recipesSaved++;
      });
    } catch (error) {
      // Conversion table might not exist
      console.warn('[Analytics] Conversion tracking not available');
    }

    // Calculate top performing notifications
    const performanceMap = new Map<string, any>();
    notifications.forEach((n: any) => {
      const key = `${n.type}:${n.channel}`;
      if (!performanceMap.has(key)) {
        performanceMap.set(key, {
          type: n.type,
          channel: n.channel,
          sent: 0,
          opened: 0,
          clicked: 0,
          conversions: 0,
        });
      }
      const perf = performanceMap.get(key);
      perf.sent++;
      if (n.read) perf.opened++;
      if (n.clicked) perf.clicked++;
    });

    const topPerforming = Array.from(performanceMap.values())
      .map((perf) => ({
        ...perf,
        openRate: perf.sent > 0 ? (perf.opened / perf.sent) * 100 : 0,
        clickRate: perf.sent > 0 ? (perf.clicked / perf.sent) * 100 : 0,
        conversionRate: perf.sent > 0 ? (perf.conversions / perf.sent) * 100 : 0,
      }))
      .sort((a, b) => b.clickRate - a.clickRate)
      .slice(0, 10);

    return {
      totalSent,
      totalOpened,
      totalClicked,
      openRate: Math.round(openRate * 100) / 100,
      clickRate: Math.round(clickRate * 100) / 100,
      clickToOpenRate: Math.round(clickToOpenRate * 100) / 100,
      byType,
      byChannel,
      conversions,
      topPerforming,
    };
  } catch (error) {
    console.error('[Analytics] Failed to get notification analytics:', error);
    // Return empty analytics if tables don't exist
    return {
      totalSent: 0,
      totalOpened: 0,
      totalClicked: 0,
      openRate: 0,
      clickRate: 0,
      clickToOpenRate: 0,
      byType: {},
      byChannel: {},
      conversions: {
        upgrades: 0,
        mealPlansCreated: 0,
        recipesSaved: 0,
      },
      topPerforming: [],
    };
  }
}

