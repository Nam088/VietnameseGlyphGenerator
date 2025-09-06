export interface GlyphOptions {
  // Base character style (A, E, I, O, U, Y, i, Ư,Ơ, D,d)
  characterStyle?: string;
  
  // Primary tone marks (dấu thanh)
  graveAccentGlyph?: string;        // dấu huyền (`)
  acuteAccentGlyph?: string;        // dấu sắc (´)
  tildeGlyph?: string;              // dấu ngã (~)
  hookAboveGlyph?: string;          // dấu hỏi (?)
  dotBelowGlyph?: string;           // dấu nặng (.)
  
  // Primary combining marks
  circumflexGlyph?: string;         // dấu mũ (^)
  breveGlyph?: string;              // dấu trăng (˘)
  
  // Horn marks for Ơ, Ư
  hornGlyphUppercase?: string;      // horn for uppercase O, U
  hornGlyphLowercase?: string;      // horn for lowercase o, u
  
  // Secondary tone marks for combinations with circumflex/breve
  secondaryGraveGlyph?: string;     // grave for â, ă combinations
  secondaryAcuteGlyph?: string;     // acute for â, ă combinations
  secondaryTildeGlyph?: string;     // tilde for â, ă combinations
  secondaryHookAboveGlyph?: string; // hook above for â, ă combinations
  
  // Special characters
  dotlessIGlyph?: string;           // dotless i base glyph
  
  // OpenType features
  openTypeFeature?: string;         // ss01, ss02, etc.
  
  // D with stroke (Đ)
  dStrokeUppercaseGlyph?: string;   // stroke for uppercase D
  dStrokeLowercaseGlyph?: string;   // stroke for lowercase d
  
  // Generation control flags
  shouldCreateDotlessI?: boolean;   // true=create dotless i, false=skip
  shouldCreateHorn?: boolean;       // true=create horn variants, false=skip
}

// Individual generation result for specific patterns
export interface GenerationResult {
  variants: Record<string, string>; // output -> input mapping
  toString(): string;
}

export class GenerationResultImpl implements GenerationResult {
  public variants: Record<string, string> = {};

  constructor(variants: Record<string, string> = {}) {
    this.variants = variants;
  }

  addVariant(outputGlyph: string, inputPattern: string): void {
    this.variants[outputGlyph] = inputPattern;
  }

  toString(): string {
    const results: string[] = [];
    for (const [outputGlyph, inputPattern] of Object.entries(this.variants)) {
      results.push(`${inputPattern}=${outputGlyph}`);
    }
    return results.join('\r\n');
  }

  getVariants(): string[] {
    return Object.keys(this.variants);
  }

  getInputPattern(outputGlyph: string): string | undefined {
    return this.variants[outputGlyph];
  }
}

// Structured result for flexible data manipulation
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

export class GlyphGenerationResultImpl implements GlyphGenerationResult {
  public glyphs: GlyphResult = {};

  constructor(glyphs: GlyphResult = {}) {
    this.glyphs = glyphs;
  }

  // Convert to traditional string format for backward compatibility
  toString(): string {
    const result: string[] = [];
    
    for (const [, variants] of Object.entries(this.glyphs)) {
      const variantStrings: string[] = [];
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
  toJSON(): string {
    return JSON.stringify(this.glyphs, null, 2);
  }

  // Get specific glyph or all variants
  getGlyph(baseGlyph: string, outputGlyph?: string): string | Record<string, string> | undefined {
    const glyphData = this.glyphs[baseGlyph];
    if (!glyphData) return undefined;
    
    if (outputGlyph) {
      return glyphData[outputGlyph]; // Returns the input pattern
    }
    
    return glyphData;
  }

  // Get all output glyph names for a base glyph
  getVariants(baseGlyph: string): string[] {
    const glyphData = this.glyphs[baseGlyph];
    return glyphData ? Object.keys(glyphData) : []; // Returns output glyph names
  }

  // Get input pattern for a specific output glyph
  getInputPattern(baseGlyph: string, outputGlyph: string): string | undefined {
    const glyphData = this.glyphs[baseGlyph];
    return glyphData ? glyphData[outputGlyph] : undefined;
  }

  // Get all base glyph names
  getAllBaseGlyphs(): string[] {
    return Object.keys(this.glyphs);
  }

  // Add glyph data
  addGlyph(baseGlyph: string, variant: string, value: string): void {
    if (!this.glyphs[baseGlyph]) {
      this.glyphs[baseGlyph] = {};
    }
    this.glyphs[baseGlyph][variant] = value;
  }

  // Parse from traditional string format
  static fromString(glyphString: string): GlyphGenerationResultImpl {
    const result = new GlyphGenerationResultImpl();
    
    if (!glyphString.trim()) return result;
    
    // Split by double line breaks to get glyph groups
    const glyphGroups = glyphString.split(/\r?\n\r?\n/);
    
    for (const group of glyphGroups) {
      if (!group.trim()) continue;
      
      const lines = group.split(/\r?\n/);
      for (const line of lines) {
        if (!line.trim()) continue;
        
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

export const CHARACTER_STYLES = ["A", "E", "I", "O", "U", "Y", "i", "Ư,Ơ", "D,d"];
export const GRAVE_ACCENT_GLYPHS = ["grave", "gravecomb", "grave.ss01", "grave.ss02", "gravecomb.ss01", "gravecomb.ss02"];
export const ACUTE_ACCENT_GLYPHS = ["acute", "acutecomb", "acute.ss01", "acute.ss02", "acutecomb.ss01", "acutecomb.ss02"];
export const TILDE_GLYPHS = ["tilde", "tildecomb", "tilde.ss01", "tilde.ss02", "tildecomb.ss01", "tildecomb.ss02"];
export const HOOK_ABOVE_GLYPHS = ["hookabovecomb.case", "hookabovecomb", "hookabovecomb.case.ss01", "hookabovecomb.case.ss02", "hookabovecomb.ss01", "hookabovecomb.ss02"];
export const DOT_BELOW_GLYPHS = ["dotbelowcomb.case", "dotbelowcomb", "dotbelowcomb.case.ss01", "dotbelowcomb.case.ss02", "dotbelowcomb.ss01", "dotbelowcomb.ss02"];
export const CIRCUMFLEX_GLYPHS = ["circumflex", "circumflexcomb", "circumflex.ss01", "circumflex.ss02", "circumflexcomb.ss01", "circumflexcomb.ss02"];
export const BREVE_GLYPHS = ["breve", "brevecomb", "breve.ss01", "breve.ss02", "brevecomb.ss01", "brevecomb.ss02"];
export const HORN_GLYPHS = ["horn", "horncomb", "horn.ss01", "horn.ss01", "horncomb.ss01", "horncomb.ss02", "horncomb.ss03"];
export const DOTLESS_I_GLYPHS = ["dotlessi", "dotlessi.ss01", "dotlessi.ss02", "dotlessi.ss03", "dotlessi.ss04", "dotlessi.ss05"];
export const OPENTYPE_FEATURES = ["ss01", "ss02", "ss03", "ss04", "ss05", "ss06", "ss07", "ss08", "ss09", "ss10"];
export const D_STROKE_GLYPHS = ["hyphen.case", "hyphen.sc1", "hyphen.case.ss01", "hyphen.case.ss02", "hyphen.sc1.ss01", "hyphen.sc1.ss02"];