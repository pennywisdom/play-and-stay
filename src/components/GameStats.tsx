import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface GameStatsProps {
  moves: number;
  matches: number;
  totalPairs: number;
  startTime: Date | null;
  gameWon: boolean;
}

export const GameStats = ({ moves, matches, totalPairs, startTime, gameWon }: GameStatsProps) => {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!startTime || gameWon) return;

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, gameWon]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = totalPairs > 0 ? (matches / totalPairs) * 100 : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Moves Counter */}
      <Card className="bg-gradient-card border-border p-4 text-center">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Moves</p>
          <p className="text-2xl font-bold text-primary">{moves}</p>
        </div>
      </Card>

      {/* Progress */}
      <Card className="bg-gradient-card border-border p-4 text-center">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Progress</p>
          <div className="space-y-1">
            <p className="text-lg font-bold text-primary">
              {matches}/{totalPairs}
            </p>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-primary h-2 rounded-full transition-all duration-500 ease-smooth"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Timer */}
      <Card className="bg-gradient-card border-border p-4 text-center">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Time</p>
          <p className="text-2xl font-bold text-primary">
            {startTime ? formatTime(elapsedTime) : "0:00"}
          </p>
        </div>
      </Card>
    </div>
  );
};