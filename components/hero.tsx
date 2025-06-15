import { ArrowRight, ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";

interface Hero1Props {
  badge?: string;
  heading: string;
  description: string;
  buttons?: {
    primary?: {
      text: string;
      url: string;
    };
    secondary?: {
      text: string;
      url: string;
    };
  };
  image: {
    src: string;
    alt: string;
  };
}

const Hero1 = async ({
  badge = "🥗 Checkout grocery lists",
  heading = "Personalized AI Meal Plans for Your Lifestyle",
  description = "Get custom weekly meal plans, grocery lists, and recipes—all tailored to your diet, fitness goals, and household size. Save time, eat better, and stay on track effortlessly.",
  buttons = {
    primary: {
      text: "Get Started for Free",
      url: "/meal-plans/new",
    },
    secondary: {
      text: "How It Works",
      url: "/about",
    },
  },
  image = {
    src: "https://yourcdn.com/assets/mealwise-hero.png",
    alt: "Preview of Mealwise app generating a personalized meal plan",
  },
}: Hero1Props) => {


  const session = await auth.api.getSession({
    headers: await headers() // you need to pass the headers object.
});
  return (
    <section className="py-32">
      <div className="container">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            {badge && (
              <Badge variant="outline">
                {badge}
                <ArrowUpRight className="ml-2 size-4" />
              </Badge>
            )}
            <h1 className="my-6 text-pretty text-4xl font-bold lg:text-6xl">
              {heading}
            </h1>
            <p className="text-muted-foreground mb-8 max-w-xl lg:text-xl">
              {description}
            </p>
            <div className="flex w-full flex-col justify-center gap-2 sm:flex-row lg:justify-start">
              {buttons?.primary && (
                <Button asChild className="w-full sm:w-auto">
                  <Link href={buttons.primary.url}>
                    {session ?  'Create a Meal Plan' : buttons.primary.text }
                  </Link>
                </Button>
              )}
              {buttons?.secondary && (
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <Link href={buttons.secondary.url}>
                    {buttons.secondary.text}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
          <img
            src={image.src}
            alt={image.alt}
            className="max-h-96 w-full rounded-md object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export { Hero1 };
