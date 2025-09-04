interface HangmanDrawingProps {
  incorrectGuesses: number;
}

export const HangmanDrawing = ({ incorrectGuesses }: HangmanDrawingProps) => {
  const parts = [
    // Base
    <div key="base" className="w-16 h-2 bg-foreground mx-auto" />,
    // Pole
    <div key="pole" className="w-2 h-32 bg-foreground mx-auto" />,
    // Top beam
    <div key="beam" className="w-12 h-2 bg-foreground ml-8" />,
    // Noose
    <div key="noose" className="w-2 h-8 bg-foreground ml-16" />,
    // Head
    <div key="head" className="w-8 h-8 border-4 border-foreground rounded-full ml-14" />,
    // Body
    <div key="body" className="w-2 h-16 bg-foreground ml-16" />,
    // Left arm
    <div key="leftArm" className="w-8 h-2 bg-foreground ml-12 mt-4 rotate-45 origin-right" />,
    // Right arm
    <div key="rightArm" className="w-8 h-2 bg-foreground ml-16 -mt-2 -rotate-45 origin-left" />,
    // Left leg
    <div key="leftLeg" className="w-8 h-2 bg-foreground ml-12 mt-6 rotate-45 origin-right" />,
    // Right leg
    <div key="rightLeg" className="w-8 h-2 bg-foreground ml-16 -mt-2 -rotate-45 origin-left" />
  ];

  return (
    <div className="flex flex-col items-center justify-end h-48 w-32 mx-auto">
      {parts.slice(0, incorrectGuesses).map((part, index) => (
        <div key={index} className="absolute">
          {part}
        </div>
      ))}
    </div>
  );
};