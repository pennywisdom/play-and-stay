import { useState, useEffect, useCallback } from "react";
import { HangmanDrawing } from "./HangmanDrawing";
import { WordDisplay } from "./WordDisplay";
import { AlphabetGrid } from "./AlphabetGrid";
import { GameStats } from "./GameStats";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const WORDS = [
  "COSMIC", "STELLAR", "GALAXY", "PLANET", "NEBULA",
  "ASTEROID", "COMET", "SOLAR", "SPACE", "MOON",
  "UNIVERSE", "ROCKET", "ASTRONAUT", "ORBIT", "METEOR"
];

const MAX_INCORRECT_GUESSES = 10;

export const HangmanBoard = () => {
  const [currentWord, setCurrentWord] = useState("");
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [incorrectGuesses, setIncorrectGuesses] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);

  const getRandomWord = useCallback(() => {
    return WORDS[Math.floor(Math.random() * WORDS.length)];
  }, []);

  const resetGame = useCallback(() => {
    setCurrentWord(getRandomWord());
    setGuessedLetters(new Set());
    setIncorrectGuesses(0);
    setGameStarted(false);
    setStartTime(null);
    setGameWon(false);
    setGameLost(false);
  }, [getRandomWord]);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  const handleGuess = (letter: string) => {
    if (guessedLetters.has(letter) || gameWon || gameLost) return;

    if (!gameStarted) {
      setGameStarted(true);
      setStartTime(new Date());
    }

    const newGuessedLetters = new Set([...guessedLetters, letter]);
    setGuessedLetters(newGuessedLetters);

    if (currentWord.toLowerCase().includes(letter)) {
      toast.success(`Good guess! '${letter.toUpperCase()}' is in the word! ✨`);
      
      // Check if word is complete
      const isWordComplete = currentWord
        .toLowerCase()
        .split('')
        .every(wordLetter => newGuessedLetters.has(wordLetter));
      
      if (isWordComplete) {
        setGameWon(true);
        toast.success("🎉 Congratulations! You guessed the word!");
      }
    } else {
      const newIncorrectGuesses = incorrectGuesses + 1;
      setIncorrectGuesses(newIncorrectGuesses);
      toast.error(`'${letter.toUpperCase()}' is not in the word. Try again!`);
      
      if (newIncorrectGuesses >= MAX_INCORRECT_GUESSES) {
        setGameLost(true);
        toast.error(`Game over! The word was: ${currentWord}`);
      }
    }
  };

  const correctGuesses = Array.from(guessedLetters).filter(letter => 
    currentWord.toLowerCase().includes(letter)
  ).length;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Game Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Cosmic Hangman by pennywisdom
        </h1>
        <p className="text-muted-foreground">
          Guess the space-themed word before the astronaut is in trouble! 🚀
        </p>
      </div>

      {/* Game Stats */}
      <GameStats 
        moves={guessedLetters.size}
        matches={correctGuesses}
        totalPairs={currentWord.length}
        startTime={startTime}
        gameWon={gameWon}
        hideMatches={false}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Game Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-gradient-card border-border p-6">
            {/* Hangman Drawing */}
            <div className="mb-8">
              <HangmanDrawing incorrectGuesses={incorrectGuesses} />
            </div>
            
            {/* Word Display */}
            <WordDisplay word={currentWord} guessedLetters={guessedLetters} />
            
            {/* Alphabet Grid */}
            <AlphabetGrid
              guessedLetters={guessedLetters}
              onGuess={handleGuess}
              disabled={gameWon || gameLost}
            />
          </Card>
        </div>

        {/* Game Info */}
        <div className="space-y-4">
          <Card className="bg-gradient-card border-border p-4">
            <h3 className="text-lg font-bold text-center mb-3 text-primary">
              Game Info
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Word Length:</span>
                <span className="font-bold text-primary">{currentWord.length} letters</span>
              </div>
              <div className="flex justify-between">
                <span>Incorrect Guesses:</span>
                <span className="font-bold text-destructive">
                  {incorrectGuesses}/{MAX_INCORRECT_GUESSES}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Letters Guessed:</span>
                <span className="font-bold">{guessedLetters.size}</span>
              </div>
            </div>
          </Card>

          {/* Reset Button */}
          <Button 
            onClick={resetGame}
            variant="default"
            size="lg"
            className="w-full bg-gradient-primary hover:shadow-glow-primary transition-all duration-300"
          >
            New Word 🚀
          </Button>
        </div>
      </div>

      {/* Game Over Overlay */}
      {(gameWon || gameLost) && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-card p-8 rounded-2xl border border-border shadow-2xl text-center space-y-4 animate-scale-in max-w-md">
            <div className="text-6xl">{gameWon ? "🎉" : "💀"}</div>
            <h2 className={`text-3xl font-bold bg-clip-text text-transparent ${
              gameWon ? "bg-gradient-success" : "bg-gradient-to-r from-destructive to-destructive/70"
            }`}>
              {gameWon ? "You Won!" : "Game Over!"}
            </h2>
            <p className="text-muted-foreground">
              {gameWon 
                ? `Amazing! You guessed "${currentWord}" correctly!`
                : `The word was: "${currentWord}". Better luck next time!`
              }
            </p>
            <div className="space-y-2">
              <p className="text-sm">Letters Guessed: <span className="font-bold text-primary">{guessedLetters.size}</span></p>
              <p className="text-sm">Incorrect Guesses: <span className="font-bold text-destructive">{incorrectGuesses}/{MAX_INCORRECT_GUESSES}</span></p>
              {startTime && (
                <p className="text-sm">
                  Time: <span className="font-bold text-primary">
                    {Math.floor((Date.now() - startTime.getTime()) / 1000)}s
                  </span>
                </p>
              )}
            </div>
            <Button 
              onClick={resetGame}
              className="bg-gradient-primary hover:shadow-glow-primary transition-all duration-300"
            >
              New Word 🚀
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};