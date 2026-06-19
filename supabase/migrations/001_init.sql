-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  profession TEXT NOT NULL,
  bio TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE IF NOT EXISTS public.design_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.design_categories (name, slug, description, icon) VALUES
  ('Architecture','architecture','Architectural designs, floor plans, blueprints','building'),
  ('AutoCAD','autocad','AutoCAD drawings and 2D/3D designs','drafting-compass'),
  ('Mechanical','mechanical','Mechanical parts, assemblies, engineering drawings','cog'),
  ('CNC Design','cnc-design','CNC machining designs and G-code files','crosshair'),
  ('3D Printing','3d-printing','STL, OBJ, 3MF files for 3D printing','cube'),
  ('Interior Design','interior-design','Interior layouts, furniture, decoration','palette'),
  ('Electrical','electrical','Circuit diagrams, PCB layouts, electrical plans','zap'),
  ('Civil Engineering','civil-engineering','Structural designs, bridges, roads','hard-hat'),
  ('Industrial','industrial','Industrial machinery, plant layouts, equipment','factory'),
  ('Construction','construction','Construction plans, site layouts, material lists','hammer'),
  ('Furniture','furniture','Furniture designs, woodworking, joinery','armchair'),
  ('Jewelry','jewelry','Jewelry designs, CAD models, 3D renders','gem'),
  ('Product Design','product-design','Product concepts, prototypes, renders','package'),
  ('Other','other','Other design files','file');

-- Designs table
CREATE TABLE IF NOT EXISTS public.designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category_id UUID REFERENCES public.design_categories(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  telegram_file_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT DEFAULT 0,
  file_type TEXT NOT NULL,
  thumbnail_url TEXT DEFAULT '',
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Follows
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Downloads tracking
CREATE TABLE IF NOT EXISTS public.downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id UUID NOT NULL REFERENCES public.designs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  downloaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_categories ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_delete" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = id);

-- Designs policies
CREATE POLICY "designs_select" ON public.designs FOR SELECT TO authenticated, anon USING (is_public = true);
CREATE POLICY "designs_insert" ON public.designs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "designs_update" ON public.designs FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "designs_delete" ON public.designs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Follows policies
CREATE POLICY "follows_select" ON public.follows FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "follows_insert" ON public.follows FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "follows_delete" ON public.follows FOR DELETE TO authenticated USING (auth.uid() = follower_id);

-- Downloads policies
CREATE POLICY "downloads_select" ON public.downloads FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "downloads_insert" ON public.downloads FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Categories policy (public read)
CREATE POLICY "categories_select" ON public.design_categories FOR SELECT TO authenticated, anon USING (true);

-- Trigger: auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, profession)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'profession', 'Other')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper functions
CREATE OR REPLACE FUNCTION public.increment_download_count(design_id UUID)
RETURNS VOID AS $$ BEGIN UPDATE public.designs SET download_count = download_count + 1 WHERE id = design_id; END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_view_count(design_id UUID)
RETURNS VOID AS $$ BEGIN UPDATE public.designs SET view_count = view_count + 1 WHERE id = design_id; END; $$ LANGUAGE plpgsql SECURITY DEFINER;
