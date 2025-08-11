-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  first_name TEXT,
  last_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create exercises table to track available exercises
CREATE TABLE public.exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pillar TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  steps TEXT[] NOT NULL,
  video_url TEXT,
  evidence_type TEXT NOT NULL CHECK (evidence_type IN ('text', 'audio', 'video', 'any')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on exercises (public readable)
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view exercises" 
ON public.exercises 
FOR SELECT 
USING (true);

-- Create exercise completions table for evidence submissions
CREATE TABLE public.exercise_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  evidence_text TEXT,
  evidence_file_url TEXT,
  evidence_type TEXT NOT NULL CHECK (evidence_type IN ('text', 'audio', 'video')),
  reflection TEXT,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, exercise_id)
);

-- Enable RLS on exercise completions
ALTER TABLE public.exercise_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own completions" 
ON public.exercise_completions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own completions" 
ON public.exercise_completions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own completions" 
ON public.exercise_completions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create storage buckets for evidence files
INSERT INTO storage.buckets (id, name, public) VALUES ('evidence-files', 'evidence-files', false);

-- Create storage policies for evidence files
CREATE POLICY "Users can upload their own evidence files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'evidence-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own evidence files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'evidence-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own evidence files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'evidence-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own evidence files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'evidence-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name'
  );
  RETURN new;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profiles timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();