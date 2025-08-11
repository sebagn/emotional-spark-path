import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Calendar, BookOpen, Upload } from 'lucide-react';

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

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
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
    <div className="min-h-screen bg-gradient-calm p-4">
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
                <BookOpen className="h-5 w-5" />
                Tu Progreso
              </CardTitle>
              <CardDescription>
                Resumen de tu crecimiento personal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {completions.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Ejercicios Completados
                  </div>
                </div>
                <div className="text-center p-4 bg-accent/5 rounded-lg">
                  <div className="text-2xl font-bold text-accent">
                    {profile ? formatDate(profile.created_at) : 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Miembro desde
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Línea de Vida */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Mi Línea de Vida
            </CardTitle>
            <CardDescription>
              Tu camino de crecimiento y aprendizaje
            </CardDescription>
          </CardHeader>
          <CardContent>
            {completions.length === 0 ? (
              <div className="text-center py-8">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Aún no has completado ningún ejercicio. ¡Comienza tu viaje de crecimiento personal!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {completions.map((completion) => (
                  <div key={completion.id} className="border-l-4 border-primary pl-4 py-2">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{completion.exercises.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {completion.exercises.pillar}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(completion.completed_at)}
                      </span>
                    </div>
                    
                    {completion.evidence_text && (
                      <div className="mt-2 p-3 bg-muted/50 rounded-md">
                        <p className="text-sm">{completion.evidence_text}</p>
                      </div>
                    )}
                    
                    {completion.evidence_file_url && (
                      <div className="mt-2">
                        <a 
                          href={completion.evidence_file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          <Upload className="h-3 w-3" />
                          Ver archivo adjunto ({completion.evidence_type})
                        </a>
                      </div>
                    )}
                    
                    {completion.reflection && (
                      <div className="mt-2 p-3 bg-secondary/50 rounded-md">
                        <p className="text-sm font-medium mb-1">Reflexión:</p>
                        <p className="text-sm">{completion.reflection}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;