"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface KatanaSequenceProps {
  frameCount: number;
}

export const KatanaSequence: React.FC<KatanaSequenceProps> = ({ frameCount }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;
    let failedCount = 0;

    const timeout = setTimeout(() => {
        if (!isLoaded) {
            setUseFallback(true);
            setIsLoaded(true);
        }
    }, 3000); 

    const preload = () => {
      for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        const frameIndex = i.toString().padStart(3, "0");
        img.src = `/sequence/ezgif-frame-${frameIndex}.png`;
        img.onload = () => {
          loadedCount++;
          setLoadingProgress(Math.floor((loadedCount / frameCount) * 100));
          if (loadedCount + failedCount === frameCount) {
            setImages(loadedImages);
            if (failedCount < frameCount) {
                setIsLoaded(true);
                clearTimeout(timeout);
            }
          }
        };
        img.onerror = () => {
            failedCount++;
            if (loadedCount + failedCount === frameCount) {
                setUseFallback(true);
                setIsLoaded(true);
                clearTimeout(timeout);
            }
        };
        loadedImages[i - 1] = img;
      }
    };
    preload();
    return () => clearTimeout(timeout);
  }, [frameCount, isLoaded]);

  useEffect(() => {
    if (!isLoaded || useFallback || !images.length || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const sequenceObj = { frame: 0 };

    const render = (index: number) => {
      const img = images[index];
      if (!img) return;

      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      const imgRatio = img.width / img.height;
      const winRatio = width / height;

      let drawWidth, drawHeight, offsetX, offsetY;

      if (imgRatio > winRatio) {
        drawWidth = width * 0.8; 
        drawHeight = drawWidth / imgRatio;
        offsetX = (width - drawWidth) / 2;
        offsetY = (height - drawHeight) / 2;
      } else {
        drawHeight = height * 0.8;
        drawWidth = drawHeight * imgRatio;
        offsetY = (height - drawHeight) / 2;
        offsetX = (width - drawWidth) / 2;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };

    render(0);

    const tl = gsap.to(sequenceObj, {
      frame: frameCount - 1,
      snap: "frame",
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.5,
      },
      onUpdate: () => render(Math.floor(sequenceObj.frame))
    });

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, [isLoaded, images, frameCount, useFallback]);

  return (
    <div ref={containerRef} className="relative h-[400vh] w-full bg-[#fff1eb]">
      
      {/* Loading Overlay */}
      {!isLoaded && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#fff1eb]">
          <div className="h-[1px] w-48 bg-slate-950/10 relative">
             <div 
               className="absolute left-0 top-0 h-full bg-slate-950 transition-all duration-300"
               style={{ width: `${loadingProgress}%` }}
             />
          </div>
        </div>
      )}

      {/* Sticky Context */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center bg-[#fff1eb]">
        
        {/* CENTERED IMAGE SEQUENCE OR HERO IMAGE FALLBACK */}
        {!useFallback ? (
            <canvas 
                ref={canvasRef} 
                className="h-full w-full pointer-events-none mix-blend-multiply opacity-80" 
            />
        ) : (
            /* HERO IMAGE REPLACEMENT */
            <div className="relative w-full max-w-4xl aspect-video flex items-center justify-center opacity-90">
                <img 
                    src="/hero.png" 
                    alt="Nuvia Hero" 
                    className="w-full h-full object-contain"
                />
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#fff1eb] to-transparent pointer-events-none" />
            </div>
        )}
        
        {/* Background Visual Depth */}
        <div className="absolute inset-0 flex items-center justify-center -z-10 opacity-[0.03] select-none pointer-events-none">
           <span className="font-instrument text-[20vw] italic leading-none text-slate-950 lowercase">nuvia logic</span>
        </div>
      </div>
    </div>
  );
};
