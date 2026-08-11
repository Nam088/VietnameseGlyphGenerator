# Glyph Filter Options Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task by task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `onlyLetters` and `onlyOutputs` filtering options to `generateGlyphs`, and add a new standalone `findGlyphCandidates` function that scans slash separated input for recognizable Vietnamese base letter tokens (with or without a feature suffix) for a caller to present as a pick list.

**Architecture:** `onlyLetters`/`onlyOutputs` are two new optional fields read directly off the raw `GlyphOptions` inside `generate.ts`'s existing token loop, each adding one skip condition. `findGlyphCandidates` is a new, separate pure function in `src/candidates.ts` that reuses `cleanInput` and `letterTable`, but recognizes bare letter tokens too (unlike `tokenize`, which requires a feature suffix).

**Tech Stack:** TypeScript, Vitest.

**Reference spec:** `docs/superpowers/specs/2026-08-11-glyph-filter-options-design.md`

---

## Task 1: `onlyLetters` and `onlyOutputs` options

**Files:**
- Modify: `src/types.ts`
- Modify: `src/generate.ts`
- Modify: `src/generate.test.ts`

- [ ] **Step 1: Write the failing tests**

Add to `src/generate.test.ts` (keep every existing test, append these):

```ts
  it('only processes tokens whose base letter is in onlyLetters', () => {
    const result = generateGlyphs('A.ss01/O.ss01', { onlyLetters: ['A'] });
    expect(result.getAllBaseGlyphs()).toEqual(['A.ss01']);
  });

  it('does not restrict letters when onlyLetters is not set', () => {
    const result = generateGlyphs('A.ss01/O.ss01', {});
    expect(result.getAllBaseGlyphs()).toEqual(['A.ss01', 'O.ss01']);
  });

  it('only keeps variants whose output name is in onlyOutputs', () => {
    const result = generateGlyphs('U.ss01/u.ss01', { onlyOutputs: ['Uhorn.ss01', 'uhorn.ss01'] });
    expect(result.getVariants('U.ss01')).toEqual(['Uhorn.ss01']);
    expect(result.getVariants('u.ss01')).toEqual(['uhorn.ss01']);
  });

  it('keeps only the dotlessi substitution row when onlyOutputs is restricted to it', () => {
    const result = generateGlyphs('i.ss01', { onlyOutputs: ['dotlessi.ss01'] });
    expect(result.getVariants('i.ss01')).toEqual(['dotlessi.ss01']);
  });

  it('combines onlyLetters and onlyOutputs', () => {
    const result = generateGlyphs('A.ss01/O.ss01', { onlyLetters: ['A'], onlyOutputs: ['Agrave.ss01'] });
    expect(result.getAllBaseGlyphs()).toEqual(['A.ss01']);
    expect(result.getVariants('A.ss01')).toEqual(['Agrave.ss01']);
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/generate.test.ts`
Expected: FAIL on the 5 new tests, with `onlyLetters`/`onlyOutputs` not existing on the `GlyphOptions` type (TypeScript error surfaced as a test failure) and the filtering not being applied.

- [ ] **Step 3: Add the two fields to `GlyphOptions`**

In `src/types.ts`, add to the `GlyphOptions` interface (keep every existing field):

```ts
  onlyLetters?: string[];
  onlyOutputs?: string[];
```

- [ ] **Step 4: Apply the filters in `generate.ts`**

Replace the loop body in `src/generate.ts`:

```ts
  for (const { base, features } of tokenize(cleanInput(input))) {
    const families = letterTable[base];
    if (!families) continue;
    if (options.onlyLetters && !options.onlyLetters.includes(base)) continue;

    const baseGlyph = `${base}.${features}`;
    for (const family of families) {
      for (const variant of markGenerators[family](base, features, normalizedOptions)) {
        if (options.onlyOutputs && !options.onlyOutputs.includes(variant.output)) continue;
        result.addGlyph(baseGlyph, variant.output, variant.input);
      }
    }
  }
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/generate.test.ts`
Expected: PASS, 11 tests (6 existing plus 5 new).

- [ ] **Step 6: Commit**

```bash
git add src/types.ts src/generate.ts src/generate.test.ts
git commit -m "feat: add onlyLetters and onlyOutputs filtering options"
```

---

## Task 2: `findGlyphCandidates`

**Files:**
- Create: `src/candidates.ts`
- Test: `src/candidates.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { findGlyphCandidates } from './candidates';

describe('findGlyphCandidates', () => {
  it('keeps bare recognized letters and letter plus feature tokens, drops unrecognized ones', () => {
    expect(findGlyphCandidates('A/Anvjnavj/A.ss01/E/E.ss02/xyz/Uhorn')).toEqual([
      'A', 'A.ss01', 'E', 'E.ss02', 'Uhorn'
    ]);
  });

  it('removes duplicates while keeping first-seen order', () => {
    expect(findGlyphCandidates('A/A/A.ss01')).toEqual(['A', 'A.ss01']);
  });

  it('returns an empty array for an empty string', () => {
    expect(findGlyphCandidates('')).toEqual([]);
  });

  it('drops a token whose base letter is not in the letter table', () => {
    expect(findGlyphCandidates('Z.ss01/Q')).toEqual([]);
  });

  it('drops a token with a dot but empty features', () => {
    expect(findGlyphCandidates('A./E.')).toEqual([]);
  });

  it('drops a token with more than one dot', () => {
    expect(findGlyphCandidates('A.ss01.extra')).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/candidates.test.ts`
Expected: FAIL, `Cannot find module './candidates'`.

- [ ] **Step 3: Write the implementation**

```ts
import { cleanInput } from './parser/cleanInput';
import { letterTable } from './letters/letterTable';

export function findGlyphCandidates(input: string): string[] {
  const seen = new Set<string>();
  const candidates: string[] = [];

  for (const part of cleanInput(input).split('/')) {
    if (part.length === 0 || seen.has(part) || !isRecognizedToken(part)) continue;
    seen.add(part);
    candidates.push(part);
  }

  return candidates;
}

function isRecognizedToken(part: string): boolean {
  const pieces = part.split('.');
  if (pieces.length === 1) return letterTable[pieces[0]] !== undefined;
  if (pieces.length === 2) return letterTable[pieces[0]] !== undefined && pieces[1].length > 0;
  return false;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/candidates.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

```bash
git add src/candidates.ts src/candidates.test.ts
git commit -m "feat: add findGlyphCandidates for scanning slash separated input"
```

---

## Task 3: Export `findGlyphCandidates` from the public entry point

**Files:**
- Modify: `src/index.ts`
- Modify: `src/index.test.ts`

- [ ] **Step 1: Write the failing test**

Add to `src/index.test.ts` (keep the existing two tests, append this one), and add `findGlyphCandidates` to the existing import line:

```ts
import { generateGlyphs, findGlyphCandidates } from './index';
```

```ts
  it('exposes findGlyphCandidates from the package entry point', () => {
    expect(findGlyphCandidates('A/Anvjnavj/A.ss01')).toEqual(['A', 'A.ss01']);
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/index.test.ts`
Expected: FAIL, `findGlyphCandidates` is not exported from `./index`.

- [ ] **Step 3: Add the export**

In `src/index.ts`:

```ts
export { generateGlyphs } from './generate';
export { findGlyphCandidates } from './candidates';
export { GlyphOptions, GlyphGenerationResult } from './types';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/index.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
git add src/index.ts src/index.test.ts
git commit -m "feat: export findGlyphCandidates from the package entry point"
```

---

## Task 4: Full verification and version bump

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Run the full suite and coverage**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no errors.

Run: `npm run lint`
Expected: no errors.

Run: `npm run test:coverage`
Expected: all test files pass, all thresholds (90%) still met. If `src/candidates.ts` falls short on branch coverage, add the missing case to `src/candidates.test.ts` rather than a new file.

Run: `npm run build`
Expected: `dist/` regenerated with no errors, no `.test.js` files in `dist/` (per the existing `tsconfig.build.json` exclude), `dist/index.d.ts` exporting `generateGlyphs`, `findGlyphCandidates`, `GlyphOptions`, `GlyphGenerationResult`.

- [ ] **Step 2: Bump the package version**

In `package.json`, change:

```json
  "version": "0.2.0",
```

to:

```json
  "version": "0.3.0",
```

This is a minor bump: purely additive (new optional fields, new export), no existing behavior changes when the new options are not used.

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "chore: bump version to 0.3.0 for the new filtering options"
```
