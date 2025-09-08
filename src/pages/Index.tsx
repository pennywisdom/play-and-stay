import { useState } from "react";
import { HangmanBoard } from "@/components/HangmanBoard";
import { WordScrambleBoard } from "@/components/WordScrambleBoard";
import { WordSearchBoard } from "@/components/WordSearchBoard";
import { CrosswordBoard } from "@/components/CrosswordBoard";
import { WordleBoard } from "@/components/WordleBoard";
import { WordBuilderBoard } from "@/components/WordBuilderBoard";
import { SolitaireBoard } from "@/components/SolitaireBoard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type GameType = "hangman" | "scramble" | "wordsearch" | "crossword" | "wordle" | "builder" | "solitaire";

const Index = () => {
  const [currentGame, setCurrentGame] = useState<GameType>("hangman");

  return (
    <div className="min-h-screen bg-gradient-cosmic bg-fixed">
      <div className="min-h-screen bg-background/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          {/* Game Navigation */}
          <Card className="bg-gradient-card border-border p-4 mb-6 max-w-6xl mx-auto">
            <div className="flex flex-col gap-4 items-center justify-center">
              <h2 className="text-xl font-bold text-primary">Choose Your Game:</h2>
              <div className="flex flex-wrap gap-3 justify-center">
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
                <Button
                  onClick={() => setCurrentGame("wordsearch")}
                  variant={currentGame === "wordsearch" ? "default" : "outline"}
                  className={currentGame === "wordsearch" ? "bg-gradient-primary" : ""}
                >
                  🔍 Word Search
                </Button>
                <Button
                  onClick={() => setCurrentGame("crossword")}
                  variant={currentGame === "crossword" ? "default" : "outline"}
                  className={currentGame === "crossword" ? "bg-gradient-primary" : ""}
                >
                  📝 Crossword
                </Button>
                <Button
                  onClick={() => setCurrentGame("wordle")}
                  variant={currentGame === "wordle" ? "default" : "outline"}
                  className={currentGame === "wordle" ? "bg-gradient-primary" : ""}
                >
                  🎯 Wordle
                </Button>
                <Button
                  onClick={() => setCurrentGame("builder")}
                  variant={currentGame === "builder" ? "default" : "outline"}
                  className={currentGame === "builder" ? "bg-gradient-primary" : ""}
                >
                  🔨 Word Builder
                </Button>
                <Button
                  onClick={() => setCurrentGame("solitaire")}
                  variant={currentGame === "solitaire" ? "default" : "outline"}
                  className={currentGame === "solitaire" ? "bg-gradient-primary" : ""}
                >
                  🃏 Solitaire
                </Button>
              </div>
            </div>
          </Card>

          {/* Render Current Game */}
          {currentGame === "hangman" && <HangmanBoard />}
          {currentGame === "scramble" && <WordScrambleBoard />}
          {currentGame === "wordsearch" && <WordSearchBoard />}
          {currentGame === "crossword" && <CrosswordBoard />}
          {currentGame === "wordle" && <WordleBoard />}
          {currentGame === "builder" && <WordBuilderBoard />}
          {currentGame === "solitaire" && <SolitaireBoard />}
        </div>
      </div>
    </div>
  );
};

export default Index;
