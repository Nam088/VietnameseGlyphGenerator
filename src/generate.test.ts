import { describe, it, expect } from 'vitest';
import { generateGlyphs } from './generate';

describe('generateGlyphs', () => {
  it('returns an empty result for empty input', () => {
    const result = generateGlyphs('', {});
    expect(result.getAllBaseGlyphs()).toEqual([]);
    expect(result.toString()).toBe('');
  });

  it('generates tone, circumflex and breve variants for a single A token', () => {
    const result = generateGlyphs('A.ss01', {});
    expect(result.getAllBaseGlyphs()).toEqual(['A.ss01']);
    expect(result.getVariants('A.ss01')).toEqual(
      expect.arrayContaining(['Agrave.ss01', 'Acircumflex.ss01', 'Abreve.ss01'])
    );
    expect(result.getInputPattern('A.ss01', 'Agrave.ss01')).toBe('A.ss01+grave');
  });

  it('generates variants for every token in a multi glyph input, in input order', () => {
    const result = generateGlyphs('A.ss01/D.ss01', {});
    expect(result.getAllBaseGlyphs()).toEqual(['A.ss01', 'D.ss01']);
    expect(result.getInputPattern('D.ss01', 'Dcroat.ss01')).toBe('D.ss01+hyphen.case');
  });

  it('skips a token whose base letter is not in the letter table', () => {
    const result = generateGlyphs('Z.ss01', {});
    expect(result.getAllBaseGlyphs()).toEqual([]);
  });

  it('omits the horn variant for O when shouldCreateHorn is false, but keeps tone and circumflex variants', () => {
    const result = generateGlyphs('O.ss01', { shouldCreateHorn: false });
    expect(result.getVariants('O.ss01')).not.toContain('Ohorn.ss01');
    expect(result.getVariants('O.ss01')).toContain('Ograve.ss01');
    expect(result.getVariants('O.ss01')).toContain('Ocircumflex.ss01');
  });

  it('omits the dotlessi substitution for i when shouldCreateDotlessI is false, but keeps the tone variants', () => {
    const result = generateGlyphs('i.ss01', { shouldCreateDotlessI: false });
    expect(result.getVariants('i.ss01')).not.toContain('dotlessi.ss01');
    expect(result.getVariants('i.ss01')).toContain('igrave.ss01');
  });
});
