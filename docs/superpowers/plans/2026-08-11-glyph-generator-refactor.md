# Glyph Generator Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task by task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single stateful class in `src/index.ts` with a set of small pure function modules that generate Vietnamese diacritic glyph name mappings directly into a structured result, with no intermediate string round trip and no duplicated single glyph versus multi glyph code paths.

**Architecture:** A token parser (`parser/cleanInput.ts`, `parser/tokenize.ts`) turns raw input into `{ base, features }` tokens. A declarative table (`letters/letterTable.ts`) maps each base letter to the mark families it needs. Each mark family is one pure function in `marks/*.ts` returning `Variant[]` directly. `letters/markFamilies.ts` dispatches a family name to its function. `generate.ts` ties parser, table, and marks together and writes straight into the result object built by `result.ts`. `index.ts` exposes one function, `generateGlyphs`.

**Tech Stack:** TypeScript, Vitest (with `@vitest/coverage-v8`), no runtime dependencies.

**Reference spec:** `docs/superpowers/specs/2026-08-11-glyph-generator-refactor-design.md`

---

## Task 1: Vitest tooling setup

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json`

- [ ] **Step 1: Add `@vitest/coverage-v8` and new scripts to `package.json`**

In `package.json`, add to `devDependencies` (keep every existing entry, just add this one):

```json
    "@vitest/coverage-v8": "^1.3.0",
```

Add to `scripts` (keep every existing entry, add these two, right after `"test": "vitest --run",`):

```json
    "test:watch": "vitest",
    "test:coverage": "vitest --run --coverage",
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts'],
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90
      }
    }
  }
});
```

- [ ] **Step 3: Install and verify**

Run: `npm install`
Expected: installs `@vitest/coverage-v8`, no errors.

Run: `npm test`
Expected: existing `src/index.test.ts` suite still passes (nothing in `src/` has changed yet).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "chore: add vitest config and coverage tooling"
```

---

## Task 2: Rewrite `types.ts` with the trimmed public types

**Files:**
- Modify: `src/types.ts` (replace entire content)

- [ ] **Step 1: Replace the content of `src/types.ts`**

```ts
export interface GlyphOptions {
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
  dStrokeUppercaseGlyph?: string;
  dStrokeLowercaseGlyph?: string;
  shouldCreateDotlessI?: boolean;
  shouldCreateHorn?: boolean;
}

export interface Variant {
  output: string;
  input: string;
}

export interface GlyphGenerationResult {
  toString(): string;
  toJSON(): string;
  getGlyph(baseGlyph: string, outputGlyph?: string): string | Record<string, string> | undefined;
  getVariants(baseGlyph: string): string[];
  getAllBaseGlyphs(): string[];
  getInputPattern(baseGlyph: string, outputGlyph: string): string | undefined;
}
```

This drops `characterStyle`, `dotlessIGlyph`, `openTypeFeature` (all three were only read by the now removed duplicate single glyph code path, and two of them were read inconsistently there, see the design doc "Bối cảnh" section) and drops the unused sample glyph name constants (`CHARACTER_STYLES`, `GRAVE_ACCENT_GLYPHS`, etc). It also drops `GlyphResult`, `GenerationResult`, `GenerationResultImpl`, `GlyphGenerationResultImpl` (moving to `result.ts` in Task 14) and `GlyphLists` (no longer needed, category lists are gone).

- [ ] **Step 2: Verify it still compiles in isolation**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: errors, because `src/index.ts` still imports names that no longer exist in `types.ts` (`GlyphLists`, `GlyphGenerationResultImpl`, etc). This is expected. Confirm the errors are all in `src/index.ts`, not in `src/types.ts` itself.

- [ ] **Step 3: Commit**

```bash
git add src/types.ts
git commit -m "refactor: trim GlyphOptions and drop dead public types"
```

---

## Task 3: `options.ts`

**Files:**
- Create: `src/options.ts`
- Test: `src/options.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { normalizeOptions } from './options';

describe('normalizeOptions', () => {
  it('fills every field with its default when options is empty', () => {
    const result = normalizeOptions({});
    expect(result).toEqual({
      graveAccentGlyph: 'grave',
      acuteAccentGlyph: 'acute',
      tildeGlyph: 'tilde',
      hookAboveGlyph: 'hookabovecomb',
      dotBelowGlyph: 'dotbelowcomb',
      circumflexGlyph: 'circumflex',
      breveGlyph: 'breve',
      hornGlyphUppercase: 'horn',
      hornGlyphLowercase: 'horn',
      secondaryGraveGlyph: 'grave',
      secondaryAcuteGlyph: 'acute',
      secondaryTildeGlyph: 'tilde',
      secondaryHookAboveGlyph: 'hookabovecomb',
      dStrokeUppercaseGlyph: 'hyphen.case',
      dStrokeLowercaseGlyph: 'hyphen.case',
      shouldCreateDotlessI: true,
      shouldCreateHorn: true
    });
  });

  it('keeps explicit values instead of defaults', () => {
    const result = normalizeOptions({ graveAccentGlyph: 'gravecomb', shouldCreateHorn: false });
    expect(result.graveAccentGlyph).toBe('gravecomb');
    expect(result.shouldCreateHorn).toBe(false);
  });

  it('falls back secondary tone glyphs to the primary ones when only primary is set', () => {
    const result = normalizeOptions({ acuteAccentGlyph: 'acutecomb' });
    expect(result.secondaryAcuteGlyph).toBe('acutecomb');
  });

  it('keeps an explicit secondary value even when primary is also set', () => {
    const result = normalizeOptions({ acuteAccentGlyph: 'acutecomb', secondaryAcuteGlyph: 'acute.ss02' });
    expect(result.secondaryAcuteGlyph).toBe('acute.ss02');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/options.test.ts`
Expected: FAIL, `Cannot find module './options'`.

- [ ] **Step 3: Write the implementation**

```ts
import { GlyphOptions } from './types';

export type NormalizedGlyphOptions = Required<Pick<GlyphOptions,
  'graveAccentGlyph' | 'acuteAccentGlyph' | 'tildeGlyph' | 'hookAboveGlyph' | 'dotBelowGlyph' |
  'circumflexGlyph' | 'breveGlyph' | 'hornGlyphUppercase' | 'hornGlyphLowercase' |
  'secondaryGraveGlyph' | 'secondaryAcuteGlyph' | 'secondaryTildeGlyph' | 'secondaryHookAboveGlyph' |
  'dStrokeUppercaseGlyph' | 'dStrokeLowercaseGlyph' | 'shouldCreateDotlessI' | 'shouldCreateHorn'
>>;

export function normalizeOptions(options: GlyphOptions): NormalizedGlyphOptions {
  return {
    graveAccentGlyph: options.graveAccentGlyph ?? 'grave',
    acuteAccentGlyph: options.acuteAccentGlyph ?? 'acute',
    tildeGlyph: options.tildeGlyph ?? 'tilde',
    hookAboveGlyph: options.hookAboveGlyph ?? 'hookabovecomb',
    dotBelowGlyph: options.dotBelowGlyph ?? 'dotbelowcomb',
    circumflexGlyph: options.circumflexGlyph ?? 'circumflex',
    breveGlyph: options.breveGlyph ?? 'breve',
    hornGlyphUppercase: options.hornGlyphUppercase ?? 'horn',
    hornGlyphLowercase: options.hornGlyphLowercase ?? 'horn',
    secondaryGraveGlyph: options.secondaryGraveGlyph ?? options.graveAccentGlyph ?? 'grave',
    secondaryAcuteGlyph: options.secondaryAcuteGlyph ?? options.acuteAccentGlyph ?? 'acute',
    secondaryTildeGlyph: options.secondaryTildeGlyph ?? options.tildeGlyph ?? 'tilde',
    secondaryHookAboveGlyph: options.secondaryHookAboveGlyph ?? options.hookAboveGlyph ?? 'hookabovecomb',
    dStrokeUppercaseGlyph: options.dStrokeUppercaseGlyph ?? 'hyphen.case',
    dStrokeLowercaseGlyph: options.dStrokeLowercaseGlyph ?? 'hyphen.case',
    shouldCreateDotlessI: options.shouldCreateDotlessI ?? true,
    shouldCreateHorn: options.shouldCreateHorn ?? true
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/options.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add src/options.ts src/options.test.ts
git commit -m "feat: add normalizeOptions as a pure function module"
```

---

## Task 4: `marks/toneMarks.ts`

**Files:**
- Create: `src/marks/toneMarks.ts`
- Test: `src/marks/toneMarks.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { normalizeOptions } from '../options';
import { generateBasicToneMarks } from './toneMarks';

const options = normalizeOptions({});

describe('generateBasicToneMarks', () => {
  it('generates grave, acute, tilde, hoi and dotbelow variants', () => {
    expect(generateBasicToneMarks('A', 'ss01', options)).toEqual([
      { output: 'Agrave.ss01', input: 'A.ss01+grave' },
      { output: 'Aacute.ss01', input: 'A.ss01+acute' },
      { output: 'Atilde.ss01', input: 'A.ss01+tilde' },
      { output: 'Ahoi.ss01', input: 'A.ss01+hookabovecomb' },
      { output: 'Adotbelow.ss01', input: 'A.ss01+dotbelowcomb' }
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/marks/toneMarks.test.ts`
Expected: FAIL, `Cannot find module './toneMarks'`.

- [ ] **Step 3: Write the implementation**

```ts
import { Variant } from '../types';
import { NormalizedGlyphOptions } from '../options';

export function generateBasicToneMarks(baseName: string, features: string, options: NormalizedGlyphOptions): Variant[] {
  const token = `${baseName}.${features}`;

  return [
    { output: `${baseName}grave.${features}`, input: `${token}+${options.graveAccentGlyph}` },
    { output: `${baseName}acute.${features}`, input: `${token}+${options.acuteAccentGlyph}` },
    { output: `${baseName}tilde.${features}`, input: `${token}+${options.tildeGlyph}` },
    { output: `${baseName}hoi.${features}`, input: `${token}+${options.hookAboveGlyph}` },
    { output: `${baseName}dotbelow.${features}`, input: `${token}+${options.dotBelowGlyph}` }
  ];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/marks/toneMarks.test.ts`
Expected: PASS, 1 test.

- [ ] **Step 5: Commit**

```bash
git add src/marks/toneMarks.ts src/marks/toneMarks.test.ts
git commit -m "feat: add generateBasicToneMarks pure function"
```

---

## Task 5: `marks/circumflex.ts`

**Files:**
- Create: `src/marks/circumflex.ts`
- Test: `src/marks/circumflex.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { normalizeOptions } from '../options';
import { generateCircumflexCombinations } from './circumflex';

const options = normalizeOptions({});

describe('generateCircumflexCombinations', () => {
  it('generates circumflex alone and combined with the secondary tone glyphs', () => {
    expect(generateCircumflexCombinations('A', 'ss01', options)).toEqual([
      { output: 'Acircumflex.ss01', input: 'A.ss01+circumflex' },
      { output: 'Acircumflexgrave.ss01', input: 'A.ss01+circumflex+grave' },
      { output: 'Acircumflexacute.ss01', input: 'A.ss01+circumflex+acute' },
      { output: 'Acircumflextilde.ss01', input: 'A.ss01+circumflex+tilde' },
      { output: 'Acircumflexhoi.ss01', input: 'A.ss01+circumflex+hookabovecomb' },
      { output: 'Acircumflexdotbelow.ss01', input: 'A.ss01+circumflex+dotbelowcomb' }
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/marks/circumflex.test.ts`
Expected: FAIL, `Cannot find module './circumflex'`.

- [ ] **Step 3: Write the implementation**

```ts
import { Variant } from '../types';
import { NormalizedGlyphOptions } from '../options';

export function generateCircumflexCombinations(baseName: string, features: string, options: NormalizedGlyphOptions): Variant[] {
  const token = `${baseName}.${features}`;
  const circumflex = options.circumflexGlyph;

  return [
    { output: `${baseName}circumflex.${features}`, input: `${token}+${circumflex}` },
    { output: `${baseName}circumflexgrave.${features}`, input: `${token}+${circumflex}+${options.secondaryGraveGlyph}` },
    { output: `${baseName}circumflexacute.${features}`, input: `${token}+${circumflex}+${options.secondaryAcuteGlyph}` },
    { output: `${baseName}circumflextilde.${features}`, input: `${token}+${circumflex}+${options.secondaryTildeGlyph}` },
    { output: `${baseName}circumflexhoi.${features}`, input: `${token}+${circumflex}+${options.secondaryHookAboveGlyph}` },
    { output: `${baseName}circumflexdotbelow.${features}`, input: `${token}+${circumflex}+${options.dotBelowGlyph}` }
  ];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/marks/circumflex.test.ts`
Expected: PASS, 1 test.

- [ ] **Step 5: Commit**

```bash
git add src/marks/circumflex.ts src/marks/circumflex.test.ts
git commit -m "feat: add generateCircumflexCombinations pure function"
```

---

## Task 6: `marks/breve.ts`

**Files:**
- Create: `src/marks/breve.ts`
- Test: `src/marks/breve.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { normalizeOptions } from '../options';
import { generateBreveCombinations } from './breve';

const options = normalizeOptions({});

describe('generateBreveCombinations', () => {
  it('generates breve alone and combined with the secondary tone glyphs', () => {
    expect(generateBreveCombinations('A', 'ss01', options)).toEqual([
      { output: 'Abreve.ss01', input: 'A.ss01+breve' },
      { output: 'Abrevegrave.ss01', input: 'A.ss01+breve+grave' },
      { output: 'Abreveacute.ss01', input: 'A.ss01+breve+acute' },
      { output: 'Abrevetilde.ss01', input: 'A.ss01+breve+tilde' },
      { output: 'Abrevehoi.ss01', input: 'A.ss01+breve+hookabovecomb' },
      { output: 'Abrevedotbelow.ss01', input: 'A.ss01+breve+dotbelowcomb' }
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/marks/breve.test.ts`
Expected: FAIL, `Cannot find module './breve'`.

- [ ] **Step 3: Write the implementation**

```ts
import { Variant } from '../types';
import { NormalizedGlyphOptions } from '../options';

export function generateBreveCombinations(baseName: string, features: string, options: NormalizedGlyphOptions): Variant[] {
  const token = `${baseName}.${features}`;
  const breve = options.breveGlyph;

  return [
    { output: `${baseName}breve.${features}`, input: `${token}+${breve}` },
    { output: `${baseName}brevegrave.${features}`, input: `${token}+${breve}+${options.secondaryGraveGlyph}` },
    { output: `${baseName}breveacute.${features}`, input: `${token}+${breve}+${options.secondaryAcuteGlyph}` },
    { output: `${baseName}brevetilde.${features}`, input: `${token}+${breve}+${options.secondaryTildeGlyph}` },
    { output: `${baseName}brevehoi.${features}`, input: `${token}+${breve}+${options.secondaryHookAboveGlyph}` },
    { output: `${baseName}brevedotbelow.${features}`, input: `${token}+${breve}+${options.dotBelowGlyph}` }
  ];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/marks/breve.test.ts`
Expected: PASS, 1 test.

- [ ] **Step 5: Commit**

```bash
git add src/marks/breve.ts src/marks/breve.test.ts
git commit -m "feat: add generateBreveCombinations pure function"
```

---

## Task 7: `marks/horn.ts`

**Files:**
- Create: `src/marks/horn.ts`
- Test: `src/marks/horn.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { normalizeOptions } from '../options';
import { generateHornCombinations } from './horn';

const options = normalizeOptions({});

describe('generateHornCombinations', () => {
  it('uses the uppercase horn glyph for O and combines it with the primary tone glyphs', () => {
    expect(generateHornCombinations('O', 'ss01', options)).toEqual([
      { output: 'Ohorn.ss01', input: 'O.ss01+horn' },
      { output: 'Ohorngrave.ss01', input: 'O.ss01+horn+grave' },
      { output: 'Ohornacute.ss01', input: 'O.ss01+horn+acute' },
      { output: 'Ohorntilde.ss01', input: 'O.ss01+horn+tilde' },
      { output: 'Ohornhoi.ss01', input: 'O.ss01+horn+hookabovecomb' },
      { output: 'Ohorndotbelow.ss01', input: 'O.ss01+horn+dotbelowcomb' }
    ]);
  });

  it('uses the lowercase horn glyph for u', () => {
    const variants = generateHornCombinations('u', 'ss02', normalizeOptions({ hornGlyphLowercase: 'horn.alt' }));
    expect(variants[0]).toEqual({ output: 'uhorn.ss02', input: 'u.ss02+horn.alt' });
  });

  it('returns no variants when shouldCreateHorn is false', () => {
    expect(generateHornCombinations('O', 'ss01', normalizeOptions({ shouldCreateHorn: false }))).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/marks/horn.test.ts`
Expected: FAIL, `Cannot find module './horn'`.

- [ ] **Step 3: Write the implementation**

```ts
import { Variant } from '../types';
import { NormalizedGlyphOptions } from '../options';

const UPPERCASE_HORN_LETTERS = new Set(['O', 'U']);
const LOWERCASE_HORN_LETTERS = new Set(['o', 'u']);

export function generateHornCombinations(baseName: string, features: string, options: NormalizedGlyphOptions): Variant[] {
  if (!options.shouldCreateHorn) return [];

  const horn = UPPERCASE_HORN_LETTERS.has(baseName)
    ? options.hornGlyphUppercase
    : LOWERCASE_HORN_LETTERS.has(baseName)
      ? options.hornGlyphLowercase
      : '';
  const token = `${baseName}.${features}`;

  return [
    { output: `${baseName}horn.${features}`, input: `${token}+${horn}` },
    { output: `${baseName}horngrave.${features}`, input: `${token}+${horn}+${options.graveAccentGlyph}` },
    { output: `${baseName}hornacute.${features}`, input: `${token}+${horn}+${options.acuteAccentGlyph}` },
    { output: `${baseName}horntilde.${features}`, input: `${token}+${horn}+${options.tildeGlyph}` },
    { output: `${baseName}hornhoi.${features}`, input: `${token}+${horn}+${options.hookAboveGlyph}` },
    { output: `${baseName}horndotbelow.${features}`, input: `${token}+${horn}+${options.dotBelowGlyph}` }
  ];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/marks/horn.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
git add src/marks/horn.ts src/marks/horn.test.ts
git commit -m "feat: add generateHornCombinations pure function"
```

---

## Task 8: `marks/dStroke.ts`

**Files:**
- Create: `src/marks/dStroke.ts`
- Test: `src/marks/dStroke.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { normalizeOptions } from '../options';
import { generateDStroke } from './dStroke';

const options = normalizeOptions({});

describe('generateDStroke', () => {
  it('uses the uppercase stroke glyph for D', () => {
    expect(generateDStroke('D', 'ss01', options)).toEqual([
      { output: 'Dcroat.ss01', input: 'D.ss01+hyphen.case' }
    ]);
  });

  it('uses the lowercase stroke glyph for d', () => {
    expect(generateDStroke('d', 'ss01', options)).toEqual([
      { output: 'dcroat.ss01', input: 'd.ss01+hyphen.case' }
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/marks/dStroke.test.ts`
Expected: FAIL, `Cannot find module './dStroke'`.

- [ ] **Step 3: Write the implementation**

```ts
import { Variant } from '../types';
import { NormalizedGlyphOptions } from '../options';

export function generateDStroke(baseName: string, features: string, options: NormalizedGlyphOptions): Variant[] {
  const dcroat = baseName === 'D' ? options.dStrokeUppercaseGlyph : options.dStrokeLowercaseGlyph;

  return [
    { output: `${baseName}croat.${features}`, input: `${baseName}.${features}+${dcroat}` }
  ];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/marks/dStroke.test.ts`
Expected: PASS, 2 tests.

- [ ] **Step 5: Commit**

```bash
git add src/marks/dStroke.ts src/marks/dStroke.test.ts
git commit -m "feat: add generateDStroke pure function"
```

---

## Task 9: `marks/dotlessI.ts`

**Files:**
- Create: `src/marks/dotlessI.ts`
- Test: `src/marks/dotlessI.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { normalizeOptions } from '../options';
import { generateDotlessI } from './dotlessI';

describe('generateDotlessI', () => {
  it('adds the dotlessi substitution plus the tone variants when shouldCreateDotlessI is true', () => {
    const options = normalizeOptions({ shouldCreateDotlessI: true });
    expect(generateDotlessI('i', 'ss01', options)).toEqual([
      { output: 'dotlessi.ss01', input: 'i.ss01' },
      { output: 'igrave.ss01', input: 'dotlessi.ss01+grave' },
      { output: 'iacute.ss01', input: 'dotlessi.ss01+acute' },
      { output: 'itilde.ss01', input: 'dotlessi.ss01+tilde' },
      { output: 'ihoi.ss01', input: 'dotlessi.ss01+hookabovecomb' },
      { output: 'idotbelow.ss01', input: 'i.ss01+dotbelowcomb' }
    ]);
  });

  it('skips the dotlessi substitution but keeps the tone variants when shouldCreateDotlessI is false', () => {
    const options = normalizeOptions({ shouldCreateDotlessI: false });
    expect(generateDotlessI('i', 'ss01', options)).toEqual([
      { output: 'igrave.ss01', input: 'dotlessi.ss01+grave' },
      { output: 'iacute.ss01', input: 'dotlessi.ss01+acute' },
      { output: 'itilde.ss01', input: 'dotlessi.ss01+tilde' },
      { output: 'ihoi.ss01', input: 'dotlessi.ss01+hookabovecomb' },
      { output: 'idotbelow.ss01', input: 'i.ss01+dotbelowcomb' }
    ]);
  });
});
```

Note: `idotbelow` intentionally keeps the plain `i.ss01` base (not `dotlessi.ss01`). The dot below mark sits under the letter and never collides with the tittle of `i`, so the tittle stays; only marks placed above the letter (grave, acute, tilde, hook above) need the dotless base. This matches the original behavior in `src/index.ts` (`generateDotlessIWithTones`, see the design doc "Bối cảnh" section).

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/marks/dotlessI.test.ts`
Expected: FAIL, `Cannot find module './dotlessI'`.

- [ ] **Step 3: Write the implementation**

```ts
import { Variant } from '../types';
import { NormalizedGlyphOptions } from '../options';

export function generateDotlessI(baseName: string, features: string, options: NormalizedGlyphOptions): Variant[] {
  const token = `${baseName}.${features}`;
  const dotlessBase = `dotlessi.${features}`;
  const variants: Variant[] = [];

  if (options.shouldCreateDotlessI) {
    variants.push({ output: dotlessBase, input: token });
  }

  variants.push(
    { output: `${baseName}grave.${features}`, input: `${dotlessBase}+${options.graveAccentGlyph}` },
    { output: `${baseName}acute.${features}`, input: `${dotlessBase}+${options.acuteAccentGlyph}` },
    { output: `${baseName}tilde.${features}`, input: `${dotlessBase}+${options.tildeGlyph}` },
    { output: `${baseName}hoi.${features}`, input: `${dotlessBase}+${options.hookAboveGlyph}` },
    { output: `${baseName}dotbelow.${features}`, input: `${token}+${options.dotBelowGlyph}` }
  );

  return variants;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/marks/dotlessI.test.ts`
Expected: PASS, 2 tests.

- [ ] **Step 5: Commit**

```bash
git add src/marks/dotlessI.ts src/marks/dotlessI.test.ts
git commit -m "feat: add generateDotlessI pure function"
```

---

## Task 10: `letters/letterTable.ts`

**Files:**
- Create: `src/letters/letterTable.ts`
- Test: `src/letters/letterTable.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { letterTable } from './letterTable';

describe('letterTable', () => {
  it('declares tone marks, circumflex and breve for A and a', () => {
    expect(letterTable.A).toEqual(['toneMarks', 'circumflex', 'breve']);
    expect(letterTable.a).toEqual(['toneMarks', 'circumflex', 'breve']);
  });

  it('declares tone marks and circumflex for E and e', () => {
    expect(letterTable.E).toEqual(['toneMarks', 'circumflex']);
    expect(letterTable.e).toEqual(['toneMarks', 'circumflex']);
  });

  it('declares only tone marks for I', () => {
    expect(letterTable.I).toEqual(['toneMarks']);
  });

  it('declares dotlessI for i', () => {
    expect(letterTable.i).toEqual(['dotlessI']);
  });

  it('declares dStroke for D and d', () => {
    expect(letterTable.D).toEqual(['dStroke']);
    expect(letterTable.d).toEqual(['dStroke']);
  });

  it('declares tone marks, circumflex and horn for O and o', () => {
    expect(letterTable.O).toEqual(['toneMarks', 'circumflex', 'horn']);
    expect(letterTable.o).toEqual(['toneMarks', 'circumflex', 'horn']);
  });

  it('declares tone marks and horn for U and u', () => {
    expect(letterTable.U).toEqual(['toneMarks', 'horn']);
    expect(letterTable.u).toEqual(['toneMarks', 'horn']);
  });

  it('declares only tone marks for Y, y and the already horned letters', () => {
    for (const letter of ['Y', 'y', 'Ohorn', 'ohorn', 'Uhorn', 'uhorn']) {
      expect(letterTable[letter]).toEqual(['toneMarks']);
    }
  });

  it('has no entry for an unknown letter', () => {
    expect(letterTable.Z).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/letters/letterTable.test.ts`
Expected: FAIL, `Cannot find module './letterTable'`.

- [ ] **Step 3: Write the implementation**

```ts
export type MarkFamilyName = 'toneMarks' | 'circumflex' | 'breve' | 'horn' | 'dStroke' | 'dotlessI';

export const letterTable: Record<string, MarkFamilyName[]> = {
  A: ['toneMarks', 'circumflex', 'breve'],
  a: ['toneMarks', 'circumflex', 'breve'],
  E: ['toneMarks', 'circumflex'],
  e: ['toneMarks', 'circumflex'],
  I: ['toneMarks'],
  i: ['dotlessI'],
  D: ['dStroke'],
  d: ['dStroke'],
  O: ['toneMarks', 'circumflex', 'horn'],
  o: ['toneMarks', 'circumflex', 'horn'],
  U: ['toneMarks', 'horn'],
  u: ['toneMarks', 'horn'],
  Y: ['toneMarks'],
  y: ['toneMarks'],
  Ohorn: ['toneMarks'],
  ohorn: ['toneMarks'],
  Uhorn: ['toneMarks'],
  uhorn: ['toneMarks']
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/letters/letterTable.test.ts`
Expected: PASS, 9 tests.

- [ ] **Step 5: Commit**

```bash
git add src/letters/letterTable.ts src/letters/letterTable.test.ts
git commit -m "feat: add declarative letterTable replacing the duplicated switch statements"
```

---

## Task 11: `letters/markFamilies.ts`

**Files:**
- Create: `src/letters/markFamilies.ts`
- Test: `src/letters/markFamilies.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { normalizeOptions } from '../options';
import { markGenerators } from './markFamilies';
import { generateBasicToneMarks } from '../marks/toneMarks';
import { generateDStroke } from '../marks/dStroke';

const options = normalizeOptions({});

describe('markGenerators', () => {
  it('dispatches toneMarks to generateBasicToneMarks', () => {
    expect(markGenerators.toneMarks('A', 'ss01', options)).toEqual(generateBasicToneMarks('A', 'ss01', options));
  });

  it('dispatches dStroke to generateDStroke', () => {
    expect(markGenerators.dStroke('D', 'ss01', options)).toEqual(generateDStroke('D', 'ss01', options));
  });

  it('has one entry per mark family name used in letterTable', () => {
    expect(Object.keys(markGenerators).sort()).toEqual(
      ['breve', 'circumflex', 'dStroke', 'dotlessI', 'horn', 'toneMarks'].sort()
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/letters/markFamilies.test.ts`
Expected: FAIL, `Cannot find module './markFamilies'`.

- [ ] **Step 3: Write the implementation**

```ts
import { Variant } from '../types';
import { NormalizedGlyphOptions } from '../options';
import { MarkFamilyName } from './letterTable';
import { generateBasicToneMarks } from '../marks/toneMarks';
import { generateCircumflexCombinations } from '../marks/circumflex';
import { generateBreveCombinations } from '../marks/breve';
import { generateHornCombinations } from '../marks/horn';
import { generateDStroke } from '../marks/dStroke';
import { generateDotlessI } from '../marks/dotlessI';

type MarkGenerator = (baseName: string, features: string, options: NormalizedGlyphOptions) => Variant[];

export const markGenerators: Record<MarkFamilyName, MarkGenerator> = {
  toneMarks: generateBasicToneMarks,
  circumflex: generateCircumflexCombinations,
  breve: generateBreveCombinations,
  horn: generateHornCombinations,
  dStroke: generateDStroke,
  dotlessI: generateDotlessI
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/letters/markFamilies.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
git add src/letters/markFamilies.ts src/letters/markFamilies.test.ts
git commit -m "feat: add markFamilies dispatch table"
```

---

## Task 12: `parser/cleanInput.ts`

**Files:**
- Create: `src/parser/cleanInput.ts`
- Test: `src/parser/cleanInput.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { cleanInput } from './cleanInput';

describe('cleanInput', () => {
  it('removes leading and trailing slashes', () => {
    expect(cleanInput('/A.ss01/')).toBe('A.ss01');
  });

  it('removes whitespace and line breaks', () => {
    expect(cleanInput('A.ss01/ \r\n O.ss02')).toBe('A.ss01/O.ss02');
  });

  it('collapses consecutive slashes into one', () => {
    expect(cleanInput('A.ss01//O.ss02')).toBe('A.ss01/O.ss02');
  });

  it('returns an empty string for an empty input', () => {
    expect(cleanInput('')).toBe('');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/parser/cleanInput.test.ts`
Expected: FAIL, `Cannot find module './cleanInput'`.

- [ ] **Step 3: Write the implementation**

```ts
export function cleanInput(input: string): string {
  return input
    .replace(/^\/+|\/+$/g, '')
    .replace(/\s/g, '')
    .replace(/\/+/g, '/');
}
```

Note: the original code had an extra `.replace(/\r\n/g, '')` step after stripping whitespace. `\s` already matches `\r` and `\n`, so that step never had anything left to remove. It is dropped here as a provably no op simplification.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/parser/cleanInput.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add src/parser/cleanInput.ts src/parser/cleanInput.test.ts
git commit -m "feat: add cleanInput, dropping the provably redundant carriage return strip"
```

---

## Task 13: `parser/tokenize.ts`

**Files:**
- Create: `src/parser/tokenize.ts`
- Test: `src/parser/tokenize.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { tokenize } from './tokenize';

describe('tokenize', () => {
  it('splits a cleaned multi glyph string into base and features', () => {
    expect(tokenize('A.ss01/O.ss02')).toEqual([
      { base: 'A', features: 'ss01' },
      { base: 'O', features: 'ss02' }
    ]);
  });

  it('handles a single glyph', () => {
    expect(tokenize('A.ss01')).toEqual([{ base: 'A', features: 'ss01' }]);
  });

  it('returns an empty array for an empty string', () => {
    expect(tokenize('')).toEqual([]);
  });

  it('skips a token with no dot', () => {
    expect(tokenize('A/O.ss01')).toEqual([{ base: 'O', features: 'ss01' }]);
  });

  it('skips a token with an empty base', () => {
    expect(tokenize('.ss01/O.ss01')).toEqual([{ base: 'O', features: 'ss01' }]);
  });

  it('skips a token with empty features', () => {
    expect(tokenize('A./O.ss01')).toEqual([{ base: 'O', features: 'ss01' }]);
  });

  it('skips a token with more than one dot', () => {
    expect(tokenize('A.ss01.extra/O.ss01')).toEqual([{ base: 'O', features: 'ss01' }]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/parser/tokenize.test.ts`
Expected: FAIL, `Cannot find module './tokenize'`.

- [ ] **Step 3: Write the implementation**

```ts
export interface GlyphToken {
  base: string;
  features: string;
}

export function tokenize(cleanedInput: string): GlyphToken[] {
  if (!cleanedInput) return [];

  const tokens: GlyphToken[] = [];

  for (const part of cleanedInput.split('/')) {
    const pieces = part.split('.');
    if (pieces.length !== 2 || pieces[0].length === 0 || pieces[1].length === 0) continue;
    tokens.push({ base: pieces[0], features: pieces[1] });
  }

  return tokens;
}
```

Note: a token needs exactly one dot with non empty text on both sides. The original code had two different validity checks in two different places (one allowed extra dots in an intermediate categorization step, the other required exactly one dot right before generation); only the exactly one dot rule ever reached actual output, so that is the single rule kept here.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/parser/tokenize.test.ts`
Expected: PASS, 7 tests.

- [ ] **Step 5: Commit**

```bash
git add src/parser/tokenize.ts src/parser/tokenize.test.ts
git commit -m "feat: add tokenize with a single unified validity rule"
```

---

## Task 14: `result.ts`

**Files:**
- Create: `src/result.ts`
- Test: `src/result.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { createGlyphGenerationResult } from './result';

describe('createGlyphGenerationResult', () => {
  it('starts empty', () => {
    const result = createGlyphGenerationResult();
    expect(result.getAllBaseGlyphs()).toEqual([]);
    expect(result.toString()).toBe('');
    expect(result.toJSON()).toBe('{}');
  });

  it('stores and reads back variants for one base glyph', () => {
    const result = createGlyphGenerationResult();
    result.addGlyph('A.ss01', 'Agrave.ss01', 'A.ss01+grave');
    result.addGlyph('A.ss01', 'Aacute.ss01', 'A.ss01+acute');

    expect(result.getAllBaseGlyphs()).toEqual(['A.ss01']);
    expect(result.getVariants('A.ss01')).toEqual(['Agrave.ss01', 'Aacute.ss01']);
    expect(result.getInputPattern('A.ss01', 'Agrave.ss01')).toBe('A.ss01+grave');
    expect(result.getGlyph('A.ss01', 'Agrave.ss01')).toBe('A.ss01+grave');
    expect(result.getGlyph('A.ss01')).toEqual({ 'Agrave.ss01': 'A.ss01+grave', 'Aacute.ss01': 'A.ss01+acute' });
  });

  it('returns undefined for an unknown base glyph', () => {
    const result = createGlyphGenerationResult();
    expect(result.getGlyph('Z.ss01')).toBeUndefined();
    expect(result.getInputPattern('Z.ss01', 'Zgrave.ss01')).toBeUndefined();
    expect(result.getVariants('Z.ss01')).toEqual([]);
  });

  it('renders toString as input=output lines, blank line separated per base glyph', () => {
    const result = createGlyphGenerationResult();
    result.addGlyph('A.ss01', 'Agrave.ss01', 'A.ss01+grave');
    result.addGlyph('A.ss01', 'Aacute.ss01', 'A.ss01+acute');
    result.addGlyph('D.ss01', 'Dcroat.ss01', 'D.ss01+hyphen.case');

    expect(result.toString()).toBe(
      'A.ss01+grave=Agrave.ss01\r\nA.ss01+acute=Aacute.ss01\r\n\r\nD.ss01+hyphen.case=Dcroat.ss01'
    );
  });

  it('renders toJSON as the glyph map', () => {
    const result = createGlyphGenerationResult();
    result.addGlyph('A.ss01', 'Agrave.ss01', 'A.ss01+grave');

    expect(JSON.parse(result.toJSON())).toEqual({ 'A.ss01': { 'Agrave.ss01': 'A.ss01+grave' } });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/result.test.ts`
Expected: FAIL, `Cannot find module './result'`.

- [ ] **Step 3: Write the implementation**

```ts
import { GlyphGenerationResult } from './types';

export interface MutableGlyphGenerationResult extends GlyphGenerationResult {
  addGlyph(baseGlyph: string, variant: string, value: string): void;
}

export function createGlyphGenerationResult(): MutableGlyphGenerationResult {
  const glyphs: Record<string, Record<string, string>> = {};

  return {
    addGlyph(baseGlyph, variant, value) {
      if (!glyphs[baseGlyph]) glyphs[baseGlyph] = {};
      glyphs[baseGlyph][variant] = value;
    },

    toString() {
      const groups = Object.values(glyphs)
        .map(variants => Object.entries(variants).map(([output, input]) => `${input}=${output}`).join('\r\n'))
        .filter(group => group.length > 0);

      return groups.join('\r\n\r\n');
    },

    toJSON() {
      return JSON.stringify(glyphs, null, 2);
    },

    getGlyph(baseGlyph, outputGlyph) {
      const data = glyphs[baseGlyph];
      if (!data) return undefined;
      return outputGlyph ? data[outputGlyph] : data;
    },

    getVariants(baseGlyph) {
      return glyphs[baseGlyph] ? Object.keys(glyphs[baseGlyph]) : [];
    },

    getInputPattern(baseGlyph, outputGlyph) {
      return glyphs[baseGlyph]?.[outputGlyph];
    },

    getAllBaseGlyphs() {
      return Object.keys(glyphs);
    }
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/result.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add src/result.ts src/result.test.ts
git commit -m "feat: add createGlyphGenerationResult, built directly with no string round trip"
```

---

## Task 15: `generate.ts`

**Files:**
- Create: `src/generate.ts`
- Test: `src/generate.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { generateGlyphs } from './generate';

describe('generateGlyphs', () => {
  it('returns an empty result for empty input', () => {
    const result = generateGlyphs('', {});
    expect(result.getAllBaseGlyphs()).toEqual([]);
    expect(result.toString()).toBe('');
  });

  it('generates tone, circumflex and breve variants for a single A token', () => {
    const result = generateGlyphs('A.ss01', {});
    expect(result.getAllBaseGlyphs()).toEqual(['A.ss01']);
    expect(result.getVariants('A.ss01')).toEqual(
      expect.arrayContaining(['Agrave.ss01', 'Acircumflex.ss01', 'Abreve.ss01'])
    );
    expect(result.getInputPattern('A.ss01', 'Agrave.ss01')).toBe('A.ss01+grave');
  });

  it('generates variants for every token in a multi glyph input, in input order', () => {
    const result = generateGlyphs('A.ss01/D.ss01', {});
    expect(result.getAllBaseGlyphs()).toEqual(['A.ss01', 'D.ss01']);
    expect(result.getInputPattern('D.ss01', 'Dcroat.ss01')).toBe('D.ss01+hyphen.case');
  });

  it('skips a token whose base letter is not in the letter table', () => {
    const result = generateGlyphs('Z.ss01', {});
    expect(result.getAllBaseGlyphs()).toEqual([]);
  });

  it('omits the horn variant for O when shouldCreateHorn is false, but keeps tone and circumflex variants', () => {
    const result = generateGlyphs('O.ss01', { shouldCreateHorn: false });
    expect(result.getVariants('O.ss01')).not.toContain('Ohorn.ss01');
    expect(result.getVariants('O.ss01')).toContain('Ograve.ss01');
    expect(result.getVariants('O.ss01')).toContain('Ocircumflex.ss01');
  });

  it('omits the dotlessi substitution for i when shouldCreateDotlessI is false, but keeps the tone variants', () => {
    const result = generateGlyphs('i.ss01', { shouldCreateDotlessI: false });
    expect(result.getVariants('i.ss01')).not.toContain('dotlessi.ss01');
    expect(result.getVariants('i.ss01')).toContain('igrave.ss01');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/generate.test.ts`
Expected: FAIL, `Cannot find module './generate'`.

- [ ] **Step 3: Write the implementation**

```ts
import { GlyphGenerationResult, GlyphOptions } from './types';
import { normalizeOptions } from './options';
import { cleanInput } from './parser/cleanInput';
import { tokenize } from './parser/tokenize';
import { letterTable } from './letters/letterTable';
import { markGenerators } from './letters/markFamilies';
import { createGlyphGenerationResult } from './result';

export function generateGlyphs(input: string, options: GlyphOptions = {}): GlyphGenerationResult {
  const normalizedOptions = normalizeOptions(options);
  const result = createGlyphGenerationResult();

  for (const { base, features } of tokenize(cleanInput(input))) {
    const families = letterTable[base];
    if (!families) continue;

    const baseGlyph = `${base}.${features}`;
    for (const family of families) {
      for (const variant of markGenerators[family](base, features, normalizedOptions)) {
        result.addGlyph(baseGlyph, variant.output, variant.input);
      }
    }
  }

  return result;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/generate.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

```bash
git add src/generate.ts src/generate.test.ts
git commit -m "feat: add generateGlyphs, replacing the class based generator"
```

---

## Task 16: Rewrite `index.ts` and `index.test.ts`, delete the old class

**Files:**
- Modify: `src/index.ts` (replace entire content)
- Modify: `src/index.test.ts` (replace entire content)

- [ ] **Step 1: Replace the content of `src/index.ts`**

```ts
export { generateGlyphs } from './generate';
export { GlyphOptions, GlyphGenerationResult } from './types';
```

This removes `VietnameseGlyphGenerator`, `generateGlyphsAsString`, `filterI`, `filterHorn`, `generateGlyph` (the unrelated hash based placeholder), and the `Options` type, all superseded by the modules built in Tasks 3 through 15.

- [ ] **Step 2: Replace the content of `src/index.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { generateGlyphs } from './index';
import { GlyphOptions } from './types';

describe('generateGlyphs (public API)', () => {
  it('is exported from the package entry point and produces the expected shape', () => {
    const options: GlyphOptions = {
      shouldCreateHorn: true,
      shouldCreateDotlessI: true
    };

    const result = generateGlyphs('A.ss01/O.ss01', options);

    expect(result.getAllBaseGlyphs()).toEqual(['A.ss01', 'O.ss01']);
    expect(result.getInputPattern('A.ss01', 'Agrave.ss01')).toBe('A.ss01+grave');
    expect(result.getInputPattern('O.ss01', 'Ohorn.ss01')).toBe('O.ss01+horn');
    expect(typeof result.toString()).toBe('string');
    expect(typeof result.toJSON()).toBe('string');
  });

  it('returns an empty result for an empty string', () => {
    const result = generateGlyphs('', {});
    expect(result.toString()).toBe('');
  });
});
```

- [ ] **Step 3: Run the full suite**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no errors.

Run: `npm test`
Expected: every test file passes (`options.test.ts`, every file under `marks/`, `letters/`, `parser/`, `result.test.ts`, `generate.test.ts`, `index.test.ts`).

- [ ] **Step 4: Commit**

```bash
git add src/index.ts src/index.test.ts
git commit -m "refactor: expose generateGlyphs as the sole public entry point"
```

---

## Task 17: Coverage check and version bump

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Run coverage**

Run: `npm run test:coverage`
Expected: all thresholds (statements, branches, functions, lines at 90%) pass for every file under `src/` except test files. If any file falls short, add the missing case to that file's existing test file (for example, an untested `hornGlyphLowercase` branch in `marks/horn.test.ts`) rather than adding a new file.

- [ ] **Step 2: Bump the package version**

In `package.json`, change:

```json
  "version": "0.1.3",
```

to:

```json
  "version": "0.2.0",
```

This is a minor bump because the public API changed (class removed, `generateGlyphsAsString`/`filterI`/`filterHorn`/`generateGlyph` removed, three `GlyphOptions` fields removed), while the package stays on `0.x` where breaking changes are expected between minor versions.

- [ ] **Step 3: Full verification**

Run: `npm run lint`
Expected: no errors.

Run: `npm run build`
Expected: `dist/` regenerated with no errors, `dist/index.d.ts` exporting `generateGlyphs`, `GlyphOptions`, `GlyphGenerationResult`.

Run: `npm test`
Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add package.json
git commit -m "chore: bump version to 0.2.0 for the breaking API refactor"
```

---

## Post refactor file map

```
src/
  types.ts
  options.ts
  options.test.ts
  marks/
    toneMarks.ts / toneMarks.test.ts
    circumflex.ts / circumflex.test.ts
    breve.ts / breve.test.ts
    horn.ts / horn.test.ts
    dStroke.ts / dStroke.test.ts
    dotlessI.ts / dotlessI.test.ts
  letters/
    letterTable.ts / letterTable.test.ts
    markFamilies.ts / markFamilies.test.ts
  parser/
    cleanInput.ts / cleanInput.test.ts
    tokenize.ts / tokenize.test.ts
  result.ts / result.test.ts
  generate.ts / generate.test.ts
  index.ts / index.test.ts
vitest.config.ts
```
