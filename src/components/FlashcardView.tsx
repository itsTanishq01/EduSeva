import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, RotateCw, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { generateFlashcards } from "@/services/api";
import { toast } from "sonner";
import { cache, CACHE_KEYS } from "@/lib/cache";

interface Flashcard {
  front: string;
  back: string;
  type: string;
  difficulty: string;
}

export const FlashcardView = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load flashcards on mount
  useEffect(() => {
    loadFlashcards();
  }, []);

  const loadFlashcards = async () => {
    // Try loading from cache first
    const cachedFlashcards = cache.get<Flashcard[]>(CACHE_KEYS.FLASHCARDS);
    if (cachedFlashcards && Array.isArray(cachedFlashcards) && cachedFlashcards.length > 0) {
      setFlashcards(cachedFlashcards);
      toast.success(`Loaded ${cachedFlashcards.length} cached flashcards`);
      return;
    }

    setIsLoading(true);
    try {
      const response = await generateFlashcards({
        numCards: 10,
        difficulty: "intermediate",
      });
      
      // Cache the flashcards
      cache.set(CACHE_KEYS.FLASHCARDS, response.flashcards);
      
      setFlashcards(response.flashcards);
      toast.success(`Generated ${response.flashcards.length} flashcards`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load flashcards");
    } finally {
      setIsLoading(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (flashcards.length === 0) return;
      
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          handlePrevious();
          break;
        case "ArrowRight":
          e.preventDefault();
          handleNext();
          break;
        case " ":
        case "Enter":
          e.preventDefault();
          handleFlip();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentIndex, flashcards.length, isFlipped]);

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setCurrentIndex(
      (prev) => (prev - 1 + flashcards.length) % flashcards.length
    );
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const currentCard = flashcards[currentIndex];

  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 pt-20">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Generating flashcards...</p>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 pt-20 space-y-4">
        <p className="text-muted-foreground">No flashcards available</p>
        <Button onClick={loadFlashcards}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Generate Flashcards
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center p-6 pt-20">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Flashcards
          </h2>
          <p className="text-sm text-muted-foreground">
            Card {currentIndex + 1} of {flashcards.length}
          </p>
        </div>

        <div
          className="perspective-1000 relative h-80 cursor-pointer"
          onClick={handleFlip}
        >
          <Card
            className={`flashcard-container absolute inset-0 transition-transform duration-500 shadow-xl hover:shadow-2xl ${
              isFlipped ? "flashcard-flipped" : ""
            }`}
            style={{ transformStyle: "preserve-3d" }}
          >
            <div
              className="flashcard-face flashcard-front absolute inset-0 flex items-center justify-center p-8 bg-gradient-to-br from-card to-card/50"
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="text-center space-y-4">
                <div className="inline-block rounded-full bg-gradient-to-r from-primary/20 to-accent/20 px-6 py-2 shadow-md">
                  <span className="text-sm font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Question
                  </span>
                </div>
                <p className="text-xl font-medium text-foreground leading-relaxed">
                  {currentCard.front}
                </p>
              </div>
            </div>
            <div
              className="flashcard-face flashcard-back absolute inset-0 flex items-center justify-center p-8 bg-gradient-to-br from-primary/5 to-accent/5"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <div className="text-center space-y-4">
                <div className="inline-block rounded-full bg-gradient-to-r from-accent/20 to-primary/20 px-6 py-2 shadow-md">
                  <span className="text-sm font-semibold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                    Answer
                  </span>
                </div>
                <p className="text-xl text-foreground leading-relaxed">{currentCard.back}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePrevious}
            disabled={flashcards.length <= 1}
            className="shadow-md hover:shadow-lg"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="gradient" size="lg" onClick={handleFlip} className="shadow-lg">
            <RotateCw className="mr-2 h-5 w-5" />
            Flip Card
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleNext}
            disabled={flashcards.length <= 1}
            className="shadow-md hover:shadow-lg"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex items-center justify-center gap-4">
          <div className="text-center text-sm text-muted-foreground bg-muted/50 rounded-full px-4 py-2">
            Use arrow keys to navigate • Space/Enter to flip
          </div>
          <Button variant="outline" onClick={loadFlashcards}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Regenerate
          </Button>
        </div>
      </div>
    </div>
  );
};
