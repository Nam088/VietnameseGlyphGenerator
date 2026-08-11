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
