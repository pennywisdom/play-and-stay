import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AlphabetGridProps {
  guessedLetters: Set<string>;
  onGuess: (letter: string) => void;
  disabled: boolean;
}

export const AlphabetGrid = ({ guessedLetters, onGuess, disabled }: AlphabetGridProps) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 max-w-2xl mx-auto">
      {alphabet.map(letter => (
        <Button
          key={letter}
          onClick={() => onGuess(letter.toLowerCase())}
          disabled={disabled || guessedLetters.has(letter.toLowerCase())}
          variant={guessedLetters.has(letter.toLowerCase()) ? "outline" : "default"}
          size="sm"
          className={cn(
            "aspect-square text-sm font-bold transition-all duration-200",
            guessedLetters.has(letter.toLowerCase())
              ? "opacity-50 cursor-not-allowed"
              : "hover:scale-105 bg-gradient-primary hover:shadow-glow-primary"
          )}
        >
          {letter}
        </Button>
      ))}
    </div>
  );
};