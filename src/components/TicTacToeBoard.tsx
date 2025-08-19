import { useState, useEffect } from "react";
import { TicTacToeCell } from "./TicTacToeCell";
import { GameStats } from "./GameStats";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Player = 'X' | 'O';
type Cell = Player | null;
type Board = Cell[];

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6] // Diagonals
];

export const TicTacToeBoard = () => {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'draw'>('playing');
  const [winner, setWinner] = useState<Player | null>(null);
  const [winningCells, setWinningCells] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  const checkWinner = (board: Board): { winner: Player | null; winningCells: number[] } => {
    for (const combination of WINNING_COMBINATIONS) {
      const [a, b, c] = combination;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a] as Player, winningCells: combination };
      }
    }
    return { winner: null, winningCells: [] };
  };

  const checkDraw = (board: Board): boolean => {
    return board.every(cell => cell !== null);
  };

  const handleCellClick = (index: number) => {
    if (board[index] || gameStatus !== 'playing') return;

    if (!gameStarted) {
      setGameStarted(true);
      setStartTime(new Date());
    }

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);
    setMoves(prev => prev + 1);

    const { winner: gameWinner, winningCells: cells } = checkWinner(newBoard);
    
    if (gameWinner) {
      setWinner(gameWinner);
      setWinningCells(cells);
      setGameStatus('won');
      toast.success(`🎉 Player ${gameWinner} wins!`);
    } else if (checkDraw(newBoard)) {
      setGameStatus('draw');
      toast.info("It's a draw! 🤝");
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setGameStatus('playing');
    setWinner(null);
    setWinningCells([]);
    setMoves(0);
    setGameStarted(false);
    setStartTime(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Game Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Cosmic Tic-Tac-Toe by pennywisdom
        </h1>
        <p className="text-muted-foreground">
          Get three in a row to win! ⭐
        </p>
      </div>

      {/* Current Player */}
      {gameStatus === 'playing' && (
        <div className="text-center">
          <p className="text-lg font-semibold">
            Current Player: <span className={cn(
              "text-2xl font-bold",
              currentPlayer === 'X' ? "text-primary" : "text-secondary"
            )}>
              {currentPlayer}
            </span>
          </p>
        </div>
      )}

      {/* Game Stats */}
      <GameStats 
        moves={moves}
        matches={0}
        totalPairs={0}
        startTime={startTime}
        gameWon={gameStatus === 'won'}
        hideMatches={true}
      />

      {/* Game Board */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 p-4 sm:p-6 bg-gradient-card rounded-xl border border-border max-w-md mx-auto">
        {board.map((cell, index) => (
          <TicTacToeCell
            key={index}
            value={cell}
            onClick={() => handleCellClick(index)}
            disabled={gameStatus !== 'playing'}
            isWinning={winningCells.includes(index)}
          />
        ))}
      </div>

      {/* Game Controls */}
      <div className="flex justify-center">
        <Button 
          onClick={resetGame}
          variant="default"
          size="lg"
          className="bg-gradient-primary hover:shadow-glow-primary transition-all duration-300"
        >
          New Game 🚀
        </Button>
      </div>

      {/* Game Over Overlay */}
      {gameStatus !== 'playing' && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-card p-8 rounded-2xl border border-border shadow-2xl text-center space-y-4 animate-scale-in">
            <div className="text-6xl">
              {gameStatus === 'won' ? '🎉' : '🤝'}
            </div>
            <h2 className="text-3xl font-bold bg-gradient-success bg-clip-text text-transparent">
              {gameStatus === 'won' ? `Player ${winner} Wins!` : "It's a Draw!"}
            </h2>
            <p className="text-muted-foreground">
              {gameStatus === 'won' 
                ? `Congratulations! Player ${winner} got three in a row!`
                : "Great game! Nobody got three in a row this time."
              }
            </p>
            <div className="space-y-2">
              <p className="text-sm">Moves: <span className="font-bold text-primary">{moves}</span></p>
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
              Play Again 🚀
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};