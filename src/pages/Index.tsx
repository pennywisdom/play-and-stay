import { useState } from "react";
import { HangmanBoard } from "@/components/HangmanBoard";
import { WordScrambleBoard } from "@/components/WordScrambleBoard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type GameType = "hangman" | "scramble";

const Index = () => {
  const [currentGame, setCurrentGame] = useState<GameType>("hangman");

  return (
    <div className="min-h-screen bg-gradient-cosmic bg-fixed">
      <div className="min-h-screen bg-background/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          {/* Game Navigation */}
          <Card className="bg-gradient-card border-border p-4 mb-6 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <h2 className="text-xl font-bold text-primary">Choose Your Game:</h2>
              <div className="flex gap-3">
                <Button
                  onClick={() => setCurrentGame("hangman")}
                  variant={currentGame === "hangman" ? "default" : "outline"}
                  className={currentGame === "hangman" ? "bg-gradient-primary" : ""}
                >
                  🎯 Hangman
                </Button>
                <Button
                  onClick={() => setCurrentGame("scramble")}
                  variant={currentGame === "scramble" ? "default" : "outline"}
                  className={currentGame === "scramble" ? "bg-gradient-primary" : ""}
                >
                  🌌 Word Scramble
                </Button>
              </div>
            </div>
          </Card>

          {/* Render Current Game */}
          {currentGame === "hangman" && <HangmanBoard />}
          {currentGame === "scramble" && <WordScrambleBoard />}
        </div>
      </div>
    </div>
  );
};

export default Index;
