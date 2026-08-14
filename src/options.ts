import { GlyphOptions } from './types';

export type NormalizedGlyphOptions = Required<Pick<GlyphOptions,
  'graveAccentGlyph' | 'acuteAccentGlyph' | 'tildeGlyph' | 'hookAboveGlyph' | 'dotBelowGlyph' |
  'circumflexGlyph' | 'breveGlyph' | 'hornGlyphUppercase' | 'hornGlyphLowercase' |
  'secondaryGraveGlyph' | 'secondaryAcuteGlyph' | 'secondaryTildeGlyph' | 'secondaryHookAboveGlyph' |
  'dStrokeUppercaseGlyph' | 'dStrokeLowercaseGlyph' | 'shouldCreateDotlessI' | 'shouldCreateHorn'
>>;

export const DEFAULT_NORMALIZED_OPTIONS: NormalizedGlyphOptions = Object.freeze({
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

export function normalizeOptions(options?: GlyphOptions): NormalizedGlyphOptions {
  if (!options || Object.keys(options).length === 0) {
    return DEFAULT_NORMALIZED_OPTIONS;
  }

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
