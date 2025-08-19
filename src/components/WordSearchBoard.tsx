import { useState, useEffect, useCallback } from "react";
import { WordSearchCell } from "./WordSearchCell";
import { GameStats } from "./GameStats";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Position {
  row: number;
  col: number;
}

interface Word {
  word: string;
  found: boolean;
  positions: Position[];
}

const WORDS_TO_FIND = [
  "COSMIC", "STAR", "GALAXY", "PLANET", "NEBULA", 
  "ORBIT", "COMET", "SOLAR", "SPACE", "MOON"
];

const GRID_SIZE = 12;

export const WordSearchBoard = () => {
  const [grid, setGrid] = useState<string[][]>([]);
  const [words, setWords] = useState<Word[]>([]);
  const [selectedCells, setSelectedCells] = useState<Position[]>([]);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [gameWon, setGameWon] = useState(false);

  const generateRandomLetter = () => {
    return String.fromCharCode(65 + Math.floor(Math.random() * 26));
  };

  const canPlaceWord = (grid: string[][], word: string, row: number, col: number, direction: [number, number]): boolean => {
    const [dRow, dCol] = direction;
    
    for (let i = 0; i < word.length; i++) {
      const newRow = row + i * dRow;
      const newCol = col + i * dCol;
      
      if (newRow < 0 || newRow >= GRID_SIZE || newCol < 0 || newCol >= GRID_SIZE) {
        return false;
      }
      
      if (grid[newRow][newCol] !== '' && grid[newRow][newCol] !== word[i]) {
        return false;
      }
    }
    
    return true;
  };

  const placeWord = (grid: string[][], word: string, row: number, col: number, direction: [number, number]): Position[] => {
    const [dRow, dCol] = direction;
    const positions: Position[] = [];
    
    for (let i = 0; i < word.length; i++) {
      const newRow = row + i * dRow;
      const newCol = col + i * dCol;
      grid[newRow][newCol] = word[i];
      positions.push({ row: newRow, col: newCol });
    }
    
    return positions;
  };

  const generateGrid = useCallback(() => {
    // Initialize empty grid
    const newGrid: string[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
    const newWords: Word[] = [];
    
    // Directions: horizontal, vertical, diagonal
    const directions: [number, number][] = [
      [0, 1],   // horizontal
      [1, 0],   // vertical
      [1, 1],   // diagonal
      [-1, 1],  // anti-diagonal
      [0, -1],  // horizontal backward
      [-1, 0],  // vertical backward
      [-1, -1], // diagonal backward
      [1, -1]   // anti-diagonal backward
    ];
    
    // Place each word
    WORDS_TO_FIND.forEach(word => {
      let placed = false;
      let attempts = 0;
      
      while (!placed && attempts < 100) {
        const direction = directions[Math.floor(Math.random() * directions.length)];
        const row = Math.floor(Math.random() * GRID_SIZE);
        const col = Math.floor(Math.random() * GRID_SIZE);
        
        if (canPlaceWord(newGrid, word, row, col, direction)) {
          const positions = placeWord(newGrid, word, row, col, direction);
          newWords.push({ word, found: false, positions });
          placed = true;
        }
        
        attempts++;
      }
    });
    
    // Fill empty cells with random letters
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (newGrid[row][col] === '') {
          newGrid[row][col] = generateRandomLetter();
        }
      }
    }
    
    setGrid(newGrid);
    setWords(newWords);
  }, []);

  useEffect(() => {
    generateGrid();
  }, [generateGrid]);

  const handleMouseDown = (row: number, col: number) => {
    if (gameWon) return;
    
    if (!gameStarted) {
      setGameStarted(true);
      setStartTime(new Date());
    }
    
    setIsSelecting(true);
    setSelectedCells([{ row, col }]);
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (!isSelecting || gameWon) return;
    
    const startCell = selectedCells[0];
    if (!startCell) return;
    
    // Calculate if the current cell is in a valid line from start
    const rowDiff = row - startCell.row;
    const colDiff = col - startCell.col;
    
    // Only allow straight lines (horizontal, vertical, diagonal)
    if (rowDiff === 0 || colDiff === 0 || Math.abs(rowDiff) === Math.abs(colDiff)) {
      const cells: Position[] = [];
      const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff));
      const stepRow = steps === 0 ? 0 : rowDiff / steps;
      const stepCol = steps === 0 ? 0 : colDiff / steps;
      
      for (let i = 0; i <= steps; i++) {
        cells.push({
          row: startCell.row + Math.round(i * stepRow),
          col: startCell.col + Math.round(i * stepCol)
        });
      }
      
      setSelectedCells(cells);
    }
  };

  const handleMouseUp = () => {
    if (!isSelecting || gameWon) return;
    
    setIsSelecting(false);
    
    // Check if selected cells form a word
    const selectedLetters = selectedCells.map(cell => grid[cell.row][cell.col]).join('');
    const reversedLetters = selectedLetters.split('').reverse().join('');
    
    const foundWord = words.find(wordObj => 
      (wordObj.word === selectedLetters || wordObj.word === reversedLetters) && !wordObj.found
    );
    
    if (foundWord) {
      setFoundWords(prev => new Set([...prev, foundWord.word]));
      setWords(prev => prev.map(w => 
        w.word === foundWord.word ? { ...w, found: true } : w
      ));
      toast.success(`Found: ${foundWord.word}! 🌟`);
      
      // Check if all words are found
      if (foundWords.size + 1 === WORDS_TO_FIND.length) {
        setGameWon(true);
        toast.success("🎉 Congratulations! You found all words!");
      }
    }
    
    setSelectedCells([]);
  };

  const resetGame = () => {
    generateGrid();
    setSelectedCells([]);
    setFoundWords(new Set());
    setIsSelecting(false);
    setGameStarted(false);
    setStartTime(null);
    setGameWon(false);
  };

  const isCellSelected = (row: number, col: number): boolean => {
    return selectedCells.some(cell => cell.row === row && cell.col === col);
  };

  const isCellFound = (row: number, col: number): boolean => {
    return words.some(word => 
      word.found && word.positions.some(pos => pos.row === row && pos.col === col)
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Game Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Cosmic Word Search by pennywisdom
        </h1>
        <p className="text-muted-foreground">
          Find all the hidden space words! ✨
        </p>
      </div>

      {/* Game Stats */}
      <GameStats 
        moves={0}
        matches={foundWords.size}
        totalPairs={WORDS_TO_FIND.length}
        startTime={startTime}
        gameWon={gameWon}
        hideMatches={false}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Word Search Grid */}
        <div className="lg:col-span-2">
          <div 
            className="grid grid-cols-12 gap-1 p-4 bg-gradient-card rounded-xl border border-border select-none"
            style={{ userSelect: 'none' }}
          >
            {grid.map((row, rowIndex) =>
              row.map((letter, colIndex) => (
                <WordSearchCell
                  key={`${rowIndex}-${colIndex}`}
                  letter={letter}
                  isSelected={isCellSelected(rowIndex, colIndex)}
                  isFound={isCellFound(rowIndex, colIndex)}
                  onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                  onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                  onMouseUp={handleMouseUp}
                  row={rowIndex}
                  col={colIndex}
                />
              ))
            )}
          </div>
        </div>

        {/* Words List */}
        <div className="space-y-4">
          <Card className="bg-gradient-card border-border p-4">
            <h3 className="text-lg font-bold text-center mb-3 text-primary">
              Find These Words
            </h3>
            <div className="space-y-2">
              {WORDS_TO_FIND.map(word => (
                <div
                  key={word}
                  className={cn(
                    "p-2 rounded-lg text-center font-semibold transition-all duration-300",
                    foundWords.has(word) 
                      ? "bg-gradient-success text-white line-through" 
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {word}
                </div>
              ))}
            </div>
          </Card>

          {/* Reset Button */}
          <Button 
            onClick={resetGame}
            variant="default"
            size="lg"
            className="w-full bg-gradient-primary hover:shadow-glow-primary transition-all duration-300"
          >
            New Puzzle 🚀
          </Button>
        </div>
      </div>

      {/* Game Over Overlay */}
      {gameWon && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-card p-8 rounded-2xl border border-border shadow-2xl text-center space-y-4 animate-scale-in max-w-md">
            <div className="text-6xl">🎉</div>
            <h2 className="text-3xl font-bold bg-gradient-success bg-clip-text text-transparent">
              Puzzle Complete!
            </h2>
            <p className="text-muted-foreground">
              Amazing! You found all {WORDS_TO_FIND.length} words in the cosmic word search!
            </p>
            <div className="space-y-2">
              <p className="text-sm">Words Found: <span className="font-bold text-primary">{foundWords.size}/{WORDS_TO_FIND.length}</span></p>
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
              New Puzzle 🚀
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};