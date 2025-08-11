import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Upload, Mic, Video, Type, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Exercise {
  id: string;
  title: string;
  description: string;
  evidence_type: string;
  pillar: string;
}

interface ExerciseCompletionProps {
  exercise: Exercise;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ExerciseCompletion = ({ exercise, open, onOpenChange }: ExerciseCompletionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [evidenceType, setEvidenceType] = useState<string>('text');
  const [evidenceText, setEvidenceText] = useState('');
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [reflection, setReflection] = useState('');
  const [showCongratulations, setShowCongratulations] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEvidenceFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('evidence-files')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('evidence-files')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (evidenceType !== 'text' && !evidenceFile) {
      toast({
        title: "Archivo requerido",
        description: "Por favor selecciona un archivo para subir",
        variant: "destructive",
      });
      return;
    }

    if (evidenceType === 'text' && !evidenceText.trim()) {
      toast({
        title: "Texto requerido",
        description: "Por favor escribe tu evidencia",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      let fileUrl = null;
      
      if (evidenceFile) {
        fileUrl = await uploadFile(evidenceFile);
        if (!fileUrl) {
          throw new Error('Error al subir el archivo');
        }
      }

      const { error } = await supabase
        .from('exercise_completions')
        .insert({
          user_id: user.id,
          exercise_id: exercise.id,
          evidence_text: evidenceType === 'text' ? evidenceText : null,
          evidence_file_url: fileUrl,
          evidence_type: evidenceType,
          reflection: reflection.trim() || null,
        });

      if (error) throw error;

      setShowCongratulations(true);
      
      // Reset form
      setEvidenceText('');
      setEvidenceFile(null);
      setReflection('');
      
    } catch (error: any) {
      console.error('Error completing exercise:', error);
      toast({
        title: "Error",
        description: "No se pudo completar el ejercicio. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowCongratulations(false);
    onOpenChange(false);
  };

  const getEvidenceTypeOptions = () => {
    if (exercise.evidence_type === 'any') {
      return [
        { value: 'text', label: 'Texto', icon: Type },
        { value: 'audio', label: 'Audio', icon: Mic },
        { value: 'video', label: 'Video', icon: Video },
      ];
    }
    
    const iconMap = {
      text: Type,
      audio: Mic,
      video: Video,
    };
    
    return [{
      value: exercise.evidence_type,
      label: exercise.evidence_type.charAt(0).toUpperCase() + exercise.evidence_type.slice(1),
      icon: iconMap[exercise.evidence_type as keyof typeof iconMap] || Type,
    }];
  };

  if (showCongratulations) {
    const congratulationMessages = [
      `¡Increíble! Has completado "${exercise.title}". Tu dedicación al crecimiento personal es verdaderamente inspiradora. Cada ejercicio completado fortalece tu inteligencia emocional y te acerca más a la versión más plena de ti mismo/a.`,
      `¡Excelente trabajo! Al completar "${exercise.title}" has dado un paso significativo en tu desarrollo emocional. Tu compromiso con el autoconocimiento y la mejora continua es admirable.`,
      `¡Felicitaciones! Has superado otro desafío en tu camino de crecimiento personal. "${exercise.title}" ahora forma parte de tu historia de transformación y fortalecimiento emocional.`,
      `¡Fantástico! Tu esfuerzo en completar "${exercise.title}" demuestra tu determinación por crecer emocionalmente. Cada reflexión y acción que tomas te convierte en una persona más consciente y equilibrada.`,
    ];
    
    const randomMessage = congratulationMessages[Math.floor(Math.random() * congratulationMessages.length)];
    
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <div className="text-center py-8">
            <div className="mx-auto mb-6 w-20 h-20 bg-gradient-success rounded-full flex items-center justify-center animate-pulse">
              <Trophy className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ¡Felicitaciones!
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed text-base">
              {randomMessage}
            </p>
            <div className="bg-gradient-calm p-4 rounded-lg mb-6">
              <p className="text-sm font-medium text-primary mb-1">💎 Has desbloqueado:</p>
              <p className="text-sm text-muted-foreground">
                Un nuevo recuerdo en tu línea de vida personal
              </p>
            </div>
            <div className="space-y-3">
              <Button 
                onClick={() => {
                  handleClose();
                  // Navigate to profile to see the timeline
                  navigate('/profile');
                }} 
                className="w-full bg-gradient-wellness hover:shadow-glow"
              >
                Ver mi línea de vida
              </Button>
              <Button 
                onClick={handleClose} 
                variant="outline" 
                className="w-full"
              >
                Continuar explorando
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Completar Ejercicio</DialogTitle>
          <DialogDescription>
            {exercise.title} - {exercise.pillar}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Tipo de evidencia</Label>
              <RadioGroup
                value={evidenceType}
                onValueChange={setEvidenceType}
                className="mt-2"
                disabled={exercise.evidence_type !== 'any'}
              >
                {getEvidenceTypeOptions().map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value} className="flex items-center gap-2 cursor-pointer">
                        <IconComponent className="h-4 w-4" />
                        {option.label}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>

            {evidenceType === 'text' ? (
              <div className="space-y-2">
                <Label htmlFor="evidenceText">Tu evidencia (texto)</Label>
                <Textarea
                  id="evidenceText"
                  value={evidenceText}
                  onChange={(e) => setEvidenceText(e.target.value)}
                  placeholder="Describe cómo completaste este ejercicio, qué aprendiste, cómo te sentiste..."
                  rows={4}
                  required
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="evidenceFile">
                  Subir archivo ({evidenceType})
                </Label>
                <Input
                  id="evidenceFile"
                  type="file"
                  accept={evidenceType === 'audio' ? 'audio/*' : 'video/*'}
                  onChange={handleFileChange}
                  required
                />
                {evidenceFile && (
                  <p className="text-sm text-muted-foreground">
                    Archivo seleccionado: {evidenceFile.name}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reflection">Reflexión personal (opcional)</Label>
              <Textarea
                id="reflection"
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="¿Qué has aprendido? ¿Cómo te ha ayudado este ejercicio en tu crecimiento personal?"
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Completando...' : 'Completar Ejercicio'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseCompletion;