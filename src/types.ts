export interface GlyphOptions {
  graveAccentGlyph?: string;
  acuteAccentGlyph?: string;
  tildeGlyph?: string;
  hookAboveGlyph?: string;
  dotBelowGlyph?: string;
  circumflexGlyph?: string;
  breveGlyph?: string;
  hornGlyphUppercase?: string;
  hornGlyphLowercase?: string;
  secondaryGraveGlyph?: string;
  secondaryAcuteGlyph?: string;
  secondaryTildeGlyph?: string;
  secondaryHookAboveGlyph?: string;
  dStrokeUppercaseGlyph?: string;
  dStrokeLowercaseGlyph?: string;
  shouldCreateDotlessI?: boolean;
  shouldCreateHorn?: boolean;
}

export interface Variant {
  output: string;
  input: string;
}

export interface GlyphGenerationResult {
  toString(): string;
  toJSON(): string;
  getGlyph(baseGlyph: string, outputGlyph?: string): string | Record<string, string> | undefined;
  getVariants(baseGlyph: string): string[];
  getAllBaseGlyphs(): string[];
  getInputPattern(baseGlyph: string, outputGlyph: string): string | undefined;
}
