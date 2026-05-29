-- Migration: Create initial schema for Chuta AI
-- Bolao da Copa do Mundo 2026

-- ============================================
-- TABELA: users
-- ============================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================
-- TABELA: pools (boloes)
-- ============================================
CREATE TABLE public.pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  invite_code TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(6), 'hex'),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================
-- TABELA: pool_members
-- ============================================
CREATE TABLE public.pool_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES public.pools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0 NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(pool_id, user_id)
);

-- ============================================
-- TABELA: matches (jogos)
-- ============================================
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  stage TEXT NOT NULL,
  home_score INTEGER,
  away_score INTEGER,
  finished BOOLEAN DEFAULT false NOT NULL
);

-- ============================================
-- TABELA: predictions (palpites)
-- ============================================
CREATE TABLE public.predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  pool_id UUID NOT NULL REFERENCES public.pools(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  home_prediction INTEGER NOT NULL,
  away_prediction INTEGER NOT NULL,
  points INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, pool_id, match_id)
);

-- ============================================
-- INDICES
-- ============================================
CREATE INDEX idx_pool_members_pool_id ON public.pool_members(pool_id);
CREATE INDEX idx_pool_members_user_id ON public.pool_members(user_id);
CREATE INDEX idx_predictions_match_id ON public.predictions(match_id);
CREATE INDEX idx_predictions_pool_id ON public.predictions(pool_id);
CREATE INDEX idx_predictions_user_id ON public.predictions(user_id);
CREATE INDEX idx_matches_starts_at ON public.matches(starts_at);
CREATE INDEX idx_matches_finished ON public.matches(finished);

-- ============================================
-- RLS (Row Level Security)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pool_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

-- USERS policies
CREATE POLICY "Users can view all users" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- POOLS policies
CREATE POLICY "Authenticated users can view pools" ON public.pools
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create pools" ON public.pools
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update pools" ON public.pools
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete pools" ON public.pools
  FOR DELETE USING (auth.uid() = owner_id);

-- POOL_MEMBERS policies
CREATE POLICY "Authenticated users can view pool members" ON public.pool_members
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can join pools" ON public.pool_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave pools" ON public.pool_members
  FOR DELETE USING (auth.uid() = user_id);

-- MATCHES policies
CREATE POLICY "Everyone can view matches" ON public.matches
  FOR SELECT USING (true);

CREATE POLICY "Only admins can insert matches" ON public.matches
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Only admins can update matches" ON public.matches
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid())
  );

-- PREDICTIONS policies
CREATE POLICY "Members can view predictions in their pools" ON public.predictions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.pool_members
      WHERE pool_members.pool_id = predictions.pool_id
      AND pool_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own predictions" ON public.predictions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.matches
      WHERE matches.id = match_id
      AND matches.starts_at > now()
    )
  );

CREATE POLICY "Users can update own predictions before match starts" ON public.predictions
  FOR UPDATE USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.matches
      WHERE matches.id = match_id
      AND matches.starts_at > now()
    )
  );

CREATE POLICY "Users can delete own predictions" ON public.predictions
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- TRIGGER: Sync auth.users to public.users
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Usuario'),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FUNCTION: Calculate prediction points
-- ============================================
CREATE OR REPLACE FUNCTION public.calculate_points(
  p_home_pred INTEGER,
  p_away_pred INTEGER,
  p_home_score INTEGER,
  p_away_score INTEGER
) RETURNS INTEGER AS $$
DECLARE
  points INTEGER := 0;
  pred_diff INTEGER;
  actual_diff INTEGER;
BEGIN
  -- Null scores mean match not finished
  IF p_home_score IS NULL OR p_away_score IS NULL THEN
    RETURN 0;
  END IF;

  -- Exact score
  IF p_home_pred = p_home_score AND p_away_pred = p_away_score THEN
    RETURN 10;
  END IF;

  pred_diff := p_home_pred - p_away_pred;
  actual_diff := p_home_score - p_away_score;

  -- Check if winner/draw is correct
  IF (pred_diff > 0 AND actual_diff > 0) OR
     (pred_diff < 0 AND actual_diff < 0) OR
     (pred_diff = 0 AND actual_diff = 0) THEN
    points := 3; -- Correct winner/draw

    -- Correct goal difference
    IF pred_diff = actual_diff THEN
      points := 7;
    -- Got one team's goals right
    ELSIF p_home_pred = p_home_score OR p_away_pred = p_away_score THEN
      points := 5;
    END IF;
  END IF;

  RETURN points;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- FUNCTION: Update scores after match result
-- ============================================
CREATE OR REPLACE FUNCTION public.update_predictions_after_result()
RETURNS TRIGGER AS $$
BEGIN
  -- Only run when match is marked as finished or scores change
  IF NEW.finished = true AND (
    OLD.finished = false OR
    OLD.home_score IS DISTINCT FROM NEW.home_score OR
    OLD.away_score IS DISTINCT FROM NEW.away_score
  ) THEN
    -- Update points for all predictions of this match
    UPDATE public.predictions
    SET points = public.calculate_points(
      home_prediction,
      away_prediction,
      NEW.home_score,
      NEW.away_score
    ),
    updated_at = now()
    WHERE match_id = NEW.id;

    -- Recalculate total scores for affected pool members
    UPDATE public.pool_members pm
    SET score = (
      SELECT COALESCE(SUM(p.points), 0)
      FROM public.predictions p
      WHERE p.user_id = pm.user_id
      AND p.pool_id = pm.pool_id
    )
    WHERE pm.pool_id IN (
      SELECT DISTINCT pool_id FROM public.predictions WHERE match_id = NEW.id
    )
    AND pm.user_id IN (
      SELECT DISTINCT user_id FROM public.predictions WHERE match_id = NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_match_result_updated
  AFTER UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.update_predictions_after_result();
