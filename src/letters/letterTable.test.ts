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
