"use strict";
/**
 * Vietnamese Glyph Generator Library
 * Converts C# font glyph generation logic to TypeScript
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VietnameseGlyphGenerator = exports.GenerationResultImpl = exports.GlyphGenerationResultImpl = void 0;
exports.generateGlyph = generateGlyph;
const types_1 = require("./types");
var types_2 = require("./types");
Object.defineProperty(exports, "GlyphGenerationResultImpl", { enumerable: true, get: function () { return types_2.GlyphGenerationResultImpl; } });
Object.defineProperty(exports, "GenerationResultImpl", { enumerable: true, get: function () { return types_2.GenerationResultImpl; } });
class VietnameseGlyphGenerator {
    constructor() {
        this.glyphCategories = {
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
        // Pre-built Map for O(1) category lookups
        this.categoryMap = new Map([
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
    }
    // Normalize options with fallbacks to primary values
    normalizeOptions(options) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
        return {
            ...options,
            graveAccentGlyph: (_a = options.graveAccentGlyph) !== null && _a !== void 0 ? _a : 'grave',
            acuteAccentGlyph: (_b = options.acuteAccentGlyph) !== null && _b !== void 0 ? _b : 'acute',
            tildeGlyph: (_c = options.tildeGlyph) !== null && _c !== void 0 ? _c : 'tilde',
            hookAboveGlyph: (_d = options.hookAboveGlyph) !== null && _d !== void 0 ? _d : 'hookabovecomb',
            dotBelowGlyph: (_e = options.dotBelowGlyph) !== null && _e !== void 0 ? _e : 'dotbelowcomb',
            circumflexGlyph: (_f = options.circumflexGlyph) !== null && _f !== void 0 ? _f : 'circumflex',
            breveGlyph: (_g = options.breveGlyph) !== null && _g !== void 0 ? _g : 'breve',
            hornGlyphUppercase: (_h = options.hornGlyphUppercase) !== null && _h !== void 0 ? _h : 'horn',
            hornGlyphLowercase: (_j = options.hornGlyphLowercase) !== null && _j !== void 0 ? _j : 'horn',
            // Secondary fallback to primary
            secondaryGraveGlyph: (_l = (_k = options.secondaryGraveGlyph) !== null && _k !== void 0 ? _k : options.graveAccentGlyph) !== null && _l !== void 0 ? _l : 'grave',
            secondaryAcuteGlyph: (_o = (_m = options.secondaryAcuteGlyph) !== null && _m !== void 0 ? _m : options.acuteAccentGlyph) !== null && _o !== void 0 ? _o : 'acute',
            secondaryTildeGlyph: (_q = (_p = options.secondaryTildeGlyph) !== null && _p !== void 0 ? _p : options.tildeGlyph) !== null && _q !== void 0 ? _q : 'tilde',
            secondaryHookAboveGlyph: (_s = (_r = options.secondaryHookAboveGlyph) !== null && _r !== void 0 ? _r : options.hookAboveGlyph) !== null && _s !== void 0 ? _s : 'hookabovecomb',
            dotlessIGlyph: (_t = options.dotlessIGlyph) !== null && _t !== void 0 ? _t : 'dotlessi',
            openTypeFeature: (_u = options.openTypeFeature) !== null && _u !== void 0 ? _u : 'ss01',
            dStrokeUppercaseGlyph: (_v = options.dStrokeUppercaseGlyph) !== null && _v !== void 0 ? _v : 'hyphen.case',
            dStrokeLowercaseGlyph: (_w = options.dStrokeLowercaseGlyph) !== null && _w !== void 0 ? _w : 'hyphen.case'
        };
    }
    // Modern structured API with optimized batch processing
    generateGlyphs(glyphsInput, options) {
        var _a, _b;
        // Normalize options with fallbacks
        const normalizedOptions = this.normalizeOptions(options);
        // Get configuration from options instead of storing as instance variables
        const shouldCreateHorn = (_a = normalizedOptions.shouldCreateHorn) !== null && _a !== void 0 ? _a : true;
        const shouldCreateDotlessI = (_b = normalizedOptions.shouldCreateDotlessI) !== null && _b !== void 0 ? _b : true;
        // Clean and process input in one step - avoid duplicate processing
        const cleanedInput = glyphsInput
            .replace(/^\/+|\/+$/g, '') // Remove leading/trailing slashes
            .replace(/\s/g, '') // Remove whitespace
            .replace(/\r\n/g, '') // Remove line breaks
            .replace(/\/+/g, '/'); // Normalize consecutive slashes to single slash
        const result = new types_1.GlyphGenerationResultImpl();
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
                            const dotlessResult = new types_1.GenerationResultImpl();
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
            }
            else if (array.length === 1) {
                const glyphOutput = this.processSingleGlyph(normalizedOptions, glyphsInput, shouldCreateDotlessI);
                this.parseAndAddGlyphOutput(result, cleanedInput, glyphOutput);
            }
        }
        return result;
    }
    // Optimized batch processing for multiple glyphs
    processBatchGlyphs(texts, normalizedOptions, shouldCreateHorn, result) {
        for (const text of texts) {
            const glyphParts = text.split('.');
            const name = glyphParts[0];
            const glyphOutput = this.processGlyphByType(name, text, glyphParts[1], normalizedOptions, shouldCreateHorn);
            this.parseAndAddGlyphOutput(result, text, glyphOutput);
        }
    }
    // Helper method to add single glyph result
    addGlyphToResult(result, baseGlyph, glyphLine) {
        if (!glyphLine.trim())
            return;
        // Parse format: "input=output"
        const equalIndex = glyphLine.indexOf('=');
        if (equalIndex > 0) {
            const variant = glyphLine.substring(0, equalIndex); // input (A.ss01+grave)
            const value = glyphLine.substring(equalIndex + 1); // output (Agrave.ss01)
            // Store as output -> input (reversed from string format)
            result.addGlyph(baseGlyph, value, variant);
        }
    }
    // Helper method to parse multi-line glyph output and add to result
    parseAndAddGlyphOutput(result, baseGlyph, glyphOutput) {
        if (!glyphOutput.trim())
            return;
        const lines = glyphOutput.split(/\r?\n/);
        for (const line of lines) {
            if (line.trim()) {
                this.addGlyphToResult(result, baseGlyph, line);
            }
        }
    }
    // Legacy string-based API for backward compatibility
    generateGlyphsAsString(glyphsInput, options) {
        const result = this.generateGlyphs(glyphsInput, options);
        return result.toString();
    }
    processGlyphByType(name, text, features, options, shouldCreateHorn) {
        const results = [];
        switch (name) {
            case "A":
            case "a":
                // Batch generate all A-related variants together
                results.push(this.generateBasicToneMarks(text, features, options), this.generateCircumflexCombinations(text, features, options), this.generateBreveCombinations(text, features, options));
                break;
            case "E":
            case "e":
                results.push(this.generateBasicToneMarks(text, features, options), this.generateCircumflexCombinations(text, features, options));
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
                results.push(this.generateBasicToneMarks(text, features, options), this.generateCircumflexCombinations(text, features, options));
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
    processSingleGlyph(normalizedOptions, glyphsInput, shouldCreateDotlessI) {
        const text = glyphsInput.replace(/^\/+|\/+$/g, '').replace(/\s/g, '').replace(/\r\n/g, '');
        const features = normalizedOptions.openTypeFeature || "";
        const glyphParts = glyphsInput.split('.');
        const results = [];
        if (glyphParts.length === 2) {
            const name = normalizedOptions.characterStyle || "";
            switch (name) {
                case "A":
                    // Batch generate all variants together for better performance
                    results.push(this.generateBasicToneMarks(text, features, normalizedOptions), this.generateCircumflexCombinations(text, features, normalizedOptions), this.generateBreveCombinations(text, features, normalizedOptions));
                    break;
                case "E":
                    results.push(this.generateBasicToneMarks(text, features, normalizedOptions), this.generateCircumflexCombinations(text, features, normalizedOptions));
                    break;
                case "I":
                    results.push(this.generateBasicToneMarks(text, features, normalizedOptions));
                    break;
                case "i":
                    if (shouldCreateDotlessI) {
                        const dotlessResult = new types_1.GenerationResultImpl();
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
                    results.push(this.generateBasicToneMarks(text, features, normalizedOptions), this.generateCircumflexCombinations(text, features, normalizedOptions), this.generateHornCombinations(text, features, normalizedOptions));
                    break;
                case "Ư,Ơ":
                case "Y":
                    results.push(this.generateBasicToneMarks(text, features, normalizedOptions));
                    break;
                case "U":
                case "u":
                    results.push(this.generateBasicToneMarks(text, features, normalizedOptions), this.generateHornCombinations(text, features, normalizedOptions));
                    break;
            }
        }
        // Combine all results into a string format efficiently
        return results.map(result => result.toString()).join('\r\n') + (results.length > 0 ? "\r\n\r\n" : "");
    }
    // Vietnamese tone pattern generators - now return structured objects
    generateBasicToneMarks(value, features, options) {
        const baseName = value.substring(0, value.indexOf('.'));
        const result = new types_1.GenerationResultImpl();
        result.addVariant(`${baseName}grave.${features}`, `${value}+${options.graveAccentGlyph}`);
        result.addVariant(`${baseName}acute.${features}`, `${value}+${options.acuteAccentGlyph}`);
        result.addVariant(`${baseName}tilde.${features}`, `${value}+${options.tildeGlyph}`);
        result.addVariant(`${baseName}hoi.${features}`, `${value}+${options.hookAboveGlyph}`);
        result.addVariant(`${baseName}dotbelow.${features}`, `${value}+${options.dotBelowGlyph}`);
        return result;
    }
    generateCircumflexCombinations(value, features, options) {
        const baseName = value.substring(0, value.indexOf('.'));
        const circumflex = options.circumflexGlyph;
        const result = new types_1.GenerationResultImpl();
        result.addVariant(`${baseName}circumflex.${features}`, `${value}+${circumflex}`);
        result.addVariant(`${baseName}circumflexgrave.${features}`, `${value}+${circumflex}+${options.secondaryGraveGlyph}`);
        result.addVariant(`${baseName}circumflexacute.${features}`, `${value}+${circumflex}+${options.secondaryAcuteGlyph}`);
        result.addVariant(`${baseName}circumflextilde.${features}`, `${value}+${circumflex}+${options.secondaryTildeGlyph}`);
        result.addVariant(`${baseName}circumflexhoi.${features}`, `${value}+${circumflex}+${options.secondaryHookAboveGlyph}`);
        result.addVariant(`${baseName}circumflexdotbelow.${features}`, `${value}+${circumflex}+${options.dotBelowGlyph}`);
        return result;
    }
    generateBreveCombinations(value, features, options) {
        const baseName = value.substring(0, value.indexOf('.'));
        const breve = options.breveGlyph;
        const result = new types_1.GenerationResultImpl();
        result.addVariant(`${baseName}breve.${features}`, `${value}+${breve}`);
        result.addVariant(`${baseName}brevegrave.${features}`, `${value}+${breve}+${options.secondaryGraveGlyph}`);
        result.addVariant(`${baseName}breveacute.${features}`, `${value}+${breve}+${options.secondaryAcuteGlyph}`);
        result.addVariant(`${baseName}brevetilde.${features}`, `${value}+${breve}+${options.secondaryTildeGlyph}`);
        result.addVariant(`${baseName}brevehoi.${features}`, `${value}+${breve}+${options.secondaryHookAboveGlyph}`);
        result.addVariant(`${baseName}brevedotbelow.${features}`, `${value}+${breve}+${options.dotBelowGlyph}`);
        return result;
    }
    generateHornCombinations(value, features, options) {
        const glyphParts = value.split('.');
        let horn = "";
        if (glyphParts[0] === "O" || glyphParts[0] === "U") {
            horn = options.hornGlyphUppercase || "";
        }
        if (glyphParts[0] === "o" || glyphParts[0] === "u") {
            horn = options.hornGlyphLowercase || "";
        }
        const result = new types_1.GenerationResultImpl();
        result.addVariant(`${glyphParts[0]}horn.${features}`, `${value}+${horn}`);
        result.addVariant(`${glyphParts[0]}horngrave.${features}`, `${value}+${horn}+${options.graveAccentGlyph}`);
        result.addVariant(`${glyphParts[0]}hornacute.${features}`, `${value}+${horn}+${options.acuteAccentGlyph}`);
        result.addVariant(`${glyphParts[0]}horntilde.${features}`, `${value}+${horn}+${options.tildeGlyph}`);
        result.addVariant(`${glyphParts[0]}hornhoi.${features}`, `${value}+${horn}+${options.hookAboveGlyph}`);
        result.addVariant(`${glyphParts[0]}horndotbelow.${features}`, `${value}+${horn}+${options.dotBelowGlyph}`);
        return result;
    }
    generateBasicHornGlyph(value, features, options) {
        const glyphParts = value.split('.');
        let horn = "";
        if (glyphParts[0] === "O" || glyphParts[0] === "U") {
            horn = options.hornGlyphUppercase || "";
        }
        if (glyphParts[0] === "o" || glyphParts[0] === "u") {
            horn = options.hornGlyphLowercase || "";
        }
        const result = new types_1.GenerationResultImpl();
        result.addVariant(`${glyphParts[0]}horn.${features}`, `${value}+${horn}`);
        return result;
    }
    generateDotlessIWithTones(value, features, test, options) {
        let dotlessi = "";
        const glyphParts = value.split('.');
        if (test === 1) {
            dotlessi = `dotlessi.${glyphParts[1]}`;
        }
        else if (test === 0) {
            dotlessi = options.dotlessIGlyph || "";
        }
        const result = new types_1.GenerationResultImpl();
        result.addVariant(`${glyphParts[0]}grave.${features}`, `${dotlessi}+${options.graveAccentGlyph}`);
        result.addVariant(`${glyphParts[0]}acute.${features}`, `${dotlessi}+${options.acuteAccentGlyph}`);
        result.addVariant(`${glyphParts[0]}tilde.${features}`, `${dotlessi}+${options.tildeGlyph}`);
        result.addVariant(`${glyphParts[0]}hoi.${features}`, `${dotlessi}+${options.hookAboveGlyph}`);
        result.addVariant(`${glyphParts[0]}dotbelow.${features}`, `${value}+${options.dotBelowGlyph}`);
        return result;
    }
    generateDStroke(value, features, options) {
        const glyphParts = value.split('.');
        let dcroat = "";
        if (glyphParts[0] === "D") {
            dcroat = options.dStrokeUppercaseGlyph || "";
        }
        if (glyphParts[0] === "d") {
            dcroat = options.dStrokeLowercaseGlyph || "";
        }
        const result = new types_1.GenerationResultImpl();
        result.addVariant(`${glyphParts[0]}croat.${features}`, `${value}+${dcroat}`);
        return result;
    }
    filterGlyphs(processedInput) {
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
    categorizeGlyph(name, text) {
        const category = this.categoryMap.get(name);
        if (category) {
            this.glyphCategories[category].push(text);
        }
    }
    filterRender() {
        const result = [];
        // Optimized helper function with cached splits and early returns
        const processLists = (mainList, relatedList, includeRelated = false) => {
            var _a;
            if (mainList.length <= 1)
                return;
            const output = [];
            // Group related items by feature for O(1) lookup instead of O(n) iteration
            const relatedByFeature = new Map();
            if (includeRelated && relatedList) {
                for (const item of relatedList) {
                    const split = item.split('.');
                    if (split.length > 1) {
                        const feature = split[1];
                        if (!relatedByFeature.has(feature)) {
                            relatedByFeature.set(feature, []);
                        }
                        (_a = relatedByFeature.get(feature)) === null || _a === void 0 ? void 0 : _a.push(item);
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
        ];
        for (const processor of listProcessors) {
            processLists(processor[0], processor[1], processor[2]);
        }
        return result.join('\r\n');
    }
    addList() {
        // Pre-allocate arrays with known size for better performance
        const createList = (item) => ["", item];
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
    deleteList() {
        // Faster iteration using for...in
        for (const key in this.glyphCategories) {
            this.glyphCategories[key].length = 0; // Faster than creating new arrays
        }
    }
    // Optimized helper method to reduce code duplication
    parseGlyphInput(glyphsInput) {
        const cleanInput = glyphsInput.replace(/^\/+|\/+$/g, '').replace(/\s|\r\n/g, '');
        if (!cleanInput)
            return [];
        // Optimized: remove consecutive slashes and split in one pass
        return cleanInput.replace(/\/+/g, '/').split('/').filter(text => text && text.includes('.') && text.indexOf('.') > 0 && text.indexOf('.') < text.length - 1);
    }
    filterI(glyphsInput) {
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
                        const result = new types_1.GenerationResultImpl();
                        result.addVariant(`dotlessi.${glyphParts[1]}`, text);
                        generatedOutput += result.toString() + "\r\n\r\n";
                    }
                }
            }
        }
        this.deleteList();
        return generatedOutput;
    }
    filterHorn(glyphsInput, options, createHorn) {
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
                    case "U":
                        this.glyphCategories.listU.push(text);
                        break;
                    case "u":
                        this.glyphCategories.listu.push(text);
                        break;
                    case "O":
                        this.glyphCategories.listO.push(text);
                        break;
                    case "o":
                        this.glyphCategories.listo.push(text);
                        break;
                }
            }
        }
        const processHornList = (list, method) => {
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
        }
        else {
            // For non-createHorn mode, use a simple horn glyph generator
            const generateSimpleHorn = (value, features) => {
                const glyphParts = value.split('.');
                const result = new types_1.GenerationResultImpl();
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
exports.VietnameseGlyphGenerator = VietnameseGlyphGenerator;
/**
 * Generate a simple glyph string based on the input name.
 * This is a legacy function kept for compatibility.
 */
function generateGlyph(name, opts = {}) {
    var _a;
    const base = name.trim() || "glyph";
    let hash = 0;
    for (let i = 0; i < base.length; i++) {
        hash = (hash * 31 + base.charCodeAt(i)) | 0;
    }
    const vowels = ["a", "e", "i", "o", "u", "y"];
    const vowel = vowels[Math.abs(hash) % vowels.length];
    const core = `${(_a = base[0]) !== null && _a !== void 0 ? _a : "g"}${vowel}${Math.abs(hash) % 100}`;
    const result = opts.uppercase ? core.toUpperCase() : core;
    return result;
}
exports.default = VietnameseGlyphGenerator;
//# sourceMappingURL=index.js.map