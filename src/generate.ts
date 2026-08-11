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
    if (options.onlyLetters && !options.onlyLetters.includes(base)) continue;

    const baseGlyph = `${base}.${features}`;
    for (const family of families) {
      for (const variant of markGenerators[family](base, features, normalizedOptions)) {
        if (options.onlyOutputs && !options.onlyOutputs.includes(variant.output)) continue;
        result.addGlyph(baseGlyph, variant.output, variant.input);
      }
    }
  }

  return result;
}
