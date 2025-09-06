# Vietnamese Glyph Generator

A TypeScript library for generating Vietnamese font glyphs with tone marks, circumflex, breve, horn combinations, and OpenType features.

## Features

- ✨ **Object-based API** - Structured results instead of string concatenation
- 🚀 **High Performance** - Optimized batch processing (1,100+ variants/ms)
- 🎯 **Type Safe** - Full TypeScript support with comprehensive interfaces
- 🔧 **Flexible Configuration** - Customizable accent glyphs and OpenType features
- 📊 **Rich Results** - Direct access to variants with input->output mapping

## Installation

```bash
npm install vietnamese-glyph-generator
```

## Quick Start

```typescript
import { VietnameseGlyphGenerator } from 'vietnamese-glyph-generator';

const generator = new VietnameseGlyphGenerator();

const options = {
  graveAccentGlyph: 'grave',
  acuteAccentGlyph: 'acute',
  openTypeFeature: 'ss01',
  shouldCreateHorn: true,
  shouldCreateDotlessI: true
};

// Generate glyphs for multiple characters
const result = generator.generateGlyphs('A.ss01/E.ss01/O.ss01', options);

// Access structured results
console.log('Base glyphs:', result.getAllBaseGlyphs());
console.log('A variants:', result.getVariants('A.ss01'));
console.log('Input pattern:', result.getInputPattern('A.ss01', 'Agrave.ss01'));
```

```

## API Reference

### Basic Usage

```typescript
// Single character generation
const result = generator.generateGlyphs('A.ss01', options);

// Multiple characters (batch processing)
const result = generator.generateGlyphs('A.ss01/E.ss01/O.ss01/U.ss01', options);

// Legacy string output (for backward compatibility)
const stringResult = generator.generateGlyphsAsString('A.ss01', options);
```

### Configuration Options

```typescript
const options = {
  // Primary accent glyphs
  graveAccentGlyph: 'grave',           // ` (grave accent)
  acuteAccentGlyph: 'acute',           // ´ (acute accent)  
  tildeGlyph: 'tilde',                 // ~ (tilde)
  hookAboveGlyph: 'hookabovecomb',     // ̉ (hook above)
  dotBelowGlyph: 'dotbelowcomb',       // ̣ (dot below)
  
  // Diacritic combination glyphs
  circumflexGlyph: 'circumflex',       // ^ (circumflex)
  breveGlyph: 'breve',                 // ̆ (breve)
  
  // Horn glyphs for Ơ/Ư characters
  hornGlyphUppercase: 'horn',          // Horn for O, U
  hornGlyphLowercase: 'horn',          // Horn for o, u
  
  // Secondary accents (for combinations like â + `)
  secondaryGraveGlyph: 'grave.secondary',
  secondaryAcuteGlyph: 'acute.secondary',
  secondaryTildeGlyph: 'tilde.secondary', 
  secondaryHookAboveGlyph: 'hookabovecomb.secondary',
  
  // Special characters
  dotlessIGlyph: 'dotlessi',           // Dotless i base
  dStrokeUppercaseGlyph: 'hyphen.case', // Đ stroke
  dStrokeLowercaseGlyph: 'hyphen.case', // đ stroke
  
  // OpenType features
  openTypeFeature: 'ss01',             // Stylistic set
  characterStyle: 'A',                 // Character style context
  
  // Generation flags
  shouldCreateHorn: true,              // Generate horn combinations
  shouldCreateDotlessI: true           // Generate dotless i variants
};
```

### Result Interface

```typescript
// Main result object
interface GlyphGenerationResult {
  getAllBaseGlyphs(): string[];                    // Get all base glyph names
  getVariants(baseGlyph: string): string[];       // Get variants for a base glyph
  getInputPattern(baseGlyph: string, variant: string): string; // Get input pattern
  toString(): string;                              // Convert to string format
}

// Individual generation result
interface GenerationResult {
  addVariant(output: string, input: string): void; // Add variant mapping
  getVariants(): Map<string, string>;              // Get all variants
  toString(): string;                               // String representation
}
```

## Examples

### Vietnamese Tone Marks

```typescript
// Generate all tone marks for letter A
const result = generator.generateGlyphs('A.ss01', options);

console.log(result.getVariants('A.ss01'));
// Output: ['Agrave.ss01', 'Aacute.ss01', 'Atilde.ss01', 'Ahoi.ss01', 'Adotbelow.ss01', ...]

// Check how a variant is constructed
console.log(result.getInputPattern('A.ss01', 'Agrave.ss01'));
// Output: 'A.ss01+grave'
```

### Circumflex Combinations (Â)

```typescript
const result = generator.generateGlyphs('A.ss01', options);

// Circumflex + tone marks
console.log('Circumflex variants:');
result.getVariants('A.ss01')
  .filter(v => v.includes('circumflex'))
  .forEach(variant => {
    const input = result.getInputPattern('A.ss01', variant);
    console.log(`${variant} <- ${input}`);
  });

// Output:
// Acircumflex.ss01 <- A.ss01+circumflex
// Acircumflexgrave.ss01 <- A.ss01+circumflex+grave
// Acircumflexacute.ss01 <- A.ss01+circumflex+acute
// Acircumflextilde.ss01 <- A.ss01+circumflex+tilde
// ...
```

### Horn Combinations (Ơ, Ư)

```typescript
const result = generator.generateGlyphs('O.ss01/U.ss01', {
  ...options,
  shouldCreateHorn: true,
  hornGlyphUppercase: 'horn'
});

// Horn + tone combinations
console.log('Horn variants for O:');
result.getVariants('O.ss01')
  .filter(v => v.includes('horn'))
  .forEach(variant => {
    const input = result.getInputPattern('O.ss01', variant);
    console.log(`${variant} <- ${input}`);
  });

// Output:
// Ohorn.ss01 <- O.ss01+horn
// Ohorngrave.ss01 <- O.ss01+horn+grave
// Ohornacute.ss01 <- O.ss01+horn+acute
// ...
```

### Dotless I Processing

```typescript
const result = generator.generateGlyphs('i.ss01', {
  ...options,
  shouldCreateDotlessI: true,
  dotlessIGlyph: 'dotlessi'
});

console.log('Dotless i variants:');
result.getVariants('i.ss01').forEach(variant => {
  const input = result.getInputPattern('i.ss01', variant);
  console.log(`${variant} <- ${input}`);
});

// Output:
// igrave.ss01 <- dotlessi.ss01+grave
// iacute.ss01 <- dotlessi.ss01+acute
// itilde.ss01 <- dotlessi.ss01+tilde
// ...
```

### Batch Processing

```typescript
// Process multiple characters efficiently
const input = 'A.ss01/E.ss01/O.ss01/U.ss01/a.ss01/e.ss01/o.ss01/u.ss01';
const result = generator.generateGlyphs(input, options);

console.log(`Generated ${result.getAllBaseGlyphs().length} base glyphs`);

// Count total variants
let totalVariants = 0;
result.getAllBaseGlyphs().forEach(baseGlyph => {
  totalVariants += result.getVariants(baseGlyph).length;
});

console.log(`Total variants: ${totalVariants}`);
// Output: Total variants: 112+ (depending on configuration)
```

### Legacy String Output

```typescript
// For backward compatibility with string-based APIs
const stringOutput = generator.generateGlyphsAsString('A.ss01', options);
console.log(stringOutput);

// Output:
// Agrave.ss01=A.ss01+grave
// Aacute.ss01=A.ss01+acute
// Atilde.ss01=A.ss01+tilde
// ...
```

### Special Character Filters

```typescript
// Generate only dotless i variants
const dotlessI = generator.filterI('i.ss01/i.ss02');
console.log(dotlessI);

// Generate only horn characters
const hornGlyphs = generator.filterHorn('O.ss01/U.ss01/o.ss01/u.ss01', options, true);
console.log(hornGlyphs);
```

## Performance

The library is optimized for high-performance batch processing:

```typescript
// Performance test
const startTime = Date.now();
const iterations = 1000;

for (let i = 0; i < iterations; i++) {
  generator.generateGlyphs('A.ss01/E.ss01/O.ss01/U.ss01', options);
}

const totalTime = Date.now() - startTime;
console.log(`${(totalTime / iterations).toFixed(2)}ms per iteration`);
// Typical output: ~0.10ms per iteration (1,100+ variants/ms)
```

## Character Support

| Character | Tone Marks | Circumflex | Breve | Horn | Special |
|-----------|------------|------------|-------|------|---------|
| A, a      | ✓          | ✓          | ✓     | ✗    | -       |
| E, e      | ✓          | ✓          | ✗     | ✗    | -       |
| I, i      | ✓          | ✗          | ✗     | ✗    | Dotless |
| O, o      | ✓          | ✓          | ✗     | ✓    | -       |
| U, u      | ✓          | ✗          | ✗     | ✓    | -       |
| Y, y      | ✓          | ✗          | ✗     | ✗    | -       |
| D, d      | ✗          | ✗          | ✗     | ✗    | Stroke  |

**Tone Marks**: ` (grave), ´ (acute), ~ (tilde), ̉ (hook above), ̣ (dot below)

## Migration from String API

If upgrading from a string-based API:

```typescript
// Old way (string concatenation)
const oldResult = someStringBasedGenerator(input);
const lines = oldResult.split('\n');

// New way (structured object)
const newResult = generator.generateGlyphs(input, options);
const baseGlyph = 'A.ss01';
const variants = newResult.getVariants(baseGlyph);
const inputPattern = newResult.getInputPattern(baseGlyph, 'Agrave.ss01');
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## TypeScript Support

This library is written in TypeScript and provides full type definitions. No additional `@types` packages needed!

```typescript
import { 
  VietnameseGlyphGenerator,
  GlyphOptions,
  GlyphGenerationResult,
  GenerationResult 
} from 'vietnamese-glyph-generator';
```
