'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProFeatures, PRO_FEATURES } from '@/hooks/use-pro-features';
import { Loader2, Upload, Link2, FileJson, Lock, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SubscriptionModal from '@/components/SubscriptionModal';

interface RecipeImportProps {
  onImportSuccess?: (recipe: any) => void;
}

export function RecipeImport({ onImportSuccess }: RecipeImportProps) {
  const { isPro, hasFeature, requestUpgradeModal } = useProFeatures();
  const { toast } = useToast();
  const [importType, setImportType] = useState<'url' | 'json'>('url');
  const [url, setUrl] = useState('');
  const [jsonData, setJsonData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const canImport = hasFeature('recipe-import');

  const handleImport = async () => {
    if (!canImport) {
      requestUpgradeModal(PRO_FEATURES['recipe-import']);
      setUpgradeModalOpen(true);
      return;
    }

    if (importType === 'url' && !url.trim()) {
      toast({
        title: 'URL required',
        description: 'Please enter a recipe URL',
        variant: 'destructive',
      });
      return;
    }

    if (importType === 'json' && !jsonData.trim()) {
      toast({
        title: 'Recipe data required',
        description: 'Please enter recipe data in JSON format',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/recipes/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: importType === 'url' ? url : undefined,
          recipeData: importType === 'json' ? JSON.parse(jsonData) : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.requiresPro) {
          requestUpgradeModal(PRO_FEATURES['recipe-import']);
          setUpgradeModalOpen(true);
        } else {
          throw new Error(data.error || 'Failed to import recipe');
        }
        return;
      }

      toast({
        title: 'Recipe imported!',
        description: 'Your recipe has been imported successfully.',
      });

      // Reset form
      setUrl('');
      setJsonData('');

      // Callback
      if (onImportSuccess) {
        onImportSuccess(data.recipe);
      }
    } catch (error: any) {
      toast({
        title: 'Import failed',
        description: error.message || 'Failed to import recipe. Please check the URL or data format.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!canImport) {
    return (
      <>
        <Card className="border-dashed">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Recipe Import
              </CardTitle>
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded-full text-xs font-medium">
                <Crown className="h-3 w-3" />
                Pro
              </span>
            </div>
            <CardDescription>
              Import recipes from external sources like AllRecipes, Food Network, and more.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Upgrade to Pro to import recipes from popular recipe websites or JSON format.
              </p>
              <Button
                onClick={() => {
                  requestUpgradeModal(PRO_FEATURES['recipe-import']);
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
          featureId="recipe-import"
          open={upgradeModalOpen}
          onOpenChange={setUpgradeModalOpen}
        />
      </>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Recipe
          </CardTitle>
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-medium">
            <Crown className="h-3 w-3" />
            Pro
          </span>
        </div>
        <CardDescription>
          Import recipes from external sources or JSON format.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Import Type Selection */}
        <div className="flex gap-2">
          <Button
            variant={importType === 'url' ? 'default' : 'outline'}
            onClick={() => setImportType('url')}
            className="flex-1"
          >
            <Link2 className="h-4 w-4 mr-2" />
            From URL
          </Button>
          <Button
            variant={importType === 'json' ? 'default' : 'outline'}
            onClick={() => setImportType('json')}
            className="flex-1"
          >
            <FileJson className="h-4 w-4 mr-2" />
            From JSON
          </Button>
        </div>

        {/* URL Input */}
        {importType === 'url' && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Recipe URL</label>
            <Input
              placeholder="https://www.allrecipes.com/recipe/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Supports AllRecipes, Food Network, and other sites with structured data.
            </p>
          </div>
        )}

        {/* JSON Input */}
        {importType === 'json' && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Recipe Data (JSON)</label>
            <Textarea
              placeholder='{"name": "Recipe Name", "ingredients": [...], "instructions": "..."}'
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              disabled={isLoading}
              rows={8}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Enter recipe data in JSON format with name, ingredients, instructions, etc.
            </p>
          </div>
        )}

        {/* Import Button */}
        <Button
          onClick={handleImport}
          disabled={isLoading || (importType === 'url' && !url.trim()) || (importType === 'json' && !jsonData.trim())}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Import Recipe
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

