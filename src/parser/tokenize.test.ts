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
