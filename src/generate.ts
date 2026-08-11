import { GlyphGenerationResult, GlyphOptions } from './types';
import { normalizeOptions } from './options';
import { cleanInput } from './parser/cleanInput';
import { tokenize } from './parser/tokenize';
import { letterTable } from './letters/letterTable';
import { markGenerators } from './letters/markFamilies';
import { createGlyphGenerationResult } from './result';

export function generateGlyphs(input: string, options: GlyphOptions = {}): GlyphGenerationResult {
  const normalizedOptions = normalizeOptions(options);
  const result = createGlyphGenerationResult();

  for (const { base, features } of tokenize(cleanInput(input))) {
    const families = letterTable[base];
    if (!families) continue;

    const baseGlyph = `${base}.${features}`;
    for (const family of families) {
      for (const variant of markGenerators[family](base, features, normalizedOptions)) {
        result.addGlyph(baseGlyph, variant.output, variant.input);
      }
    }
  }

  return result;
}
