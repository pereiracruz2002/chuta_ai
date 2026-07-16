-- Migration: Atualizar ultimo confronto das quartas com times classificados
-- Argentina e Suica venceram as oitavas

-- Match 100: Argentina vs Suica
UPDATE public.matches
SET home_team = 'Argentina', away_team = 'Suica'
WHERE starts_at = '2026-07-12T01:00:00Z' AND stage = 'Quartas';
