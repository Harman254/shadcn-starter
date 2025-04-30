// components/Hero8.tsx

import React from "react";

type ButtonProps = {
  variant?: "default" | "ghost";
  children: React.ReactNode;
};

const Button = ({ variant = "default", children }: ButtonProps) => {
  const baseClasses =
    "inline-flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors";
  const variantClasses = {
    default: "bg-black text-white hover:bg-gray-800",
    ghost: "bg-transparent border border-gray-300 hover:bg-gray-100",
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]}`}>
      {children}
    </button>
  );
};

const Hero8 = () => {
  return (
    <section className="py-32">
      <div className="overflow-hidden border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="mx-auto flex max-w-5xl flex-col items-center">
            <div className="z-10 text-center">
              <h1 className="mb-8 text-4xl font-semibold lg:text-7xl">
                Turn Ingredients into Magic Ai
              </h1>
              <p className="mx-auto max-w-screen-md text-gray-600 lg:text-xl">
                Transform everyday ingredients into delicious meals with the power of Ai.
                Whether you are planning, grocery shopping, or cooking on the fly, our Ai
                assistant helps you create magic instantly.
              </p>
              <div className="mt-12 flex w-full flex-col justify-center gap-2 sm:flex-row">
                <Button>
                  Get started now
                  <span className="ml-2">&rarr;</span>
                </Button>
                <Button variant="ghost">
                  Learn more
                  <span className="ml-2">&rarr;</span>
                </Button>
              </div>
            </div>
          </div>
          <img
            src="/hero.jpg"
            alt="Hero image"
            className="mx-auto mt-24 max-h-96 w-full max-w-7xl rounded-t-lg object-cover shadow-lg"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero8;
