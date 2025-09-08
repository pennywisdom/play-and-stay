import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";


// Common space-themed words for validation
const VALID_WORDS = [
  "star", "mars", "moon", "sun", "orbit", "comet", "space", "earth", "venus", "saturn",
  "planet", "galaxy", "cosmic", "meteor", "rocket", "shuttle", "probe", "orbit", "solar",
  "lunar", "alien", "nebula", "quasar", "pulsar", "black", "hole", "void", "dark",
  "matter", "energy", "light", "beam", "ray", "wave", "field", "force", "gravity",
  "time", "warp", "speed", "fast", "slow", "hot", "cold", "ice", "fire", "gas",
  "dust", "rock", "metal", "crystal", "ore", "gold", "silver", "iron", "carbon",
  "oxygen", "hydrogen", "helium", "nitrogen", "water", "air", "atmosphere", "surface",
  "core", "crust", "mantle", "ring", "belt", "cloud", "storm", "wind", "weather",
  "climate", "season", "year", "day", "night", "dawn", "dusk", "eclipse", "flare",
  "nova", "super", "giant", "dwarf", "red", "blue", "white", "yellow", "green",
  "purple", "orange", "pink", "gray", "grey", "brown", "tan", "beige", "clear",
  "bright", "dim", "fade", "glow", "shine", "spark", "flash", "burst", "boom",
  "bang", "crash", "hit", "miss", "find", "lost", "seek", "search", "explore",
  "discover", "create", "build", "make", "form", "shape", "round", "square", "flat",
  "curve", "spiral", "circle", "line", "path", "route", "journey", "travel", "move",
  "fly", "float", "drift", "spin", "turn", "roll", "fall", "rise", "climb", "dive",
  "deep", "high", "low", "near", "far", "close", "wide", "narrow", "thick", "thin",
  "big", "small", "huge", "tiny", "vast", "mini", "mega", "ultra", "super", "hyper",
  "zone", "area", "region", "sector", "quadrant", "system", "cluster", "group",
  "team", "crew", "unit", "base", "station", "port", "dock", "bay", "deck", "room",
  "lab", "test", "scan", "read", "data", "info", "code", "signal", "message", "call",
  "name", "type", "kind", "sort", "class", "level", "grade", "rank", "size", "mass",
  "weight", "load", "power", "fuel", "engine", "motor", "drive", "push", "pull",
  "lift", "carry", "hold", "grab", "take", "give", "send", "get", "put", "set",
  "start", "stop", "go", "come", "stay", "wait", "rest", "work", "play", "game",
  "fun", "cool", "warm", "nice", "good", "bad", "best", "new", "old", "first",
  "last", "next", "back", "front", "side", "top", "bottom", "left", "right", "up",
  "down", "in", "out", "on", "off", "open", "shut", "free", "safe", "sure", "true"
];

// Letter sets with varying difficulty
const LETTER_SETS = [
  { letters: "SPACETIME", difficulty: "Easy" },
  { letters: "ASTRONOMY", difficulty: "Easy" },
  { letters: "COSMICRAY", difficulty: "Medium" },
  { letters: "STARDUSTE", difficulty: "Medium" },
  { letters: "BLACKHOLE", difficulty: "Medium" },
  { letters: "NEBULARYX", difficulty: "Hard" },
  { letters: "QUASARION", difficulty: "Hard" },
  { letters: "GALAXYZER", difficulty: "Hard" },
];

export const WordBuilderBoard = () => {
  const [currentLetters, setCurrentLetters] = useState("");
  const [currentWord, setCurrentWord] = useState("");
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [usedLetters, setUsedLetters] = useState<{ [key: string]: number }>({});
  const [availableLetters, setAvailableLetters] = useState<{ [key: string]: number }>({});
  const [gameStarted, setGameStarted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [gameEnded, setGameEnded] = useState(false);
  const [difficulty, setDifficulty] = useState("");

  const resetGame = useCallback(() => {
    const randomSet = LETTER_SETS[Math.floor(Math.random() * LETTER_SETS.length)];
    setCurrentLetters(randomSet.letters);
    setDifficulty(randomSet.difficulty);
    setCurrentWord("");
    setFoundWords([]);
    setUsedLetters({});
    setGameStarted(true);
    setStartTime(new Date());
    setTimeLeft(180);
    setGameEnded(false);
    
    // Count available letters
    const letterCount: { [key: string]: number } = {};
    for (const letter of randomSet.letters) {
      letterCount[letter] = (letterCount[letter] || 0) + 1;
    }
    setAvailableLetters(letterCount);
  }, []);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  // Timer effect
  useEffect(() => {
    if (!gameStarted || gameEnded || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameEnded(true);
          toast.success(`Time's up! You found ${foundWords.length} words!`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameEnded, timeLeft, foundWords.length]);

  const canUseLetters = (word: string): boolean => {
    const needed: { [key: string]: number } = {};
    
    for (const letter of word.toUpperCase()) {
      needed[letter] = (needed[letter] || 0) + 1;
    }

    for (const [letter, count] of Object.entries(needed)) {
      if (!availableLetters[letter] || availableLetters[letter] < count) {
        return false;
      }
    }

    return true;
  };

  const handleSubmit = () => {
    const word = currentWord.trim().toLowerCase();
    
    if (word.length < 3) {
      toast.error("Words must be at least 3 letters long!");
      return;
    }

    if (foundWords.includes(word)) {
      toast.error("You've already found that word!");
      return;
    }

    if (!canUseLetters(word)) {
      toast.error("You don't have the right letters for that word!");
      return;
    }

    if (!VALID_WORDS.includes(word)) {
      toast.error("That's not a valid word in our dictionary!");
      return;
    }

    setFoundWords(prev => [...prev, word]);
    setCurrentWord("");
    toast.success(`Great! "${word.toUpperCase()}" found!`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    if (canUseLetters(value)) {
      setCurrentWord(value);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScore = (): number => {
    return foundWords.reduce((score, word) => {
      const baseScore = word.length;
      const bonus = word.length >= 6 ? 2 : word.length >= 5 ? 1 : 0;
      return score + baseScore + bonus;
    }, 0);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-card border-border p-6 text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">🌌 Cosmic Word Builder</h1>
        <p className="text-muted-foreground">
          Create as many words as possible using the given letters!
        </p>
      </Card>

      {/* Game Stats */}
      {gameStarted && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="bg-gradient-card border-border p-4 text-center">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Words Found</p>
              <p className="text-2xl font-bold text-primary">{foundWords.length}</p>
            </div>
          </Card>
          <Card className="bg-gradient-card border-border p-4 text-center">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Score</p>
              <p className="text-2xl font-bold text-primary">{getScore()}</p>
            </div>
          </Card>
          <Card className="bg-gradient-card border-border p-4 text-center">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Time Left</p>
              <p className="text-2xl font-bold text-primary">{formatTime(timeLeft)}</p>
            </div>
          </Card>
          <Card className="bg-gradient-card border-border p-4 text-center">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Difficulty</p>
              <p className="text-2xl font-bold text-primary">{difficulty}</p>
            </div>
          </Card>
        </div>
      )}

      {/* Letter Display */}
      <Card className="bg-gradient-card border-border p-6">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-primary mb-2">Available Letters:</h3>
          <div className="flex justify-center gap-2 flex-wrap">
            {currentLetters.split('').map((letter, index) => (
              <div
                key={index}
                className="w-12 h-12 bg-primary text-primary-foreground rounded-lg flex items-center justify-center text-xl font-bold shadow-glow-primary"
              >
                {letter}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Word Input */}
      {!gameEnded && (
        <Card className="bg-gradient-card border-border p-6">
          <div className="flex gap-2 max-w-md mx-auto">
            <Input
              value={currentWord}
              onChange={handleInputChange}
              placeholder="Create a word..."
              className="text-center text-lg font-bold uppercase"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              disabled={gameEnded}
            />
            <Button 
              onClick={handleSubmit}
              disabled={currentWord.length < 3 || gameEnded}
              className="bg-gradient-primary hover:shadow-glow-primary"
            >
              Submit
            </Button>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-2">
            Minimum 3 letters • Use only the available letters above
          </p>
        </Card>
      )}

      {/* Found Words */}
      {foundWords.length > 0 && (
        <Card className="bg-gradient-card border-border p-6">
          <h3 className="text-lg font-semibold text-primary mb-4 text-center">
            Found Words ({foundWords.length}) - Score: {getScore()}
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {foundWords.map((word, index) => (
              <Badge 
                key={index}
                variant="secondary"
                className="text-sm px-3 py-1 bg-gradient-success text-white"
              >
                {word.toUpperCase()} ({word.length}pts)
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* New Game Button */}
      <div className="text-center">
        <Button 
          onClick={resetGame}
          className="bg-gradient-primary hover:shadow-glow-primary"
        >
          🎮 New Letter Set
        </Button>
      </div>

      {/* Game Over Overlay */}
      {gameEnded && (
        <Card className="bg-gradient-card border-border p-8 text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">🎊 Time's Up!</h2>
          <div className="space-y-2 text-lg">
            <p>Words Found: <span className="font-bold text-primary">{foundWords.length}</span></p>
            <p>Final Score: <span className="font-bold text-primary">{getScore()}</span></p>
            <p>Difficulty: <span className="font-bold text-primary">{difficulty}</span></p>
          </div>
          <Button 
            onClick={resetGame}
            className="mt-4 bg-gradient-primary hover:shadow-glow-primary"
          >
            🎮 Play Again
          </Button>
        </Card>
      )}
    </div>
  );
};