import { Variant } from '../types';
import { NormalizedGlyphOptions } from '../options';

export function generateDotlessI(baseName: string, features: string, options: NormalizedGlyphOptions): Variant[] {
  const token = `${baseName}.${features}`;
  const dotlessBase = `dotlessi.${features}`;
  const variants: Variant[] = [];

  if (options.shouldCreateDotlessI) {
    variants.push({ output: dotlessBase, input: token });
  }

  variants.push(
    { output: `${baseName}grave.${features}`, input: `${dotlessBase}+${options.graveAccentGlyph}` },
    { output: `${baseName}acute.${features}`, input: `${dotlessBase}+${options.acuteAccentGlyph}` },
    { output: `${baseName}tilde.${features}`, input: `${dotlessBase}+${options.tildeGlyph}` },
    { output: `${baseName}hoi.${features}`, input: `${dotlessBase}+${options.hookAboveGlyph}` },
    { output: `${baseName}dotbelow.${features}`, input: `${token}+${options.dotBelowGlyph}` }
  );

  return variants;
}
