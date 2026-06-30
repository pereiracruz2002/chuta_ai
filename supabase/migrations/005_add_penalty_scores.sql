-- Migration: Adicionar placar de penaltis
-- home_penalty_score / away_penalty_score = resultado da disputa de penaltis (NULL se nao houve)

ALTER TABLE public.matches
ADD COLUMN home_penalty_score INTEGER DEFAULT NULL,
ADD COLUMN away_penalty_score INTEGER DEFAULT NULL;

COMMENT ON COLUMN public.matches.home_penalty_score IS 'Gols convertidos nos penaltis pelo time da casa. NULL se jogo nao foi decidido nos penaltis.';
COMMENT ON COLUMN public.matches.away_penalty_score IS 'Gols convertidos nos penaltis pelo time visitante. NULL se jogo nao foi decidido nos penaltis.';
