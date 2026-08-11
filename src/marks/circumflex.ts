import { Variant } from '../types';
import { NormalizedGlyphOptions } from '../options';

export function generateCircumflexCombinations(baseName: string, features: string, options: NormalizedGlyphOptions): Variant[] {
  const token = `${baseName}.${features}`;
  const circumflex = options.circumflexGlyph;

  return [
    { output: `${baseName}circumflex.${features}`, input: `${token}+${circumflex}` },
    { output: `${baseName}circumflexgrave.${features}`, input: `${token}+${circumflex}+${options.secondaryGraveGlyph}` },
    { output: `${baseName}circumflexacute.${features}`, input: `${token}+${circumflex}+${options.secondaryAcuteGlyph}` },
    { output: `${baseName}circumflextilde.${features}`, input: `${token}+${circumflex}+${options.secondaryTildeGlyph}` },
    { output: `${baseName}circumflexhoi.${features}`, input: `${token}+${circumflex}+${options.secondaryHookAboveGlyph}` },
    { output: `${baseName}circumflexdotbelow.${features}`, input: `${token}+${circumflex}+${options.dotBelowGlyph}` }
  ];
}
