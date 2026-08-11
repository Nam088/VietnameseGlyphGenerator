import { describe, it, expect } from 'vitest';
import { normalizeOptions } from '../options';
import { generateBreveCombinations } from './breve';

const options = normalizeOptions({});

describe('generateBreveCombinations', () => {
  it('generates breve alone and combined with the secondary tone glyphs', () => {
    expect(generateBreveCombinations('A', 'ss01', options)).toEqual([
      { output: 'Abreve.ss01', input: 'A.ss01+breve' },
      { output: 'Abrevegrave.ss01', input: 'A.ss01+breve+grave' },
      { output: 'Abreveacute.ss01', input: 'A.ss01+breve+acute' },
      { output: 'Abrevetilde.ss01', input: 'A.ss01+breve+tilde' },
      { output: 'Abrevehoi.ss01', input: 'A.ss01+breve+hookabovecomb' },
      { output: 'Abrevedotbelow.ss01', input: 'A.ss01+breve+dotbelowcomb' }
    ]);
  });
});
