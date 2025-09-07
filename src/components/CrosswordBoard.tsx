import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CrosswordCell {
  letter: string;
  number?: number;
  isBlocked: boolean;
  isStartOfWord: boolean;
}

interface Clue {
  number: number;
  clue: string;
  answer: string;
  direction: 'across' | 'down';
  startRow: number;
  startCol: number;
  completed: boolean;
}

const CROSSWORD_DATA: Clue[] = [
  {
    number: 1,
    clue: "Large celestial body that emits light",
    answer: "STAR",
    direction: "across",
    startRow: 1,
    startCol: 1,
    completed: false
  },
  {
    number: 2,
    clue: "Collection of stars and planets",
    answer: "GALAXY",
    direction: "down",
    startRow: 1,
    startCol: 3,
    completed: false
  },
  {
    number: 3,
    clue: "Earth's natural satellite",
    answer: "MOON",
    direction: "across",
    startRow: 3,
    startCol: 0,
    completed: false
  },
  {
    number: 4,
    clue: "The path a planet takes around a star",
    answer: "ORBIT",
    direction: "down",
    startRow: 3,
    startCol: 2,
    completed: false
  },
  {
    number: 5,
    clue: "Empty area beyond Earth's atmosphere",
    answer: "SPACE",
    direction: "across",
    startRow: 5,
    startCol: 1,
    completed: false
  }
];

const GRID_SIZE = 8;

export const CrosswordBoard = () => {
  const [grid, setGrid] = useState<CrosswordCell[][]>([]);
  const [userAnswers, setUserAnswers] = useState<string[][]>([]);
  const [clues, setClues] = useState<Clue[]>(CROSSWORD_DATA);
  const [selectedCell, setSelectedCell] = useState<{row: number, col: number} | null>(null);
  const [gameWon, setGameWon] = useState(false);

  const initializeGrid = () => {
    // Create empty grid
    const newGrid: CrosswordCell[][] = Array(GRID_SIZE).fill(null).map(() =>
      Array(GRID_SIZE).fill(null).map(() => ({
        letter: '',
        isBlocked: true,
        isStartOfWord: false
      }))
    );

    const newUserAnswers: string[][] = Array(GRID_SIZE).fill(null).map(() =>
      Array(GRID_SIZE).fill('')
    );

    // Place words and create cells
    CROSSWORD_DATA.forEach(clue => {
      const { startRow, startCol, answer, direction, number } = clue;
      
      for (let i = 0; i < answer.length; i++) {
        const row = direction === 'across' ? startRow : startRow + i;
        const col = direction === 'across' ? startCol + i : startCol;
        
        if (row < GRID_SIZE && col < GRID_SIZE) {
          newGrid[row][col] = {
            letter: answer[i],
            number: i === 0 ? number : undefined,
            isBlocked: false,
            isStartOfWord: i === 0
          };
        }
      }
    });

    setGrid(newGrid);
    setUserAnswers(newUserAnswers);
  };

  useEffect(() => {
    initializeGrid();
  }, []);

  const handleCellClick = (row: number, col: number) => {
    if (grid[row] && grid[row][col] && !grid[row][col].isBlocked) {
      setSelectedCell({ row, col });
    }
  };

  const handleInputChange = (row: number, col: number, value: string) => {
    if (value.length > 1) return;
    
    const newUserAnswers = [...userAnswers];
    newUserAnswers[row][col] = value.toUpperCase();
    setUserAnswers(newUserAnswers);

    // Check if any words are completed
    checkWordCompletion(newUserAnswers);
  };

  const checkWordCompletion = (answers: string[][]) => {
    const updatedClues = clues.map(clue => {
      const { startRow, startCol, answer, direction } = clue;
      let userWord = '';
      
      for (let i = 0; i < answer.length; i++) {
        const row = direction === 'across' ? startRow : startRow + i;
        const col = direction === 'across' ? startCol + i : startCol;
        userWord += answers[row][col] || '';
      }
      
      const wasCompleted = clue.completed;
      const isCompleted = userWord === answer;
      
      if (isCompleted && !wasCompleted) {
        toast.success(`Completed: ${clue.clue} ✨`);
      }
      
      return { ...clue, completed: isCompleted };
    });

    setClues(updatedClues);

    // Check if all words are completed
    const allCompleted = updatedClues.every(clue => clue.completed);
    if (allCompleted && !gameWon) {
      setGameWon(true);
      toast.success("🎉 Crossword Complete! Amazing work!");
    }
  };

  const resetGame = () => {
    initializeGrid();
    setClues(CROSSWORD_DATA.map(clue => ({ ...clue, completed: false })));
    setSelectedCell(null);
    setGameWon(false);
  };

  const getCellStyle = (row: number, col: number) => {
    const cell = grid[row]?.[col];
    if (!cell) return "";

    if (cell.isBlocked) {
      return "bg-gray-800 cursor-not-allowed";
    }

    const isSelected = selectedCell?.row === row && selectedCell?.col === col;
    const isCorrect = cell.letter === userAnswers[row][col];
    
    return cn(
      "bg-white border-2 border-gray-300 cursor-pointer transition-all duration-200",
      "hover:border-primary/50 hover:shadow-md",
      isSelected && "border-primary ring-2 ring-primary/30",
      isCorrect && userAnswers[row][col] && "bg-green-50 border-green-300"
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Game Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Cosmic Crossword
        </h1>
        <p className="text-muted-foreground">
          Fill in the space-themed crossword puzzle! 🚀
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Crossword Grid */}
        <div className="lg:col-span-2">
          <Card className="bg-gradient-card border-border p-6">
            <div className="grid gap-1 mx-auto" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, maxWidth: '400px' }}>
              {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={cn(
                      "aspect-square relative flex items-center justify-center text-lg font-bold",
                      getCellStyle(rowIndex, colIndex)
                    )}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  >
                    {!cell.isBlocked && (
                      <>
                        {cell.number && (
                          <span className="absolute top-0 left-0 text-xs font-bold text-primary p-0.5 leading-none">
                            {cell.number}
                          </span>
                        )}
                        <Input
                          value={userAnswers[rowIndex][colIndex] || ''}
                          onChange={(e) => handleInputChange(rowIndex, colIndex, e.target.value)}
                          className="w-full h-full border-0 bg-transparent text-center p-0 text-lg font-bold focus:outline-none focus:ring-0"
                          maxLength={1}
                        />
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Clues */}
        <div className="space-y-4">
          <Card className="bg-gradient-card border-border p-4">
            <h3 className="text-lg font-bold text-center mb-4 text-primary">
              Clues
            </h3>
            <div className="space-y-4">
              {/* Across Clues */}
              <div>
                <h4 className="font-semibold text-primary mb-2">Across</h4>
                <div className="space-y-2">
                  {clues
                    .filter(clue => clue.direction === 'across')
                    .map(clue => (
                      <div
                        key={`across-${clue.number}`}
                        className={cn(
                          "p-2 rounded-lg text-sm transition-all duration-300",
                          clue.completed
                            ? "bg-gradient-success text-white"
                            : "bg-muted/50 text-muted-foreground"
                        )}
                      >
                        <span className="font-bold">{clue.number}.</span> {clue.clue}
                      </div>
                    ))}
                </div>
              </div>

              {/* Down Clues */}
              <div>
                <h4 className="font-semibold text-primary mb-2">Down</h4>
                <div className="space-y-2">
                  {clues
                    .filter(clue => clue.direction === 'down')
                    .map(clue => (
                      <div
                        key={`down-${clue.number}`}
                        className={cn(
                          "p-2 rounded-lg text-sm transition-all duration-300",
                          clue.completed
                            ? "bg-gradient-success text-white"
                            : "bg-muted/50 text-muted-foreground"
                        )}
                      >
                        <span className="font-bold">{clue.number}.</span> {clue.clue}
                      </div>
                    ))}
                </div>
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
            New Crossword 🌟
          </Button>
        </div>
      </div>

      {/* Game Over Overlay */}
      {gameWon && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-card p-8 rounded-2xl border border-border shadow-2xl text-center space-y-4 animate-scale-in max-w-md">
            <div className="text-6xl">🎉</div>
            <h2 className="text-3xl font-bold bg-gradient-success bg-clip-text text-transparent">
              Crossword Complete!
            </h2>
            <p className="text-muted-foreground">
              Fantastic! You've completed the cosmic crossword puzzle!
            </p>
            <div className="space-y-2">
              <p className="text-sm">Words Completed: <span className="font-bold text-primary">{clues.filter(c => c.completed).length}/{clues.length}</span></p>
            </div>
            <Button 
              onClick={resetGame}
              className="bg-gradient-primary hover:shadow-glow-primary transition-all duration-300"
            >
              New Crossword 🌟
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};