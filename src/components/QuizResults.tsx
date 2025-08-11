import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { Play, ExternalLink, CheckCircle } from "lucide-react";
import ExerciseCompletion from "./ExerciseCompletion";
import { useAuth } from "@/hooks/useAuth";

interface Exercise {
  title: string;
  description: string;
  videoUrl?: string;
  steps: string[];
}

interface PillarResult {
  name: string;
  icon: string;
  score: number;
  maxScore: number;
  level: string;
  exercises: Exercise[];
}

interface QuizResultsProps {
  results: PillarResult[];
  onRestart: () => void;
}

const getLevelColor = (level: string) => {
  switch (level) {
    case "Excelente": return "bg-gradient-success text-white";
    case "Alto": return "bg-primary text-primary-foreground";
    case "Medio": return "bg-accent text-accent-foreground";
    default: return "bg-secondary text-secondary-foreground";
  }
};

const getLevel = (score: number, maxScore: number) => {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 90) return "Excelente";
  if (percentage >= 75) return "Alto";
  if (percentage >= 50) return "Medio";
  return "Bajo";
};

export const QuizResults = ({ results, onRestart }: QuizResultsProps) => {
  const { user } = useAuth();
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [completionOpen, setCompletionOpen] = useState(false);
  
  const totalScore = results.reduce((sum, result) => sum + result.score, 0);
  const totalMaxScore = results.reduce((sum, result) => sum + result.maxScore, 0);
  const overallPercentage = (totalScore / totalMaxScore) * 100;

  return (
    <div className="space-y-8">
      {/* Overall Score */}
      <Card className="p-8 text-center bg-gradient-wellness text-white shadow-glow border-0">
        <h2 className="text-3xl font-bold mb-4">¡Cuestionario Completado!</h2>
        <div className="text-6xl font-bold mb-2">{Math.round(overallPercentage)}%</div>
        <p className="text-xl opacity-90">Puntuación General de Inteligencia Emocional</p>
      </Card>

      {/* Individual Pillar Results */}
      <div className="grid gap-6">
        <h3 className="text-2xl font-semibold text-center mb-4">Resultados por Pilar Emocional</h3>
        
        {results.map((result, index) => {
          const level = getLevel(result.score, result.maxScore);
          const percentage = (result.score / result.maxScore) * 100;
          
          return (
            <Card key={index} className="p-6 shadow-soft border-0 bg-card/80">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl">{result.icon}</div>
                <div className="flex-1">
                  <h4 className="text-xl font-semibold">{result.name}</h4>
                  <div className="flex items-center gap-3 mt-2">
                    <Progress value={percentage} className="flex-1 h-3" />
                    <Badge className={getLevelColor(level)}>{level}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.score} de {result.maxScore} puntos ({Math.round(percentage)}%)
                  </p>
                </div>
              </div>
              
              {/* Exercises for improvement */}
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <h5 className="font-semibold mb-2 text-primary">Ejercicios recomendados:</h5>
                <div className="space-y-2">
                  {result.exercises.slice(0, 3).map((exercise, exerciseIndex) => (
                    <Dialog key={exerciseIndex}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start text-left text-sm p-2 h-auto hover:bg-accent/50"
                        >
                          <ExternalLink className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{exercise.title}</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Play className="w-5 h-5 text-primary" />
                            {exercise.title}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-muted-foreground">{exercise.description}</p>
                          
                          {exercise.videoUrl && (
                            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                              <iframe
                                src={exercise.videoUrl}
                                className="w-full h-full rounded-lg"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          )}
                          
                          <div>
                            <h4 className="font-semibold mb-2">Pasos a seguir:</h4>
                            <ol className="space-y-2">
                              {exercise.steps.map((step, stepIndex) => (
                                <li key={stepIndex} className="flex items-start gap-2">
                                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                                    {stepIndex + 1}
                                  </span>
                                  <span className="text-sm">{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                          
                          {user && (
                            <Button
                              onClick={() => {
                                setSelectedExercise({
                                  id: `${result.name}-${exerciseIndex}`,
                                  title: exercise.title,
                                  description: exercise.description,
                                  evidence_type: 'any',
                                  pillar: result.name
                                });
                                setCompletionOpen(true);
                              }}
                              className="w-full mt-4"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Completar Ejercicio
                            </Button>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="text-center space-y-4">
        <Button 
          onClick={onRestart}
          size="lg"
          className="bg-gradient-wellness hover:shadow-glow transition-all duration-300"
        >
          Realizar el cuestionario nuevamente
        </Button>
        
        <Card className="p-6 bg-gradient-calm border-0">
          <h4 className="font-semibold mb-2">💡 Próximos pasos</h4>
          <p className="text-sm text-muted-foreground">
            Enfócate en los pilares con puntuación más baja y practica los ejercicios recomendados diariamente. 
            La inteligencia emocional se desarrolla con práctica constante.
          </p>
        </Card>
      </div>

      {selectedExercise && (
        <ExerciseCompletion
          exercise={selectedExercise}
          open={completionOpen}
          onOpenChange={setCompletionOpen}
        />
      )}
    </div>
  );
};