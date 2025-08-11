import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmotionalQuiz } from "@/components/EmotionalQuiz";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";

const Index = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="relative">
      {/* Navigation bar for authenticated users */}
      {user && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h2 className="text-lg font-semibold">Inteligencia Emocional</h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Mi Perfil
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
      )}
      
      {/* Main content with padding if user is authenticated */}
      <div className={user ? "pt-16" : ""}>
        <EmotionalQuiz />
        
        {/* Login prompt for non-authenticated users */}
        {!user && (
          <div className="fixed bottom-4 right-4 z-50">
            <Button
              onClick={() => navigate('/auth')}
              className="shadow-lg"
            >
              <User className="mr-2 h-4 w-4" />
              Iniciar Sesión
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
