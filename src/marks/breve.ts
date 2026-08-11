import { Variant } from '../types';
import { NormalizedGlyphOptions } from '../options';

export function generateBreveCombinations(baseName: string, features: string, options: NormalizedGlyphOptions): Variant[] {
  const token = `${baseName}.${features}`;
  const breve = options.breveGlyph;

  return [
    { output: `${baseName}breve.${features}`, input: `${token}+${breve}` },
    { output: `${baseName}brevegrave.${features}`, input: `${token}+${breve}+${options.secondaryGraveGlyph}` },
    { output: `${baseName}breveacute.${features}`, input: `${token}+${breve}+${options.secondaryAcuteGlyph}` },
    { output: `${baseName}brevetilde.${features}`, input: `${token}+${breve}+${options.secondaryTildeGlyph}` },
    { output: `${baseName}brevehoi.${features}`, input: `${token}+${breve}+${options.secondaryHookAboveGlyph}` },
    { output: `${baseName}brevedotbelow.${features}`, input: `${token}+${breve}+${options.dotBelowGlyph}` }
  ];
}
