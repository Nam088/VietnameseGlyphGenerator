/**
 * Vietnamese Glyph Generator Library
 * Converts C# font glyph generation logic to TypeScript
 */

import { GlyphOptions, GlyphLists, GlyphGenerationResult, GlyphGenerationResultImpl, GenerationResult, GenerationResultImpl } from './types';

export { GlyphOptions, GlyphLists, GlyphGenerationResult, GlyphGenerationResultImpl, GenerationResult, GenerationResultImpl } from './types';

export type Options = {
  uppercase?: boolean;
};

export class VietnameseGlyphGenerator {
  private glyphCategories: GlyphLists = {        // Keep this as instance variable for shared state
    listD: [],
    listd: [],
    listDcroat: [],
    listdcroat: [],
    listA: [],
    listE: [],
    listI: [],
    listO: [],
    listU: [],
    listOhorn: [],
    listUhorn: [],
    listY: [],
    lista: [],
    liste: [],
    listi: [],
    listo: [],
    listu: [],
    listohorn: [],
    listuhorn: [],
    listy: [],
    listdotlessi: []
  };

  // Normalize options with fallbacks to primary values
  private normalizeOptions(options: GlyphOptions): Required<Pick<GlyphOptions, 
    'graveAccentGlyph' | 'acuteAccentGlyph' | 'tildeGlyph' | 'hookAboveGlyph' | 'dotBelowGlyph' |
    'circumflexGlyph' | 'breveGlyph' | 'hornGlyphUppercase' | 'hornGlyphLowercase' |
    'secondaryGraveGlyph' | 'secondaryAcuteGlyph' | 'secondaryTildeGlyph' | 'secondaryHookAboveGlyph' |
    'dotlessIGlyph' | 'openTypeFeature' | 'dStrokeUppercaseGlyph' | 'dStrokeLowercaseGlyph'
  >> & GlyphOptions {
    return {
      ...options,
      graveAccentGlyph: options.graveAccentGlyph ?? 'grave',
      acuteAccentGlyph: options.acuteAccentGlyph ?? 'acute',
      tildeGlyph: options.tildeGlyph ?? 'tilde',
      hookAboveGlyph: options.hookAboveGlyph ?? 'hookabovecomb',
      dotBelowGlyph: options.dotBelowGlyph ?? 'dotbelowcomb',
      circumflexGlyph: options.circumflexGlyph ?? 'circumflex',
      breveGlyph: options.breveGlyph ?? 'breve',
      hornGlyphUppercase: options.hornGlyphUppercase ?? 'horn',
      hornGlyphLowercase: options.hornGlyphLowercase ?? 'horn',
      // Secondary fallback to primary
      secondaryGraveGlyph: options.secondaryGraveGlyph ?? options.graveAccentGlyph ?? 'grave',
      secondaryAcuteGlyph: options.secondaryAcuteGlyph ?? options.acuteAccentGlyph ?? 'acute',
      secondaryTildeGlyph: options.secondaryTildeGlyph ?? options.tildeGlyph ?? 'tilde',
      secondaryHookAboveGlyph: options.secondaryHookAboveGlyph ?? options.hookAboveGlyph ?? 'hookabovecomb',
      dotlessIGlyph: options.dotlessIGlyph ?? 'dotlessi',
      openTypeFeature: options.openTypeFeature ?? 'ss01',
      dStrokeUppercaseGlyph: options.dStrokeUppercaseGlyph ?? 'hyphen.case',
      dStrokeLowercaseGlyph: options.dStrokeLowercaseGlyph ?? 'hyphen.case'
    };
  }

  // Modern structured API with optimized batch processing
  public generateGlyphs(
    glyphsInput: string,
    options: GlyphOptions
  ): GlyphGenerationResult {
    // Normalize options with fallbacks
    const normalizedOptions = this.normalizeOptions(options);
    
    // Get configuration from options instead of storing as instance variables
    const shouldCreateHorn = normalizedOptions.shouldCreateHorn ?? true;
    const shouldCreateDotlessI = normalizedOptions.shouldCreateDotlessI ?? true;
    
    // Clean and process input in one step - avoid duplicate processing
    const cleanedInput = glyphsInput
      .replace(/^\/+|\/+$/g, '')           // Remove leading/trailing slashes
      .replace(/\s/g, '')                  // Remove whitespace
      .replace(/\r\n/g, '')                // Remove line breaks
      .replace(/\/+/g, '/');               // Normalize consecutive slashes to single slash
    
    const result = new GlyphGenerationResultImpl();

    if (cleanedInput.length > 0) {
      const array = cleanedInput.split('/');
      
      if (array.length > 1) {
        this.addList();
        this.filterGlyphs(cleanedInput);
        const filteredOutput = this.filterRender();
        const filteredArray = filteredOutput.split('/');
        
        if (this.glyphCategories.listi.length > 1 && shouldCreateDotlessI) {
          for (const text of this.glyphCategories.listi) {
            const glyphParts = text.split('.');
            if (glyphParts.length === 2) {
              // Generate dotless i result
              const dotlessResult = new GenerationResultImpl();
              dotlessResult.addVariant(`dotlessi.${glyphParts[1]}`, text);
              this.addGlyphToResult(result, text, dotlessResult.toString());
            }
          }
        }
        
        this.deleteList();
        
        // Batch process multiple glyphs for better performance
        const validTexts = filteredArray.filter(text => {
          const glyphParts = text.split('.');
          return glyphParts.length === 2;
        });
        
        // Process in batches to optimize memory usage
        this.processBatchGlyphs(validTexts, normalizedOptions, shouldCreateHorn, result);
        
      } else if (array.length === 1) {
        const glyphOutput = this.processSingleGlyph(normalizedOptions, glyphsInput, shouldCreateDotlessI);
        this.parseAndAddGlyphOutput(result, cleanedInput, glyphOutput);
      }
    }

    return result;
  }

  // Optimized batch processing for multiple glyphs
  private processBatchGlyphs(
    texts: string[], 
    normalizedOptions: GlyphOptions, 
    shouldCreateHorn: boolean, 
    result: GlyphGenerationResultImpl
  ): void {
    for (const text of texts) {
      const glyphParts = text.split('.');
      const name = glyphParts[0];
      const glyphOutput = this.processGlyphByType(name, text, glyphParts[1], normalizedOptions, shouldCreateHorn);
      this.parseAndAddGlyphOutput(result, text, glyphOutput);
    }
  }

  // Helper method to add single glyph result
  private addGlyphToResult(result: GlyphGenerationResultImpl, baseGlyph: string, glyphLine: string): void {
    if (!glyphLine.trim()) return;
    
    // Parse format: "input=output"
    const equalIndex = glyphLine.indexOf('=');
    if (equalIndex > 0) {
      const variant = glyphLine.substring(0, equalIndex);  // input (A.ss01+grave)
      const value = glyphLine.substring(equalIndex + 1);   // output (Agrave.ss01)
      
      // Store as output -> input (reversed from string format)
      result.addGlyph(baseGlyph, value, variant);
    }
  }

  // Helper method to parse multi-line glyph output and add to result
  private parseAndAddGlyphOutput(result: GlyphGenerationResultImpl, baseGlyph: string, glyphOutput: string): void {
    if (!glyphOutput.trim()) return;
    
    const lines = glyphOutput.split(/\r?\n/);
    for (const line of lines) {
      if (line.trim()) {
        this.addGlyphToResult(result, baseGlyph, line);
      }
    }
  }

  // Legacy string-based API for backward compatibility
  public generateGlyphsAsString(
    glyphsInput: string,
    options: GlyphOptions
  ): string {
    const result = this.generateGlyphs(glyphsInput, options);
    return result.toString();
  }

  private processGlyphByType(name: string, text: string, features: string, options: GlyphOptions, shouldCreateHorn: boolean): string {
    const results: GenerationResult[] = [];
    
    switch (name) {
      case "A":
      case "a":
        // Batch generate all A-related variants together
        results.push(
          this.generateBasicToneMarks(text, features, options),
          this.generateCircumflexCombinations(text, features, options),
          this.generateBreveCombinations(text, features, options)
        );
        break;
      case "E":
      case "e":
        results.push(
          this.generateBasicToneMarks(text, features, options),
          this.generateCircumflexCombinations(text, features, options)
        );
        break;
      case "I":
        results.push(this.generateBasicToneMarks(text, features, options));
        break;
      case "i":
        results.push(this.generateDotlessIWithTones(text, features, 1, options));
        break;
      case "D":
      case "d":
        results.push(this.generateDStroke(text, features, options));
        break;
      case "O":
      case "o":
        results.push(
          this.generateBasicToneMarks(text, features, options),
          this.generateCircumflexCombinations(text, features, options)
        );
        if (shouldCreateHorn) {
          results.push(this.generateHornCombinations(text, features, options));
        }
        break;
      case "U":
      case "u":
        results.push(this.generateBasicToneMarks(text, features, options));
        if (shouldCreateHorn) {
          results.push(this.generateHornCombinations(text, features, options));
        }
        break;
      case "Y":
      case "y":
      case "Uhorn":
      case "uhorn":
      case "Ohorn":
      case "ohorn":
        results.push(this.generateBasicToneMarks(text, features, options));
        break;
      default:
        return "";
    }
    
    // Combine all results into a string format efficiently
    return results.map(result => result.toString()).join('\r\n') + "\r\n\r\n";
  }

  private processSingleGlyph(normalizedOptions: GlyphOptions, glyphsInput: string, shouldCreateDotlessI: boolean): string {
    const text = glyphsInput.replace(/^\/+|\/+$/g, '').replace(/\s/g, '').replace(/\r\n/g, '');
    const features = normalizedOptions.openTypeFeature || "";
    const glyphParts = glyphsInput.split('.');
    const results: GenerationResult[] = [];
    
    if (glyphParts.length === 2) {
      const name = normalizedOptions.characterStyle || "";
      
      switch (name) {
        case "A":
          // Batch generate all variants together for better performance
          results.push(
            this.generateBasicToneMarks(text, features, normalizedOptions),
            this.generateCircumflexCombinations(text, features, normalizedOptions),
            this.generateBreveCombinations(text, features, normalizedOptions)
          );
          break;
        case "E":
          results.push(
            this.generateBasicToneMarks(text, features, normalizedOptions),
            this.generateCircumflexCombinations(text, features, normalizedOptions)
          );
          break;
        case "I":
          results.push(this.generateBasicToneMarks(text, features, normalizedOptions));
          break;
        case "i":
          if (shouldCreateDotlessI) {
            const dotlessResult = new GenerationResultImpl();
            dotlessResult.addVariant(`dotlessi.${features}`, text);
            results.push(dotlessResult);
          }
          results.push(this.generateDotlessIWithTones(text, features, 0, normalizedOptions));
          break;
        case "D,d":
          results.push(this.generateDStroke(text, features, normalizedOptions));
          break;
        case "O":
        case "o":
          results.push(
            this.generateBasicToneMarks(text, features, normalizedOptions),
            this.generateCircumflexCombinations(text, features, normalizedOptions),
            this.generateHornCombinations(text, features, normalizedOptions)
          );
          break;
        case "Ư,Ơ":
        case "Y":
          results.push(this.generateBasicToneMarks(text, features, normalizedOptions));
          break;
        case "U":
        case "u":
          results.push(
            this.generateBasicToneMarks(text, features, normalizedOptions),
            this.generateHornCombinations(text, features, normalizedOptions)
          );
          break;
      }
    }
    
    // Combine all results into a string format efficiently
    return results.map(result => result.toString()).join('\r\n') + (results.length > 0 ? "\r\n\r\n" : "");
  }

  // Vietnamese tone pattern generators - now return structured objects
  private generateBasicToneMarks(value: string, features: string, options: GlyphOptions): GenerationResult {
    const baseName = value.substring(0, value.indexOf('.'));
    const result = new GenerationResultImpl();
    
    result.addVariant(`${baseName}grave.${features}`, `${value}+${options.graveAccentGlyph}`);
    result.addVariant(`${baseName}acute.${features}`, `${value}+${options.acuteAccentGlyph}`);
    result.addVariant(`${baseName}tilde.${features}`, `${value}+${options.tildeGlyph}`);
    result.addVariant(`${baseName}hoi.${features}`, `${value}+${options.hookAboveGlyph}`);
    result.addVariant(`${baseName}dotbelow.${features}`, `${value}+${options.dotBelowGlyph}`);
    
    return result;
  }

  private generateCircumflexCombinations(value: string, features: string, options: GlyphOptions): GenerationResult {
    const baseName = value.substring(0, value.indexOf('.'));
    const circumflex = options.circumflexGlyph;
    const result = new GenerationResultImpl();
    
    result.addVariant(`${baseName}circumflex.${features}`, `${value}+${circumflex}`);
    result.addVariant(`${baseName}circumflexgrave.${features}`, `${value}+${circumflex}+${options.secondaryGraveGlyph}`);
    result.addVariant(`${baseName}circumflexacute.${features}`, `${value}+${circumflex}+${options.secondaryAcuteGlyph}`);
    result.addVariant(`${baseName}circumflextilde.${features}`, `${value}+${circumflex}+${options.secondaryTildeGlyph}`);
    result.addVariant(`${baseName}circumflexhoi.${features}`, `${value}+${circumflex}+${options.secondaryHookAboveGlyph}`);
    result.addVariant(`${baseName}circumflexdotbelow.${features}`, `${value}+${circumflex}+${options.dotBelowGlyph}`);
    
    return result;
  }

  private generateBreveCombinations(value: string, features: string, options: GlyphOptions): GenerationResult {
    const baseName = value.substring(0, value.indexOf('.'));
    const breve = options.breveGlyph;
    const result = new GenerationResultImpl();
    
    result.addVariant(`${baseName}breve.${features}`, `${value}+${breve}`);
    result.addVariant(`${baseName}brevegrave.${features}`, `${value}+${breve}+${options.secondaryGraveGlyph}`);
    result.addVariant(`${baseName}breveacute.${features}`, `${value}+${breve}+${options.secondaryAcuteGlyph}`);
    result.addVariant(`${baseName}brevetilde.${features}`, `${value}+${breve}+${options.secondaryTildeGlyph}`);
    result.addVariant(`${baseName}brevehoi.${features}`, `${value}+${breve}+${options.secondaryHookAboveGlyph}`);
    result.addVariant(`${baseName}brevedotbelow.${features}`, `${value}+${breve}+${options.dotBelowGlyph}`);
    
    return result;
  }

  private generateHornCombinations(value: string, features: string, options: GlyphOptions): GenerationResult {
    const glyphParts = value.split('.');
    let horn = "";
    
    if (glyphParts[0] === "O" || glyphParts[0] === "U") {
      horn = options.hornGlyphUppercase || "";
    }
    if (glyphParts[0] === "o" || glyphParts[0] === "u") {
      horn = options.hornGlyphLowercase || "";
    }
    
    const result = new GenerationResultImpl();
    
    result.addVariant(`${glyphParts[0]}horn.${features}`, `${value}+${horn}`);
    result.addVariant(`${glyphParts[0]}horngrave.${features}`, `${value}+${horn}+${options.graveAccentGlyph}`);
    result.addVariant(`${glyphParts[0]}hornacute.${features}`, `${value}+${horn}+${options.acuteAccentGlyph}`);
    result.addVariant(`${glyphParts[0]}horntilde.${features}`, `${value}+${horn}+${options.tildeGlyph}`);
    result.addVariant(`${glyphParts[0]}hornhoi.${features}`, `${value}+${horn}+${options.hookAboveGlyph}`);
    result.addVariant(`${glyphParts[0]}horndotbelow.${features}`, `${value}+${horn}+${options.dotBelowGlyph}`);
    
    return result;
  }

  private generateBasicHornGlyph(value: string, features: string, options: GlyphOptions): GenerationResult {
    const glyphParts = value.split('.');
    let horn = "";
    
    if (glyphParts[0] === "O" || glyphParts[0] === "U") {
      horn = options.hornGlyphUppercase || "";
    }
    if (glyphParts[0] === "o" || glyphParts[0] === "u") {
      horn = options.hornGlyphLowercase || "";
    }
    
    const result = new GenerationResultImpl();
    result.addVariant(`${glyphParts[0]}horn.${features}`, `${value}+${horn}`);
    
    return result;
  }

  private generateDotlessIWithTones(value: string, features: string, test: number, options: GlyphOptions): GenerationResult {
    let dotlessi = "";
    const glyphParts = value.split('.');
    
    if (test === 1) {
      dotlessi = `dotlessi.${glyphParts[1]}`;
    } else if (test === 0) {
      dotlessi = options.dotlessIGlyph || "";
    }
    
    const result = new GenerationResultImpl();
    
    result.addVariant(`${glyphParts[0]}grave.${features}`, `${dotlessi}+${options.graveAccentGlyph}`);
    result.addVariant(`${glyphParts[0]}acute.${features}`, `${dotlessi}+${options.acuteAccentGlyph}`);
    result.addVariant(`${glyphParts[0]}tilde.${features}`, `${dotlessi}+${options.tildeGlyph}`);
    result.addVariant(`${glyphParts[0]}hoi.${features}`, `${dotlessi}+${options.hookAboveGlyph}`);
    result.addVariant(`${glyphParts[0]}dotbelow.${features}`, `${value}+${options.dotBelowGlyph}`);
    
    return result;
  }

  private generateDStroke(value: string, features: string, options: GlyphOptions): GenerationResult {
    const glyphParts = value.split('.');
    let dcroat = "";
    
    if (glyphParts[0] === "D") {
      dcroat = options.dStrokeUppercaseGlyph || "";
    }
    if (glyphParts[0] === "d") {
      dcroat = options.dStrokeLowercaseGlyph || "";
    }
    
    const result = new GenerationResultImpl();
    result.addVariant(`${glyphParts[0]}croat.${features}`, `${value}+${dcroat}`);
    
    return result;
  }

  private filterGlyphs(processedInput: string): void {
    // Clean input once with optimized regex
    const cleanInput = processedInput.replace(/^\/+|\/+$/g, '').replace(/\s|\r\n/g, '');

    if (cleanInput.length > 0) {
      // Optimized: Remove consecutive slashes in one pass
      const cleanedGlyphString = cleanInput.replace(/\/+/g, '/');

      const array = cleanedGlyphString.split('/');
      
      // Pre-filter valid entries to avoid repeated checks
      for (const text of array) {
        if (text && text.includes('.')) {
          const dotIndex = text.indexOf('.');
          if (dotIndex > 0 && dotIndex < text.length - 1) {
            const name = text.substring(0, dotIndex);
            this.categorizeGlyph(name, text);
          }
        }
      }
    }
  }

  // Pre-built Map for O(1) category lookups
  private readonly categoryMap = new Map<string, keyof GlyphLists>([
    ["Dcroat", "listDcroat"],
    ["dcroat", "listdcroat"], 
    ["D", "listD"],
    ["d", "listd"],
    ["A", "listA"],
    ["E", "listE"],
    ["I", "listI"],
    ["O", "listO"],
    ["U", "listU"],
    ["Y", "listY"],
    ["a", "lista"],
    ["e", "liste"],
    ["ohorn", "listohorn"],
    ["Ohorn", "listOhorn"],
    ["uhorn", "listuhorn"],
    ["Uhorn", "listUhorn"],
    ["i", "listi"],
    ["o", "listo"],
    ["u", "listu"],
    ["y", "listy"],
    ["dotlessi", "listdotlessi"]
  ]);

  private categorizeGlyph(name: string, text: string): void {
    const category = this.categoryMap.get(name);
    if (category) {
      this.glyphCategories[category].push(text);
    }
  }

  private filterRender(): string {
    const result: string[] = [];
    
    // Optimized helper function with cached splits and early returns
    const processLists = (
      mainList: string[], 
      relatedList?: string[], 
      includeRelated: boolean = false
    ): void => {
      if (mainList.length <= 1) return;
      
      const output: string[] = [];
      
      // Group related items by feature for O(1) lookup instead of O(n) iteration
      const relatedByFeature = new Map<string, string[]>();
      
      if (includeRelated && relatedList) {
        for (const item of relatedList) {
          const split = item.split('.');
          if (split.length > 1) {
            const feature = split[1];
            if (!relatedByFeature.has(feature)) {
              relatedByFeature.set(feature, []);
            }
            relatedByFeature.get(feature)!.push(item);
          }
        }
      }
      
      for (const item of mainList) {
        output.push(item);
        
        if (includeRelated && relatedByFeature.size > 0) {
          const mainSplit = item.split('.');
          if (mainSplit.length > 1) {
            const mainFeature = mainSplit[1];
            
            // O(1) lookup instead of O(n) iteration
            const matchingRelated = relatedByFeature.get(mainFeature);
            if (matchingRelated) {
              output.push(...matchingRelated);
            }
          }
        }
      }
      
      if (output.length > 0) {
        result.push(output.join('/') + '/');
      }
    };

    // Process lists in logical order
    const listProcessors = [
      [this.glyphCategories.listD, this.glyphCategories.listDcroat, true],
      [this.glyphCategories.listd, this.glyphCategories.listdcroat, true],
      [this.glyphCategories.listA],
      [this.glyphCategories.listE],
      [this.glyphCategories.listI],
      [this.glyphCategories.listO, this.glyphCategories.listOhorn, true],
      [this.glyphCategories.listU, this.glyphCategories.listUhorn, true],
      [this.glyphCategories.listY],
      [this.glyphCategories.lista],
      [this.glyphCategories.liste],
      [this.glyphCategories.listi, this.glyphCategories.listdotlessi, true],
      [this.glyphCategories.listo, this.glyphCategories.listohorn, true],
      [this.glyphCategories.listu, this.glyphCategories.listuhorn, true],
      [this.glyphCategories.listy],
      [this.glyphCategories.listDcroat],
      [this.glyphCategories.listdcroat],
      [this.glyphCategories.listOhorn],
      [this.glyphCategories.listUhorn],
      [this.glyphCategories.listohorn],
      [this.glyphCategories.listuhorn],
      [this.glyphCategories.listdotlessi]
    ] as const;

    for (const processor of listProcessors) {
      processLists(processor[0], processor[1], processor[2] as boolean);
    }

    return result.join('\r\n');
  }

  private addList(): void {
    // Pre-allocate arrays with known size for better performance
    const createList = (item: string): string[] => ["", item];
    
    this.glyphCategories = {
      listD: createList("D"),
      listd: createList("d"),
      listDcroat: createList("Dcroat"),
      listdcroat: createList("dcroat"),
      listA: createList("A"),
      listE: createList("E"),
      listI: createList("I"),
      listO: createList("O"),
      listU: createList("U"),
      listOhorn: createList("Ohorn"),
      listUhorn: createList("Uhorn"),
      listY: createList("Y"),
      lista: createList("a"),
      liste: createList("e"),
      listi: createList("i"),
      listo: createList("o"),
      listu: createList("u"),
      listohorn: createList("ohorn"),
      listuhorn: createList("uhorn"),
      listy: createList("y"),
      listdotlessi: createList("dotlessi")
    };
  }

  private deleteList(): void {
    // Faster iteration using for...in
    for (const key in this.glyphCategories) {
      (this.glyphCategories as any)[key].length = 0; // Faster than creating new arrays
    }
  }

  // Optimized helper method to reduce code duplication
  private parseGlyphInput(glyphsInput: string): string[] {
    const cleanInput = glyphsInput.replace(/^\/+|\/+$/g, '').replace(/\s|\r\n/g, '');
    if (!cleanInput) return [];
    
    // Optimized: remove consecutive slashes and split in one pass
    return cleanInput.replace(/\/+/g, '/').split('/').filter(text => 
      text && text.includes('.') && text.indexOf('.') > 0 && text.indexOf('.') < text.length - 1
    );
  }

  public filterI(glyphsInput: string): string {
    let generatedOutput = "";
    this.addList();

    const validTexts = this.parseGlyphInput(glyphsInput);
    
    for (const text of validTexts) {
      const dotIndex = text.indexOf('.');
      const name = text.substring(0, dotIndex);
      
      if (name === "i") {
        this.glyphCategories.listi.push(text);
      }
    }

    if (this.glyphCategories.listi.length > 0) {
      for (const text of this.glyphCategories.listi) {
        if (text && text !== "") { // Skip empty strings
          const glyphParts = text.split('.');
          if (glyphParts.length === 2) {
            // Generate dotless i result
            const result = new GenerationResultImpl();
            result.addVariant(`dotlessi.${glyphParts[1]}`, text);
            generatedOutput += result.toString() + "\r\n\r\n";
          }
        }
      }
    }

    this.deleteList();
    return generatedOutput;
  }

  public filterHorn(glyphsInput: string, options: GlyphOptions, createHorn: boolean): string {
    let generatedOutput = "";
    this.addList();

    const validTexts = this.parseGlyphInput(glyphsInput);
    
    // Optimized categorization with Set lookup
    const hornChars = new Set(['U', 'u', 'O', 'o']);
    
    for (const text of validTexts) {
      const dotIndex = text.indexOf('.');
      const name = text.substring(0, dotIndex);
      
      if (hornChars.has(name)) {
        switch (name) {
          case "U": this.glyphCategories.listU.push(text); break;
          case "u": this.glyphCategories.listu.push(text); break;
          case "O": this.glyphCategories.listO.push(text); break;
          case "o": this.glyphCategories.listo.push(text); break;
        }
      }
    }

    const processHornList = (list: string[], method: (text: string, features: string, options: GlyphOptions) => GenerationResult) => {
      if (list.length > 0) {
        for (const text of list) {
          if (text && text !== "") { // Skip empty strings
            const glyphParts = text.split('.');
            if (glyphParts.length === 2) {
              const result = method.call(this, text, glyphParts[1], options);
              generatedOutput += result.toString() + "\r\n\r\n";
            }
          }
        }
      }
    };

    if (createHorn) {
      processHornList(this.glyphCategories.listO, this.generateBasicHornGlyph);
      processHornList(this.glyphCategories.listo, this.generateBasicHornGlyph);
      processHornList(this.glyphCategories.listU, this.generateBasicHornGlyph);
      processHornList(this.glyphCategories.listu, this.generateBasicHornGlyph);
    } else {
      // For non-createHorn mode, use a simple horn glyph generator
      const generateSimpleHorn = (value: string, features: string): GenerationResult => {
        const glyphParts = value.split('.');
        const result = new GenerationResultImpl();
        result.addVariant(`${glyphParts[0]}horn.${features}`, value);
        return result;
      };

      processHornList(this.glyphCategories.listO, generateSimpleHorn);
      processHornList(this.glyphCategories.listo, generateSimpleHorn);
      processHornList(this.glyphCategories.listU, generateSimpleHorn);
      processHornList(this.glyphCategories.listu, generateSimpleHorn);
    }

    this.deleteList();
    return generatedOutput;
  }
}

/**
 * Generate a simple glyph string based on the input name.
 * This is a legacy function kept for compatibility.
 */
export function generateGlyph(name: string, opts: Options = {}): string {
  const base = name.trim() || "glyph";
  let hash = 0;
  for (let i = 0; i < base.length; i++) {
    hash = (hash * 31 + base.charCodeAt(i)) | 0;
  }
  const vowels = ["a", "e", "i", "o", "u", "y"];
  const vowel = vowels[Math.abs(hash) % vowels.length];
  const core = `${base[0] ?? "g"}${vowel}${Math.abs(hash) % 100}`;
  const result = opts.uppercase ? core.toUpperCase() : core;
  return result;
}

export default VietnameseGlyphGenerator;
