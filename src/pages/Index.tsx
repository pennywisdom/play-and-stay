import { GameBoard } from "@/components/GameBoard";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-cosmic bg-fixed">
      <div className="min-h-screen bg-background/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <GameBoard />
        </div>
      </div>
    </div>
  );
};

export default Index;
