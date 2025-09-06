"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.D_STROKE_GLYPHS = exports.OPENTYPE_FEATURES = exports.DOTLESS_I_GLYPHS = exports.HORN_GLYPHS = exports.BREVE_GLYPHS = exports.CIRCUMFLEX_GLYPHS = exports.DOT_BELOW_GLYPHS = exports.HOOK_ABOVE_GLYPHS = exports.TILDE_GLYPHS = exports.ACUTE_ACCENT_GLYPHS = exports.GRAVE_ACCENT_GLYPHS = exports.CHARACTER_STYLES = exports.GlyphGenerationResultImpl = exports.GenerationResultImpl = void 0;
class GenerationResultImpl {
    constructor(variants = {}) {
        this.variants = {};
        this.variants = variants;
    }
    addVariant(outputGlyph, inputPattern) {
        this.variants[outputGlyph] = inputPattern;
    }
    toString() {
        const results = [];
        for (const [outputGlyph, inputPattern] of Object.entries(this.variants)) {
            results.push(`${inputPattern}=${outputGlyph}`);
        }
        return results.join('\r\n');
    }
    getVariants() {
        return Object.keys(this.variants);
    }
    getInputPattern(outputGlyph) {
        return this.variants[outputGlyph];
    }
}
exports.GenerationResultImpl = GenerationResultImpl;
class GlyphGenerationResultImpl {
    constructor(glyphs = {}) {
        this.glyphs = {};
        this.glyphs = glyphs;
    }
    // Convert to traditional string format for backward compatibility
    toString() {
        const result = [];
        for (const [, variants] of Object.entries(this.glyphs)) {
            const variantStrings = [];
            for (const [outputGlyph, inputPattern] of Object.entries(variants)) {
                // Convert back to input=output format
                variantStrings.push(`${inputPattern}=${outputGlyph}`);
            }
            if (variantStrings.length > 0) {
                result.push(variantStrings.join('\r\n'));
            }
        }
        return result.join('\r\n\r\n');
    }
    // JSON representation
    toJSON() {
        return JSON.stringify(this.glyphs, null, 2);
    }
    // Get specific glyph or all variants
    getGlyph(baseGlyph, outputGlyph) {
        const glyphData = this.glyphs[baseGlyph];
        if (!glyphData)
            return undefined;
        if (outputGlyph) {
            return glyphData[outputGlyph]; // Returns the input pattern
        }
        return glyphData;
    }
    // Get all output glyph names for a base glyph
    getVariants(baseGlyph) {
        const glyphData = this.glyphs[baseGlyph];
        return glyphData ? Object.keys(glyphData) : []; // Returns output glyph names
    }
    // Get input pattern for a specific output glyph
    getInputPattern(baseGlyph, outputGlyph) {
        const glyphData = this.glyphs[baseGlyph];
        return glyphData ? glyphData[outputGlyph] : undefined;
    }
    // Get all base glyph names
    getAllBaseGlyphs() {
        return Object.keys(this.glyphs);
    }
    // Add glyph data
    addGlyph(baseGlyph, variant, value) {
        if (!this.glyphs[baseGlyph]) {
            this.glyphs[baseGlyph] = {};
        }
        this.glyphs[baseGlyph][variant] = value;
    }
    // Parse from traditional string format
    static fromString(glyphString) {
        const result = new GlyphGenerationResultImpl();
        if (!glyphString.trim())
            return result;
        // Split by double line breaks to get glyph groups
        const glyphGroups = glyphString.split(/\r?\n\r?\n/);
        for (const group of glyphGroups) {
            if (!group.trim())
                continue;
            const lines = group.split(/\r?\n/);
            for (const line of lines) {
                if (!line.trim())
                    continue;
                // Parse format: "input+accent=output"
                const equalIndex = line.indexOf('=');
                if (equalIndex > 0) {
                    const leftSide = line.substring(0, equalIndex);
                    const rightSide = line.substring(equalIndex + 1);
                    // Extract base glyph from input (before first +)
                    const plusIndex = leftSide.indexOf('+');
                    const baseGlyph = plusIndex > 0 ? leftSide.substring(0, plusIndex) : leftSide;
                    result.addGlyph(baseGlyph, leftSide, rightSide);
                }
            }
        }
        return result;
    }
}
exports.GlyphGenerationResultImpl = GlyphGenerationResultImpl;
exports.CHARACTER_STYLES = ["A", "E", "I", "O", "U", "Y", "i", "Ư,Ơ", "D,d"];
exports.GRAVE_ACCENT_GLYPHS = ["grave", "gravecomb", "grave.ss01", "grave.ss02", "gravecomb.ss01", "gravecomb.ss02"];
exports.ACUTE_ACCENT_GLYPHS = ["acute", "acutecomb", "acute.ss01", "acute.ss02", "acutecomb.ss01", "acutecomb.ss02"];
exports.TILDE_GLYPHS = ["tilde", "tildecomb", "tilde.ss01", "tilde.ss02", "tildecomb.ss01", "tildecomb.ss02"];
exports.HOOK_ABOVE_GLYPHS = ["hookabovecomb.case", "hookabovecomb", "hookabovecomb.case.ss01", "hookabovecomb.case.ss02", "hookabovecomb.ss01", "hookabovecomb.ss02"];
exports.DOT_BELOW_GLYPHS = ["dotbelowcomb.case", "dotbelowcomb", "dotbelowcomb.case.ss01", "dotbelowcomb.case.ss02", "dotbelowcomb.ss01", "dotbelowcomb.ss02"];
exports.CIRCUMFLEX_GLYPHS = ["circumflex", "circumflexcomb", "circumflex.ss01", "circumflex.ss02", "circumflexcomb.ss01", "circumflexcomb.ss02"];
exports.BREVE_GLYPHS = ["breve", "brevecomb", "breve.ss01", "breve.ss02", "brevecomb.ss01", "brevecomb.ss02"];
exports.HORN_GLYPHS = ["horn", "horncomb", "horn.ss01", "horn.ss01", "horncomb.ss01", "horncomb.ss02", "horncomb.ss03"];
exports.DOTLESS_I_GLYPHS = ["dotlessi", "dotlessi.ss01", "dotlessi.ss02", "dotlessi.ss03", "dotlessi.ss04", "dotlessi.ss05"];
exports.OPENTYPE_FEATURES = ["ss01", "ss02", "ss03", "ss04", "ss05", "ss06", "ss07", "ss08", "ss09", "ss10"];
exports.D_STROKE_GLYPHS = ["hyphen.case", "hyphen.sc1", "hyphen.case.ss01", "hyphen.case.ss02", "hyphen.sc1.ss01", "hyphen.sc1.ss02"];
//# sourceMappingURL=types.js.map