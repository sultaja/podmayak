
import React, { useState, useRef, useEffect } from 'react';
import { ChevronsLeftRight } from 'lucide-react';

interface BeforeAfterSliderProps {
  originalImage: string;
  generatedImage: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({ originalImage, generatedImage }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = (clientX: number) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percentage = (x / rect.width) * 100;
      setSliderPosition(percentage);
    }
  };

  const onMouseDown = () => { isDragging.current = true; };
  const onMouseUp = () => { isDragging.current = false; };
  const onMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) handleMove(e.clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  useEffect(() => {
    document.addEventListener('mouseup', onMouseUp);
    return () => document.removeEventListener('mouseup', onMouseUp);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none cursor-ew-resize group"
      onMouseMove={onMouseMove}
      onTouchMove={onTouchMove}
      onMouseDown={onMouseDown}
    >
      {/* Background: Original Image */}
      <img 
        src={originalImage} 
        alt="Original" 
        className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
      />
      
      {/* Label Original */}
      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded select-none z-10">
        ORIGINAL
      </div>

      {/* Foreground: Generated Image (Clipped) */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img 
          src={generatedImage} 
          alt="Renovated" 
          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
        />
        {/* Label Renovated */}
        <div className="absolute top-4 left-4 bg-teal-500/90 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded select-none">
          RENOVATED
        </div>
      </div>

      {/* Slider Handle */}
      <div 
        className="absolute inset-y-0 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg transform active:scale-110 transition-transform">
          <ChevronsLeftRight className="w-5 h-5 text-slate-800" />
        </div>
      </div>
    </div>
  );
};
