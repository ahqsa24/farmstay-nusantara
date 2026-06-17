import React from "react";

interface LevelProgressProps {
  title: string;
  subtitle: string;
  progressPercentage: number;
  completedAreas: number;
  totalAreas: number;
  levelName: string;
}

export default function LevelProgress({
  title,
  subtitle,
  progressPercentage,
  completedAreas,
  totalAreas,
  levelName,
}: LevelProgressProps) {
  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-farm-border shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
      
      <div className="flex items-center gap-6">
        {/* Star Badge */}
        <div className="w-16 h-16 rounded-2xl border border-farm-border bg-farm-cream flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-farm-green">
            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
          </svg>
        </div>
        
        {/* Texts */}
        <div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-farm-text">Your Journey Level</h2>
          <p className="text-sm text-farm-text-light mt-1">Complete all areas to unlock certification.</p>
        </div>
      </div>

      <div className="relative w-full md:w-auto min-w-[280px] bg-white rounded-xl p-4 border border-farm-border shadow-sm flex flex-col gap-2 shrink-0">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold text-farm-gold uppercase tracking-widest">
              Progress Petualangan
            </span>
            <span className="text-sm font-bold text-farm-text">
              {completedAreas} / {totalAreas} Area Selesai
            </span>
          </div>
          <span className="text-xl font-bold text-farm-green">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        
        <div className="w-full h-1.5 bg-farm-cream rounded-full mt-2 overflow-hidden">
          <div 
            className="h-full bg-farm-green rounded-full transition-all duration-1000 ease-out" 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
      
    </div>
  );
}
