'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProFeatures, PRO_FEATURES } from '@/hooks/use-pro-features';
import { Loader2, Lock, Crown, Calendar, Users, DollarSign, Apple } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SubscriptionModal from '@/components/SubscriptionModal';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Template {
  id: string;
  name: string;
  description: string;
  duration: number;
  mealsPerDay: number;
  category: string;
  imageUrl: string;
}

export function TemplatesBrowser() {
  const { isPro, hasFeature, requestUpgradeModal } = useProFeatures();
  const { toast } = useToast();
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const canAccess = hasFeature('meal-plan-templates');

  useEffect(() => {
    if (canAccess) {
      fetchTemplates();
    } else {
      setIsLoading(false);
    }
  }, [canAccess]);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/meal-plans/templates');
      const data = await response.json();

      if (!response.ok) {
        if (data.requiresPro) {
          requestUpgradeModal(PRO_FEATURES['meal-plan-templates']);
          setUpgradeModalOpen(true);
        }
        return;
      }

      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load templates',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseTemplate = (template: Template) => {
    // Navigate to chat with template prompt
    const prompt = `Create a ${template.name.toLowerCase()} meal plan for ${template.duration} days with ${template.mealsPerDay} meals per day. Use the ${template.category} style.`;
    router.push(`/chat?prompt=${encodeURIComponent(prompt)}`);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'keto':
      case 'fitness':
        return <Apple className="h-5 w-5" />;
      case 'family':
        return <Users className="h-5 w-5" />;
      case 'budget':
        return <DollarSign className="h-5 w-5" />;
      default:
        return <Apple className="h-5 w-5" />;
    }
  };

  if (!canAccess) {
    return (
      <>
        <Card className="border-dashed">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Meal Plan Templates
              </CardTitle>
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded-full text-xs font-medium">
                <Crown className="h-3 w-3" />
                Pro
              </span>
            </div>
            <CardDescription>
              Access premium meal plan templates curated by nutrition experts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Upgrade to Pro to access 6+ premium meal plan templates including Keto, Mediterranean, Vegetarian, and more.
              </p>
              <Button
                onClick={() => {
                  requestUpgradeModal(PRO_FEATURES['meal-plan-templates']);
                  setUpgradeModalOpen(true);
                }}
                className="w-full"
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Pro
              </Button>
            </div>
          </CardContent>
        </Card>
        <SubscriptionModal
          featureId="meal-plan-templates"
          open={upgradeModalOpen}
          onOpenChange={setUpgradeModalOpen}
        />
      </>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          Premium Templates
        </h2>
        <p className="text-muted-foreground mt-1">
          Choose from expertly curated meal plan templates
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-32 bg-gradient-to-br from-primary/20 to-primary/5">
              {template.imageUrl ? (
                <Image
                  src={template.imageUrl}
                  alt={template.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  {getCategoryIcon(template.category)}
                </div>
              )}
            </div>
            <CardHeader>
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {template.duration} days
                </div>
                <div className="flex items-center gap-1">
                  {template.mealsPerDay} meals/day
                </div>
              </div>
              <Button
                onClick={() => handleUseTemplate(template)}
                className="w-full"
              >
                Use Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

