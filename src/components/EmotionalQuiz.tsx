import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QuizQuestion } from "./QuizQuestion";
import { QuizProgress } from "./QuizProgress";
import { QuizResults } from "./QuizResults";

const quizData = [
  {
    pillar: "Autoconocimiento",
    icon: "🧠",
    questions: [
      "¿Reconozco con facilidad qué emoción estoy sintiendo en diferentes situaciones?",
      "¿Soy capaz de ponerle nombre a mis emociones cuando las experimento?",
      "¿Puedo identificar con precisión las emociones que sienten los demás?",
      "¿Presto atención al lenguaje corporal y facial para entender mejor cómo se sienten las personas?"
    ],
    exercises: [
      "Escribir tres emociones frecuentes y tres que quisieras cambiar",
      "Escribirse una carta personal sobre situaciones emocionales",
      "Registrar emociones cuando suena una señal",
      "Reflexionar sobre el yo público vs privado",
      "Tomar conciencia del lenguaje emocional personal",
      "Hacer un dibujo sobre cómo fue la semana emocionalmente"
    ]
  },
  {
    pillar: "Regulación emocional",
    icon: "💡",
    questions: [
      "¿Puedo identificar qué me llevó a sentir una emoción y cómo eso influye en mi conducta?",
      "¿Expreso mis emociones de forma adecuada, sin dañar a otros ni reprimirlas?",
      "¿Utilizo estrategias como el diálogo, la respiración, el deporte o la distracción para calmarme cuando estoy alterado/a?",
      "¿Soy capaz de manejar la frustración cuando las cosas no salen como espero?"
    ],
    exercises: [
      "Contar hasta 20 antes de reaccionar",
      "Practicar respiración consciente",
      "Usar música para regular emociones",
      "Hacer actividad física cuando hay tensión mental",
      "Practicar comunicación asertiva",
      "Convertir experiencias negativas en oportunidades de crecimiento"
    ]
  },
  {
    pillar: "Autonomía emocional y autoestima",
    icon: "🌱",
    questions: [
      "¿Me acepto tal como soy, con mis virtudes y defectos?",
      "¿Me siento confiado/a en mis habilidades para enfrentar nuevos desafíos?",
      "¿Soy capaz de motivarme a mí mismo/a incluso en situaciones difíciles?",
      "¿Reconozco y valoro tanto mis logros como mis limitaciones personales?"
    ],
    exercises: [
      "Escribir 'yo soy capaz de...' regularmente",
      "Escribir 'me merezco...' y 'me doy permiso para...'",
      "Fijar metas alcanzables y celebrar logros",
      "Mantener diálogo interno constructivo",
      "Practicar la auto-compasión y aceptación",
      "Escribir los logros diarios"
    ]
  },
  {
    pillar: "Habilidades socioemocionales",
    icon: "🫂",
    questions: [
      "¿Me comunico con respeto y escucho activamente cuando alguien me habla?",
      "¿Soy capaz de expresar mis emociones sin agredir ni reprimirme, de forma asertiva?",
      "¿Intento comprender cómo se sienten los demás y ofrecer apoyo si lo necesitan?",
      "¿Resuelvo conflictos buscando acuerdos sin recurrir a la violencia o el silencio?"
    ],
    exercises: [
      "Incorporar emociones en el diálogo habitual",
      "Registrar emociones de otros durante interacciones",
      "Practicar felicitar y agradecer a otros",
      "Ofrecer ayuda en trabajos comunes",
      "Permitirse recibir ayuda de otros",
      "Practicar estrategias de resolución de conflictos"
    ]
  },
  {
    pillar: "Habilidades para la vida",
    icon: "🌍",
    questions: [
      "¿Identifico los problemas con claridad antes de buscar soluciones?",
      "¿Soy capaz de organizar mi tiempo y priorizar mis tareas cotidianas eficazmente?",
      "¿Tomo decisiones con responsabilidad, teniendo en cuenta consecuencias y valores personales?",
      "¿Busco ayuda cuando la necesito y sé a quién acudir para resolver una dificultad?"
    ],
    exercises: [
      "Participar en eventos divertidos y desarrollar sentido del humor",
      "Hacer actividad física regularmente",
      "Disfrutar actividades placenteras conscientemente",
      "Escribir un diario para auto-reflexión",
      "Participar en actividades de voluntariado",
      "Mantener equilibrio entre trabajo, familia y descanso"
    ]
  }
];

export const EmotionalQuiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const totalQuestions = quizData.reduce((sum, pillar) => sum + pillar.questions.length, 0);
  
  const getCurrentQuestionData = () => {
    let questionIndex = 0;
    for (const pillar of quizData) {
      if (currentQuestion < questionIndex + pillar.questions.length) {
        return {
          pillar: pillar.pillar,
          icon: pillar.icon,
          question: pillar.questions[currentQuestion - questionIndex],
          pillarIndex: quizData.indexOf(pillar)
        };
      }
      questionIndex += pillar.questions.length;
    }
    return null;
  };

  const handleAnswer = (value: number) => {
    setAnswers(prev => ({ ...prev, [currentQuestion]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateResults = () => {
    return quizData.map((pillar, pillarIndex) => {
      const pillarStartIndex = quizData.slice(0, pillarIndex).reduce((sum, p) => sum + p.questions.length, 0);
      const pillarAnswers = pillar.questions.map((_, questionIndex) => 
        answers[pillarStartIndex + questionIndex] || 0
      );
      const score = pillarAnswers.reduce((sum, answer) => sum + answer, 0);
      
      return {
        name: pillar.pillar,
        icon: pillar.icon,
        score,
        maxScore: pillar.questions.length * 5,
        level: "",
        exercises: pillar.exercises
      };
    });
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setHasStarted(false);
  };

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gradient-calm flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8 text-center shadow-glow border-0 bg-card/90 backdrop-blur-sm">
          <div className="text-6xl mb-6">🧠💝</div>
          <h1 className="text-4xl font-bold mb-6 bg-gradient-wellness bg-clip-text text-transparent">
            Evaluación de Educación Emocional
          </h1>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Descubre tu nivel de inteligencia emocional y recibe recomendaciones personalizadas 
            para fortalecer tus competencias emocionales. Este cuestionario evalúa los cinco 
            pilares fundamentales del bienestar emocional.
          </p>
          
          <div className="grid grid-cols-5 gap-4 mb-8">
            {quizData.map((pillar, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl mb-2">{pillar.icon}</div>
                <p className="text-xs text-muted-foreground">{pillar.pillar}</p>
              </div>
            ))}
          </div>
          
          <Button 
            onClick={() => setHasStarted(true)}
            size="lg"
            className="bg-gradient-wellness hover:shadow-glow transition-all duration-300 text-lg px-8 py-6"
          >
            Comenzar Evaluación
          </Button>
          
          <p className="text-sm text-muted-foreground mt-6">
            ⏱️ Tiempo estimado: 5-10 minutos • 📊 {totalQuestions} preguntas
          </p>
        </Card>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-calm p-4">
        <div className="max-w-4xl mx-auto">
          <QuizResults results={calculateResults()} onRestart={handleRestart} />
        </div>
      </div>
    );
  }

  const questionData = getCurrentQuestionData();
  
  if (!questionData) return null;

  return (
    <div className="min-h-screen bg-gradient-calm p-4">
      <div className="max-w-3xl mx-auto">
        <QuizProgress currentQuestion={currentQuestion + 1} totalQuestions={totalQuestions} />
        
        <QuizQuestion
          question={questionData.question}
          value={answers[currentQuestion] || null}
          onChange={handleAnswer}
          pillarIcon={questionData.icon}
          pillarName={questionData.pillar}
        />
        
        <div className="flex justify-between mt-8">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="hover:shadow-soft transition-all duration-300"
          >
            Anterior
          </Button>
          
          <Button 
            onClick={handleNext}
            disabled={!answers[currentQuestion]}
            className="bg-gradient-wellness hover:shadow-glow transition-all duration-300"
          >
            {currentQuestion === totalQuestions - 1 ? "Ver Resultados" : "Siguiente"}
          </Button>
        </div>
      </div>
    </div>
  );
};