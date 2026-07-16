-- Migration: Adicionar semifinais com confrontos definidos
-- Horarios oficiais FIFA em UTC

-- =============================================
-- SEMIFINAIS - 2 jogos
-- =============================================

-- 14 de julho (Match 101)
INSERT INTO public.matches (home_team, away_team, starts_at, stage) VALUES
('Franca', 'Espanha', '2026-07-14T19:00:00Z', 'Semifinal');

-- 15 de julho (Match 102)
INSERT INTO public.matches (home_team, away_team, starts_at, stage) VALUES
('Inglaterra', 'Argentina', '2026-07-15T19:00:00Z', 'Semifinal');
