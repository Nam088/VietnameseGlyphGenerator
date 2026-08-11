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
