import { describe, it, expect } from 'vitest';
import { normalizeOptions } from './options';

describe('normalizeOptions', () => {
  it('fills every field with its default when options is empty', () => {
    const result = normalizeOptions({});
    expect(result).toEqual({
      graveAccentGlyph: 'grave',
      acuteAccentGlyph: 'acute',
      tildeGlyph: 'tilde',
      hookAboveGlyph: 'hookabovecomb',
      dotBelowGlyph: 'dotbelowcomb',
      circumflexGlyph: 'circumflex',
      breveGlyph: 'breve',
      hornGlyphUppercase: 'horn',
      hornGlyphLowercase: 'horn',
      secondaryGraveGlyph: 'grave',
      secondaryAcuteGlyph: 'acute',
      secondaryTildeGlyph: 'tilde',
      secondaryHookAboveGlyph: 'hookabovecomb',
      dStrokeUppercaseGlyph: 'hyphen.case',
      dStrokeLowercaseGlyph: 'hyphen.case',
      shouldCreateDotlessI: true,
      shouldCreateHorn: true
    });
  });

  it('keeps explicit values instead of defaults', () => {
    const result = normalizeOptions({ graveAccentGlyph: 'gravecomb', shouldCreateHorn: false });
    expect(result.graveAccentGlyph).toBe('gravecomb');
    expect(result.shouldCreateHorn).toBe(false);
  });

  it('falls back secondary tone glyphs to the primary ones when only primary is set', () => {
    const result = normalizeOptions({ acuteAccentGlyph: 'acutecomb' });
    expect(result.secondaryAcuteGlyph).toBe('acutecomb');
  });

  it('keeps an explicit secondary value even when primary is also set', () => {
    const result = normalizeOptions({ acuteAccentGlyph: 'acutecomb', secondaryAcuteGlyph: 'acute.ss02' });
    expect(result.secondaryAcuteGlyph).toBe('acute.ss02');
  });
});
