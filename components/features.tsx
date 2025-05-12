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
  color?: string;
}

interface Feature17Props {
  heading?: string;
  subheading?: string;
  features?: Feature[];
}

const iconColors = [
  "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300",
  "bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-300",
  "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-300",
  "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-300",
  "bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-300",
  "bg-cyan-100 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-300",
];

const FeatureComponent = ({
  heading = "Smarter Meal Planning",
  subheading = "Why You'll Love It",
  features = [
    {
      title: "Fast Planning",
      description:
        "No more stress or dinner dread—get smart plans in seconds instead.",
      icon: <Timer className="size-4 md:size-6" />,
    },
    {
      title: "Smart Recipes",
      description:
        "AI picks meals that match your goal—from bulking up to self-control.",
      icon: <Zap className="size-4 md:size-6" />,
    },
    {
      title: "Healthy Choices",
      description:
        "Eat with balance, taste, and flair—our plans are built with expert care.",
      icon: <ZoomIn className="size-4 md:size-6" />,
    },
    {
      title: "For Everyone",
      description:
        "Solo, family, fit, or new—we've got the perfect plan for you.",
      icon: <PersonStanding className="size-4 md:size-6" />,
    },
    {
      title: "Budget Friendly",
      description:
        "Stick to meals that save you cash—without dull food or boring hash.",
      icon: <DollarSign className="size-4 md:size-6" />,
    },
    {
      title: "Live Support",
      description:
        "Questions? Feedback? Hit us fast—our friendly help is built to last.",
      icon: <MessageSquare className="size-4 md:size-6" />,
    },
  ],
}: Feature17Props) => {
  return (
    <section className="py-20 md:py-28 lg:py-32 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto max-w-screen-xl px-4">
        <div className="max-w-2xl mx-auto text-center mb-12 md:mb-16 lg:mb-20">
          <p className="inline-block px-3 py-1 mb-4 text-sm font-medium rounded-full bg-muted text-muted-foreground">
            {subheading}
          </p>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">{heading}</h2>
          <div className="w-16 h-1 mx-auto mt-6 rounded-full bg-primary"></div>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => (
            <div 
              className="group relative flex flex-col p-6 bg-background border rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1" 
              key={idx}
            >
              <span className={cn(
                "mb-5 flex size-12 items-center justify-center rounded-xl",
                iconColors[idx % iconColors.length]
              )}>
                {feature.icon}
              </span>
              <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
              <div className="absolute top-0 left-0 w-full h-full rounded-2xl border-primary/0 transition-all duration-300 group-hover:border group-hover:border-primary/20"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureComponent;