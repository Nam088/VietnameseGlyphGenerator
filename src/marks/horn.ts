import { Variant } from '../types';
import { NormalizedGlyphOptions } from '../options';

const UPPERCASE_HORN_LETTERS = new Set(['O', 'U']);
const LOWERCASE_HORN_LETTERS = new Set(['o', 'u']);

export function generateHornCombinations(baseName: string, features: string, options: NormalizedGlyphOptions): Variant[] {
  if (!options.shouldCreateHorn) return [];

  const horn = UPPERCASE_HORN_LETTERS.has(baseName)
    ? options.hornGlyphUppercase
    : LOWERCASE_HORN_LETTERS.has(baseName)
      ? options.hornGlyphLowercase
      : '';
  const token = `${baseName}.${features}`;

  return [
    { output: `${baseName}horn.${features}`, input: `${token}+${horn}` },
    { output: `${baseName}horngrave.${features}`, input: `${token}+${horn}+${options.graveAccentGlyph}` },
    { output: `${baseName}hornacute.${features}`, input: `${token}+${horn}+${options.acuteAccentGlyph}` },
    { output: `${baseName}horntilde.${features}`, input: `${token}+${horn}+${options.tildeGlyph}` },
    { output: `${baseName}hornhoi.${features}`, input: `${token}+${horn}+${options.hookAboveGlyph}` },
    { output: `${baseName}horndotbelow.${features}`, input: `${token}+${horn}+${options.dotBelowGlyph}` }
  ];
}
