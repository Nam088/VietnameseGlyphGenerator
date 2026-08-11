import { describe, it, expect } from 'vitest';
import { normalizeOptions } from '../options';
import { generateHornCombinations } from './horn';

const options = normalizeOptions({});

describe('generateHornCombinations', () => {
  it('uses the uppercase horn glyph for O and combines it with the primary tone glyphs', () => {
    expect(generateHornCombinations('O', 'ss01', options)).toEqual([
      { output: 'Ohorn.ss01', input: 'O.ss01+horn' },
      { output: 'Ohorngrave.ss01', input: 'O.ss01+horn+grave' },
      { output: 'Ohornacute.ss01', input: 'O.ss01+horn+acute' },
      { output: 'Ohorntilde.ss01', input: 'O.ss01+horn+tilde' },
      { output: 'Ohornhoi.ss01', input: 'O.ss01+horn+hookabovecomb' },
      { output: 'Ohorndotbelow.ss01', input: 'O.ss01+horn+dotbelowcomb' }
    ]);
  });

  it('uses the lowercase horn glyph for u', () => {
    const variants = generateHornCombinations('u', 'ss02', normalizeOptions({ hornGlyphLowercase: 'horn.alt' }));
    expect(variants[0]).toEqual({ output: 'uhorn.ss02', input: 'u.ss02+horn.alt' });
  });

  it('returns no variants when shouldCreateHorn is false', () => {
    expect(generateHornCombinations('O', 'ss01', normalizeOptions({ shouldCreateHorn: false }))).toEqual([]);
  });
});
