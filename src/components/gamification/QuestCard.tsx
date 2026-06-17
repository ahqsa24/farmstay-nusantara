import React from 'react';

export interface QuestOption {
  id: number;
  label: string;
}

interface QuestCardProps {
  index: number;
  questionId: number;
  questionText: string;
  guideText?: string | null;
  options: QuestOption[];
  selectedOptionId: number | null;
  isSaving: boolean;
  isSaved: boolean;
  onSelectOption: (questionId: number, optionId: number) => void;
  labels: {
    savingText: string;
    savedText: string;
    autosaveText: string;
    guideHint: string;
  }
}

export default function QuestCard({
  index,
  questionId,
  questionText,
  guideText,
  options,
  selectedOptionId,
  isSaving,
  isSaved,
  onSelectOption,
  labels
}: QuestCardProps) {
  return (
    <div className={`relative p-6 rounded-2xl border-2 transition-all duration-500 overflow-hidden ${
      selectedOptionId !== null 
        ? "border-farm-green bg-farm-green-light/10 shadow-sm" 
        : "border-farm-border bg-white hover:border-farm-gold/50"
    }`}>
      
      {/* Visual background element indicating completed quest */}
      {selectedOptionId !== null && (
        <div className="absolute -right-16 -top-16 opacity-5 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-48 h-48 text-farm-green">
            <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {/* Header section with Autosave status */}
      <div className="flex flex-col gap-1 mb-4 relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
              selectedOptionId !== null ? "bg-farm-green text-white" : "bg-farm-cream border border-farm-border text-farm-text"
            }`}>
              {index + 1}
            </div>
            <h5 className="font-semibold text-base text-farm-text leading-snug pt-1">
              {questionText}
            </h5>
          </div>

          <div className="shrink-0 flex items-center text-[10px] font-bold h-6 bg-white px-2 rounded-full border border-farm-border/50 shadow-sm">
            {isSaving && (
              <span className="text-farm-gold animate-pulse flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-farm-gold animate-bounce" />
                {labels.savingText}
              </span>
            )}
            {isSaved && (
              <span className="text-farm-green flex items-center gap-1 animate-slide-up">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
                {labels.savedText}
              </span>
            )}
            {!isSaving && !isSaved && selectedOptionId !== null && (
              <span className="text-farm-text-light font-light text-[9px] uppercase tracking-wider">{labels.autosaveText}</span>
            )}
          </div>
        </div>

        {guideText && (
          <div className="ml-11 mt-1 flex items-start gap-2 bg-farm-cream/80 p-3 rounded-xl border border-farm-border/60">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-farm-gold mt-0.5 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.82 1.508-2.316a7.5 7.5 0 1 0-7.516 0c.85.496 1.508 1.333 1.508 2.316V18" />
            </svg>
            <p className="text-xs text-farm-text-light italic leading-relaxed">
              <span className="font-bold text-[10px] text-farm-gold not-italic uppercase tracking-wider mb-0.5 block">{labels.guideHint}</span>
              {guideText}
            </p>
          </div>
        )}
      </div>

      {/* Options grid */}
      <div className="ml-11 grid grid-cols-1 gap-3 relative z-10">
        {options.map((opt) => {
          const isChecked = selectedOptionId === opt.id;
          return (
            <button
              type="button"
              key={opt.id}
              onClick={() => onSelectOption(questionId, opt.id)}
              className={`group flex items-center text-left p-4 rounded-xl border-2 transition-all duration-300 ${
                isChecked
                  ? "border-farm-green bg-white shadow-md transform scale-[1.01]"
                  : "border-farm-border bg-farm-cream hover:border-farm-green hover:bg-white hover:shadow-sm"
              }`}
            >
              <div className={`h-5 w-5 rounded-full border-2 shrink-0 flex items-center justify-center mr-3 transition-colors ${
                isChecked ? "border-farm-green" : "border-farm-border group-hover:border-farm-green/50"
              }`}>
                <div className={`h-2.5 w-2.5 rounded-full bg-farm-green transition-transform duration-300 ${
                  isChecked ? "scale-100" : "scale-0"
                }`} />
              </div>
              <span className={`text-sm leading-snug transition-colors ${
                isChecked ? "text-farm-green font-bold" : "text-farm-text font-medium"
              }`}>
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
