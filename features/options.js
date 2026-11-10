/**
 * Shared Feature Option Lists
 *
 * Single source of truth for option arrays consumed by both the
 * Preferences UI (ui/preferences.js) and the Site Editor
 * (ui/siteeditor.js).  Neither file should define these locally.
 *
 * The null/"Global (default)" sentinel required by the Site Editor's
 * override controls is added at the call site via withGlobalDefault()
 * in siteeditor.js so these arrays stay clean for direct use in
 * preferences.js.
 */

export var FOCUS_OUTLINE_OPTIONS = [
  { value: 'off',    label: 'Bleu discret' },
  { value: 'on',     label: 'Anneau bleu' },
  { value: 'high',   label: 'Anneau jaune' },
  { value: 'portal', label: 'Style portail (halo)' },
  { value: 'white',  label: 'Anneau blanc' },
];

export var FOCUS_TRANSITION_MODE_OPTIONS = [
  { value: 'slide', label: 'Glissement' },
  { value: 'scale', label: 'Agrandissement' },
  { value: 'glow',  label: 'Halo (pulsation)' },
  { value: 'off',   label: 'Désactivé' },
];

export var FOCUS_TRANSITION_SPEED_OPTIONS = [
  { value: 'fast',   label: 'Rapide (150 ms)' },
  { value: 'medium', label: 'Moyenne (250 ms)' },
  { value: 'slow',   label: 'Lente (400 ms)' },
];

export var TEXT_SCALE_OPTIONS = [
  { value: 'extra-small', label: 'Très petit (75 %)' },
  { value: 'small',       label: 'Petit (90 %)' },
  { value: 'off',         label: 'Normal (100 %)' },
  { value: 'medium',      label: 'Moyen (115 %)' },
  { value: 'large',       label: 'Grand (135 %)' },
  { value: 'extra-large', label: 'Très grand (160 %)' },
];

export var NAVIGATION_MODE_OPTIONS = [
  { value: 'geometric',   label: 'Grille stricte (géométrique)' },
  { value: 'directional', label: 'Intelligente (recommandée)' },
  { value: 'polyfill',    label: 'Ancienne (compatibilité)' },
];

export var VIEWPORT_OPTIONS = [
  { value: 'auto',     label: 'Auto' },
  { value: 'locked',   label: 'Verrouillé (1920)' },
  { value: 'unlocked', label: 'Libre' },
];

export var UA_MODE_OPTIONS = [
  { value: 'tizen',   label: 'TV Tizen' },
  { value: 'desktop', label: 'Ordinateur' },
  { value: 'mobile',  label: 'Mobile' },
];
