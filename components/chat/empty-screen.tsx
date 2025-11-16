import { ArrowRight, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

interface EmptyScreenProps {
  onExampleClick: (example: string) => void;
  requireAuth?: boolean;
}

const exampleMessages = [
  {
    heading: 'Log a meal',
    message: 'I just ate a bowl of chicken noodle soup.',
  },
  {
    heading: 'Find a recipe',
    message: 'How do I make a classic lasagna?',
  },
  {
    heading: 'Get a suggestion',
    message: 'What\'s a healthy breakfast idea?',
  },
];

export function EmptyScreen({ onExampleClick, requireAuth = false }: EmptyScreenProps) {
  if (requireAuth) {
    return (
      <div 
        className="h-full flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-auto min-h-[60vh]"
        role="region"
        aria-labelledby="auth-title"
      >
        <div className="max-w-md w-full mx-auto text-center">
          <div className="inline-block p-4 bg-primary/10 rounded-full mb-4" aria-hidden="true">
            <LogIn className="h-10 w-10 text-primary" />
          </div>
          <h2 id="auth-title" className="text-2xl sm:text-3xl font-semibold text-foreground mb-3 tracking-tight">
            Sign in to Chat
          </h2>
          <p className="mt-2 text-muted-foreground text-sm sm:text-base leading-relaxed">
            Sign in to start chatting with your AI kitchen assistant. Get personalized recipes, meal tracking, and cooking tips.
          </p>
          <div className="mt-6 space-y-3">
            <Button
              onClick={() => onExampleClick('')}
              className="w-full h-auto py-3 px-4 bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
              aria-label="Sign in to continue chatting"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Sign in to Continue
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              New to Mealwise? Sign up for free to get started.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="h-full flex items-center justify-center overflow-auto"
      role="region"
      aria-labelledby="empty-title"
    >
      <div className="max-w-2xl w-full mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16">
        <div className="text-center mb-6 sm:mb-8 md:mb-10">
          <h2 
            id="empty-title" 
            className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground mb-2 sm:mb-3 tracking-tight leading-tight"
          >
            How can I help you today?
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4" role="group" aria-label="Example conversation starters">
          {exampleMessages.map((example) => (
            <Button
              key={example.heading}
              variant="outline"
              className="h-auto py-4 sm:py-5 px-4 sm:px-5 text-left justify-start hover:bg-muted/50 transition-colors group focus-visible:ring-2 focus-visible:ring-primary"
              onClick={() => onExampleClick(example.message)}
              aria-label={`Start conversation: ${example.message}`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm sm:text-base mb-1.5 group-hover:text-foreground text-foreground">{example.heading}</p>
                <p className="font-normal text-muted-foreground text-xs sm:text-sm line-clamp-2 leading-relaxed">
                  {example.message}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground ml-3 shrink-0 group-hover:text-foreground transition-colors" aria-hidden="true" />
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
