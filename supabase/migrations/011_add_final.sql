-- Migration: Adicionar disputa de 3o lugar e final
-- Horarios oficiais FIFA em UTC

-- =============================================
-- DISPUTA DE 3O LUGAR + FINAL
-- =============================================

-- 18 de julho (Match 103) - 3o lugar
INSERT INTO public.matches (home_team, away_team, starts_at, stage) VALUES
('Franca', 'Inglaterra', '2026-07-18T21:00:00Z', '3o Lugar');

-- 19 de julho (Match 104) - Final
INSERT INTO public.matches (home_team, away_team, starts_at, stage) VALUES
('Espanha', 'Argentina', '2026-07-19T19:00:00Z', 'Final');
