import { useState, useEffect, useCallback } from "react";
import { GameStats } from "./GameStats";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const WORDS = [
  "COSMIC", "STELLAR", "GALAXY", "PLANET", "NEBULA",
  "ASTEROID", "COMET", "SOLAR", "SPACE", "MOON",
  "UNIVERSE", "ROCKET", "ASTRONAUT", "ORBIT", "METEOR"
];

export const WordScrambleBoard = () => {
  const [currentWord, setCurrentWord] = useState("");
  const [scrambledWord, setScrambledWord] = useState("");
  const [userGuess, setUserGuess] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [gameWon, setGameWon] = useState(false);
  const [hint, setHint] = useState("");

  const getRandomWord = useCallback(() => {
    return WORDS[Math.floor(Math.random() * WORDS.length)];
  }, []);

  const scrambleWord = useCallback((word: string) => {
    const letters = word.split('');
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    return letters.join('');
  }, []);

  const getHint = useCallback((word: string) => {
    const hints: { [key: string]: string } = {
      "COSMIC": "Related to the universe",
      "STELLAR": "Related to stars",
      "GALAXY": "Collection of stars",
      "PLANET": "Celestial body orbiting a star",
      "NEBULA": "Cloud of gas and dust",
      "ASTEROID": "Rocky space object",
      "COMET": "Icy space visitor",
      "SOLAR": "Related to the sun",
      "SPACE": "The final frontier",
      "MOON": "Earth's natural satellite",
      "UNIVERSE": "Everything that exists",
      "ROCKET": "Vehicle for space travel",
      "ASTRONAUT": "Space explorer",
      "ORBIT": "Path around a celestial body",
      "METEOR": "Shooting star"
    };
    return hints[word] || "Space-related word";
  }, []);

  const resetGame = useCallback(() => {
    const newWord = getRandomWord();
    let newScrambled = scrambleWord(newWord);
    
    // Make sure scrambled word is different from original
    while (newScrambled === newWord) {
      newScrambled = scrambleWord(newWord);
    }
    
    setCurrentWord(newWord);
    setScrambledWord(newScrambled);
    setUserGuess("");
    setAttempts(0);
    setGameStarted(false);
    setStartTime(null);
    setGameWon(false);
    setHint(getHint(newWord));
  }, [getRandomWord, scrambleWord, getHint]);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!gameStarted) {
      setGameStarted(true);
      setStartTime(new Date());
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (userGuess.toUpperCase() === currentWord) {
      setGameWon(true);
      toast.success("🎉 Congratulations! You unscrambled the word!");
    } else {
      toast.error("Not quite right. Try again! 🚀");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserGuess(e.target.value.toUpperCase());
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Game Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Cosmic Word Scramble by pennywisdom
        </h1>
        <p className="text-muted-foreground">
          Unscramble the space-themed words! 🌌
        </p>
      </div>

      {/* Game Stats */}
      <GameStats 
        moves={attempts}
        matches={gameWon ? 1 : 0}
        totalPairs={1}
        startTime={startTime}
        gameWon={gameWon}
        hideMatches={true}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Game Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-gradient-card border-border p-8">
            {/* Scrambled Word Display */}
            <div className="text-center mb-8">
              <div className="text-4xl sm:text-5xl font-bold text-primary mb-4 tracking-wider">
                {scrambledWord.split('').map((letter, index) => (
                  <span 
                    key={index} 
                    className="inline-block mx-1 p-2 bg-primary/10 rounded-lg border border-primary/20"
                  >
                    {letter}
                  </span>
                ))}
              </div>
              <p className="text-muted-foreground text-lg">
                Hint: {hint}
              </p>
            </div>
            
            {/* Input Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="text"
                  value={userGuess}
                  onChange={handleInputChange}
                  placeholder="Enter your guess..."
                  className="text-lg text-center font-bold uppercase tracking-wider"
                  disabled={gameWon}
                  maxLength={currentWord.length}
                />
                <Button 
                  type="submit"
                  disabled={gameWon || !userGuess.trim()}
                  className="bg-gradient-primary hover:shadow-glow-primary transition-all duration-300"
                >
                  Submit Guess 🚀
                </Button>
              </div>
            </form>
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
                <span>Attempts:</span>
                <span className="font-bold">{attempts}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={`font-bold ${gameWon ? "text-green-500" : "text-muted-foreground"}`}>
                  {gameWon ? "Solved! 🎉" : "Solving..."}
                </span>
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
            New Word 🌌
          </Button>
        </div>
      </div>

      {/* Game Won Overlay */}
      {gameWon && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-card p-8 rounded-2xl border border-border shadow-2xl text-center space-y-4 animate-scale-in max-w-md">
            <div className="text-6xl">🎉</div>
            <h2 className="text-3xl font-bold bg-gradient-success bg-clip-text text-transparent">
              Perfect!
            </h2>
            <p className="text-muted-foreground">
              You unscrambled "{currentWord}" correctly!
            </p>
            <div className="space-y-2">
              <p className="text-sm">Attempts: <span className="font-bold text-primary">{attempts}</span></p>
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
              New Word 🌌
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};