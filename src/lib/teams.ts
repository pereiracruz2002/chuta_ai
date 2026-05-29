/**
 * Mapping of team names (as stored in the database) to ISO 3166-1 alpha-2 country codes
 * Used to display flags via flagcdn.com
 * Copa do Mundo 2026 - 48 selecoes
 */
export const teamToCountryCode: Record<string, string> = {
  // Grupo A
  "Mexico": "mx",
  "Africa do Sul": "za",
  "Coreia do Sul": "kr",
  "Republica Tcheca": "cz",

  // Grupo B
  "Canada": "ca",
  "Bosnia e Herzegovina": "ba",
  "Catar": "qa",
  "Suica": "ch",

  // Grupo C
  "Brasil": "br",
  "Marrocos": "ma",
  "Haiti": "ht",
  "Escocia": "gb-sct",

  // Grupo D
  "Estados Unidos": "us",
  "Paraguai": "py",
  "Australia": "au",
  "Turquia": "tr",

  // Grupo E
  "Alemanha": "de",
  "Curacao": "cw",
  "Costa do Marfim": "ci",
  "Equador": "ec",

  // Grupo F
  "Holanda": "nl",
  "Japao": "jp",
  "Suecia": "se",
  "Tunisia": "tn",

  // Grupo G
  "Belgica": "be",
  "Egito": "eg",
  "Ira": "ir",
  "Nova Zelandia": "nz",

  // Grupo H
  "Espanha": "es",
  "Cabo Verde": "cv",
  "Arabia Saudita": "sa",
  "Uruguai": "uy",

  // Grupo I
  "Franca": "fr",
  "Senegal": "sn",
  "Iraque": "iq",
  "Noruega": "no",

  // Grupo J
  "Argentina": "ar",
  "Argelia": "dz",
  "Austria": "at",
  "Jordania": "jo",

  // Grupo K
  "Portugal": "pt",
  "RD Congo": "cd",
  "Uzbequistao": "uz",
  "Colombia": "co",

  // Grupo L
  "Inglaterra": "gb-eng",
  "Croacia": "hr",
  "Ghana": "gh",
  "Panama": "pa",
};

/**
 * Get the flag image URL for a team
 * Uses flagcdn.com (free, no API key needed)
 */
export function getFlagUrl(teamName: string, size: number = 48): string {
  const code = teamToCountryCode[teamName];
  if (!code) {
    // Return a generic placeholder
    return `https://flagcdn.com/${size}x${Math.round(size * 0.75)}/xx.png`;
  }
  // flagcdn uses width x height format
  const width = size;
  const height = Math.round(size * 0.75);
  return `https://flagcdn.com/${width}x${height}/${code}.png`;
}

/**
 * Get the country code for emoji flag rendering
 */
export function getCountryCode(teamName: string): string | null {
  return teamToCountryCode[teamName] || null;
}
