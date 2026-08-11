import { describe, it, expect } from 'vitest';
import { normalizeOptions } from '../options';
import { generateCircumflexCombinations } from './circumflex';

const options = normalizeOptions({});

describe('generateCircumflexCombinations', () => {
  it('generates circumflex alone and combined with the secondary tone glyphs', () => {
    expect(generateCircumflexCombinations('A', 'ss01', options)).toEqual([
      { output: 'Acircumflex.ss01', input: 'A.ss01+circumflex' },
      { output: 'Acircumflexgrave.ss01', input: 'A.ss01+circumflex+grave' },
      { output: 'Acircumflexacute.ss01', input: 'A.ss01+circumflex+acute' },
      { output: 'Acircumflextilde.ss01', input: 'A.ss01+circumflex+tilde' },
      { output: 'Acircumflexhoi.ss01', input: 'A.ss01+circumflex+hookabovecomb' },
      { output: 'Acircumflexdotbelow.ss01', input: 'A.ss01+circumflex+dotbelowcomb' }
    ]);
  });
});
