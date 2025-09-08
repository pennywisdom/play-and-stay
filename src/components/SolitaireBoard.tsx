import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GameStats } from "./GameStats";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Card types
type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

interface PlayingCard {
  id: string;
  suit: Suit;
  rank: Rank;
  value: number;
  isRed: boolean;
  faceUp: boolean;
}

type GameState = {
  stock: PlayingCard[];
  waste: PlayingCard[];
  foundations: PlayingCard[][];
  tableau: PlayingCard[][];
};

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const SUIT_SYMBOLS = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠'
};

// Create a standard 52-card deck
const createDeck = (): PlayingCard[] => {
  const deck: PlayingCard[] = [];
  
  for (const suit of SUITS) {
    for (let i = 0; i < RANKS.length; i++) {
      const rank = RANKS[i];
      const value = rank === 'A' ? 1 : rank === 'J' ? 11 : rank === 'Q' ? 12 : rank === 'K' ? 13 : parseInt(rank);
      
      deck.push({
        id: `${suit}-${rank}`,
        suit,
        rank,
        value,
        isRed: suit === 'hearts' || suit === 'diamonds',
        faceUp: false
      });
    }
  }
  
  return deck;
};

// Shuffle array using Fisher-Yates algorithm
const shuffleDeck = (deck: PlayingCard[]): PlayingCard[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Initialize game state
const initializeGame = (): GameState => {
  const deck = shuffleDeck(createDeck());
  
  // Set up tableau (7 columns)
  const tableau: PlayingCard[][] = [[], [], [], [], [], [], []];
  let cardIndex = 0;
  
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      const card = { ...deck[cardIndex] };
      // Only the top card in each column is face up
      if (row === col) {
        card.faceUp = true;
      }
      tableau[col].push(card);
      cardIndex++;
    }
  }
  
  // Remaining cards go to stock
  const stock = deck.slice(cardIndex).map(card => ({ ...card, faceUp: false }));
  
  return {
    stock,
    waste: [],
    foundations: [[], [], [], []], // 4 foundation piles
    tableau
  };
};

const CardComponent = ({ card, onClick, className, style }: { 
  card: PlayingCard | null; 
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}) => {
  if (!card) {
    return (
      <div 
        className={cn(
          "w-16 h-24 rounded border-2 border-dashed border-border/50",
          "bg-card/20 flex items-center justify-center",
          className
        )}
        onClick={onClick}
      >
        <div className="w-4 h-4 rounded-full bg-border/30" />
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "w-16 h-24 rounded border bg-background flex flex-col items-center justify-between p-1 cursor-pointer",
        "transition-all duration-200 hover:shadow-glow-primary hover:scale-105",
        card.faceUp ? "border-border shadow-sm" : "bg-gradient-primary border-primary",
        className
      )}
      onClick={onClick}
      style={style}
    >
      {card.faceUp ? (
        <>
          <div className={cn("text-xs font-bold", card.isRed ? "text-destructive" : "text-foreground")}>
            {card.rank}
          </div>
          <div className={cn("text-2xl", card.isRed ? "text-destructive" : "text-foreground")}>
            {SUIT_SYMBOLS[card.suit]}
          </div>
          <div className={cn("text-xs font-bold rotate-180", card.isRed ? "text-destructive" : "text-foreground")}>
            {card.rank}
          </div>
        </>
      ) : (
        <div className="w-full h-full bg-gradient-card rounded flex items-center justify-center">
          <div className="text-lg">🌌</div>
        </div>
      )}
    </div>
  );
};

export const SolitaireBoard = () => {
  const [gameState, setGameState] = useState<GameState>(initializeGame);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [gameWon, setGameWon] = useState(false);

  const resetGame = useCallback(() => {
    setGameState(initializeGame());
    setSelectedCard(null);
    setMoves(0);
    setStartTime(null);
    setGameWon(false);
  }, []);

  // Check if game is won
  useEffect(() => {
    const totalFoundationCards = gameState.foundations.reduce((sum, foundation) => sum + foundation.length, 0);
    if (totalFoundationCards === 52) {
      setGameWon(true);
      toast.success("🎉 Congratulations! You won Cosmic Solitaire!");
    }
  }, [gameState.foundations]);

  const handleStockClick = () => {
    if (!startTime) setStartTime(new Date());
    
    setGameState(prev => {
      if (prev.stock.length > 0) {
        // Draw 3 cards from stock to waste
        const cardsToDraw = Math.min(3, prev.stock.length);
        const drawnCards = prev.stock.slice(-cardsToDraw).map(card => ({ ...card, faceUp: true }));
        
        return {
          ...prev,
          stock: prev.stock.slice(0, -cardsToDraw),
          waste: [...drawnCards.reverse(), ...prev.waste]
        };
      } else if (prev.waste.length > 0) {
        // Reset: move all waste cards back to stock
        const resetCards = prev.waste.map(card => ({ ...card, faceUp: false }));
        return {
          ...prev,
          stock: resetCards.reverse(),
          waste: []
        };
      }
      return prev;
    });
    setMoves(prev => prev + 1);
  };

  const canPlaceOnFoundation = (card: PlayingCard, foundationIndex: number): boolean => {
    const foundation = gameState.foundations[foundationIndex];
    
    if (foundation.length === 0) {
      return card.rank === 'A';
    }
    
    const topCard = foundation[foundation.length - 1];
    return card.suit === topCard.suit && card.value === topCard.value + 1;
  };

  const canPlaceOnTableau = (card: PlayingCard, tableauIndex: number): boolean => {
    const tableau = gameState.tableau[tableauIndex];
    
    if (tableau.length === 0) {
      return card.rank === 'K';
    }
    
    const topCard = tableau[tableau.length - 1];
    if (!topCard.faceUp) return false;
    
    return topCard.isRed !== card.isRed && card.value === topCard.value - 1;
  };

  const moveCardToFoundation = (card: PlayingCard, foundationIndex: number) => {
    if (!canPlaceOnFoundation(card, foundationIndex)) return;
    if (!startTime) setStartTime(new Date());

    setGameState(prev => {
      const newState = { ...prev };
      
      // Remove card from its current location
      if (prev.waste.length > 0 && prev.waste[0].id === card.id) {
        newState.waste = prev.waste.slice(1);
      } else {
        // Find and remove from tableau
        for (let i = 0; i < prev.tableau.length; i++) {
          const column = prev.tableau[i];
          if (column.length > 0 && column[column.length - 1].id === card.id) {
            newState.tableau[i] = column.slice(0, -1);
            // Flip the next card if it exists
            if (newState.tableau[i].length > 0) {
              const nextCard = newState.tableau[i][newState.tableau[i].length - 1];
              if (!nextCard.faceUp) {
                newState.tableau[i][newState.tableau[i].length - 1] = { ...nextCard, faceUp: true };
              }
            }
            break;
          }
        }
      }
      
      // Add to foundation
      newState.foundations[foundationIndex] = [...prev.foundations[foundationIndex], card];
      
      return newState;
    });
    
    setMoves(prev => prev + 1);
    setSelectedCard(null);
    toast.success("Card moved to foundation! ✨");
  };

  const moveCardToTableau = (card: PlayingCard, tableauIndex: number) => {
    if (!canPlaceOnTableau(card, tableauIndex)) return;
    if (!startTime) setStartTime(new Date());

    setGameState(prev => {
      const newState = { ...prev };
      
      // Remove card from waste
      if (prev.waste.length > 0 && prev.waste[0].id === card.id) {
        newState.waste = prev.waste.slice(1);
        newState.tableau[tableauIndex] = [...prev.tableau[tableauIndex], card];
      }
      
      return newState;
    });
    
    setMoves(prev => prev + 1);
    setSelectedCard(null);
    toast.success("Card moved! 🚀");
  };

  const handleCardClick = (card: PlayingCard) => {
    if (!card.faceUp) return;
    
    setSelectedCard(prev => prev === card.id ? null : card.id);
  };

  const handleFoundationClick = (foundationIndex: number) => {
    if (!selectedCard) return;
    
    const wasteCard = gameState.waste.length > 0 ? gameState.waste[0] : null;
    if (wasteCard && wasteCard.id === selectedCard) {
      moveCardToFoundation(wasteCard, foundationIndex);
      return;
    }
    
    // Check tableau cards
    for (const column of gameState.tableau) {
      if (column.length > 0) {
        const topCard = column[column.length - 1];
        if (topCard.id === selectedCard) {
          moveCardToFoundation(topCard, foundationIndex);
          return;
        }
      }
    }
  };

  const handleTableauClick = (tableauIndex: number) => {
    if (!selectedCard) return;
    
    const wasteCard = gameState.waste.length > 0 ? gameState.waste[0] : null;
    if (wasteCard && wasteCard.id === selectedCard) {
      moveCardToTableau(wasteCard, tableauIndex);
    }
  };

  const foundationCount = gameState.foundations.reduce((sum, foundation) => sum + foundation.length, 0);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Game Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Cosmic Solitaire
        </h1>
        <p className="text-muted-foreground">
          Build foundation piles from Ace to King in each suit! 🃏
        </p>
      </div>

      {/* Game Stats */}
      <GameStats 
        moves={moves}
        matches={foundationCount}
        totalPairs={52}
        startTime={startTime}
        gameWon={gameWon}
        hideMatches={false}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Game Area */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="bg-gradient-card border-border p-6">
            {/* Top Row: Stock, Waste, and Foundations */}
            <div className="grid grid-cols-7 gap-4 mb-8">
              {/* Stock Pile */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground text-center">Stock</p>
                <CardComponent 
                  card={gameState.stock.length > 0 ? gameState.stock[gameState.stock.length - 1] : null}
                  onClick={handleStockClick}
                />
                <p className="text-xs text-center text-muted-foreground">{gameState.stock.length}</p>
              </div>

              {/* Waste Pile */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground text-center">Waste</p>
                <CardComponent 
                  card={gameState.waste.length > 0 ? gameState.waste[0] : null}
                  onClick={() => gameState.waste.length > 0 && handleCardClick(gameState.waste[0])}
                  className={selectedCard === gameState.waste[0]?.id ? "ring-2 ring-primary" : ""}
                />
              </div>

              <div /> {/* Spacer */}

              {/* Foundation Piles */}
              {gameState.foundations.map((foundation, index) => (
                <div key={index} className="space-y-2">
                  <p className="text-xs text-muted-foreground text-center">{SUITS[index]}</p>
                  <CardComponent 
                    card={foundation.length > 0 ? foundation[foundation.length - 1] : null}
                    onClick={() => handleFoundationClick(index)}
                  />
                </div>
              ))}
            </div>

            {/* Tableau */}
            <div className="grid grid-cols-7 gap-4">
              {gameState.tableau.map((column, colIndex) => (
                <div key={colIndex} className="space-y-1">
                  <p className="text-xs text-muted-foreground text-center">{colIndex + 1}</p>
                  <div 
                    className="min-h-32 space-y-1"
                    onClick={() => handleTableauClick(colIndex)}
                  >
                    {column.length === 0 ? (
                      <CardComponent card={null} />
                    ) : (
                      column.map((card, cardIndex) => (
                        <CardComponent 
                          key={card.id}
                          card={card}
                          onClick={() => handleCardClick(card)}
                          className={cn(
                            cardIndex < column.length - 1 ? "absolute z-10" : "",
                            selectedCard === card.id ? "ring-2 ring-primary z-20" : ""
                          )}
                          style={cardIndex < column.length - 1 ? {
                            transform: `translateY(${cardIndex * 20}px)`
                          } : {}}
                        />
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
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
                <span>Cards in Foundations:</span>
                <span className="font-bold text-primary">{foundationCount}/52</span>
              </div>
              <div className="flex justify-between">
                <span>Stock Cards:</span>
                <span className="font-bold">{gameState.stock.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Moves Made:</span>
                <span className="font-bold">{moves}</span>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-card border-border p-4">
            <h3 className="text-lg font-bold text-center mb-3 text-primary">
              How to Play
            </h3>
            <div className="text-xs space-y-2 text-muted-foreground">
              <p>• Click stock to draw cards</p>
              <p>• Build foundations Ace to King</p>
              <p>• Tableau: red on black, descending</p>
              <p>• Only Kings can go on empty columns</p>
            </div>
          </Card>

          {/* Reset Button */}
          <Button 
            onClick={resetGame}
            variant="default"
            size="lg"
            className="w-full bg-gradient-primary hover:shadow-glow-primary transition-all duration-300"
          >
            New Game 🚀
          </Button>
        </div>
      </div>

      {/* Game Won Overlay */}
      {gameWon && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-card p-8 rounded-2xl border border-border shadow-2xl text-center space-y-4 animate-bounce-in max-w-md">
            <div className="text-6xl">🎉</div>
            <h2 className="text-3xl font-bold bg-gradient-success bg-clip-text text-transparent">
              You Won!
            </h2>
            <p className="text-muted-foreground">
              Congratulations! You've completed Cosmic Solitaire!
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
              New Game 🚀
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};