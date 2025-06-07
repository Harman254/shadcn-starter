import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Info, ArrowLeft } from "lucide-react";

export const MealPlanNotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="max-w-md w-full text-center">
        <CardContent className="pt-8 pb-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Info className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold mb-3">Meal Plan Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The requested meal plan could not be found or may have been deleted.
          </p>
          <Button asChild className="w-full">
            <a href="/meal-plans">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Meal Plans
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default MealPlanNotFound;

