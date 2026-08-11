import { GlyphGenerationResult } from './types';

export interface MutableGlyphGenerationResult extends GlyphGenerationResult {
  addGlyph(baseGlyph: string, variant: string, value: string): void;
}

export function createGlyphGenerationResult(): MutableGlyphGenerationResult {
  const glyphs: Record<string, Record<string, string>> = {};

  return {
    addGlyph(baseGlyph, variant, value) {
      if (!glyphs[baseGlyph]) glyphs[baseGlyph] = {};
      glyphs[baseGlyph][variant] = value;
    },

    toString() {
      const groups = Object.values(glyphs)
        .map(variants => Object.entries(variants).map(([output, input]) => `${input}=${output}`).join('\r\n'))
        .filter(group => group.length > 0);

      return groups.join('\r\n\r\n');
    },

    toJSON() {
      return JSON.stringify(glyphs, null, 2);
    },

    getGlyph(baseGlyph, outputGlyph) {
      const data = glyphs[baseGlyph];
      if (!data) return undefined;
      return outputGlyph ? data[outputGlyph] : data;
    },

    getVariants(baseGlyph) {
      return glyphs[baseGlyph] ? Object.keys(glyphs[baseGlyph]) : [];
    },

    getInputPattern(baseGlyph, outputGlyph) {
      return glyphs[baseGlyph]?.[outputGlyph];
    },

    getAllBaseGlyphs() {
      return Object.keys(glyphs);
    }
  };
}
