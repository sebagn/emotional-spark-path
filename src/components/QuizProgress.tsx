import { Progress } from "@/components/ui/progress";

interface QuizProgressProps {
  currentQuestion: number;
  totalQuestions: number;
}

export const QuizProgress = ({ currentQuestion, totalQuestions }: QuizProgressProps) => {
  const progress = (currentQuestion / totalQuestions) * 100;
  
  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="flex justify-between text-sm text-muted-foreground mb-2">
        <span>Pregunta {currentQuestion} de {totalQuestions}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-3 bg-secondary/50" />
    </div>
  );
};