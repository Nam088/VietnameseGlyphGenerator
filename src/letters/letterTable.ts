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
