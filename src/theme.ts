export const C = {
  bg: '#fbf8f3', page: '#ece6dc', ink: '#1f1a17', mute: '#6b625a', faint: '#a39888',
  line: '#d9d2c7', line2: '#e6dfd4', soft: '#efe9e0',
  brand: '#e0603f', brandDark: '#c9492a', brandSoft: '#fdece6', brandSoft2: '#fde2d9', brandInk: '#a8391f',
  ok: '#3aa55d', okSoft: '#e3f4e8', okInk: '#2a7d45', gold: '#e8b931', goldDark: '#c28a10', goldSoft: '#fbf1d8', goldInk: '#a17208',
  white: '#ffffff',
};
export const R = { sm: 12, md: 16, lg: 20, xl: 26, pill: 999 };

/** Lexend for UI text, Zen Maru Gothic for Japanese. Loaded in App.tsx. */
export const F = { 400: 'Lexend_400Regular', 500: 'Lexend_500Medium', 600: 'Lexend_600SemiBold', 700: 'Lexend_700Bold' } as const;
export const J = { 500: 'ZenMaruGothic_500Medium', 700: 'ZenMaruGothic_700Bold' } as const;

export const shadow = (y = 8, r = 24, o = 0.08) => ({ shadowColor: '#281e14', shadowOffset: { width: 0, height: y }, shadowOpacity: o, shadowRadius: r / 2, elevation: Math.round(y / 2) });

/** Per-module color pairs used by icon tiles and badges */
export const TONE = {
  grammar: { bg: C.brandSoft, fg: C.brand },
  vocab: { bg: C.goldSoft, fg: C.goldDark },
  kanji: { bg: C.okSoft, fg: C.ok },
  listening: { bg: C.brandSoft2, fg: C.brandDark },
};
