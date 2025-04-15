import { ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

const Hero8 = () => {
  return (
    <section className="py-32">
      <div className="overflow-hidden border-b border-muted">
        <div className="container">
          <div className="mx-auto flex max-w-5xl flex-col items-center">
            <div className="z-10 items-center text-center">
              <h1 className="mb-8 text-4xl font-semibold text-pretty lg:text-7xl">
                Turn Ingredients into Magic Ai
              </h1>
              <p className="mx-auto max-w-screen-md text-muted-foreground lg:text-xl">
                Transform everyday ingredients into delicious meals with the power of Ai. Whether you're planning, grocery shopping or cooking on the fly, our Ai assistant helps you create magic on the fly
              </p>
              <div className="mt-12 flex w-full flex-col justify-center gap-2 sm:flex-row">
                <Button>
                  Get started now
                  <ChevronRight className="ml-2 h-4" />
                </Button>
                <Button variant="ghost">
                  Learn more
                  <ChevronRight className="ml-2 h-4" />
                </Button>
              </div>
            </div>
          </div>
          <img
            src="/hero.png"
            alt="placeholder"
            className="mx-auto mt-24 max-h-[700px] w-full max-w-7xl rounded-t-lg object-cover shadow-lg"
          />
        </div>
      </div>
    </section>
  );
};

export { Hero8 };
