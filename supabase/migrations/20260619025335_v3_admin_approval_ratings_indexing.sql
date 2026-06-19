/*
# MarketVault v3 — Admin Approval, Ratings, Comments + Indexing

## Summary
1. Admin approval system for new uploads (approval_status column on designs)
2. Rating system (design_ratings table, 1-5 stars per user per design)
3. Database indexing for high-traffic performance
4. Admin access control via admin_emails table + is_admin() function
5. design_comments table (created if missing)
6. design_rating_total function returns avg + count

## Important Notes
- Admin access controlled SOLELY by admin_emails table.
- New uploads default to 'pending', hidden from public until approved.
- Existing designs auto-approved so upgrade hides nothing.
*/

-- ============================================================
-- 1. ADD APPROVAL STATUS COLUMN TO DESIGNS
-- ============================================================
ALTER TABLE public.designs ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'pending';

UPDATE public.designs SET approval_status = 'approved' WHERE approval_status = 'pending';

-- ============================================================
-- 2. ADMIN EMAILS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admin_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  added_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_emails_select" ON public.admin_emails;
CREATE POLICY "admin_emails_select" ON public.admin_emails
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.email IN (SELECT email FROM public.admin_emails)
    )
  );

DROP POLICY IF EXISTS "admin_emails_insert_any" ON public.admin_emails;
CREATE POLICY "admin_emails_insert_any" ON public.admin_emails
  FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================================
-- 3. ADMIN DETECTION FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_email TEXT;
BEGIN
  user_email := (SELECT email FROM public.profiles WHERE id = auth.uid());
  IF user_email IS NULL THEN
    RETURN false;
  END IF;
  RETURN EXISTS (SELECT 1 FROM public.admin_emails WHERE email = user_email);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================
-- 4. UPDATE DESIGNS SELECT POLICY (approval-gated)
-- ============================================================
DROP POLICY IF EXISTS "designs_select" ON public.designs;
CREATE POLICY "designs_select" ON public.designs
  FOR SELECT TO authenticated, anon USING (
    (is_public = true AND approval_status = 'approved')
    OR (auth.uid() = user_id)
    OR is_admin()
  );

-- ============================================================
-- 5. DESIGN COMMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.design_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id UUID NOT NULL REFERENCES public.designs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.design_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "comments_select_v3" ON public.design_comments;
CREATE POLICY "comments_select_v3" ON public.design_comments
  FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "comments_insert_own_v3" ON public.design_comments;
CREATE POLICY "comments_insert_own_v3" ON public.design_comments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "comments_update_own_v3" ON public.design_comments;
CREATE POLICY "comments_update_own_v3" ON public.design_comments
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "comments_delete_own_v3" ON public.design_comments;
CREATE POLICY "comments_delete_own_v3" ON public.design_comments
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 6. DESIGN RATINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.design_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id UUID NOT NULL REFERENCES public.designs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(design_id, user_id)
);

ALTER TABLE public.design_ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ratings_select_v3" ON public.design_ratings;
CREATE POLICY "ratings_select_v3" ON public.design_ratings
  FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "ratings_insert_own_v3" ON public.design_ratings;
CREATE POLICY "ratings_insert_own_v3" ON public.design_ratings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "ratings_update_own_v3" ON public.design_ratings;
CREATE POLICY "ratings_update_own_v3" ON public.design_ratings
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "ratings_delete_own_v3" ON public.design_ratings;
CREATE POLICY "ratings_delete_own_v3" ON public.design_ratings
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 7. APPROVE / REJECT / RATING FUNCTIONS
-- ============================================================
CREATE OR REPLACE FUNCTION public.approve_design(design_id UUID)
RETURNS VOID AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can approve designs';
  END IF;
  UPDATE public.designs SET approval_status = 'approved' WHERE id = design_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.reject_design(design_id UUID)
RETURNS VOID AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can reject designs';
  END IF;
  UPDATE public.designs SET approval_status = 'rejected' WHERE id = design_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.design_rating_total(d_design_id UUID)
RETURNS TABLE(avg_rating NUMERIC, total_ratings BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(AVG(rating), 0)::NUMERIC(3,1) AS avg_rating,
    COUNT(*)::BIGINT AS total_ratings
  FROM public.design_ratings
  WHERE design_id = d_design_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================
-- 8. DATABASE INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_designs_approval_status ON public.designs(approval_status);
CREATE INDEX IF NOT EXISTS idx_designs_public ON public.designs(is_public);
CREATE INDEX IF NOT EXISTS idx_designs_category ON public.designs(category_id);
CREATE INDEX IF NOT EXISTS idx_designs_user ON public.designs(user_id);
CREATE INDEX IF NOT EXISTS idx_designs_created ON public.designs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_designs_downloads ON public.designs(download_count DESC);
CREATE INDEX IF NOT EXISTS idx_designs_public_approved ON public.designs(is_public, approval_status);
CREATE INDEX IF NOT EXISTS idx_designs_category_approved ON public.designs(category_id, is_public, approval_status);

CREATE INDEX IF NOT EXISTS idx_ratings_design ON public.design_ratings(design_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_ratings_design_user ON public.design_ratings(design_id, user_id);

CREATE INDEX IF NOT EXISTS idx_comments_design ON public.design_comments(design_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_user ON public.design_comments(user_id);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_emails_email ON public.admin_emails(email);

CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);

CREATE INDEX IF NOT EXISTS idx_downloads_design ON public.downloads(design_id);
CREATE INDEX IF NOT EXISTS idx_downloads_user ON public.downloads(user_id);

CREATE INDEX IF NOT EXISTS idx_ads_position_active ON public.ads(position, is_active);
CREATE INDEX IF NOT EXISTS idx_ads_priority ON public.ads(priority DESC);
