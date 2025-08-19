import { cn } from "@/lib/utils";

interface TicTacToeCellProps {
  value: 'X' | 'O' | null;
  onClick: () => void;
  disabled: boolean;
  isWinning?: boolean;
}

export const TicTacToeCell = ({ value, onClick, disabled, isWinning }: TicTacToeCellProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || value !== null}
      className={cn(
        "aspect-square bg-gradient-card border border-border rounded-xl",
        "flex items-center justify-center text-4xl sm:text-5xl md:text-6xl font-bold",
        "transition-all duration-300 hover:scale-105 hover:shadow-glow-primary",
        "disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none",
        !disabled && value === null && "hover:bg-gradient-primary/10",
        isWinning && "bg-gradient-success shadow-glow-success animate-pulse"
      )}
    >
      {value && (
        <span 
          className={cn(
            "animate-scale-in",
            value === 'X' ? "text-primary" : "text-secondary"
          )}
        >
          {value}
        </span>
      )}
    </button>
  );
};