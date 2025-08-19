import { cn } from "@/lib/utils";

interface WordSearchCellProps {
  letter: string;
  isSelected: boolean;
  isFound: boolean;
  onMouseDown: () => void;
  onMouseEnter: () => void;
  onMouseUp: () => void;
  row: number;
  col: number;
}

export const WordSearchCell = ({ 
  letter, 
  isSelected, 
  isFound, 
  onMouseDown, 
  onMouseEnter, 
  onMouseUp,
  row,
  col 
}: WordSearchCellProps) => {
  return (
    <div
      className={cn(
        "aspect-square flex items-center justify-center cursor-pointer select-none",
        "text-lg font-bold rounded-lg border transition-all duration-200",
        "hover:scale-105 hover:shadow-lg",
        isFound && "bg-gradient-success text-white shadow-glow-primary",
        isSelected && !isFound && "bg-primary/20 border-primary",
        !isSelected && !isFound && "bg-gradient-card border-border hover:bg-accent/50"
      )}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseUp={onMouseUp}
      data-row={row}
      data-col={col}
    >
      {letter}
    </div>
  );
};