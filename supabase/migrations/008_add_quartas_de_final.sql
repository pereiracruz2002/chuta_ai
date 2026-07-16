-- Migration: Adicionar quartas de final com confrontos definidos
-- Horarios oficiais FIFA em UTC
-- 3 confrontos definidos + 1 aguardando vencedores das oitavas de hoje

-- =============================================
-- QUARTAS DE FINAL - 4 jogos
-- =============================================

-- 9 de julho (Match 97)
INSERT INTO public.matches (home_team, away_team, starts_at, stage) VALUES
('Franca', 'Marrocos', '2026-07-09T20:00:00Z', 'Quartas');

-- 10 de julho (Match 98)
INSERT INTO public.matches (home_team, away_team, starts_at, stage) VALUES
('Espanha', 'Belgica', '2026-07-10T19:00:00Z', 'Quartas');

-- 11 de julho (Matches 99, 100)
INSERT INTO public.matches (home_team, away_team, starts_at, stage) VALUES
('Noruega', 'Inglaterra', '2026-07-11T21:00:00Z', 'Quartas'),
('Vencedor Argentina x Egito', 'Vencedor Suica x Colombia', '2026-07-12T01:00:00Z', 'Quartas');
