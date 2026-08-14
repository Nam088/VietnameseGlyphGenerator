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

  const onlyLettersSet = options.onlyLetters ? new Set(options.onlyLetters) : null;
  const onlyOutputsSet = options.onlyOutputs ? new Set(options.onlyOutputs) : null;

  const tokens = tokenize(cleanInput(input));
  const tokenCount = tokens.length;

  for (let i = 0; i < tokenCount; i++) {
    const { base, features } = tokens[i];
    const families = letterTable[base];
    if (!families) continue;
    if (onlyLettersSet && !onlyLettersSet.has(base)) continue;

    const baseGlyph = `${base}.${features}`;
    const familyCount = families.length;
    for (let f = 0; f < familyCount; f++) {
      const family = families[f];
      const variants = markGenerators[family](base, features, normalizedOptions);
      const variantCount = variants.length;
      for (let v = 0; v < variantCount; v++) {
        const variant = variants[v];
        if (onlyOutputsSet && !onlyOutputsSet.has(variant.output)) continue;
        result.addGlyph(baseGlyph, variant.output, variant.input);
      }
    }
  }

  return result;
}
