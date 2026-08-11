import { Variant } from '../types';
import { NormalizedGlyphOptions } from '../options';

export function generateBasicToneMarks(baseName: string, features: string, options: NormalizedGlyphOptions): Variant[] {
  const token = `${baseName}.${features}`;

  return [
    { output: `${baseName}grave.${features}`, input: `${token}+${options.graveAccentGlyph}` },
    { output: `${baseName}acute.${features}`, input: `${token}+${options.acuteAccentGlyph}` },
    { output: `${baseName}tilde.${features}`, input: `${token}+${options.tildeGlyph}` },
    { output: `${baseName}hoi.${features}`, input: `${token}+${options.hookAboveGlyph}` },
    { output: `${baseName}dotbelow.${features}`, input: `${token}+${options.dotBelowGlyph}` }
  ];
}
