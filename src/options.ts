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
