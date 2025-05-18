import {
  DollarSign,
  MessageSquare,
  PersonStanding,
  Timer,
  Zap,
  ZoomIn,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface FeatureProps {
  heading?: string;
  subheading?: string;
  features?: Feature[];
}

const FeatureComponent = ({
  heading = "Smarter Meal Planning",
  subheading = "Why You'll Love It",
  features = [
    {
      title: "Fast Planning",
      description: "No more stress or dinner dread—get smart plans in seconds instead.",
      icon: <Timer className="size-5 md:size-6" aria-hidden="true" />,
    },
    {
      title: "Smart Recipes",
      description: "AI picks meals that match your goal—from bulking up to self-control.",
      icon: <Zap className="size-5 md:size-6" aria-hidden="true" />,
    },
    {
      title: "Healthy Choices",
      description: "Eat with balance, taste, and flair—our plans are built with expert care.",
      icon: <ZoomIn className="size-5 md:size-6" aria-hidden="true" />,
    },
    {
      title: "For Everyone",
      description: "Solo, family, fit, or new—we've got the perfect plan for you.",
      icon: <PersonStanding className="size-5 md:size-6" aria-hidden="true" />,
    },
    {
      title: "Budget Friendly",
      description: "Stick to meals that save you cash—without dull food or boring hash.",
      icon: <DollarSign className="size-5 md:size-6" aria-hidden="true" />,
    },
    {
      title: "Live Support",
      description: "Questions? Feedback? Hit us fast—our friendly help is built to last.",
      icon: <MessageSquare className="size-5 md:size-6" aria-hidden="true" />,
    },
  ],
}: FeatureProps) => {
  return (
    <section className="relative py-24 sm:py-32 bg-gradient-to-b from-muted/30 to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-block text-green-800 rounded-lg bg-green-100 px-3 py-1 text-sm dark:bg-green-900 dark:text-green-200 mb-6">
          {subheading}
        </div>
        <h2 className="text-4xl sm:text-6xl font-bold tracking-tight mb-8">
          {heading}
        </h2>
        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground mb-16">
          Discover what makes our AI-powered plans the easiest way to eat well, save time, and stay on track.
        </p>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="relative group rounded-2xl border border-border bg-background/80 backdrop-blur-lg shadow-md hover:shadow-lg transition-all duration-300 p-6"
            >
              <div className="flex items-center justify-center size-12 mb-4 rounded-xl bg-white/10 border border-white/10 backdrop-blur-md shadow-inner text-primary">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">{feature.description}</p>
              <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-primary/30 transition duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureComponent;
