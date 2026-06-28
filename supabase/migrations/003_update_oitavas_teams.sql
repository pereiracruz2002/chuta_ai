-- Migration: Atualizar times das oitavas de final com nomes reais
-- Substitui placeholders pelos times classificados
-- Usa starts_at como identificador unico de cada partida

-- Match 74: Alemanha vs Paraguai (era '3o Grupo C/D/F')
UPDATE public.matches
SET away_team = 'Paraguai'
WHERE starts_at = '2026-06-29T20:30:00Z' AND stage = 'Oitavas';

-- Match 78: Costa do Marfim vs Noruega (era '2o Grupo I')
UPDATE public.matches
SET away_team = 'Noruega'
WHERE starts_at = '2026-06-30T17:00:00Z' AND stage = 'Oitavas';

-- Match 77: Franca vs Suecia (era '1o Grupo I' vs '3o Grupo D/F/G')
UPDATE public.matches
SET home_team = 'Franca', away_team = 'Suecia'
WHERE starts_at = '2026-06-30T21:00:00Z' AND stage = 'Oitavas';

-- Match 79: Mexico vs Equador (era '3o Grupo C/E/H')
UPDATE public.matches
SET away_team = 'Equador'
WHERE starts_at = '2026-07-01T01:00:00Z' AND stage = 'Oitavas';

-- Match 80: Inglaterra vs RD Congo (era '1o Grupo L' vs '3o Grupo E/I/J/K')
UPDATE public.matches
SET home_team = 'Inglaterra', away_team = 'RD Congo'
WHERE starts_at = '2026-07-01T16:00:00Z' AND stage = 'Oitavas';

-- Match 82: Belgica vs Senegal (era '1o Grupo G' vs '3o Grupo A/H/I/J')
UPDATE public.matches
SET home_team = 'Belgica', away_team = 'Senegal'
WHERE starts_at = '2026-07-01T20:00:00Z' AND stage = 'Oitavas';

-- Match 84: Espanha vs Austria (era '1o Grupo H' vs '2o Grupo J')
UPDATE public.matches
SET home_team = 'Espanha', away_team = 'Austria'
WHERE starts_at = '2026-07-02T19:00:00Z' AND stage = 'Oitavas';

-- Match 83: Portugal vs Croacia (era '2o Grupo K' vs '2o Grupo L')
UPDATE public.matches
SET home_team = 'Portugal', away_team = 'Croacia'
WHERE starts_at = '2026-07-02T23:00:00Z' AND stage = 'Oitavas';

-- Match 85: Suica vs Argelia (era '3o Grupo E/F/G/I/J')
UPDATE public.matches
SET away_team = 'Argelia'
WHERE starts_at = '2026-07-03T03:00:00Z' AND stage = 'Oitavas';

-- Match 88: Australia vs Egito (era '2o Grupo G')
UPDATE public.matches
SET away_team = 'Egito'
WHERE starts_at = '2026-07-03T18:00:00Z' AND stage = 'Oitavas';

-- Match 86: Argentina vs Cabo Verde (era '2o Grupo H')
UPDATE public.matches
SET away_team = 'Cabo Verde'
WHERE starts_at = '2026-07-03T22:00:00Z' AND stage = 'Oitavas';

-- Match 87: Colombia vs Ghana (era '1o Grupo K' vs '3o Grupo D/E/I/J/L')
UPDATE public.matches
SET home_team = 'Colombia', away_team = 'Ghana'
WHERE starts_at = '2026-07-04T01:30:00Z' AND stage = 'Oitavas';
