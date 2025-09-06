/**
 * Vietnamese Glyph Generator Library
 * Converts C# font glyph generation logic to TypeScript
 */
import { GlyphOptions, GlyphGenerationResult } from './types';
export { GlyphOptions, GlyphLists, GlyphGenerationResult, GlyphGenerationResultImpl, GenerationResult, GenerationResultImpl } from './types';
export type Options = {
    uppercase?: boolean;
};
export declare class VietnameseGlyphGenerator {
    private glyphCategories;
    private normalizeOptions;
    generateGlyphs(glyphsInput: string, options: GlyphOptions): GlyphGenerationResult;
    private processBatchGlyphs;
    private addGlyphToResult;
    private parseAndAddGlyphOutput;
    generateGlyphsAsString(glyphsInput: string, options: GlyphOptions): string;
    private processGlyphByType;
    private processSingleGlyph;
    private generateBasicToneMarks;
    private generateCircumflexCombinations;
    private generateBreveCombinations;
    private generateHornCombinations;
    private generateBasicHornGlyph;
    private generateDotlessIWithTones;
    private generateDStroke;
    private filterGlyphs;
    private readonly categoryMap;
    private categorizeGlyph;
    private filterRender;
    private addList;
    private deleteList;
    private parseGlyphInput;
    filterI(glyphsInput: string): string;
    filterHorn(glyphsInput: string, options: GlyphOptions, createHorn: boolean): string;
}
/**
 * Generate a simple glyph string based on the input name.
 * This is a legacy function kept for compatibility.
 */
export declare function generateGlyph(name: string, opts?: Options): string;
export default VietnameseGlyphGenerator;
//# sourceMappingURL=index.d.ts.map