import { describe, it, expect } from 'vitest';
import { createGlyphGenerationResult } from './result';

describe('createGlyphGenerationResult', () => {
  it('starts empty', () => {
    const result = createGlyphGenerationResult();
    expect(result.getAllBaseGlyphs()).toEqual([]);
    expect(result.toString()).toBe('');
    expect(result.toJSON()).toBe('{}');
  });

  it('stores and reads back variants for one base glyph', () => {
    const result = createGlyphGenerationResult();
    result.addGlyph('A.ss01', 'Agrave.ss01', 'A.ss01+grave');
    result.addGlyph('A.ss01', 'Aacute.ss01', 'A.ss01+acute');

    expect(result.getAllBaseGlyphs()).toEqual(['A.ss01']);
    expect(result.getVariants('A.ss01')).toEqual(['Agrave.ss01', 'Aacute.ss01']);
    expect(result.getInputPattern('A.ss01', 'Agrave.ss01')).toBe('A.ss01+grave');
    expect(result.getGlyph('A.ss01', 'Agrave.ss01')).toBe('A.ss01+grave');
    expect(result.getGlyph('A.ss01')).toEqual({ 'Agrave.ss01': 'A.ss01+grave', 'Aacute.ss01': 'A.ss01+acute' });
  });

  it('returns undefined for an unknown base glyph', () => {
    const result = createGlyphGenerationResult();
    expect(result.getGlyph('Z.ss01')).toBeUndefined();
    expect(result.getInputPattern('Z.ss01', 'Zgrave.ss01')).toBeUndefined();
    expect(result.getVariants('Z.ss01')).toEqual([]);
  });

  it('renders toString as input=output lines, blank line separated per base glyph', () => {
    const result = createGlyphGenerationResult();
    result.addGlyph('A.ss01', 'Agrave.ss01', 'A.ss01+grave');
    result.addGlyph('A.ss01', 'Aacute.ss01', 'A.ss01+acute');
    result.addGlyph('D.ss01', 'Dcroat.ss01', 'D.ss01+hyphen.case');

    expect(result.toString()).toBe(
      'A.ss01+grave=Agrave.ss01\r\nA.ss01+acute=Aacute.ss01\r\n\r\nD.ss01+hyphen.case=Dcroat.ss01'
    );
  });

  it('renders toJSON as the glyph map', () => {
    const result = createGlyphGenerationResult();
    result.addGlyph('A.ss01', 'Agrave.ss01', 'A.ss01+grave');

    expect(JSON.parse(result.toJSON())).toEqual({ 'A.ss01': { 'Agrave.ss01': 'A.ss01+grave' } });
  });
});
