'use client'

const companies = [
    "Google",
    "Microsoft",
    "Amazon",
    "Netflix",
    "YouTube",
    "Instagram",
    "Uber",
    "Spotify",
  ];
  
  export function Companies() {
    // Duplicate the array for seamless looping
    const logos = [...companies, ...companies];
    return (
      <section id="companies">
        <div className="py-14">
          <div className="container mx-auto px-4 md:px-8">
            <h3 className="text-center text-sm font-semibold text-gray-500">
              Trusted by professionals from leading companies
            </h3>
            <div className="relative mt-6 overflow-hidden">
              <div className="marquee flex items-center gap-8 w-max animate-marquee">
                {logos.map((logo, idx) => (
                  <img
                    key={idx}
                    src={`https://cdn.magicui.design/companies/${logo}.svg`}
                    className="h-10 w-40 px-2 dark:brightness-0 dark:invert select-none pointer-events-none"
                    alt={logo}
                    draggable="false"
                  />
                ))}
              </div>
              <div className="pointer-events-none absolute inset-y-0 left-0 h-full w-1/3 bg-gradient-to-r from-white dark:from-black"></div>
              <div className="pointer-events-none absolute inset-y-0 right-0 h-full w-1/3 bg-gradient-to-l from-white dark:from-black"></div>
              <style jsx>{`
                .animate-marquee {
                  animation: marquee 32s linear infinite;
                }
                @keyframes marquee {
                  0% { transform: translateX(0); }
                  100% { transform: translateX(-50%); }
                }
              `}</style>
            </div>
          </div>
        </div>
      </section>
    );
  }
  