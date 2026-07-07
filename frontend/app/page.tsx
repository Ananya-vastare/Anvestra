"use client";
// Force re-validation


import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplineBackground from "@/components/SplineBackground";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Lenis for smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Initial load animations
    const headlines = document.querySelectorAll(".hero-text");
    gsap.fromTo(
      headlines,
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 1.5, ease: "power4.out", delay: 0.2 }
    );

    // Parallax text
    const parallaxTexts = document.querySelectorAll(".parallax-text");
    parallaxTexts.forEach((text) => {
      gsap.to(text, {
        y: -150,
        ease: "none",
        scrollTrigger: {
          trigger: text,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });

    return () => {
      lenis.destroy();
      gsap.ticker.remove((time) => { lenis.raf(time * 1000); });
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <main ref={containerRef} className="relative min-h-screen selection:bg-slate-950 selection:text-[#fff1eb]">
      <SplineBackground />

      {/* Navigation */}
      <nav className="fixed top-0 w-full p-8 sm:px-12 flex justify-between items-center z-50 mix-blend-difference top-nav pointer-events-auto">
        <div className="font-instrument text-3xl text-white">Anvestra</div>
        <div className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40 hidden sm:block">
          Heuristic Intelligence &bull; v2.4.0
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative h-screen w-full flex items-center justify-center pointer-events-none">
        <div className="text-center mt-32">
          <div className="mb-8">
            <div className="hero-text inline-flex items-center gap-3 px-6 py-2 rounded-full border border-slate-950/20 text-slate-950 text-[10px] font-black tracking-[0.3em] uppercase backdrop-blur-sm">
              <Sparkles className="w-4 h-4 fill-slate-950" />
              Next-Gen Heuristic Engine
            </div>
          </div>

          <h1 className="hero-text font-instrument text-[16vw] sm:text-[14vw] leading-[0.8] text-slate-950 tracking-[0.02em] drop-shadow-[0_30px_60px_rgba(0,0,0,0.2)] bg-gradient-to-b from-slate-950 via-slate-900 to-black bg-clip-text text-transparent pb-4">
            Anvestra
          </h1>

          <div className="mt-8 max-w-sm mx-auto">
            <p className="hero-text text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] leading-relaxed">
              Automated high-fidelity UX auditing for the modern web.
            </p>
          </div>
        </div>
      </header>

      {/* Spacing for scroll */}
      <div className="h-[20vh] pointer-events-none"></div>

      {/* Mission Section */}
      <section className="relative py-48 px-8 sm:px-12 z-10 pointer-events-auto">
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-32 items-start">
          <div className="parallax-text">
            <h2 className="font-instrument text-6xl sm:text-[7vw] leading-[0.85] tracking-tighter mb-16 text-slate-900 mix-blend-multiply">
              Scientific Precision In Every Pixel.
            </h2>
            <div className="h-0.5 w-48 bg-slate-900 mb-16 opacity-20" />
            <p className="text-xl text-slate-600 leading-relaxed font-medium max-w-sm">
              Nuvia deconstructs your interface into its fundamental heuristic components. A neural laboratory for the modern web.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "Visual Logic", desc: "Analyzing hierarchy through mathematical grid distribution." },
              { title: "Cognitive Load", desc: "Measuring information density and user friction points." },
              { title: "A11Y Patterning", desc: "Automated WCAG compliance via visual spectral analysis." },
              { title: "Strategic Fixes", desc: "Actionable UX modifications grounded in Nielsen's Heuristics." }
            ].map((feature, i) => (
              <div key={i} className="p-10 border border-slate-950/5 rounded-3xl hover:bg-white/40 hover:backdrop-blur-xl transition-all group backdrop-blur-sm">
                <span className="text-[10px] font-black tracking-[0.4em] uppercase text-slate-300 block mb-6">Pillar 0{i + 1}</span>
                <h3 className="text-xl font-bold mb-3 text-slate-950">{feature.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section className="relative min-h-screen py-32 px-8 sm:px-12 flex flex-col items-center justify-center z-10 pointer-events-auto">
        <div className="max-w-4xl text-center mb-24">
          <h2 className="font-instrument text-5xl sm:text-8xl text-slate-950 leading-[0.9] tracking-tighter mb-8 parallax-text">
            Truth in Design.
          </h2>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed parallax-text">
            Our engine leverages the global standard for usability evaluation, ensuring your product does not just look good—it performs.
          </p>
        </div>

        <div className="w-full max-w-6xl grid grid-cols-2 sm:grid-cols-5 gap-4 parallax-text">
          {["Consistency", "Efficiency", "Error Prevention", "Recognition", "Clarity"].map((pill) => (
            <div key={pill} className="bg-white border border-slate-100 p-8 rounded-[2rem] text-center shadow-xl hover:-translate-y-2 transition-transform">
              <div className="w-12 h-12 bg-slate-950 rounded-2xl mx-auto mb-6 flex items-center justify-center text-white font-bold text-xs uppercase tracking-tighter">
                {pill.charAt(0)}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-950">{pill}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 text-center z-10 pointer-events-auto">
        <div className="mb-20">
          <h2 className="font-instrument text-[10vw] sm:text-[8vw] leading-[0.8] text-slate-950 tracking-tighter mb-8 parallax-text">
            Ready to Evolve?
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 parallax-text">
            Initialize your first neural audit today.
          </p>
        </div>

        <Link href="/dashboard" className="parallax-text group z-50 pointer-events-auto cursor-pointer block">
          <div className="bg-slate-950 text-white rounded-[3.5rem] px-20 py-12 flex flex-col items-center justify-center cursor-pointer hover:bg-black transition-all hover:scale-105 duration-700 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden pointer-events-auto border-4 border-slate-900">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"></div>
            <span className="text-[14px] font-black uppercase tracking-[0.5em] mb-6 relative z-10">Launch Dashboard</span>
            <div className="w-20 h-20 rounded-full border-2 border-white/20 flex items-center justify-center group-hover:-rotate-45 transition-transform duration-700 relative z-10 bg-white/5">
              <ArrowRight className="w-8 h-8" />
            </div>
          </div>
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-950/10 flex flex-col sm:flex-row justify-between items-center px-12 text-slate-400 text-[10px] uppercase font-black tracking-[0.3em] relative z-10 pointer-events-auto gap-8">
        <div className="flex gap-12">
          <span className="hover:text-slate-950 transition-colors cursor-pointer">Intelligence</span>
          <span className="hover:text-slate-950 transition-colors cursor-pointer">Privacy</span>
          <span className="hover:text-slate-950 transition-colors cursor-pointer">Terms</span>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span>Anvestra Labs &copy; {new Date().getFullYear()}</span>
          <span className="text-slate-950 font-bold tracking-[0.5em]">Aesthetic Computation</span>
        </div>
      </footer>
    </main>
  );
}