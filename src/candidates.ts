import { cleanInput } from './parser/cleanInput';
import { letterTable } from './letters/letterTable';

export function findGlyphCandidates(input: string): string[] {
  if (!input) return [];

  const cleaned = cleanInput(input);
  if (!cleaned) return [];

  const seen = new Set<string>();
  const candidates: string[] = [];
  const parts = cleaned.split('/');
  const len = parts.length;

  for (let i = 0; i < len; i++) {
    const part = parts[i];
    if (part.length === 0 || seen.has(part) || !isRecognizedToken(part)) continue;
    seen.add(part);
    candidates.push(part);
  }

  return candidates;
}

function isRecognizedToken(part: string): boolean {
  const dotIdx = part.indexOf('.');
  if (dotIdx === -1) {
    return letterTable[part] !== undefined;
  }
  if (dotIdx > 0 && dotIdx < part.length - 1 && part.indexOf('.', dotIdx + 1) === -1) {
    const base = part.slice(0, dotIdx);
    return letterTable[base] !== undefined;
  }
  return false;
}
