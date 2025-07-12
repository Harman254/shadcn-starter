import { Metadata } from 'next'
import { fetchMealPlanById } from "@/data";
import { MealPlan, MealPlanDetailPageProps } from "./components/types";
import MealPlanNotFound from "./components/meal-plan-not-found";
import MealPlanHeader from "./components/meal-plan-header";
import MealPlanStatCards from "./components/meal-plan-stat-cards";
import MealPlanCalendar from "./components/meal-plan-calendar";
import DayMealCard from "./components/day-meal-card";
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import Footer from '@/components/footer';

// Generate metadata for the meal plan detail page
export async function generateMetadata({ params }: MealPlanDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const mealPlan: MealPlan | null = await fetchMealPlanById(id);

  if (!mealPlan) {
    return {
      title: 'Meal Plan Not Found | MealWise',
      description: 'The requested meal plan could not be found.',
    };
  }

  const totalPlanCalories = mealPlan.days.reduce(
    (sum, day) => sum + day.meals.reduce((daySum, meal) => daySum + meal.calories, 0),
    0
  );
  const avgCaloriesPerDay = Math.round(totalPlanCalories / mealPlan.days.length);

  return {
    title: `${mealPlan.title} | ${mealPlan.duration}-Day Meal Plan | MealWise`,
    description: `Explore your ${mealPlan.duration}-day meal plan: ${mealPlan.title}. ${mealPlan.mealsPerDay} meals per day, averaging ${avgCaloriesPerDay} calories daily. View detailed nutrition information, recipes, and meal schedules.`,
    keywords: [
      'meal plan',
      'nutrition plan',
      'meal schedule',
      'diet plan',
      'healthy eating',
      'meal prep',
      'nutrition tracking',
      'calorie tracking',
      'meal planning',
      'personalized nutrition',
      mealPlan.title.toLowerCase(),
      `${mealPlan.duration} day plan`,
      `${mealPlan.mealsPerDay} meals per day`
    ],
    authors: [{ name: 'MealWise Team' }],
    creator: 'MealWise',
    publisher: 'MealWise',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL('https://www.aimealwise.com'),
    alternates: {
      canonical: `/meal-plans/${id}`,
    },
    openGraph: {
      title: `${mealPlan.title} | ${mealPlan.duration}-Day Meal Plan | MealWise`,
      description: `Explore your ${mealPlan.duration}-day meal plan: ${mealPlan.title}. ${mealPlan.mealsPerDay} meals per day, averaging ${avgCaloriesPerDay} calories daily. View detailed nutrition information, recipes, and meal schedules.`,
      url: `https://www.aimealwise.com/meal-plans/${id}`,
      siteName: 'MealWise',
      images: [
        {
          url: '/og-meal-plan-detail.png',
          width: 1200,
          height: 630,
          alt: `${mealPlan.title} - ${mealPlan.duration} Day Meal Plan`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${mealPlan.title} | ${mealPlan.duration}-Day Meal Plan | MealWise`,
      description: `Explore your ${mealPlan.duration}-day meal plan: ${mealPlan.title}. ${mealPlan.mealsPerDay} meals per day, averaging ${avgCaloriesPerDay} calories daily.`,
      images: ['/og-meal-plan-detail.png'],
      creator: '@mealwise',
      site: '@mealwise',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: 'your-google-verification-code',
      yandex: 'your-yandex-verification-code',
      yahoo: 'your-yahoo-verification-code',
    },
  };
}

const MealPlanDetailPage = async ({ params }: MealPlanDetailPageProps) => {
  const { id } = await params;
  const mealPlan: MealPlan | null = await fetchMealPlanById(id);

  const session = await auth.api.getSession({
    headers: await headers()
  });

  const userId = session?.user?.id;

  if (!mealPlan) {
    return <MealPlanNotFound />;
  }

  // Calculate statistics
  const totalPlanCalories = mealPlan.days.reduce(
    (sum, day) => sum + day.meals.reduce((daySum, meal) => daySum + meal.calories, 0),
    0
  );
  const avgCaloriesPerDay = Math.round(totalPlanCalories / mealPlan.days.length);

  return (
      <div className="max-w-7xl bg-background/95  mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <MealPlanHeader mealPlan={mealPlan} avgCaloriesPerDay={avgCaloriesPerDay} />

        <MealPlanStatCards
          duration={mealPlan.duration}
          mealsPerDay={mealPlan.mealsPerDay}
          avgCaloriesPerDay={avgCaloriesPerDay}
          totalPlanCalories={totalPlanCalories}
        />

        <MealPlanCalendar days={mealPlan.days} />

        <div className="grid gap-6 mt-8">
          {mealPlan.days.map((day, index) => (
            <DayMealCard key={day.id} day={day} dayIndex={index} userId={userId || ""} />
          ))}
        </div>
      </div>
    // </div>
  );
};

export default MealPlanDetailPage;

