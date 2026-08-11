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
