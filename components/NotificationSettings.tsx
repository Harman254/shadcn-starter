'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Bell, BellOff, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import { usePushEngage } from '@/hooks/usePushEngage';
import toast from 'react-hot-toast';

const NotificationSettings = () => {
  const { isSubscribed, isSupported, isLoading, subscribe, unsubscribe } = usePushEngage();
  const [settings, setSettings] = useState({
    mealPlanReminders: true,
    newRecipes: true,
    nutritionTips: true,
    weeklyReports: false,
    specialOffers: false,
  });

  const handleSubscribe = async () => {
    try {
      await subscribe();
      toast.success('Successfully subscribed to notifications!');
    } catch (error) {
      toast.error('Failed to subscribe to notifications');
      console.error('Subscription error:', error);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      await unsubscribe();
      toast.success('Successfully unsubscribed from notifications');
    } catch (error) {
      toast.error('Failed to unsubscribe from notifications');
      console.error('Unsubscription error:', error);
    }
  };

  const handleSettingChange = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    toast.success(`${key.replace(/([A-Z])/g, ' $1').toLowerCase()} ${settings[key] ? 'disabled' : 'enabled'}`);
  };

  if (!isSupported) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-200">Notifications Not Supported</h3>
              <p className="text-sm text-red-600 dark:text-red-300">
                Your browser doesn't support push notifications. Please use a modern browser like Chrome, Firefox, or Safari.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Stay updated with your meal planning progress and new features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Notification Status</p>
              <div className="flex items-center gap-2">
                {isSubscribed ? (
                  <>
                    <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Subscribed
                    </Badge>
                    <p className="text-sm text-green-600 dark:text-green-400">You&apos;ll receive notifications</p>
                  </>
                ) : (
                  <>
                    <Badge variant="secondary">
                      <BellOff className="h-3 w-3 mr-1" />
                      Not Subscribed
                    </Badge>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Enable to get notifications</p>
                  </>
                )}
              </div>
            </div>
            <Button
              onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
              disabled={isLoading}
              variant={isSubscribed ? "outline" : "default"}
              className={isSubscribed ? "border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/20" : ""}
            >
              {isLoading ? (
                "Loading..."
              ) : isSubscribed ? (
                "Unsubscribe"
              ) : (
                "Subscribe"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose which types of notifications you'd like to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="mealPlanReminders" className="font-medium">Meal Plan Reminders</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Get reminded about your daily meals and prep time
                </p>
              </div>
              <Switch
                id="mealPlanReminders"
                checked={settings.mealPlanReminders}
                onCheckedChange={() => handleSettingChange('mealPlanReminders')}
                disabled={!isSubscribed}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="newRecipes" className="font-medium">New Recipes</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Discover new recipes and meal ideas
                </p>
              </div>
              <Switch
                id="newRecipes"
                checked={settings.newRecipes}
                onCheckedChange={() => handleSettingChange('newRecipes')}
                disabled={!isSubscribed}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="nutritionTips" className="font-medium">Nutrition Tips</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Weekly nutrition advice and health tips
                </p>
              </div>
              <Switch
                id="nutritionTips"
                checked={settings.nutritionTips}
                onCheckedChange={() => handleSettingChange('nutritionTips')}
                disabled={!isSubscribed}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="weeklyReports" className="font-medium">Weekly Reports</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Summary of your meal planning progress
                </p>
              </div>
              <Switch
                id="weeklyReports"
                checked={settings.weeklyReports}
                onCheckedChange={() => handleSettingChange('weeklyReports')}
                disabled={!isSubscribed}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="specialOffers" className="font-medium">Special Offers</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Pro plan discounts and exclusive features
                </p>
              </div>
              <Switch
                id="specialOffers"
                checked={settings.specialOffers}
                onCheckedChange={() => handleSettingChange('specialOffers')}
                disabled={!isSubscribed}
              />
            </div>
          </div>

          {!isSubscribed && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Subscribe to push notifications to enable these preferences
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings; 