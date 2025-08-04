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
      {
        title: "Escribir tres emociones frecuentes y tres que quisieras cambiar",
        description: "Este ejercicio te ayuda a identificar patrones emocionales y establecer objetivos de desarrollo emocional.",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        steps: [
          "Toma papel y lápiz o abre una aplicación de notas",
          "Piensa en las últimas dos semanas y identifica 3 emociones que has sentido frecuentemente",
          "Reflexiona sobre 3 emociones que te gustaría cambiar o manejar mejor",
          "Escribe por qué quieres cambiar esas emociones",
          "Guarda esta lista para revisarla semanalmente"
        ]
      },
      {
        title: "Escribirse una carta personal sobre situaciones emocionales",
        description: "La autoescritura terapéutica permite procesar emociones y ganar perspectiva sobre nuestras reacciones.",
        steps: [
          "Encuentra un momento tranquilo para escribir",
          "Dirígete a ti mismo/a como si fueras tu mejor amigo/a",
          "Describe situaciones donde sientes emociones intensas",
          "Explora qué desencadena esas emociones",
          "Termina con palabras de comprensión y apoyo hacia ti mismo/a"
        ]
      },
      {
        title: "Registrar emociones cuando suena una señal",
        description: "La práctica de mindfulness emocional te ayuda a desarrollar conciencia en tiempo real de tus estados emocionales.",
        steps: [
          "Configura 3-5 alarmas aleatorias en tu teléfono durante el día",
          "Cuando suene la alarma, pausa lo que estés haciendo",
          "Identifica qué emoción estás sintiendo en ese momento",
          "Nota la sensación física en tu cuerpo",
          "Registra el contexto (dónde estás, qué estabas haciendo)",
          "Anota todo en una aplicación o cuaderno"
        ]
      }
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
      {
        title: "Contar hasta 20 antes de reaccionar",
        description: "Técnica simple pero efectiva para crear espacio entre el impulso y la acción, permitiendo respuestas más reflexivas.",
        steps: [
          "Cuando sientas una emoción intensa, detente",
          "Respira profundamente y comienza a contar del 1 al 20",
          "Con cada número, respira conscientemente",
          "Observa cómo cambia la intensidad de la emoción",
          "Ahora responde desde un lugar más calmado"
        ]
      },
      {
        title: "Practicar respiración consciente",
        description: "La respiración consciente activa el sistema nervioso parasimpático, promoviendo la calma y la claridad mental.",
        videoUrl: "https://www.youtube.com/embed/YRPh_GaiL8s",
        steps: [
          "Siéntate cómodamente con la espalda recta",
          "Inhala por la nariz durante 4 segundos",
          "Retén la respiración por 4 segundos",
          "Exhala por la boca durante 6 segundos",
          "Repite este ciclo 5-10 veces",
          "Practica esta técnica 2-3 veces al día"
        ]
      },
      {
        title: "Usar música para regular emociones",
        description: "La música tiene un poderoso efecto en nuestro estado emocional y puede ser una herramienta valiosa para la autorregulación.",
        steps: [
          "Crea diferentes playlists para diferentes estados emocionales",
          "Para calmar ansiedad: música clásica o ambient",
          "Para elevar el ánimo: música alegre y energética",
          "Para procesar tristeza: música melancólica y luego gradualmente más esperanzadora",
          "Escucha conscientemente, prestando atención a cómo cambian tus emociones"
        ]
      }
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
      {
        title: "Escribir afirmaciones de capacidad personal",
        description: "Las afirmaciones positivas restructuran patrones de pensamiento y fortalecen la autoestima y confianza personal.",
        steps: [
          "Cada mañana, escribe 3 frases que comiencen con 'Yo soy capaz de...'",
          "Escribe 2 frases que comiencen con 'Me merezco...'",
          "Añade 2 frases que comiencen con 'Me doy permiso para...'",
          "Lee estas afirmaciones en voz alta",
          "Visualiza cumpliendolas",
          "Repite este ejercicio durante 21 días seguidos"
        ]
      },
      {
        title: "Fijar metas alcanzables y celebrar logros",
        description: "Establecer objetivos realistas y celebrar los éxitos construye confianza y motivación sostenible.",
        steps: [
          "Define una meta pequeña y específica para la semana",
          "Descompón la meta en pasos diarios",
          "Al completar cada paso, reconoce tu progreso",
          "Al lograr la meta semanal, celebra de manera significativa",
          "Reflexiona sobre qué aprendiste del proceso",
          "Establece la siguiente meta basándote en este aprendizaje"
        ]
      },
      {
        title: "Mantener diálogo interno constructivo",
        description: "Transformar la autocrítica en autocompasión mejora la autoestima y resilencia emocional.",
        steps: [
          "Observa tu diálogo interno durante el día",
          "Cuando notes autocrítica, pausa y respira",
          "Reformula el pensamiento como si le hablaras a un amigo querido",
          "Usa palabras de comprensión y apoyo",
          "Pregúntate: '¿Qué necesito escuchar ahora mismo?'",
          "Practica esta reformulación consistentemente"
        ]
      }
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
      {
        title: "Incorporar emociones en el diálogo habitual",
        description: "Expresar emociones conscientemente en las conversaciones mejora la conexión y comprensión mutua.",
        steps: [
          "En conversaciones diarias, incluye cómo te sientes",
          "Usa frases como: 'Me siento...' o 'Esto me genera...'",
          "Escucha las emociones que otros expresan",
          "Valida las emociones de otros sin juzgar",
          "Practica esto primero con personas de confianza",
          "Gradualmente extiende esta práctica a más relaciones"
        ]
      },
      {
        title: "Practicar empatía activa",
        description: "Desarrollar la habilidad de percibir y responder a las emociones de otros fortalece las relaciones interpersonales.",
        steps: [
          "Durante conversaciones, presta atención al lenguaje corporal",
          "Observa el tono de voz y expresiones faciales",
          "Pregunta: '¿Cómo te sientes con esto?'",
          "Refleja lo que observas: 'Parece que te sientes...'",
          "Ofrece apoyo: '¿Cómo puedo ayudarte?'",
          "Registra estas observaciones para mejorar tu habilidad"
        ]
      },
      {
        title: "Desarrollar habilidades de resolución de conflictos",
        description: "Aprender a manejar conflictos constructivamente fortalece las relaciones y reduce el estrés interpersonal.",
        steps: [
          "Cuando surja un conflicto, respira antes de reaccionar",
          "Expresa tu perspectiva usando 'yo' en lugar de 'tú'",
          "Escucha activamente el punto de vista del otro",
          "Busca puntos en común y intereses compartidos",
          "Propón soluciones que beneficien a ambas partes",
          "Evalúa y ajusta el acuerdo según sea necesario"
        ]
      }
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
      {
        title: "Desarrollar sentido del humor y disfrutar el bienestar",
        description: "El humor y el disfrute consciente mejoran la resistencia al estrés y la calidad de vida general.",
        steps: [
          "Dedica tiempo semanal a actividades que te hagan reír",
          "Participa en eventos sociales divertidos",
          "Aprende un chiste nuevo y compártelo",
          "Ríe desinhibidamente ante situaciones graciosas",
          "Encuentra humor en situaciones cotidianas",
          "Comparte momentos divertidos con otros"
        ]
      },
      {
        title: "Mantener equilibrio vida-trabajo",
        description: "Un equilibrio saludable entre diferentes áreas de la vida es fundamental para el bienestar emocional y la productividad.",
        steps: [
          "Define límites claros entre tiempo de trabajo y personal",
          "Programa tiempo específico para familia y amigos",
          "Incluye actividades recreativas en tu horario semanal",
          "Practica decir 'no' a compromisos adicionales cuando sea necesario",
          "Dedica tiempo a pasatiempos que disfrutas",
          "Evalúa y ajusta tu equilibrio mensualmente"
        ]
      },
      {
        title: "Escribir un diario para auto-reflexión",
        description: "La escritura reflexiva promueve el autoconocimiento, procesamiento emocional y claridad mental.",
        videoUrl: "https://www.youtube.com/embed/tVlcKp3bWH8",
        steps: [
          "Elige un momento del día para escribir (mañana o noche)",
          "Escribe durante 10-15 minutos sin parar",
          "Incluye eventos del día y tus reacciones emocionales",
          "Reflexiona sobre patrones que observas",
          "Escribe agradecimientos y logros del día",
          "Lee entradas anteriores semanalmente para identificar patrones"
        ]
      }
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