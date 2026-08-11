export interface GlyphToken {
  base: string;
  features: string;
}

export function tokenize(cleanedInput: string): GlyphToken[] {
  if (!cleanedInput) return [];

  const tokens: GlyphToken[] = [];

  for (const part of cleanedInput.split('/')) {
    const pieces = part.split('.');
    if (pieces.length !== 2 || pieces[0].length === 0 || pieces[1].length === 0) continue;
    tokens.push({ base: pieces[0], features: pieces[1] });
  }

  return tokens;
}
