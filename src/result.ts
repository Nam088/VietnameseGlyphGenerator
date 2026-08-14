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
      const groups: string[] = [];
      const baseKeys = Object.keys(glyphs);
      const baseLen = baseKeys.length;

      for (let i = 0; i < baseLen; i++) {
        const variants = glyphs[baseKeys[i]];
        const variantKeys = Object.keys(variants);
        const vLen = variantKeys.length;
        if (vLen === 0) continue;

        const lines: string[] = new Array(vLen);
        for (let j = 0; j < vLen; j++) {
          const output = variantKeys[j];
          lines[j] = `${variants[output]}=${output}`;
        }
        groups.push(lines.join('\r\n'));
      }

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
