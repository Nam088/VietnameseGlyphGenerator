import { describe, it, expect, beforeEach } from 'vitest'
import { generateGlyph, VietnameseGlyphGenerator } from './index'
import { GlyphOptions } from './types'

describe('generateGlyph', () => {
  it('returns deterministic values', () => {
    const a = generateGlyph('Nguyen')
    const b = generateGlyph('Nguyen')
    expect(a).toBe(b)
  })

  it('respects uppercase option', () => {
    const low = generateGlyph('Tran')
    const up = generateGlyph('Tran', { uppercase: true })
    expect(up).toBe(low.toUpperCase())
  })

  it('handles empty input', () => {
    const g = generateGlyph('')
    expect(typeof g).toBe('string')
    expect(g.length).toBeGreaterThan(0)
  })
})

describe('VietnameseGlyphGenerator', () => {
  let generator: VietnameseGlyphGenerator;

  beforeEach(() => {
    generator = new VietnameseGlyphGenerator();
  });

  it('should create instance', () => {
    expect(generator).toBeInstanceOf(VietnameseGlyphGenerator);
  });

  it('should generate glyphs for Vietnamese characters', () => {
    const options: GlyphOptions = {
      characterStyle: 'A',
      graveAccentGlyph: 'grave',
      acuteAccentGlyph: 'acute',
      tildeGlyph: 'tilde',
      hookAboveGlyph: 'hookabovecomb',
      dotBelowGlyph: 'dotbelowcomb',
      circumflexGlyph: 'circumflex',
      breveGlyph: 'breve',
      hornGlyphUppercase: 'horn',
      secondaryGraveGlyph: 'grave',
      secondaryAcuteGlyph: 'acute',
      secondaryTildeGlyph: 'tilde',
      secondaryHookAboveGlyph: 'hookabovecomb',
      dotlessIGlyph: 'dotlessi',
      openTypeFeature: 'ss01',
      hornGlyphLowercase: 'horn',
      dStrokeUppercaseGlyph: 'hyphen.case',
      dStrokeLowercaseGlyph: 'hyphen.case',
      shouldCreateDotlessI: false,
      shouldCreateHorn: false
    };

    const result = generator.generateGlyphs('A.ss01/E.ss01', options);
    expect(result).toBeTruthy();
    expect(result.toString()).toContain('grave');
    expect(result.toString()).toContain('acute');
    expect(result.toString()).toContain('tilde');
  });

  it('should filter I glyphs correctly', () => {
    const result = generator.filterI('i.ss01/i.ss02');
    expect(result).toBeTruthy();
    expect(result).toContain('dotlessi');
  });

  it('should filter horn glyphs correctly', () => {
    const options: GlyphOptions = {
      hornGlyphUppercase: 'horn',
      hornGlyphLowercase: 'horn'
    };
    
    const result = generator.filterHorn('O.ss01/U.ss01', options, true);
    expect(result).toBeTruthy();
    expect(result).toContain('horn');
  });

  it('should handle empty input', () => {
    const generator = new VietnameseGlyphGenerator();
    const emptyOptions: GlyphOptions = {};
    const result = generator.generateGlyphs('', emptyOptions);
    expect(result.toString()).toBe('');
  });

  it('should handle single glyph input', () => {
    const options: GlyphOptions = {
      characterStyle: 'A',
      graveAccentGlyph: 'grave',
      acuteAccentGlyph: 'acute',
      tildeGlyph: 'tilde',
      hookAboveGlyph: 'hookabovecomb',
      dotBelowGlyph: 'dotbelowcomb',
      circumflexGlyph: 'circumflex',
      breveGlyph: 'breve',
      openTypeFeature: 'ss01'
    };

    const result = generator.generateGlyphs('A.ss01', options);
    expect(result).toBeTruthy();
  });

  it('should work with modern property names', () => {
    const modernOptions: GlyphOptions = {
      characterStyle: 'A',
      graveAccentGlyph: 'grave',
      acuteAccentGlyph: 'acute',
      tildeGlyph: 'tilde',
      hookAboveGlyph: 'hookabovecomb',
      dotBelowGlyph: 'dotbelowcomb',
      circumflexGlyph: 'circumflex',
      breveGlyph: 'breve',
      hornGlyphUppercase: 'horn',
      hornGlyphLowercase: 'horn',
      shouldCreateDotlessI: true,
      shouldCreateHorn: true
    };

    const result = generator.generateGlyphs('A.ss01', modernOptions);
    expect(result).toBeTruthy();
    expect(result.toString()).toContain('grave');
    expect(result.toString()).toContain('acute');
  });

  it('should return structured result with new API', () => {
    const generator = new VietnameseGlyphGenerator();
    const structuredOptions: GlyphOptions = {
      characterStyle: 'A',
      graveAccentGlyph: 'grave',
      acuteAccentGlyph: 'acute',
      tildeGlyph: 'tilde',
      hookAboveGlyph: 'hookabovecomb',
      dotBelowGlyph: 'dotbelowcomb',
      circumflexGlyph: 'circumflex',
      breveGlyph: 'breve',
      openTypeFeature: 'ss01',
      shouldCreateDotlessI: true,
      shouldCreateHorn: true
    };

    const result = generator.generateGlyphs('A.ss01', structuredOptions);
    
    // Test structured access
    expect(result.getAllBaseGlyphs()).toContain('A.ss01');
    expect(result.getVariants('A.ss01').length).toBeGreaterThan(0);
    expect(result.getInputPattern('A.ss01', 'Agrave.ss01')).toBe('A.ss01+grave');
    
    // Test conversion methods
    expect(typeof result.toString()).toBe('string');
    expect(typeof result.toJSON()).toBe('string');
    
    // Test backward compatibility
    const stringResult = generator.generateGlyphsAsString('A.ss01', structuredOptions);
    expect(stringResult).toBe(result.toString());
  });
});
