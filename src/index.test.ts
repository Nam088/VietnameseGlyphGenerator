import { describe, it, expect } from 'vitest';
import { generateGlyphs } from './index';
import { GlyphOptions } from './types';

describe('generateGlyphs (public API)', () => {
  it('is exported from the package entry point and produces the expected shape', () => {
    const options: GlyphOptions = {
      shouldCreateHorn: true,
      shouldCreateDotlessI: true
    };

    const result = generateGlyphs('A.ss01/O.ss01', options);

    expect(result.getAllBaseGlyphs()).toEqual(['A.ss01', 'O.ss01']);
    expect(result.getInputPattern('A.ss01', 'Agrave.ss01')).toBe('A.ss01+grave');
    expect(result.getInputPattern('O.ss01', 'Ohorn.ss01')).toBe('O.ss01+horn');
    expect(typeof result.toString()).toBe('string');
    expect(typeof result.toJSON()).toBe('string');
  });

  it('returns an empty result for an empty string', () => {
    const result = generateGlyphs('', {});
    expect(result.toString()).toBe('');
  });
});
