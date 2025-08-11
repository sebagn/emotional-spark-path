import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Calendar, BookOpen, Upload, Trophy, Star, Heart, Brain, Sparkles, Camera, FileText, Headphones, Video, ArrowLeft, Home, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Profile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface ExerciseCompletion {
  id: string;
  exercise_id: string;
  evidence_text: string | null;
  evidence_file_url: string | null;
  evidence_type: string;
  reflection: string | null;
  completed_at: string;
  exercises: {
    title: string;
    pillar: string;
  };
}

// Gaming helper functions
const getCharacterTitle = (completions: number): string => {
  if (completions === 0) return "Aprendiz Emocional";
  if (completions < 3) return "Explorador del Alma";
  if (completions < 6) return "Guerrero de la Calma";
  if (completions < 10) return "Maestro del Equilibrio";
  if (completions < 15) return "Sabio Emocional";
  if (completions < 25) return "Gran Maestro del Bienestar";
  return "Leyenda de la Inteligencia Emocional";
};

const getCharacterDescription = (completions: number): string => {
  if (completions === 0) return "Tu aventura de crecimiento está por comenzar";
  if (completions < 3) return "Descubriendo los secretos de tus emociones";
  if (completions < 6) return "Dominando las técnicas de autorregulación";
  if (completions < 10) return "Alcanzando el equilibrio interior";
  if (completions < 15) return "Irradiando sabiduría emocional";
  if (completions < 25) return "Guiando a otros en su crecimiento";
  return "Una leyenda viviente del bienestar emocional";
};

const getCurrentStreak = (completions: ExerciseCompletion[]): number => {
  if (completions.length === 0) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  const sortedCompletions = [...completions].sort((a, b) => 
    new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
  );
  
  // Check if there's activity today or yesterday (to allow for continuation)
  let currentDate = new Date(today);
  let lastActivityDate = new Date(sortedCompletions[0].completed_at);
  lastActivityDate.setHours(0, 0, 0, 0);
  
  // If last activity was more than 1 day ago, streak is broken
  const daysDiff = Math.floor((today.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff > 1) return 0;
  
  // If last activity was yesterday, start counting from yesterday
  if (daysDiff === 1) {
    currentDate.setDate(currentDate.getDate() - 1);
  }
  
  // Count consecutive days with activity
  const activityDates = new Set(
    completions.map(c => {
      const date = new Date(c.completed_at);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    })
  );
  
  while (activityDates.has(currentDate.getTime())) {
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }
  
  return streak;
};

const getLast7Days = (): Date[] => {
  const days = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    days.push(date);
  }
  
  return days;
};

const hasActivityOnDay = (day: Date, completions: ExerciseCompletion[]): boolean => {
  return completions.some(completion => {
    const completionDate = new Date(completion.completed_at);
    completionDate.setHours(0, 0, 0, 0);
    return completionDate.getTime() === day.getTime();
  });
};

const getNextAchievement = (currentCompletions: number): string => {
  const nextMilestone = Math.ceil((currentCompletions + 1) / 5) * 5;
  const remaining = nextMilestone - currentCompletions;
  
  if (nextMilestone === 5) return `Completa ${remaining} ejercicio${remaining > 1 ? 's' : ''} más para desbloquear "Explorador Avanzado"`;
  if (nextMilestone === 10) return `Completa ${remaining} ejercicio${remaining > 1 ? 's' : ''} más para desbloquear "Maestro del Equilibrio"`;
  if (nextMilestone === 15) return `Completa ${remaining} ejercicio${remaining > 1 ? 's' : ''} más para desbloquear "Sabio Emocional"`;
  if (nextMilestone === 25) return `Completa ${remaining} ejercicio${remaining > 1 ? 's' : ''} más para desbloquear "Gran Maestro"`;
  
  return `Completa ${remaining} ejercicio${remaining > 1 ? 's' : ''} más para tu próximo hito en nivel ${Math.floor(nextMilestone / 5)}`;
};

const Profile = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [completions, setCompletions] = useState<ExerciseCompletion[]>([]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    bio: '',
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchCompletions();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      // Check if this is the development user
      if (user.id === 'dev-user-123') {
        // Create mock profile data for development user
        const mockProfile = {
          id: 'dev-profile-123',
          user_id: user.id,
          first_name: user.user_metadata?.first_name || 'Usuario',
          last_name: user.user_metadata?.last_name || 'Desarrollo',
          bio: 'Usuario de desarrollo para probar la aplicación de Gimnasia Emocional. Este perfil se usa únicamente para testing y desarrollo local.',
          avatar_url: null,
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: new Date().toISOString(),
        };
        
        setProfile(mockProfile);
        setFormData({
          first_name: mockProfile.first_name || '',
          last_name: mockProfile.last_name || '',
          bio: mockProfile.bio || '',
        });
        console.log('🔧 Dev Mode: Using mock profile data');
        return;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          bio: data.bio || '',
        });
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el perfil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletions = async () => {
    if (!user) return;

    try {
      // Check if this is the development user
      if (user.id === 'dev-user-123') {
        // Create mock completion data for development user
        const mockCompletions = [
          {
            id: 'dev-completion-1',
            exercise_id: 'exercise-1',
            evidence_text: 'Completé este ejercicio de respiración profunda durante 10 minutos. Me ayudó mucho a relajarme y sentir más calma. Noté cómo mi ritmo cardíaco se redujo gradualmente.',
            evidence_file_url: null,
            evidence_type: 'text',
            reflection: 'La respiración consciente es realmente poderosa. Me siento más centrado y en paz conmigo mismo.',
            completed_at: '2024-12-01T10:30:00.000Z',
            exercises: {
              title: 'Respiración Consciente para la Calma',
              pillar: 'Autorregulación Emocional'
            }
          },
          {
            id: 'dev-completion-2',
            exercise_id: 'exercise-2',
            evidence_text: null,
            evidence_file_url: null,
            evidence_type: 'audio',
            reflection: 'Identificar mis emociones me está ayudando a comprenderme mejor. Ahora puedo reconocer cuándo estoy ansioso antes de que se intensifique.',
            completed_at: '2024-11-25T15:45:00.000Z',
            exercises: {
              title: 'Identificación de Emociones',
              pillar: 'Autoconciencia Emocional'
            }
          },
          {
            id: 'dev-completion-3',
            exercise_id: 'exercise-3',
            evidence_text: 'Practiqué escuchar activamente a mi pareja durante nuestra conversación sobre planes familiares. Me concentré en entender su perspectiva sin interrumpir.',
            evidence_file_url: null,
            evidence_type: 'text',
            reflection: 'La escucha activa transformó nuestra comunicación. Ahora mi pareja se siente más escuchada y comprendida.',
            completed_at: '2024-11-20T20:15:00.000Z',
            exercises: {
              title: 'Práctica de Escucha Activa',
              pillar: 'Habilidades Sociales'
            }
          },
          {
            id: 'dev-completion-4',
            exercise_id: 'exercise-4',
            evidence_text: 'Escribí una carta de agradecimiento a mi mentor y se la envié. Su respuesta fue muy emotiva y fortalecimos nuestra relación.',
            evidence_file_url: null,
            evidence_type: 'text',
            reflection: 'Expresar gratitud genuinamente crea conexiones más profundas y significativas con las personas importantes en mi vida.',
            completed_at: '2024-11-15T12:00:00.000Z',
            exercises: {
              title: 'Expresión de Gratitud',
              pillar: 'Empatía y Conexión'
            }
          },
          {
            id: 'dev-completion-5',
            exercise_id: 'exercise-5',
            evidence_text: null,
            evidence_file_url: null,
            evidence_type: 'video',
            reflection: 'Definir mis metas personales me ha dado mayor claridad sobre lo que realmente quiero lograr este año.',
            completed_at: '2024-11-10T09:30:00.000Z',
            exercises: {
              title: 'Definición de Objetivos Personales',
              pillar: 'Motivación y Propósito'
            }
          }
        ];
        
        setCompletions(mockCompletions);
        console.log('🔧 Dev Mode: Using mock completions data');
        return;
      }
      
      const { data, error } = await supabase
        .from('exercise_completions')
        .select(`
          *,
          exercises (
            title,
            pillar
          )
        `)
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      setCompletions(data || []);
    } catch (error: any) {
      console.error('Error fetching completions:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      // Handle development user
      if (user.id === 'dev-user-123') {
        // Simulate successful save for development user
        const updatedProfile = {
          id: 'dev-profile-123',
          user_id: user.id,
          first_name: formData.first_name,
          last_name: formData.last_name,
          bio: formData.bio,
          avatar_url: null,
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: new Date().toISOString(),
        };
        
        setProfile(updatedProfile);
        
        toast({
          title: "Perfil actualizado (Dev Mode)",
          description: "Los cambios se han simulado correctamente en modo desarrollo",
        });
        
        console.log('🔧 Dev Mode: Profile update simulated');
        return;
      }
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          first_name: formData.first_name,
          last_name: formData.last_name,
          bio: formData.bio,
        });

      if (error) throw error;

      toast({
        title: "Perfil actualizado",
        description: "Tus cambios han sido guardados correctamente",
      });

      fetchProfile();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-calm flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Navigation bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio
              </Button>
            </div>
            <h2 className="text-lg font-semibold">Mi Perfil Personal</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Ejercicios
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content with padding for fixed navbar */}
      <div className="pt-16 min-h-screen bg-gradient-calm p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">Mi Perfil</h1>
            <p className="text-muted-foreground">
              Gestiona tu información personal y revisa tu progreso
            </p>
          </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Información Personal */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Personal
              </CardTitle>
              <CardDescription>
                Actualiza tu información básica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Nombre</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Apellido</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Biografía</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Cuéntanos sobre ti..."
                    disabled={saving}
                    rows={3}
                  />
                </div>
                <Button type="submit" disabled={saving} className="w-full">
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar Cambios
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Estadísticas */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Tu Avatar Emocional
              </CardTitle>
              <CardDescription>
                Tu crecimiento como guerrero emocional
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="text-center space-y-4">
                {/* Avatar Visual */}
                <div className="relative mx-auto">
                  {/* Character Level Ring */}
                  <div className="relative w-24 h-24 mx-auto mb-3">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 animate-pulse"></div>
                    <div className="absolute inset-1 rounded-full bg-background flex items-center justify-center">
                      <div className="text-3xl">🧘‍♂️</div>
                    </div>
                    {/* Level Badge */}
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg border-2 border-white">
                      Lv.{Math.floor(completions.length / 3) + 1}
                    </div>
                  </div>
                  
                  {/* Character Title */}
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-foreground">
                      {getCharacterTitle(completions.length)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {getCharacterDescription(completions.length)}
                    </p>
                  </div>
                </div>
                
                {/* XP and Level Progress */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">XP hasta siguiente nivel</span>
                    <span className="font-medium text-primary">
                      {completions.length % 3}/3
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-1000 ease-out"
                      style={{ width: `${((completions.length % 3) / 3) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-lg border border-blue-200/20">
                  <div className="text-xl font-bold text-blue-600 flex items-center justify-center gap-1">
                    <Sparkles className="h-5 w-5" />
                    {completions.length}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Ejercicios Completados
                  </div>
                </div>
                
                <div className="text-center p-3 bg-gradient-to-r from-purple-500/10 to-purple-600/10 rounded-lg border border-purple-200/20">
                  <div className="text-xl font-bold text-purple-600 flex items-center justify-center gap-1">
                    <Trophy className="h-5 w-5" />
                    {Math.floor(completions.length / 3) + 1}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Nivel Actual
                  </div>
                </div>
              </div>
              
              {/* Daily Streak Section */}
              <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg p-4 border border-orange-200/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="text-xl">🔥</div>
                    <span className="font-semibold text-foreground">Racha Diaria</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-600">{getCurrentStreak(completions)}</div>
                    <div className="text-xs text-muted-foreground">días</div>
                  </div>
                </div>
                
                {/* Streak Calendar Mini */}
                <div className="flex gap-1 justify-center">
                  {getLast7Days().map((day, index) => {
                    const hasActivity = hasActivityOnDay(day, completions);
                    return (
                      <div 
                        key={index}
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          hasActivity 
                            ? 'bg-orange-500 text-white shadow-lg' 
                            : 'bg-muted text-muted-foreground border border-border'
                        }`}
                        title={day.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}
                      >
                        {hasActivity ? '🔥' : day.getDate()}
                      </div>
                    );
                  })}
                </div>
                
                <div className="text-center mt-3">
                  <p className="text-xs text-muted-foreground">
                    {getCurrentStreak(completions) > 0 
                      ? `¡Increíble! Llevas ${getCurrentStreak(completions)} día${getCurrentStreak(completions) > 1 ? 's' : ''} consecutivo${getCurrentStreak(completions) > 1 ? 's' : ''}` 
                      : 'Comienza tu racha completando un ejercicio hoy'
                    }
                  </p>
                </div>
              </div>
              
              {/* Next Achievement Preview */}
              {completions.length > 0 && (
                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg p-3 border border-green-200/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-600">Próximo Logro</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {getNextAchievement(completions.length)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Línea de Vida */}
        <Card className="shadow-soft overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Mi Línea de Vida
            </CardTitle>
            <CardDescription>
              El registro visual de tu transformación emocional
            </CardDescription>
            {completions.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">
                  {completions.length} hitos alcanzados en tu crecimiento
                </span>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {completions.length === 0 ? (
              <div className="text-center py-12 px-6">
                <div className="mx-auto mb-6 w-24 h-24 bg-gradient-calm rounded-full flex items-center justify-center opacity-50">
                  <Heart className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Tu viaje está por comenzar</h3>
                <p className="text-muted-foreground mb-6">
                  Cada ejercicio completado se convertirá en un hermoso recuerdo 
                  en tu línea de vida personal. ¡Empieza tu transformación hoy!
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full">
                  <Star className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Esperando tu primer logro</span>
                </div>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-secondary opacity-30"></div>
                
                <div className="space-y-0">
                  {completions.map((completion, index) => {
                    const getPillarIcon = (pillar: string) => {
                      const pillarLower = pillar.toLowerCase();
                      if (pillarLower.includes('autoconciencia') || pillarLower.includes('consciencia')) return Brain;
                      if (pillarLower.includes('motivación') || pillarLower.includes('motivacion')) return Star;
                      if (pillarLower.includes('autorregulación') || pillarLower.includes('regulacion')) return Heart;
                      if (pillarLower.includes('empatía') || pillarLower.includes('empatia')) return Heart;
                      if (pillarLower.includes('habilidades sociales')) return User;
                      return Sparkles;
                    };
                    
                    const getPillarColor = (pillar: string) => {
                      const pillarLower = pillar.toLowerCase();
                      if (pillarLower.includes('autoconciencia')) return 'from-blue-500 to-blue-600';
                      if (pillarLower.includes('motivación')) return 'from-yellow-500 to-orange-500';
                      if (pillarLower.includes('autorregulación')) return 'from-green-500 to-emerald-500';
                      if (pillarLower.includes('empatía')) return 'from-pink-500 to-rose-500';
                      if (pillarLower.includes('habilidades sociales')) return 'from-purple-500 to-indigo-500';
                      return 'from-primary to-accent';
                    };
                    
                    const getEvidenceIcon = (type: string) => {
                      switch (type) {
                        case 'text': return FileText;
                        case 'audio': return Headphones;
                        case 'video': return Video;
                        default: return FileText;
                      }
                    };
                    
                    const PillarIcon = getPillarIcon(completion.exercises.pillar);
                    const EvidenceIcon = getEvidenceIcon(completion.evidence_type);
                    const gradientClass = getPillarColor(completion.exercises.pillar);
                    
                    return (
                      <div key={completion.id} className="relative pl-20 pr-6 py-6 border-b border-border/50 last:border-b-0 hover:bg-muted/20 transition-colors">
                        {/* Timeline dot */}
                        <div className={`absolute left-4 w-8 h-8 bg-gradient-to-r ${gradientClass} rounded-full flex items-center justify-center shadow-lg ring-4 ring-background z-10`}>
                          <PillarIcon className="h-4 w-4 text-white" />
                        </div>
                        
                        {/* Achievement badge for milestones */}
                        {(index === 0 || index === 4 || index === 9 || (index + 1) % 10 === 0) && (
                          <div className="absolute -top-1 left-14 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-sm">
                            🎯 {index === 0 ? 'Primer logro' : `${index + 1} ejercicios`}
                          </div>
                        )}
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-bold text-lg text-foreground mb-1">
                                {completion.exercises.title}
                              </h4>
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r ${gradientClass} text-white text-xs font-medium rounded-full`}>
                                  <PillarIcon className="h-3 w-3" />
                                  {completion.exercises.pillar}
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                                  <EvidenceIcon className="h-3 w-3" />
                                  {completion.evidence_type}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-xs text-muted-foreground font-medium">
                                {formatDate(completion.completed_at)}
                              </span>
                              <div className="text-xs text-muted-foreground mt-1">
                                {new Date(completion.completed_at).toLocaleTimeString('es-ES', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </div>
                            </div>
                          </div>
                          
                          {completion.evidence_text && (
                            <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-4 rounded-lg border-l-4 border-primary">
                              <div className="flex items-center gap-2 mb-2">
                                <FileText className="h-4 w-4 text-primary" />
                                <span className="text-sm font-semibold text-primary">Mi evidencia:</span>
                              </div>
                              <p className="text-sm leading-relaxed text-foreground">
                                {completion.evidence_text}
                              </p>
                            </div>
                          )}
                          
                          {completion.evidence_file_url && (
                            <div className="bg-gradient-to-r from-accent/5 to-secondary/5 p-4 rounded-lg border-l-4 border-accent">
                              <a 
                                href={completion.evidence_file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 hover:bg-accent/10 p-2 rounded-md transition-colors group"
                              >
                                <div className="p-2 bg-accent/20 rounded-full group-hover:bg-accent/30 transition-colors">
                                  <EvidenceIcon className="h-5 w-5 text-accent" />
                                </div>
                                <div>
                                  <div className="font-medium text-accent">Archivo adjunto</div>
                                  <div className="text-xs text-muted-foreground capitalize">
                                    {completion.evidence_type} • Click para ver
                                  </div>
                                </div>
                              </a>
                            </div>
                          )}
                          
                          {completion.reflection && (
                            <div className="bg-gradient-to-r from-secondary/5 to-muted/10 p-4 rounded-lg border-l-4 border-secondary">
                              <div className="flex items-center gap-2 mb-2">
                                <Heart className="h-4 w-4 text-secondary" />
                                <span className="text-sm font-semibold text-secondary">Mi reflexión:</span>
                              </div>
                              <p className="text-sm leading-relaxed text-foreground italic">
                                "{completion.reflection}"
                              </p>
                            </div>
                          )}
                          
                          {/* Celebration message for recent completions */}
                          {index === 0 && (
                            <div className="bg-gradient-wellness p-3 rounded-lg">
                              <div className="flex items-center gap-2 text-white">
                                <Trophy className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                  🎉 ¡Tu logro más reciente! Cada paso cuenta en tu crecimiento.
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Progress summary at the bottom */}
                <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 p-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-lg">Tu Progreso Continúa</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Has completado {completions.length} ejercicio{completions.length !== 1 ? 's' : ''} en tu camino de crecimiento emocional.
                    ¡Sigue adelante, cada experiencia te fortalece más!
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
