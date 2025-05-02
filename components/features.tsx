import {
  DollarSign,
  MessageSquare,
  PersonStanding,
  Timer,
  Zap,
  ZoomIn,
} from "lucide-react";

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface Feature17Props {
  heading?: string;
  subheading?: string;
  features?: Feature[];
}

const Feature17 = ({
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
        "Solo, family, fit, or new—we’ve got the perfect plan for you.",
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
    <section className="py-32">
      <div className="container mx-auto max-w-screen-xl">
        <p className="mb-4 text-xs text-muted-foreground md:pl-5">
          {subheading}
        </p>
        <h2 className="text-3xl font-medium md:pl-5 lg:text-4xl">{heading}</h2>
        <div className="mx-auto mt-14 grid gap-x-20 gap-y-8 md:grid-cols-2 md:gap-y-6 lg:mt-20">
          {features.map((feature, idx) => (
            <div className="flex gap-6 rounded-lg md:block md:p-5" key={idx}>
              <span className="mb-8 flex size-10 shrink-0 items-center justify-center rounded-full bg-accent md:size-12">
                {feature.icon}
              </span>
              <div>
                <h3 className="font-medium md:mb-2 md:text-xl">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground md:text-base">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Feature17;
