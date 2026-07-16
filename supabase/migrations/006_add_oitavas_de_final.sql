-- Migration: Adicionar oitavas de final (Round of 16) com confrontos definidos
-- Renomeia a fase anterior (Round of 32) de 'Oitavas' para '16 avos'
-- Horarios oficiais FIFA em UTC

-- Fase anterior era Round of 32 (16 avos), nao oitavas de final
UPDATE public.matches
SET stage = '16 avos'
WHERE stage = 'Oitavas';

-- =============================================
-- OITAVAS DE FINAL (Round of 16) - 8 jogos
-- 5 confrontos definidos + 3 aguardando vencedores dos 16 avos
-- =============================================

-- 4 de julho (Matches 90, 89)
INSERT INTO public.matches (home_team, away_team, starts_at, stage) VALUES
('Canada', 'Marrocos', '2026-07-04T17:00:00Z', 'Oitavas'),
('Paraguai', 'Franca', '2026-07-04T21:00:00Z', 'Oitavas');

-- 5 de julho (Match 91)
INSERT INTO public.matches (home_team, away_team, starts_at, stage) VALUES
('Brasil', 'Noruega', '2026-07-05T20:00:00Z', 'Oitavas');

-- 6 de julho (Matches 92, 93)
INSERT INTO public.matches (home_team, away_team, starts_at, stage) VALUES
('Mexico', 'Inglaterra', '2026-07-06T00:00:00Z', 'Oitavas'),
('Vencedor Portugal x Croacia', 'Vencedor Espanha x Austria', '2026-07-06T19:00:00Z', 'Oitavas');

-- 7 de julho (Matches 94, 95, 96)
INSERT INTO public.matches (home_team, away_team, starts_at, stage) VALUES
('Estados Unidos', 'Belgica', '2026-07-07T00:00:00Z', 'Oitavas'),
('Vencedor Argentina x Cabo Verde', 'Vencedor Australia x Egito', '2026-07-07T16:00:00Z', 'Oitavas'),
('Vencedor Suica x Argelia', 'Vencedor Colombia x Ghana', '2026-07-07T20:00:00Z', 'Oitavas');
