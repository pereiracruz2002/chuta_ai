// Mapeamento de nomes de times: API-Football (inglês) -> banco de dados (português)
// A chave é o nome usado na API-Football, o valor é o nome usado no nosso seed.sql

export const TEAM_NAME_MAP: Record<string, string> = {
  // Grupo A
  "Mexico": "Mexico",
  "South Africa": "Africa do Sul",
  "South Korea": "Coreia do Sul",
  "Czech Republic": "Republica Tcheca",

  // Grupo B
  "Canada": "Canada",
  "Bosnia and Herzegovina": "Bosnia e Herzegovina",
  "Bosnia And Herzegovina": "Bosnia e Herzegovina",
  "Qatar": "Catar",
  "Switzerland": "Suica",

  // Grupo C
  "Brazil": "Brasil",
  "Morocco": "Marrocos",
  "Haiti": "Haiti",
  "Scotland": "Escocia",

  // Grupo D
  "United States": "Estados Unidos",
  "USA": "Estados Unidos",
  "Paraguay": "Paraguai",
  "Australia": "Australia",
  "Turkey": "Turquia",

  // Grupo E
  "Germany": "Alemanha",
  "Curacao": "Curacao",
  "Curaçao": "Curacao",
  "Ivory Coast": "Costa do Marfim",
  "Cote D'Ivoire": "Costa do Marfim",
  "Ecuador": "Equador",

  // Grupo F
  "Netherlands": "Holanda",
  "Japan": "Japao",
  "Sweden": "Suecia",
  "Tunisia": "Tunisia",

  // Grupo G
  "Belgium": "Belgica",
  "Egypt": "Egito",
  "Iran": "Ira",
  "New Zealand": "Nova Zelandia",

  // Grupo H
  "Spain": "Espanha",
  "Cape Verde": "Cabo Verde",
  "Cape Verde Islands": "Cabo Verde",
  "Saudi Arabia": "Arabia Saudita",
  "Uruguay": "Uruguai",

  // Grupo I
  "France": "Franca",
  "Senegal": "Senegal",
  "Iraq": "Iraque",
  "Norway": "Noruega",

  // Grupo J
  "Argentina": "Argentina",
  "Algeria": "Argelia",
  "Austria": "Austria",
  "Jordan": "Jordania",

  // Grupo K
  "Portugal": "Portugal",
  "DR Congo": "RD Congo",
  "Congo DR": "RD Congo",
  "Uzbekistan": "Uzbequistao",
  "Colombia": "Colombia",

  // Grupo L
  "England": "Inglaterra",
  "Croatia": "Croacia",
  "Ghana": "Ghana",
  "Panama": "Panama",
};

// Função para converter nome da API para nome do banco
export function mapTeamName(apiName: string): string {
  return TEAM_NAME_MAP[apiName] || apiName;
}
