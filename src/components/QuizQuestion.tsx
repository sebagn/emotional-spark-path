import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuizQuestionProps {
  question: string;
  value: number | null;
  onChange: (value: number) => void;
  pillarIcon: string;
  pillarName: string;
}

const scaleLabels = [
  { value: 1, label: "Nunca" },
  { value: 2, label: "Rara vez" },
  { value: 3, label: "A veces" },
  { value: 4, label: "Frecuentemente" },
  { value: 5, label: "Siempre" }
];

export const QuizQuestion = ({ question, value, onChange, pillarIcon, pillarName }: QuizQuestionProps) => {
  return (
    <Card className="p-8 shadow-soft border-0 bg-card/80 backdrop-blur-sm">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">{pillarIcon}</div>
        <h3 className="text-xl font-semibold text-primary mb-2">{pillarName}</h3>
        <p className="text-lg text-foreground leading-relaxed">{question}</p>
      </div>
      
      <div className="space-y-3">
        {scaleLabels.map((option) => (
          <Button
            key={option.value}
            variant="outline"
            size="lg"
            onClick={() => onChange(option.value)}
            className={cn(
              "w-full h-16 text-left justify-start text-base font-medium transition-all duration-300",
              "hover:shadow-soft hover:scale-[1.02]",
              value === option.value 
                ? "bg-gradient-wellness text-white border-primary shadow-glow" 
                : "bg-card/50 hover:bg-secondary/50"
            )}
          >
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold mr-4">
              {option.value}
            </span>
            {option.label}
          </Button>
        ))}
      </div>
    </Card>
  );
};