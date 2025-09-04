interface WordDisplayProps {
  word: string;
  guessedLetters: Set<string>;
}

export const WordDisplay = ({ word, guessedLetters }: WordDisplayProps) => {
  return (
    <div className="flex justify-center gap-2 mb-8">
      {word.split('').map((letter, index) => (
        <div
          key={index}
          className="w-12 h-12 border-b-4 border-primary flex items-center justify-center text-2xl font-bold text-primary"
        >
          {guessedLetters.has(letter.toLowerCase()) ? letter.toUpperCase() : ''}
        </div>
      ))}
    </div>
  );
};