import { Variant } from '../types';
import { NormalizedGlyphOptions } from '../options';

export function generateDStroke(baseName: string, features: string, options: NormalizedGlyphOptions): Variant[] {
  const dcroat = baseName === 'D' ? options.dStrokeUppercaseGlyph : options.dStrokeLowercaseGlyph;

  return [
    { output: `${baseName}croat.${features}`, input: `${baseName}.${features}+${dcroat}` }
  ];
}
