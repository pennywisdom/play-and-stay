import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LetterState {
  letter: string;
  state: 'correct' | 'present' | 'absent' | 'empty';
}

const WORD_LIST = [
  "SPACE", "STARS", "COMET", "ORBIT", "SOLAR", "LUNAR", "EARTH", "Venus", 
  "MARS", "TITAN", "PLUTO", "GALAXY", "NEBULA", "QUASAR", "COSMIC", "METEOR",
  "PLANET", "ROCKET", "ALIEN", "VOYAGE", "ASTRO", "PROBE", "LASER", "FIELD"
];

const MAX_GUESSES = 6;
const WORD_LENGTH = 5;

export const WordleBoard = () => {
  const [targetWord, setTargetWord] = useState("");
  const [guesses, setGuesses] = useState<LetterState[][]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [currentRow, setCurrentRow] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [usedLetters, setUsedLetters] = useState<Map<string, 'correct' | 'present' | 'absent'>>(new Map());

  const getRandomWord = useCallback(() => {
    const word = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)].toUpperCase();
    return word.length === WORD_LENGTH ? word : "SPACE";
  }, []);

  const initializeGame = useCallback(() => {
    const word = getRandomWord();
    setTargetWord(word);
    setGuesses(Array(MAX_GUESSES).fill(null).map(() => 
      Array(WORD_LENGTH).fill(null).map(() => ({ letter: '', state: 'empty' }))
    ));
    setCurrentGuess("");
    setCurrentRow(0);
    setGameWon(false);
    setGameLost(false);
    setUsedLetters(new Map());
  }, [getRandomWord]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const checkGuess = (guess: string): LetterState[] => {
    const result: LetterState[] = [];
    const targetLetters = targetWord.split('');
    const guessLetters = guess.split('');
    const letterCounts = new Map<string, number>();

    // Count letters in target word
    targetLetters.forEach(letter => {
      letterCounts.set(letter, (letterCounts.get(letter) || 0) + 1);
    });

    // First pass: mark correct positions
    guessLetters.forEach((letter, index) => {
      if (letter === targetLetters[index]) {
        result[index] = { letter, state: 'correct' };
        letterCounts.set(letter, letterCounts.get(letter)! - 1);
      } else {
        result[index] = { letter, state: 'absent' };
      }
    });

    // Second pass: mark present letters
    guessLetters.forEach((letter, index) => {
      if (result[index].state === 'absent' && letterCounts.get(letter)! > 0) {
        result[index] = { letter, state: 'present' };
        letterCounts.set(letter, letterCounts.get(letter)! - 1);
      }
    });

    return result;
  };

  const updateUsedLetters = (guessResult: LetterState[]) => {
    const newUsedLetters = new Map(usedLetters);
    
    guessResult.forEach(({ letter, state }) => {
      if (state === 'empty') return; // Skip empty states
      
      const currentState = newUsedLetters.get(letter);
      
      // Priority: correct > present > absent
      if (state === 'correct' || (state === 'present' && currentState !== 'correct')) {
        newUsedLetters.set(letter, state);
      } else if (!currentState) {
        newUsedLetters.set(letter, state);
      }
    });
    
    setUsedLetters(newUsedLetters);
  };

  const submitGuess = () => {
    if (currentGuess.length !== WORD_LENGTH) {
      toast.error("Word must be 5 letters long!");
      return;
    }

    if (gameWon || gameLost) return;

    const guessResult = checkGuess(currentGuess.toUpperCase());
    const newGuesses = [...guesses];
    newGuesses[currentRow] = guessResult;
    setGuesses(newGuesses);
    
    updateUsedLetters(guessResult);

    // Check if word is correct
    if (currentGuess.toUpperCase() === targetWord) {
      setGameWon(true);
      toast.success("🎉 Congratulations! You guessed it!");
    } else if (currentRow === MAX_GUESSES - 1) {
      setGameLost(true);
      toast.error(`Game over! The word was: ${targetWord}`);
    } else {
      setCurrentRow(currentRow + 1);
    }

    setCurrentGuess("");
  };

  const handleKeyPress = (key: string) => {
    if (gameWon || gameLost) return;

    if (key === 'ENTER') {
      submitGuess();
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (key.length === 1 && /[A-Z]/i.test(key) && currentGuess.length < WORD_LENGTH) {
      setCurrentGuess(prev => prev + key.toUpperCase());
    }
  };

  const getCellStyle = (state: LetterState['state']) => {
    switch (state) {
      case 'correct':
        return 'bg-green-500 text-white border-green-500';
      case 'present':
        return 'bg-yellow-500 text-white border-yellow-500';
      case 'absent':
        return 'bg-gray-500 text-white border-gray-500';
      default:
        return 'bg-background border-border text-foreground';
    }
  };

  const getKeyStyle = (letter: string) => {
    const state = usedLetters.get(letter);
    switch (state) {
      case 'correct':
        return 'bg-green-500 text-white hover:bg-green-600';
      case 'present':
        return 'bg-yellow-500 text-white hover:bg-yellow-600';
      case 'absent':
        return 'bg-gray-500 text-white hover:bg-gray-600';
      default:
        return 'bg-muted hover:bg-muted/80';
    }
  };

  const keyboard = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
  ];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Game Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Cosmic Wordle
        </h1>
        <p className="text-muted-foreground">
          Guess the 5-letter space word in 6 tries! 🌟
        </p>
      </div>

      {/* Game Grid */}
      <Card className="bg-gradient-card border-border p-6">
        <div className="grid gap-2 mb-6">
          {guesses.map((guess, rowIndex) => (
            <div key={rowIndex} className="flex gap-2 justify-center">
              {guess.map((cell, colIndex) => {
                const isCurrentRow = rowIndex === currentRow;
                const letter = isCurrentRow && colIndex < currentGuess.length 
                  ? currentGuess[colIndex] 
                  : cell.letter;
                
                return (
                  <div
                    key={colIndex}
                    className={cn(
                      "w-14 h-14 border-2 flex items-center justify-center text-2xl font-bold rounded-lg transition-all duration-300",
                      isCurrentRow && !gameWon && !gameLost
                        ? "border-primary bg-background animate-pulse"
                        : getCellStyle(cell.state)
                    )}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Input for current guess */}
        {!gameWon && !gameLost && (
          <div className="flex gap-2 justify-center mb-4">
            <Input
              value={currentGuess}
              onChange={(e) => {
                const value = e.target.value.toUpperCase().slice(0, WORD_LENGTH);
                setCurrentGuess(value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  submitGuess();
                } else if (e.key === 'Backspace' && currentGuess.length === 0) {
                  e.preventDefault();
                }
              }}
              placeholder="Enter your guess..."
              className="max-w-xs text-center text-lg font-bold"
              maxLength={WORD_LENGTH}
            />
            <Button 
              onClick={submitGuess}
              disabled={currentGuess.length !== WORD_LENGTH}
              className="bg-gradient-primary hover:shadow-glow-primary"
            >
              Submit
            </Button>
          </div>
        )}

        {/* Virtual Keyboard */}
        <div className="space-y-2">
          {keyboard.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-1 justify-center">
              {row.map((key) => (
                <Button
                  key={key}
                  onClick={() => handleKeyPress(key)}
                  className={cn(
                    "text-sm font-bold transition-all duration-200",
                    key === 'ENTER' || key === 'BACKSPACE' ? "px-3" : "px-2 py-1 min-w-[40px] h-12",
                    getKeyStyle(key)
                  )}
                  disabled={gameWon || gameLost}
                >
                  {key === 'BACKSPACE' ? '⌫' : key}
                </Button>
              ))}
            </div>
          ))}
        </div>
      </Card>

      {/* Reset Button */}
      <Button 
        onClick={initializeGame}
        variant="default"
        size="lg"
        className="w-full bg-gradient-primary hover:shadow-glow-primary transition-all duration-300"
      >
        New Word 🚀
      </Button>

      {/* Game Over Overlay */}
      {(gameWon || gameLost) && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-card p-8 rounded-2xl border border-border shadow-2xl text-center space-y-4 animate-scale-in max-w-md">
            <div className="text-6xl">{gameWon ? '🎉' : '😔'}</div>
            <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {gameWon ? 'Congratulations!' : 'Game Over'}
            </h2>
            <p className="text-muted-foreground">
              {gameWon 
                ? `Amazing! You guessed "${targetWord}" in ${currentRow + 1} tries!`
                : `The word was "${targetWord}". Better luck next time!`
              }
            </p>
            <Button 
              onClick={initializeGame}
              className="bg-gradient-primary hover:shadow-glow-primary transition-all duration-300"
            >
              Play Again 🌟
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};