import { describe, it, expect } from 'vitest';
import { normalizeOptions } from '../options';
import { generateBasicToneMarks } from './toneMarks';

const options = normalizeOptions({});

describe('generateBasicToneMarks', () => {
  it('generates grave, acute, tilde, hoi and dotbelow variants', () => {
    expect(generateBasicToneMarks('A', 'ss01', options)).toEqual([
      { output: 'Agrave.ss01', input: 'A.ss01+grave' },
      { output: 'Aacute.ss01', input: 'A.ss01+acute' },
      { output: 'Atilde.ss01', input: 'A.ss01+tilde' },
      { output: 'Ahoi.ss01', input: 'A.ss01+hookabovecomb' },
      { output: 'Adotbelow.ss01', input: 'A.ss01+dotbelowcomb' }
    ]);
  });
});
