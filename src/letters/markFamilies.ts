import { Variant } from '../types';
import { NormalizedGlyphOptions } from '../options';
import { MarkFamilyName } from './letterTable';
import { generateBasicToneMarks } from '../marks/toneMarks';
import { generateCircumflexCombinations } from '../marks/circumflex';
import { generateBreveCombinations } from '../marks/breve';
import { generateHornCombinations } from '../marks/horn';
import { generateDStroke } from '../marks/dStroke';
import { generateDotlessI } from '../marks/dotlessI';

type MarkGenerator = (baseName: string, features: string, options: NormalizedGlyphOptions) => Variant[];

export const markGenerators: Record<MarkFamilyName, MarkGenerator> = {
  toneMarks: generateBasicToneMarks,
  circumflex: generateCircumflexCombinations,
  breve: generateBreveCombinations,
  horn: generateHornCombinations,
  dStroke: generateDStroke,
  dotlessI: generateDotlessI
};
