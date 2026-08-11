import { describe, it, expect } from 'vitest';
import { normalizeOptions } from '../options';
import { markGenerators } from './markFamilies';
import { generateBasicToneMarks } from '../marks/toneMarks';
import { generateDStroke } from '../marks/dStroke';

const options = normalizeOptions({});

describe('markGenerators', () => {
  it('dispatches toneMarks to generateBasicToneMarks', () => {
    expect(markGenerators.toneMarks('A', 'ss01', options)).toEqual(generateBasicToneMarks('A', 'ss01', options));
  });

  it('dispatches dStroke to generateDStroke', () => {
    expect(markGenerators.dStroke('D', 'ss01', options)).toEqual(generateDStroke('D', 'ss01', options));
  });

  it('has one entry per mark family name used in letterTable', () => {
    expect(Object.keys(markGenerators).sort()).toEqual(
      ['breve', 'circumflex', 'dStroke', 'dotlessI', 'horn', 'toneMarks'].sort()
    );
  });
});
