export interface GlyphToken {
  base: string;
  features: string;
}

export function tokenize(cleanedInput: string): GlyphToken[] {
  if (!cleanedInput) return [];

  const tokens: GlyphToken[] = [];
  const parts = cleanedInput.split('/');
  const len = parts.length;

  for (let i = 0; i < len; i++) {
    const part = parts[i];
    const dotIdx = part.indexOf('.');
    if (dotIdx > 0 && dotIdx < part.length - 1 && part.indexOf('.', dotIdx + 1) === -1) {
      tokens.push({
        base: part.slice(0, dotIdx),
        features: part.slice(dotIdx + 1)
      });
    }
  }

  return tokens;
}
