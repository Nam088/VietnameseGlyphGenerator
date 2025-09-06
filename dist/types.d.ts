export interface GlyphOptions {
    characterStyle?: string;
    graveAccentGlyph?: string;
    acuteAccentGlyph?: string;
    tildeGlyph?: string;
    hookAboveGlyph?: string;
    dotBelowGlyph?: string;
    circumflexGlyph?: string;
    breveGlyph?: string;
    hornGlyphUppercase?: string;
    hornGlyphLowercase?: string;
    secondaryGraveGlyph?: string;
    secondaryAcuteGlyph?: string;
    secondaryTildeGlyph?: string;
    secondaryHookAboveGlyph?: string;
    dotlessIGlyph?: string;
    openTypeFeature?: string;
    dStrokeUppercaseGlyph?: string;
    dStrokeLowercaseGlyph?: string;
    shouldCreateDotlessI?: boolean;
    shouldCreateHorn?: boolean;
}
export interface GenerationResult {
    variants: Record<string, string>;
    toString(): string;
}
export declare class GenerationResultImpl implements GenerationResult {
    variants: Record<string, string>;
    constructor(variants?: Record<string, string>);
    addVariant(outputGlyph: string, inputPattern: string): void;
    toString(): string;
    getVariants(): string[];
    getInputPattern(outputGlyph: string): string | undefined;
}
export interface GlyphResult {
    [baseGlyph: string]: {
        [variant: string]: string;
    };
}
export interface GlyphGenerationResult {
    glyphs: GlyphResult;
    toString(): string;
    toJSON(): string;
    getGlyph(baseGlyph: string, outputGlyph?: string): string | Record<string, string> | undefined;
    getVariants(baseGlyph: string): string[];
    getAllBaseGlyphs(): string[];
    getInputPattern(baseGlyph: string, outputGlyph: string): string | undefined;
}
export declare class GlyphGenerationResultImpl implements GlyphGenerationResult {
    glyphs: GlyphResult;
    constructor(glyphs?: GlyphResult);
    toString(): string;
    toJSON(): string;
    getGlyph(baseGlyph: string, outputGlyph?: string): string | Record<string, string> | undefined;
    getVariants(baseGlyph: string): string[];
    getInputPattern(baseGlyph: string, outputGlyph: string): string | undefined;
    getAllBaseGlyphs(): string[];
    addGlyph(baseGlyph: string, variant: string, value: string): void;
    static fromString(glyphString: string): GlyphGenerationResultImpl;
}
export interface GlyphLists {
    listD: string[];
    listd: string[];
    listDcroat: string[];
    listdcroat: string[];
    listA: string[];
    listE: string[];
    listI: string[];
    listO: string[];
    listU: string[];
    listOhorn: string[];
    listUhorn: string[];
    listY: string[];
    lista: string[];
    liste: string[];
    listi: string[];
    listo: string[];
    listu: string[];
    listohorn: string[];
    listuhorn: string[];
    listy: string[];
    listdotlessi: string[];
}
export declare const CHARACTER_STYLES: string[];
export declare const GRAVE_ACCENT_GLYPHS: string[];
export declare const ACUTE_ACCENT_GLYPHS: string[];
export declare const TILDE_GLYPHS: string[];
export declare const HOOK_ABOVE_GLYPHS: string[];
export declare const DOT_BELOW_GLYPHS: string[];
export declare const CIRCUMFLEX_GLYPHS: string[];
export declare const BREVE_GLYPHS: string[];
export declare const HORN_GLYPHS: string[];
export declare const DOTLESS_I_GLYPHS: string[];
export declare const OPENTYPE_FEATURES: string[];
export declare const D_STROKE_GLYPHS: string[];
//# sourceMappingURL=types.d.ts.map