'use client'
import  Link  from "next/link";
import { useEffect } from "react";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = window.location;

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center space-y-8 animate-fade-in">
        {/* 404 Text with gradient */}
        <div className="relative">
          <h1 className="text-9xl md:text-[12rem] font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 text-9xl md:text-[12rem] font-bold text-primary/5 leading-none select-none">
            404
          </div>
        </div>

        {/* Main content */}
        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Oops! Page not found
            </h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
              The page you're looking for doesn't exist or has been moved to a different location.
            </p>
          </div>

          {/* Current path display */}
          <div className="inline-flex items-center px-4 py-2 bg-muted/50 rounded-lg border border-border/50">
            <Search className="w-4 h-4 mr-2 text-muted-foreground" />
            <code className="text-sm text-muted-foreground font-mono">
              {location.pathname}
            </code>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Button asChild size="lg" className="hover-scale group">
            <Link href="/" className="flex items-center gap-2">
              <Home className="w-4 h-4 transition-transform group-hover:scale-110" />
              Go Home
            </Link>
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => window.history.back()}
            className="hover-scale group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Go Back
          </Button>
        </div>

        {/* Decorative elements */}
        <div className="relative pt-8">
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <div className="w-32 h-32 bg-primary/10 rounded-full blur-xl animate-pulse"></div>
          </div>
          <div className="relative">
            <p className="text-sm text-muted-foreground">
              Error code: <span className="font-mono text-primary">404</span>
            </p>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
    </div>
  );
};

export default NotFound;