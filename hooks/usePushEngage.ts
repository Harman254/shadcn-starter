'use client';

import { useState, useEffect, useCallback } from 'react';

declare global {
  interface Window {
    PushEngage: any[];
    _peq: any[];
  }
}

interface PushEngageHook {
  isSubscribed: boolean;
  isSupported: boolean;
  isLoading: boolean;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
  sendNotification: (title: string, message: string, url?: string) => Promise<void>;
}

export const usePushEngage = (): PushEngageHook => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = () => {
      const supported = 'serviceWorker' in navigator && 'PushManager' in window;
      setIsSupported(supported);
      setIsLoading(false);
    };

    checkSupport();
  }, []);

  // Check subscription status
  const checkSubscriptionStatus = useCallback(async () => {
    if (!isSupported) return;

    try {
      // Check if user is subscribed to PushEngage
      if (window.PushEngage && window.PushEngage.length > 0) {
        // You can add specific checks here based on PushEngage API
        // For now, we'll assume not subscribed initially
        setIsSubscribed(false);
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  }, [isSupported]);

  useEffect(() => {
    checkSubscriptionStatus();
  }, [checkSubscriptionStatus]);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!isSupported) {
      throw new Error('Push notifications are not supported in this browser');
    }

    try {
      setIsLoading(true);
      
      // Trigger PushEngage subscription
      if (window.PushEngage) {
        window.PushEngage.push(['subscribe']);
      }
      
      setIsSubscribed(true);
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    if (!isSupported) {
      throw new Error('Push notifications are not supported in this browser');
    }

    try {
      setIsLoading(true);
      
      // Trigger PushEngage unsubscription
      if (window.PushEngage) {
        window.PushEngage.push(['unsubscribe']);
      }
      
      setIsSubscribed(false);
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  // Send a notification (for testing or immediate notifications)
  const sendNotification = useCallback(async (title: string, message: string, url?: string) => {
    if (!isSupported) {
      throw new Error('Push notifications are not supported in this browser');
    }

    try {
      // This would typically be done server-side
      // For client-side testing, you can use the browser's notification API
      if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(title, {
          body: message,
          icon: '/favicon.ico', // Add your app icon
          badge: '/favicon.ico',
          tag: 'mealwise-notification',
          data: { url }
        });

        if (url) {
          notification.onclick = () => {
            window.open(url, '_blank');
            notification.close();
          };
        }
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }, [isSupported]);

  return {
    isSubscribed,
    isSupported,
    isLoading,
    subscribe,
    unsubscribe,
    sendNotification
  };
}; 