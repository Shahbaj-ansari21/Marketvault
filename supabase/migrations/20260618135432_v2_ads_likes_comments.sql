
-- Create ads table
CREATE TABLE IF NOT EXISTS public.ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT NOT NULL,
  position TEXT NOT NULL DEFAULT 'sidebar',
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create likes table
CREATE TABLE IF NOT EXISTS public.design_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id UUID NOT NULL REFERENCES public.designs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(design_id, user_id)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS public.design_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id UUID NOT NULL REFERENCES public.designs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create activity log table
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Ads: anyone can read active ads
CREATE POLICY "ads_select" ON public.ads FOR SELECT TO authenticated, anon USING (is_active = true);
CREATE POLICY "ads_insert" ON public.ads FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "ads_update" ON public.ads FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "ads_delete" ON public.ads FOR DELETE TO authenticated USING (true);

-- Likes
CREATE POLICY "likes_select" ON public.design_likes FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "likes_insert" ON public.design_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_delete" ON public.design_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Comments
CREATE POLICY "comments_select" ON public.design_comments FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "comments_insert" ON public.design_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_update" ON public.design_comments FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_delete" ON public.design_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Activity log
CREATE POLICY "activity_select" ON public.activity_log FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "activity_insert" ON public.activity_log FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Add like_count to designs
ALTER TABLE public.designs ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;

-- Function to handle likes
CREATE OR REPLACE FUNCTION public.handle_like(design_id UUID, is_add BOOLEAN)
RETURNS VOID AS $$
BEGIN
  IF is_add THEN
    UPDATE public.designs SET like_count = like_count + 1 WHERE id = design_id;
  ELSE
    UPDATE public.designs SET like_count = like_count - 1 WHERE id = design_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
