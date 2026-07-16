-- Copa do Mundo 2026 - Jogos da fase de grupos + 16 avos + Oitavas + Quartas + Semifinais + Final
-- Horarios em UTC (o banco armazena como TIMESTAMPTZ)
-- Para converter para Brasilia: UTC - 3 horas
-- Fonte: FIFA / Wikipedia (dados oficiais do sorteio)

-- Limpar tabela de matches existente (CUIDADO: isso remove todos os palpites vinculados)
-- DELETE FROM predictions;
-- DELETE FROM matches;

-- =============================================
-- GRUPO A: Mexico, Africa do Sul, Coreia do Sul, Republica Tcheca
-- =============================================
INSERT INTO matches (home_team, away_team, starts_at, stage) VALUES
('Mexico', 'Africa do Sul', '2026-06-11T19:00:00Z', 'Grupo A'),
('Coreia do Sul', 'Republica Tcheca', '2026-06-12T02:00:00Z', 'Grupo A'),
('Republica Tcheca', 'Africa do Sul', '2026-06-18T16:00:00Z', 'Grupo A'),
('Mexico', 'Coreia do Sul', '2026-06-19T01:00:00Z', 'Grupo A'),
('Republica Tcheca', 'Mexico', '2026-06-25T01:00:00Z', 'Grupo A'),
('Africa do Sul', 'Coreia do Sul', '2026-06-25T01:00:00Z', 'Grupo A');

-- =============================================
-- GRUPO B: Canada, Bosnia e Herzegovina, Catar, Suica
-- =============================================
INSERT INTO matches (home_team, away_team, starts_at, stage) VALUES
('Canada', 'Bosnia e Herzegovina', '2026-06-12T19:00:00Z', 'Grupo B'),
('Catar', 'Suica', '2026-06-13T19:00:00Z', 'Grupo B'),
('Suica', 'Bosnia e Herzegovina', '2026-06-18T19:00:00Z', 'Grupo B'),
('Canada', 'Catar', '2026-06-18T22:00:00Z', 'Grupo B'),
('Suica', 'Canada', '2026-06-24T19:00:00Z', 'Grupo B'),
('Bosnia e Herzegovina', 'Catar', '2026-06-24T19:00:00Z', 'Grupo B');

-- =============================================
-- GRUPO C: Brasil, Marrocos, Haiti, Escocia
-- =============================================
INSERT INTO matches (home_team, away_team, starts_at, stage) VALUES
('Brasil', 'Marrocos', '2026-06-13T22:00:00Z', 'Grupo C'),
('Haiti', 'Escocia', '2026-06-14T01:00:00Z', 'Grupo C'),
('Escocia', 'Marrocos', '2026-06-19T22:00:00Z', 'Grupo C'),
('Brasil', 'Haiti', '2026-06-20T00:30:00Z', 'Grupo C'),
('Escocia', 'Brasil', '2026-06-24T22:00:00Z', 'Grupo C'),
('Marrocos', 'Haiti', '2026-06-24T22:00:00Z', 'Grupo C');

-- =============================================
-- GRUPO D: Estados Unidos, Paraguai, Australia, Turquia
-- =============================================
INSERT INTO matches (home_team, away_team, starts_at, stage) VALUES
('Estados Unidos', 'Paraguai', '2026-06-13T01:00:00Z', 'Grupo D'),
('Australia', 'Turquia', '2026-06-14T04:00:00Z', 'Grupo D'),
('Estados Unidos', 'Australia', '2026-06-19T19:00:00Z', 'Grupo D'),
('Turquia', 'Paraguai', '2026-06-20T03:00:00Z', 'Grupo D'),
('Turquia', 'Estados Unidos', '2026-06-26T02:00:00Z', 'Grupo D'),
('Paraguai', 'Australia', '2026-06-26T02:00:00Z', 'Grupo D');

-- =============================================
-- GRUPO E: Alemanha, Curacao, Costa do Marfim, Equador
-- =============================================
INSERT INTO matches (home_team, away_team, starts_at, stage) VALUES
('Alemanha', 'Curacao', '2026-06-14T17:00:00Z', 'Grupo E'),
('Costa do Marfim', 'Equador', '2026-06-14T23:00:00Z', 'Grupo E'),
('Alemanha', 'Costa do Marfim', '2026-06-20T20:00:00Z', 'Grupo E'),
('Equador', 'Curacao', '2026-06-21T00:00:00Z', 'Grupo E'),
('Curacao', 'Costa do Marfim', '2026-06-25T20:00:00Z', 'Grupo E'),
('Equador', 'Alemanha', '2026-06-25T20:00:00Z', 'Grupo E');

-- =============================================
-- GRUPO F: Holanda, Japao, Suecia, Tunisia
-- =============================================
INSERT INTO matches (home_team, away_team, starts_at, stage) VALUES
('Holanda', 'Japao', '2026-06-14T20:00:00Z', 'Grupo F'),
('Suecia', 'Tunisia', '2026-06-15T02:00:00Z', 'Grupo F'),
('Holanda', 'Suecia', '2026-06-20T17:00:00Z', 'Grupo F'),
('Tunisia', 'Japao', '2026-06-21T04:00:00Z', 'Grupo F'),
('Japao', 'Suecia', '2026-06-25T23:00:00Z', 'Grupo F'),
('Tunisia', 'Holanda', '2026-06-25T23:00:00Z', 'Grupo F');

-- =============================================
-- GRUPO G: Belgica, Egito, Ira, Nova Zelandia
-- =============================================
INSERT INTO matches (home_team, away_team, starts_at, stage) VALUES
('Belgica', 'Egito', '2026-06-15T19:00:00Z', 'Grupo G'),
('Ira', 'Nova Zelandia', '2026-06-16T01:00:00Z', 'Grupo G'),
('Belgica', 'Ira', '2026-06-21T19:00:00Z', 'Grupo G'),
('Nova Zelandia', 'Egito', '2026-06-22T01:00:00Z', 'Grupo G'),
('Egito', 'Ira', '2026-06-27T03:00:00Z', 'Grupo G'),
('Nova Zelandia', 'Belgica', '2026-06-27T03:00:00Z', 'Grupo G');

-- =============================================
-- GRUPO H: Espanha, Cabo Verde, Arabia Saudita, Uruguai
-- =============================================
INSERT INTO matches (home_team, away_team, starts_at, stage) VALUES
('Espanha', 'Cabo Verde', '2026-06-15T16:00:00Z', 'Grupo H'),
('Arabia Saudita', 'Uruguai', '2026-06-15T22:00:00Z', 'Grupo H'),
('Espanha', 'Arabia Saudita', '2026-06-21T16:00:00Z', 'Grupo H'),
('Uruguai', 'Cabo Verde', '2026-06-21T22:00:00Z', 'Grupo H'),
('Cabo Verde', 'Arabia Saudita', '2026-06-27T00:00:00Z', 'Grupo H'),
('Uruguai', 'Espanha', '2026-06-27T00:00:00Z', 'Grupo H');

-- =============================================
-- GRUPO I: Franca, Senegal, Iraque, Noruega
-- =============================================
INSERT INTO matches (home_team, away_team, starts_at, stage) VALUES
('Franca', 'Senegal', '2026-06-16T19:00:00Z', 'Grupo I'),
('Iraque', 'Noruega', '2026-06-16T22:00:00Z', 'Grupo I'),
('Franca', 'Iraque', '2026-06-22T21:00:00Z', 'Grupo I'),
('Noruega', 'Senegal', '2026-06-23T00:00:00Z', 'Grupo I'),
('Noruega', 'Franca', '2026-06-26T19:00:00Z', 'Grupo I'),
('Senegal', 'Iraque', '2026-06-26T19:00:00Z', 'Grupo I');

-- =============================================
-- GRUPO J: Argentina, Argelia, Austria, Jordania
-- =============================================
INSERT INTO matches (home_team, away_team, starts_at, stage) VALUES
('Argentina', 'Argelia', '2026-06-17T01:00:00Z', 'Grupo J'),
('Austria', 'Jordania', '2026-06-17T04:00:00Z', 'Grupo J'),
('Argentina', 'Austria', '2026-06-22T17:00:00Z', 'Grupo J'),
('Jordania', 'Argelia', '2026-06-23T03:00:00Z', 'Grupo J'),
('Argelia', 'Austria', '2026-06-28T02:00:00Z', 'Grupo J'),
('Jordania', 'Argentina', '2026-06-28T02:00:00Z', 'Grupo J');

-- =============================================
-- GRUPO K: Portugal, RD Congo, Uzbequistao, Colombia
-- =============================================
INSERT INTO matches (home_team, away_team, starts_at, stage) VALUES
('Portugal', 'RD Congo', '2026-06-17T17:00:00Z', 'Grupo K'),
('Uzbequistao', 'Colombia', '2026-06-18T02:00:00Z', 'Grupo K'),
('Portugal', 'Uzbequistao', '2026-06-23T17:00:00Z', 'Grupo K'),
('Colombia', 'RD Congo', '2026-06-24T02:00:00Z', 'Grupo K'),
('Colombia', 'Portugal', '2026-06-27T23:30:00Z', 'Grupo K'),
('RD Congo', 'Uzbequistao', '2026-06-27T23:30:00Z', 'Grupo K');

-- =============================================
-- GRUPO L: Inglaterra, Croacia, Ghana, Panama
-- =============================================
INSERT INTO matches (home_team, away_team, starts_at, stage) VALUES
('Inglaterra', 'Croacia', '2026-06-17T20:00:00Z', 'Grupo L'),
('Ghana', 'Panama', '2026-06-17T23:00:00Z', 'Grupo L'),
('Inglaterra', 'Ghana', '2026-06-23T20:00:00Z', 'Grupo L'),
('Panama', 'Croacia', '2026-06-23T23:00:00Z', 'Grupo L'),
('Panama', 'Inglaterra', '2026-06-27T21:00:00Z', 'Grupo L'),
('Croacia', 'Ghana', '2026-06-27T21:00:00Z', 'Grupo L');

-- =============================================
-- 16 AVOS DE FINAL (Round of 32) - 16 jogos
-- Horarios oficiais FIFA em UTC
-- =============================================

-- 28 de junho (Match 73)
INSERT INTO matches (home_team, away_team, starts_at, stage) VALUES
('Africa do Sul', 'Canada', '2026-06-28T19:00:00Z', '16 avos');

-- 29 de junho (Matches 74, 75, 76)
INSERT INTO matches (home_team, away_team, starts_at, stage) VALUES
('Brasil', 'Japao', '2026-06-29T17:00:00Z', '16 avos'),
('Alemanha', 'Paraguai', '2026-06-29T20:30:00Z', '16 avos'),
('Holanda', 'Marrocos', '2026-06-30T01:00:00Z', '16 avos');

-- 30 de junho (Matches 77, 78, 79)
INSERT INTO matches (home_team, away_team, starts_at, stage) VALUES
('Costa do Marfim', 'Noruega', '2026-06-30T17:00:00Z', '16 avos'),
('Franca', 'Suecia', '2026-06-30T21:00:00Z', '16 avos'),
('Mexico', 'Equador', '2026-07-01T01:00:00Z', '16 avos');

-- 1 de julho (Matches 80, 81, 82)
INSERT INTO matches (home_team, away_team, starts_at, stage) VALUES
('Inglaterra', 'RD Congo', '2026-07-01T16:00:00Z', '16 avos'),
('Belgica', 'Senegal', '2026-07-01T20:00:00Z', '16 avos'),
('Estados Unidos', 'Bosnia e Herzegovina', '2026-07-02T00:00:00Z', '16 avos');

-- 2 de julho (Matches 83, 84, 85)
INSERT INTO matches (home_team, away_team, starts_at, stage) VALUES
('Espanha', 'Austria', '2026-07-02T19:00:00Z', '16 avos'),
('Portugal', 'Croacia', '2026-07-02T23:00:00Z', '16 avos'),
('Suica', 'Argelia', '2026-07-03T03:00:00Z', '16 avos');

-- 3 de julho (Matches 86, 87, 88)
INSERT INTO matches (home_team, away_team, starts_at, stage) VALUES
('Australia', 'Egito', '2026-07-03T18:00:00Z', '16 avos'),
('Argentina', 'Cabo Verde', '2026-07-03T22:00:00Z', '16 avos'),
('Colombia', 'Ghana', '2026-07-04T01:30:00Z', '16 avos');

-- =============================================
-- OITAVAS DE FINAL (Round of 16) - 8 jogos
-- Horarios oficiais FIFA em UTC
-- =============================================

-- 4 de julho (Matches 90, 89)
INSERT INTO matches (home_team, away_team, starts_at, stage) VALUES
('Canada', 'Marrocos', '2026-07-04T17:00:00Z', 'Oitavas'),
('Paraguai', 'Franca', '2026-07-04T21:00:00Z', 'Oitavas');

-- 5 de julho (Match 91)
INSERT INTO matches (home_team, away_team, starts_at, stage) VALUES
('Brasil', 'Noruega', '2026-07-05T20:00:00Z', 'Oitavas');

-- 6 de julho (Matches 92, 93)
INSERT INTO matches (home_team, away_team, starts_at, stage) VALUES
('Mexico', 'Inglaterra', '2026-07-06T00:00:00Z', 'Oitavas'),
('Portugal', 'Espanha', '2026-07-06T19:00:00Z', 'Oitavas');

-- 7 de julho (Matches 94, 95, 96)
INSERT INTO matches (home_team, away_team, starts_at, stage) VALUES
('Estados Unidos', 'Belgica', '2026-07-07T00:00:00Z', 'Oitavas'),
('Argentina', 'Egito', '2026-07-07T16:00:00Z', 'Oitavas'),
('Suica', 'Colombia', '2026-07-07T20:00:00Z', 'Oitavas');

-- =============================================
-- QUARTAS DE FINAL - 4 jogos
-- Horarios oficiais FIFA em UTC
-- =============================================

-- 9 de julho (Match 97)
INSERT INTO matches (home_team, away_team, starts_at, stage) VALUES
('Franca', 'Marrocos', '2026-07-09T20:00:00Z', 'Quartas');

-- 10 de julho (Match 98)
INSERT INTO matches (home_team, away_team, starts_at, stage) VALUES
('Espanha', 'Belgica', '2026-07-10T19:00:00Z', 'Quartas');

-- 11 de julho (Matches 99, 100)
INSERT INTO matches (home_team, away_team, starts_at, stage) VALUES
('Noruega', 'Inglaterra', '2026-07-11T21:00:00Z', 'Quartas'),
('Argentina', 'Suica', '2026-07-12T01:00:00Z', 'Quartas');

-- =============================================
-- SEMIFINAIS - 2 jogos
-- Horarios oficiais FIFA em UTC
-- =============================================

-- 14 de julho (Match 101)
INSERT INTO matches (home_team, away_team, starts_at, stage) VALUES
('Franca', 'Espanha', '2026-07-14T19:00:00Z', 'Semifinal');

-- 15 de julho (Match 102)
INSERT INTO matches (home_team, away_team, starts_at, stage) VALUES
('Inglaterra', 'Argentina', '2026-07-15T19:00:00Z', 'Semifinal');

-- =============================================
-- DISPUTA DE 3O LUGAR + FINAL
-- Horarios oficiais FIFA em UTC
-- =============================================

-- 18 de julho (Match 103) - 3o lugar
INSERT INTO matches (home_team, away_team, starts_at, stage) VALUES
('Franca', 'Inglaterra', '2026-07-18T21:00:00Z', '3o Lugar');

-- 19 de julho (Match 104) - Final
INSERT INTO matches (home_team, away_team, starts_at, stage) VALUES
('Espanha', 'Argentina', '2026-07-19T19:00:00Z', 'Final');
