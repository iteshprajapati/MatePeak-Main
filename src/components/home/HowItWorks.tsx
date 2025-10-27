
import React, { useState } from "react";
import { Search, CalendarDays, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  {
    title: "Find Your Mentor",
    subtitle: "Browse Experts",
    description: "Discover top mentors by skill, domain, or passion.",
    icon: Search,
    color: "from-amber-50/80 via-white to-amber-50/50",
  },
  {
    title: "Book a Session",
    subtitle: "Pick a Time",
    description: "Choose when and what you'd like to discuss.",
    icon: CalendarDays,
    color: "from-blue-50/40 via-white to-blue-50/30",
  },
  {
    title: "Connect & Grow",
    subtitle: "Learn & Evolve",
    description: "Join your session and grow with guidance.",
    icon: Users,
    color: "from-green-50/40 via-white to-green-50/30",
  },
];

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

const HowItWorks = ({ sectionRef }: { sectionRef: React.RefObject<HTMLDivElement> }) => {
  const [active, setActive] = useState(0);

  const goLeft = () => setActive((prev) => mod(prev - 1, steps.length));
  const goRight = () => setActive((prev) => mod(prev + 1, steps.length));

  return (
    <section
      ref={sectionRef}
      className="py-24 md:py-32 bg-gradient-to-b from-white via-slate-50/30 to-white"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-matepeak-primary mb-5 font-poppins tracking-tight">
            How MatePeak Works
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
            Get mentorship in three easy steps—from browsing experts to growing your skills.
          </p>
        </div>
        <div className="relative flex items-center justify-center mb-16 select-none overflow-visible">
          <button
            aria-label="Previous step"
            onClick={goLeft}
            className="z-20 absolute left-4 md:left-20 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200/50 rounded-full w-12 h-12 flex items-center justify-center transition-all hover:shadow-xl hover:scale-110 hover:bg-white focus:outline-none active:scale-95"
          >
            <svg width={24} height={24} viewBox="0 0 24 24" stroke="#555" fill="none"><path d="M15 18l-6-6 6-6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div className="flex w-full max-w-5xl items-center justify-center h-[380px] md:h-[320px] relative px-16 md:px-24">
            {[...Array(3)].map((_, i) => {
              const stepIdx = mod(active + i - 1, steps.length);
              let pos = i - 1;

              const step = steps[stepIdx];
              let scale = pos === 0 ? "scale-100" : "scale-85";
              let blur = pos === 0 ? "blur-0" : "blur-[0.8px]";
              let z = pos === 0 ? "z-10" : "z-0";
              let opacity = pos === 0 ? "opacity-100" : "opacity-50";
              let yTrans = pos === 0 ? "translate-y-0" : "translate-y-4";
              let boxShadow = pos === 0 ? "shadow-2xl" : "shadow-md";

              return (
                <div
                  key={step.title}
                  aria-hidden={pos !== 0}
                  className={cn(
                    "absolute transition-all duration-700 ease-out flex flex-col items-center w-5/6 md:w-2/5 max-w-lg mx-auto cursor-default",
                    scale,
                    blur,
                    z,
                    opacity,
                    yTrans,
                    boxShadow
                  )}
                  style={{
                    left:
                      pos === -1
                        ? "0%"
                        : pos === 1
                        ? "60%"
                        : "30%",
                  }}
                >
                  <div
                    className={cn(
                      "w-full rounded-3xl bg-gradient-to-br backdrop-blur-sm",
                      step.color,
                      "p-12 flex flex-col items-center min-h-[300px] border border-gray-200/40"
                    )}
                  >
                    <div
                      className={cn(
                        "w-20 h-20 rounded-full bg-white flex items-center justify-center mb-8 shadow-lg group transition-all duration-300 border border-gray-100/50",
                        "hover:scale-110 hover:shadow-xl hover:border-gray-200"
                      )}
                    >
                      <step.icon
                        size={42}
                        className="text-matepeak-primary transition-transform group-hover:scale-110"
                        strokeWidth={2}
                      />
                    </div>
                    <span className="uppercase text-xs text-matepeak-secondary font-bold tracking-widest mb-3 opacity-60">
                      {step.subtitle}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-bold mb-4 text-matepeak-primary tracking-tight leading-tight">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-center text-base leading-relaxed font-normal max-w-xs">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            aria-label="Next step"
            onClick={goRight}
            className="z-20 absolute right-4 md:right-20 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200/50 rounded-full w-12 h-12 flex items-center justify-center transition-all hover:shadow-xl hover:scale-110 hover:bg-white focus:outline-none active:scale-95"
          >
            <svg width={24} height={24} viewBox="0 0 24 24" stroke="#555" fill="none"><path d="M9 6l6 6-6 6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
        <div className="text-center mt-12">
          <a href="/how-it-works">
            <button
              className="rounded-full border-2 border-matepeak-primary/80 text-matepeak-primary font-semibold px-12 py-4 text-base group relative transition-all bg-white hover:bg-matepeak-primary hover:text-white hover:shadow-xl hover:border-matepeak-primary hover:-translate-y-0.5 active:translate-y-0"
            >
              <span className="relative z-10 flex items-center">
                Learn More About How It Works
                <svg
                  className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path d="M5 12h14M13 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
