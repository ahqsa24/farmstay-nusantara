import React, { useEffect, useRef, useState } from "react";
export interface JourneyMapPillar {
  id: number;
  code: string;
  name: string;
  score_percentage?: number;
  progress_percentage?: number;
}

interface JourneyMapProps {
  pillars: JourneyMapPillar[];
  onSelectPillar: (id: number) => void;
  selectedPillarId?: number | null;
  isLoading?: boolean;
}

export default function JourneyMap({ pillars, onSelectPillar, selectedPillarId, isLoading }: JourneyMapProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2;
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[160px]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-farm-gold border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="w-full relative">
      <div 
        ref={scrollRef}
        className="w-full overflow-x-auto pb-4 cursor-grab active:cursor-grabbing hide-scrollbar"
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        <div className="flex items-start justify-between min-w-[700px] px-8 relative h-48 pt-6">
          
          {/* Thick connecting line background */}
          <div className="absolute left-[4.5rem] right-[4.5rem] top-16 h-2 bg-[#EFE8DD] z-0 rounded-full"></div>

          {pillars?.map((pillar, index) => {
            const score = pillar.score_percentage ?? pillar.progress_percentage ?? 0;
            const isCompleted = score === 100;
            const inProgress = score > 0 && !isCompleted;
            const isLocked = false; // The user requested all areas to be clickable
            const isActive = selectedPillarId === pillar.id;

            return (
              <div key={pillar.id} className="relative flex flex-col items-center w-32 shrink-0 group z-10">
                
                {/* Circle Marker */}
                <button
                  onClick={() => onSelectPillar(pillar.id)}
                  className={`w-[88px] h-[88px] rounded-full flex items-center justify-center transition-all duration-300 relative 
                    ${isCompleted 
                      ? isActive 
                        ? "bg-farm-green ring-[6px] ring-farm-green/40 shadow-[0_0_20px_rgba(25,135,84,0.4)] scale-105" 
                        : "bg-farm-green ring-[4px] ring-farm-green/20 hover:scale-105"
                      : isActive
                        ? "bg-white ring-[6px] ring-[#E1CDA4] shadow-[0_0_20px_rgba(225,205,164,0.4)] scale-105" 
                        : "bg-white ring-[4px] ring-gray-100 hover:scale-105"
                    }
                    cursor-pointer
                  `}
                >
                  {isCompleted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-8 h-8 text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    <span className={`font-serif text-3xl font-bold ${isActive ? "text-[#C19B53]" : "text-gray-300"}`}>
                      {index + 1}
                    </span>
                  )}
                </button>

                {/* Text Content Below Circle */}
                <div className="flex flex-col items-center mt-4 w-40 text-center">
                  <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isCompleted ? "text-farm-green" : "text-[#C19B53]"}`}>
                    Area {pillar.code}
                  </span>
                  
                  <span className="text-sm font-bold text-gray-800 mb-2 leading-tight">
                    {pillar.name}
                  </span>
                  
                  {/* Small Pill Badge */}
                  <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border shadow-sm
                    ${isCompleted 
                      ? "bg-farm-green border-farm-green text-white" 
                      : "bg-white border-gray-200 text-gray-600"
                    }
                  `}>
                    {!isCompleted && <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>}
                    <span className="text-[10px] font-extrabold">{Math.round(score)}%</span>
                  </div>
                </div>
                
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
