# Vietnamese Glyph Generator

A small TypeScript library that generates OpenType glyph name mappings for Vietnamese diacritics (tone marks, circumflex, breve, horn, dotless i, D stroke) from a compact input string.

## Installation

```bash
npm install vietnamese-glyph-generator
```

## Quick start

```typescript
import { generateGlyphs } from 'vietnamese-glyph-generator';

const result = generateGlyphs('A.ss01/O.ss01', {
  graveAccentGlyph: 'grave',
  acuteAccentGlyph: 'acute'
});

console.log(result.getAllBaseGlyphs());
// ['A.ss01', 'O.ss01']

console.log(result.getVariants('A.ss01'));
// ['Agrave.ss01', 'Aacute.ss01', 'Atilde.ss01', 'Ahoi.ss01', 'Adotbelow.ss01',
//  'Acircumflex.ss01', 'Acircumflexgrave.ss01', ..., 'Abreve.ss01', ...]

console.log(result.getInputPattern('A.ss01', 'Agrave.ss01'));
// 'A.ss01+grave'

console.log(result.toString());
// A.ss01+grave=Agrave.ss01
// A.ss01+acute=Aacute.ss01
// ...
```

There is no class to instantiate. `generateGlyphs` is a plain function; every call is independent and side effect free.

## Input format

Input is one or more tokens separated by `/`, each token being a base letter followed by a dot and an OpenType feature suffix:

```
A.ss01/O.ss02/D.ss01
```

Leading/trailing slashes, whitespace, and repeated slashes are cleaned up automatically. A token that doesn't have exactly one `base.feature` shape (missing the dot, empty base, empty feature, or more than one dot) is skipped.

## API

### `generateGlyphs(input: string, options?: GlyphOptions): GlyphGenerationResult`

Parses `input` and returns a `GlyphGenerationResult` containing every generated variant for every recognized base letter.

### `GlyphOptions`

All fields are optional; each accent field falls back to a sensible default OpenType glyph name when omitted.

| Field | Default | Meaning |
|---|---|---|
| `graveAccentGlyph` | `'grave'` | dấu huyền (`` ` ``) |
| `acuteAccentGlyph` | `'acute'` | dấu sắc (´) |
| `tildeGlyph` | `'tilde'` | dấu ngã (~) |
| `hookAboveGlyph` | `'hookabovecomb'` | dấu hỏi |
| `dotBelowGlyph` | `'dotbelowcomb'` | dấu nặng |
| `circumflexGlyph` | `'circumflex'` | dấu mũ (Â, Ê) |
| `breveGlyph` | `'breve'` | dấu trăng (Ă) |
| `hornGlyphUppercase` | `'horn'` | horn for O, U |
| `hornGlyphLowercase` | `'horn'` | horn for o, u |
| `secondaryGraveGlyph` | falls back to `graveAccentGlyph` | grave used on top of circumflex/breve |
| `secondaryAcuteGlyph` | falls back to `acuteAccentGlyph` | acute used on top of circumflex/breve |
| `secondaryTildeGlyph` | falls back to `tildeGlyph` | tilde used on top of circumflex/breve |
| `secondaryHookAboveGlyph` | falls back to `hookAboveGlyph` | hook above used on top of circumflex/breve |
| `dStrokeUppercaseGlyph` | `'hyphen.case'` | stroke for Đ |
| `dStrokeLowercaseGlyph` | `'hyphen.case'` | stroke for đ |
| `shouldCreateHorn` | `true` | generate horn combinations for O/o/U/u |
| `shouldCreateDotlessI` | `true` | also emit the `dotlessi.<feature> = i.<feature>` substitution row |
| `onlyLetters` | unrestricted | only process tokens whose base letter is in this list |
| `onlyOutputs` | unrestricted | only keep generated rows whose output glyph name is in this list |

### `GlyphGenerationResult`

```typescript
interface GlyphGenerationResult {
  toString(): string;                                       // "input=output" lines, blank-line separated per base glyph
  toJSON(): string;                                          // JSON of { baseGlyph: { output: input } }
  getAllBaseGlyphs(): string[];
  getVariants(baseGlyph: string): string[];                  // output glyph names for a base glyph
  getInputPattern(baseGlyph: string, outputGlyph: string): string | undefined;
  getGlyph(baseGlyph: string, outputGlyph?: string): string | Record<string, string> | undefined;
}
```

### `findGlyphCandidates(input: string): string[]`

Scans a `/`-separated string (for example, a glyph name list pasted from a font) and returns the tokens that look like a recognized Vietnamese base letter, either bare (`A`, `Uhorn`) or with a feature suffix (`A.ss01`). Anything else is dropped. Duplicates are removed, first-seen order is kept. This is a filtering/preview helper only, it does not generate anything by itself, use its output to build the input you pass to `generateGlyphs`.

```typescript
import { findGlyphCandidates } from 'vietnamese-glyph-generator';

findGlyphCandidates('A/Anvjnavj/A.ss01/E/E.ss02/xyz/Uhorn');
// ['A', 'A.ss01', 'E', 'E.ss02', 'Uhorn']
```

A typical flow: paste a raw glyph list, call `findGlyphCandidates` to get the recognized subset, let the user pick which ones they actually want, join the picked tokens back with `/`, then call `generateGlyphs`.

## Examples

### Circumflex combinations (Â)

```typescript
const result = generateGlyphs('A.ss01', {});

result.getVariants('A.ss01')
  .filter(name => name.includes('circumflex'))
  .forEach(name => console.log(name, '<-', result.getInputPattern('A.ss01', name)));

// Acircumflex.ss01 <- A.ss01+circumflex
// Acircumflexgrave.ss01 <- A.ss01+circumflex+grave
// Acircumflexacute.ss01 <- A.ss01+circumflex+acute
// ...
```

### Horn combinations (Ơ, Ư)

```typescript
const result = generateGlyphs('O.ss01/U.ss01', { shouldCreateHorn: true });

result.getVariants('O.ss01')
  .filter(name => name.includes('horn'))
  .forEach(name => console.log(name, '<-', result.getInputPattern('O.ss01', name)));

// Ohorn.ss01 <- O.ss01+horn
// Ohorngrave.ss01 <- O.ss01+horn+grave
// Ohornacute.ss01 <- O.ss01+horn+acute
// ...
```

### Dotless i

```typescript
const result = generateGlyphs('i.ss01', { shouldCreateDotlessI: true });

console.log(result.getVariants('i.ss01'));
// ['dotlessi.ss01', 'igrave.ss01', 'iacute.ss01', 'itilde.ss01', 'ihoi.ss01', 'idotbelow.ss01']

console.log(result.getInputPattern('i.ss01', 'dotlessi.ss01'));
// 'i.ss01'
console.log(result.getInputPattern('i.ss01', 'igrave.ss01'));
// 'dotlessi.ss01+grave'
```

`idotbelow` intentionally keeps the plain `i.ss01` base instead of the dotless one: the dot-below mark sits under the letter and never collides with the tittle of `i`, so only the marks placed above the letter need the dotless substitution.

### Restricting which letters get generated

```typescript
generateGlyphs('A.ss01/O.ss01/D.ss01', { onlyLetters: ['A'] }).getAllBaseGlyphs();
// ['A.ss01']
```

### Restricting which exact output rows get generated

```typescript
const result = generateGlyphs('U.ss01/u.ss01', { onlyOutputs: ['Uhorn.ss01', 'uhorn.ss01'] });
result.getVariants('U.ss01'); // ['Uhorn.ss01']
result.getVariants('u.ss01'); // ['uhorn.ss01']
```

## Base letter support

| Base letter | Tone marks | Circumflex | Breve | Horn | Special |
|---|---|---|---|---|---|
| A, a | yes | yes | yes | no | |
| E, e | yes | yes | no | no | |
| I | yes | no | no | no | |
| i | yes, on the dotless base | no | no | no | dotless i substitution |
| O, o | yes | yes | no | yes | |
| U, u | yes | no | no | yes | |
| Y, y | yes | no | no | no | |
| Ohorn, ohorn, Uhorn, uhorn | yes | no | no | no | already-horned input |
| D, d | no | no | no | no | D/d stroke (Đ/đ) |

Tone marks generated: grave (`` ` ``), acute (´), tilde (~), hook above, dot below.

## Example app

`examples/solidjs` is a small SolidJS + TypeScript + Tailwind app that exercises the whole API interactively (input, `findGlyphCandidates` picker, every `GlyphOptions` field, `onlyLetters`/`onlyOutputs`). It imports the library straight from `src/`, no build step needed:

```bash
cd examples/solidjs
npm install
npm run dev
```

## Development

```bash
npm test              # run the test suite once
npm run test:watch    # run tests in watch mode
npm run test:coverage # run tests with a coverage report
npm run lint          # lint src/
npm run build         # type-check and emit dist/
```

## License

MIT
