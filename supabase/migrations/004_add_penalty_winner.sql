-- Migration: Adicionar campo penalty_winner para fase eliminatoria
-- O placar (home_score/away_score) registra resultado apos tempo normal + prorrogacao
-- penalty_winner indica qual time venceu nos penaltis (NULL se nao houve penaltis)

ALTER TABLE public.matches
ADD COLUMN penalty_winner TEXT DEFAULT NULL;

-- Comentario explicativo na coluna
COMMENT ON COLUMN public.matches.penalty_winner IS 'Nome do time que venceu nos penaltis. NULL se jogo nao foi decidido nos penaltis. Nao afeta calculo de pontuacao.';
