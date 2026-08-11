import { describe, it, expect } from 'vitest';
import { normalizeOptions } from '../options';
import { generateDotlessI } from './dotlessI';

describe('generateDotlessI', () => {
  it('adds the dotlessi substitution plus the tone variants when shouldCreateDotlessI is true', () => {
    const options = normalizeOptions({ shouldCreateDotlessI: true });
    expect(generateDotlessI('i', 'ss01', options)).toEqual([
      { output: 'dotlessi.ss01', input: 'i.ss01' },
      { output: 'igrave.ss01', input: 'dotlessi.ss01+grave' },
      { output: 'iacute.ss01', input: 'dotlessi.ss01+acute' },
      { output: 'itilde.ss01', input: 'dotlessi.ss01+tilde' },
      { output: 'ihoi.ss01', input: 'dotlessi.ss01+hookabovecomb' },
      { output: 'idotbelow.ss01', input: 'i.ss01+dotbelowcomb' }
    ]);
  });

  it('skips the dotlessi substitution but keeps the tone variants when shouldCreateDotlessI is false', () => {
    const options = normalizeOptions({ shouldCreateDotlessI: false });
    expect(generateDotlessI('i', 'ss01', options)).toEqual([
      { output: 'igrave.ss01', input: 'dotlessi.ss01+grave' },
      { output: 'iacute.ss01', input: 'dotlessi.ss01+acute' },
      { output: 'itilde.ss01', input: 'dotlessi.ss01+tilde' },
      { output: 'ihoi.ss01', input: 'dotlessi.ss01+hookabovecomb' },
      { output: 'idotbelow.ss01', input: 'i.ss01+dotbelowcomb' }
    ]);
  });
});
