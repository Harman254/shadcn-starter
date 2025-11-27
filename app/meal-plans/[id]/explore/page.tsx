import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { NutritionOverview } from "@/components/meal-plan-explore/NutritionOverview";
import { ConsolidatedShoppingList } from "@/components/meal-plan-explore/ConsolidatedShoppingList";
import { PrepTimeline } from "@/components/meal-plan-explore/PrepTimeline";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ExplorePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ExploreMealPlanPage({ params }: ExplorePageProps) {
  const { id } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const mealPlan = await prisma.mealPlan.findUnique({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      days: {
        include: {
          meals: true,
        },
        orderBy: {
          date: 'asc',
        },
      },
    },
  });

  if (!mealPlan) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center gap-4">
        <Link href={`/meal-plans/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Explore Plan</h1>
          <p className="text-muted-foreground">
            {mealPlan.title} • {mealPlan.duration} Days
          </p>
        </div>
      </div>

      <NutritionOverview mealPlan={mealPlan} />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PrepTimeline mealPlan={mealPlan} />
        </div>
        <div>
          <ConsolidatedShoppingList mealPlan={mealPlan} />
        </div>
      </div>
    </div>
  );
}
