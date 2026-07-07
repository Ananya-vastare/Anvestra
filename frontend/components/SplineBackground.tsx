"use client";

import React, { useRef, useEffect } from "react";
import Spline from "@splinetool/react-spline";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SplineBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // MAGNIFIED 3D KINETICS
    // Starts even larger (1.5x) to occupy the initial viewport with massive presence
    gsap.fromTo(containerRef.current, 
      {
        scale: 1,
        y: "0%",
        opacity: 0.95
      },
      {
        scale: 0.3,
        y: "15%",
        opacity: 0.15,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: "body",
          start: "top top",
          end: "bottom bottom",
          scrub: 1.5,
        }
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-[100] bg-[#fff1eb] overflow-hidden pointer-events-none">
      <div 
        ref={containerRef}
        className="w-full h-full flex items-center justify-center translate-z-0"
      >
        <Spline 
          scene="https://prod.spline.design/plTvXZiXmJ4NBasT/scene.splinecode" 
          className="w-full h-full"
        />
      </div>
      
      <div className="absolute inset-0 bg-[#fff1eb] -z-[101]" />
    </div>
  );
}
