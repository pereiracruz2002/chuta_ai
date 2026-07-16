-- Migration: Atualizar times das oitavas de final com todos os confrontos definidos
-- Substitui placeholders pelos times classificados nos 16 avos
-- Usa starts_at como identificador unico de cada partida

-- Match 93: Portugal vs Espanha (era 'Vencedor Portugal x Croacia' vs 'Vencedor Espanha x Austria')
UPDATE public.matches
SET home_team = 'Portugal', away_team = 'Espanha'
WHERE starts_at = '2026-07-06T19:00:00Z' AND stage = 'Oitavas';

-- Match 95: Argentina vs Egito (era 'Vencedor Argentina x Cabo Verde' vs 'Vencedor Australia x Egito')
UPDATE public.matches
SET home_team = 'Argentina', away_team = 'Egito'
WHERE starts_at = '2026-07-07T16:00:00Z' AND stage = 'Oitavas';

-- Match 96: Suica vs Colombia (era 'Vencedor Suica x Argelia' vs 'Vencedor Colombia x Ghana')
UPDATE public.matches
SET home_team = 'Suica', away_team = 'Colombia'
WHERE starts_at = '2026-07-07T20:00:00Z' AND stage = 'Oitavas';
