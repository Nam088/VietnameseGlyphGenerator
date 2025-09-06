"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const index_1 = require("./index");
(0, vitest_1.describe)('generateGlyph', () => {
    (0, vitest_1.it)('returns deterministic values', () => {
        const a = (0, index_1.generateGlyph)('Nguyen');
        const b = (0, index_1.generateGlyph)('Nguyen');
        (0, vitest_1.expect)(a).toBe(b);
    });
    (0, vitest_1.it)('respects uppercase option', () => {
        const low = (0, index_1.generateGlyph)('Tran');
        const up = (0, index_1.generateGlyph)('Tran', { uppercase: true });
        (0, vitest_1.expect)(up).toBe(low.toUpperCase());
    });
    (0, vitest_1.it)('handles empty input', () => {
        const g = (0, index_1.generateGlyph)('');
        (0, vitest_1.expect)(typeof g).toBe('string');
        (0, vitest_1.expect)(g.length).toBeGreaterThan(0);
    });
});
(0, vitest_1.describe)('VietnameseGlyphGenerator', () => {
    let generator;
    (0, vitest_1.beforeEach)(() => {
        generator = new index_1.VietnameseGlyphGenerator();
    });
    (0, vitest_1.it)('should create instance', () => {
        (0, vitest_1.expect)(generator).toBeInstanceOf(index_1.VietnameseGlyphGenerator);
    });
    (0, vitest_1.it)('should generate glyphs for Vietnamese characters', () => {
        const options = {
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
        (0, vitest_1.expect)(result).toBeTruthy();
        (0, vitest_1.expect)(result.toString()).toContain('grave');
        (0, vitest_1.expect)(result.toString()).toContain('acute');
        (0, vitest_1.expect)(result.toString()).toContain('tilde');
    });
    (0, vitest_1.it)('should filter I glyphs correctly', () => {
        const result = generator.filterI('i.ss01/i.ss02');
        (0, vitest_1.expect)(result).toBeTruthy();
        (0, vitest_1.expect)(result).toContain('dotlessi');
    });
    (0, vitest_1.it)('should filter horn glyphs correctly', () => {
        const options = {
            hornGlyphUppercase: 'horn',
            hornGlyphLowercase: 'horn'
        };
        const result = generator.filterHorn('O.ss01/U.ss01', options, true);
        (0, vitest_1.expect)(result).toBeTruthy();
        (0, vitest_1.expect)(result).toContain('horn');
    });
    (0, vitest_1.it)('should handle empty input', () => {
        const generator = new index_1.VietnameseGlyphGenerator();
        const emptyOptions = {};
        const result = generator.generateGlyphs('', emptyOptions);
        (0, vitest_1.expect)(result.toString()).toBe('');
    });
    (0, vitest_1.it)('should handle single glyph input', () => {
        const options = {
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
        (0, vitest_1.expect)(result).toBeTruthy();
    });
    (0, vitest_1.it)('should work with modern property names', () => {
        const modernOptions = {
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
        (0, vitest_1.expect)(result).toBeTruthy();
        (0, vitest_1.expect)(result.toString()).toContain('grave');
        (0, vitest_1.expect)(result.toString()).toContain('acute');
    });
    (0, vitest_1.it)('should return structured result with new API', () => {
        const generator = new index_1.VietnameseGlyphGenerator();
        const structuredOptions = {
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
        (0, vitest_1.expect)(result.getAllBaseGlyphs()).toContain('A.ss01');
        (0, vitest_1.expect)(result.getVariants('A.ss01').length).toBeGreaterThan(0);
        (0, vitest_1.expect)(result.getInputPattern('A.ss01', 'Agrave.ss01')).toBe('A.ss01+grave');
        // Test conversion methods
        (0, vitest_1.expect)(typeof result.toString()).toBe('string');
        (0, vitest_1.expect)(typeof result.toJSON()).toBe('string');
        // Test backward compatibility
        const stringResult = generator.generateGlyphsAsString('A.ss01', structuredOptions);
        (0, vitest_1.expect)(stringResult).toBe(result.toString());
    });
});
//# sourceMappingURL=index.test.js.map