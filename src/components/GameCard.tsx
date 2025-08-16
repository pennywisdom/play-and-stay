import { useState } from "react";
import { cn } from "@/lib/utils";

interface GameCardProps {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
  onClick: () => void;
  disabled: boolean;
}

export const GameCard = ({ id, emoji, isFlipped, isMatched, onClick, disabled }: GameCardProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    if (disabled || isFlipped || isMatched || isAnimating) return;
    
    setIsAnimating(true);
    onClick();
    
    // Reset animation state after flip completes
    setTimeout(() => setIsAnimating(false), 600);
  };

  return (
    <div 
      className={cn(
        "relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 cursor-pointer",
        "transition-all duration-300 ease-bounce",
        "hover:scale-105 hover:shadow-glow-primary",
        disabled && "cursor-not-allowed opacity-50",
        isMatched && "animate-pulse-glow"
      )}
      onClick={handleClick}
    >
      {/* Card Container with 3D perspective */}
      <div 
        className={cn(
          "relative w-full h-full transition-transform duration-600 ease-smooth",
          "preserve-3d",
          (isFlipped || isMatched) && "rotate-y-180"
        )}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Card Back (shown initially) */}
        <div 
          className={cn(
            "absolute inset-0 w-full h-full rounded-lg",
            "bg-gradient-card border border-border",
            "flex items-center justify-center",
            "backface-hidden",
            "shadow-lg hover:shadow-xl transition-shadow"
          )}
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-primary rounded-full opacity-60" />
        </div>

        {/* Card Front (shows emoji when flipped) */}
        <div 
          className={cn(
            "absolute inset-0 w-full h-full rounded-lg",
            "flex items-center justify-center",
            "backface-hidden rotate-y-180",
            isMatched 
              ? "bg-gradient-success shadow-glow-match border-card-match" 
              : "bg-gradient-card border-border",
            "border transition-all duration-300"
          )}
        >
          <span className="text-2xl sm:text-3xl md:text-4xl select-none">
            {emoji}
          </span>
        </div>
      </div>

      {/* Matched card glow effect */}
      {isMatched && (
        <div className="absolute inset-0 bg-gradient-success opacity-20 rounded-lg animate-pulse" />
      )}
    </div>
  );
};