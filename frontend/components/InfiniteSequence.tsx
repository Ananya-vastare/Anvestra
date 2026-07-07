"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface InfiniteSequenceProps {
  frameCount: number;
}

export const InfiniteSequence: React.FC<InfiniteSequenceProps> = ({ frameCount }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [hasFinishedOnce, setHasFinishedOnce] = useState(false);

  // 1. Preload images
  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    const preload = () => {
      for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        const frameIndex = i.toString().padStart(3, "0");
        img.src = `/sequence/ezgif-frame-${frameIndex}.png`;
        img.onload = () => {
          loadedCount++;
          setLoadingProgress(Math.floor((loadedCount / frameCount) * 100));
          if (loadedCount === frameCount) {
            setImages(loadedImages);
            setIsLoaded(true);
          }
        };
        loadedImages[i - 1] = img;
      }
    };
    preload();
  }, [frameCount]);

  // 2. Playback Loop (Infinite)
  useEffect(() => {
    if (!isLoaded) return;

    let requestRef: number;
    let lastTime = 0;
    const fps = 24; 
    const interval = 1000 / fps;

    const animate = (time: number) => {
      if (time - lastTime > interval) {
        setCurrentFrame((prev) => {
          const next = (prev + 1) % frameCount;
          if (next === 0 && prev !== 0) {
            setHasFinishedOnce(true);
          }
          return next;
        });
        lastTime = time;
      }
      requestRef = requestAnimationFrame(animate);
    };

    requestRef = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef);
  }, [isLoaded, frameCount]);

  // 3. Handle Canvas Resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isLoaded]);

  // 4. Canvas Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = images[currentFrame];

    if (!canvas || !ctx || !img) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const imgRatio = img.width / img.height;
    const winRatio = width / height;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (imgRatio > winRatio) {
      drawWidth = width;
      drawHeight = width / imgRatio;
      offsetX = 0;
      offsetY = (height - drawHeight) / 2;
    } else {
      drawHeight = height;
      drawWidth = height * imgRatio;
      offsetY = 0;
      offsetX = (width - drawWidth) / 2;
    }

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  }, [currentFrame, images, isLoaded]);

  return (
    <div className="relative h-screen w-full bg-[#fef9f6] overflow-hidden">
      {/* Loading State */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#fef9f6]"
          >
            <div className="mb-4 h-[1px] w-48 bg-slate-950/10">
              <motion.div 
                className="h-full bg-slate-950"
                initial={{ width: 0 }}
                animate={{ width: `${loadingProgress}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Canvas */}
      <canvas 
        ref={canvasRef}
        className="h-full w-full pointer-events-none mix-blend-darken"
        style={{ opacity: isLoaded ? 1 : 0, transition: "opacity 1.5s ease" }}
      />

      {/* Scroll down HINT - Only after one full loop */}
      <AnimatePresence>
        {hasFinishedOnce && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 text-slate-950/40 z-30"
          >
             <span className="text-[10px] font-black uppercase tracking-[0.6em] text-center">Scroll to explore Nuvia</span>
             <motion.div
               animate={{ y: [0, 8, 0] }}
               transition={{ duration: 2, repeat: Infinity }}
             >
                <ChevronDown className="w-5 h-5 text-slate-950/20" />
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
