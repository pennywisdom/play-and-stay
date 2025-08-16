import { useState, useEffect } from "react";
import { GameCard } from "./GameCard";
import { GameStats } from "./GameStats";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const CARD_EMOJIS = ["🚀", "⭐", "🌙", "🪐", "🛸", "☄️", "🌟", "🔮"];

export const GameBoard = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // Initialize game
  const initializeGame = () => {
    const gameCards: Card[] = [];
    const shuffledEmojis = [...CARD_EMOJIS, ...CARD_EMOJIS]
      .sort(() => Math.random() - 0.5);

    shuffledEmojis.forEach((emoji, index) => {
      gameCards.push({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      });
    });

    setCards(gameCards);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setGameStarted(false);
    setGameWon(false);
    setStartTime(null);
  };

  // Handle card click
  const handleCardClick = (cardId: number) => {
    if (!gameStarted) {
      setGameStarted(true);
      setStartTime(new Date());
    }

    if (flippedCards.length === 2) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    // Flip the card
    setCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, isFlipped: true } : card
    ));

    // Check for match when two cards are flipped
    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      const [firstCardId, secondCardId] = newFlippedCards;
      const firstCard = cards.find(card => card.id === firstCardId);
      const secondCard = cards.find(card => card.id === secondCardId);

      if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
        // Match found!
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.id === firstCardId || card.id === secondCardId
              ? { ...card, isMatched: true }
              : card
          ));
          setMatches(prev => prev + 1);
          setFlippedCards([]);
          toast.success("Perfect match! ✨");
        }, 600);
      } else {
        // No match - flip cards back
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.id === firstCardId || card.id === secondCardId
              ? { ...card, isFlipped: false }
              : card
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  // Check for game completion
  useEffect(() => {
    if (matches === CARD_EMOJIS.length && gameStarted && !gameWon) {
      setGameWon(true);
      toast.success("🎉 Congratulations! You won the cosmic memory game!");
    }
  }, [matches, gameStarted, gameWon]);

  // Initialize game on component mount
  useEffect(() => {
    initializeGame();
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Game Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Cosmic Memory
        </h1>
        <p className="text-muted-foreground">
          Match the cosmic pairs to win! ✨
        </p>
      </div>

      {/* Game Stats */}
      <GameStats 
        moves={moves}
        matches={matches}
        totalPairs={CARD_EMOJIS.length}
        startTime={startTime}
        gameWon={gameWon}
      />

      {/* Game Board */}
      <div className="grid grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 bg-gradient-card rounded-xl border border-border">
        {cards.map((card) => (
          <GameCard
            key={card.id}
            id={card.id}
            emoji={card.emoji}
            isFlipped={card.isFlipped}
            isMatched={card.isMatched}
            onClick={() => handleCardClick(card.id)}
            disabled={flippedCards.length === 2 || gameWon}
          />
        ))}
      </div>

      {/* Game Controls */}
      <div className="flex justify-center">
        <Button 
          onClick={initializeGame}
          variant="default"
          size="lg"
          className="bg-gradient-primary hover:shadow-glow-primary transition-all duration-300"
        >
          New Game 🚀
        </Button>
      </div>

      {/* Win Screen Overlay */}
      {gameWon && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-card p-8 rounded-2xl border border-border shadow-2xl text-center space-y-4 animate-bounce-in">
            <div className="text-6xl">🎉</div>
            <h2 className="text-3xl font-bold bg-gradient-success bg-clip-text text-transparent">
              Victory!
            </h2>
            <p className="text-muted-foreground">
              You completed the cosmic memory challenge!
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
              onClick={initializeGame}
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