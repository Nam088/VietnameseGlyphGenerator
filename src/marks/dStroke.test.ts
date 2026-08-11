import { describe, it, expect } from 'vitest';
import { normalizeOptions } from '../options';
import { generateDStroke } from './dStroke';

const options = normalizeOptions({});

describe('generateDStroke', () => {
  it('uses the uppercase stroke glyph for D', () => {
    expect(generateDStroke('D', 'ss01', options)).toEqual([
      { output: 'Dcroat.ss01', input: 'D.ss01+hyphen.case' }
    ]);
  });

  it('uses the lowercase stroke glyph for d', () => {
    expect(generateDStroke('d', 'ss01', options)).toEqual([
      { output: 'dcroat.ss01', input: 'd.ss01+hyphen.case' }
    ]);
  });
});
