# UI kit (`src/theme.ts`, `src/ui.tsx`)

Reuse these instead of raw RN components/styles. No UI library is used.

## Tokens — `src/theme.ts`

- `C` colors: `bg` (warm off-white page), `ink`/`mute`/`faint` (text), `line`/`line2`/`soft` (borders, fills), `brand*` (coral — primary & "wrong"), `ok*` (green — correct & kanji), `gold*` (stars, highlights), `white`.
- `R` radii: `sm 12, md 16, lg 20, xl 26, pill 999`.
- `F` Lexend weights `400–700` (UI/Vietnamese text), `J` Zen Maru Gothic `500/700` (Japanese). Fonts are loaded in `App.tsx` with `useFonts`; the app renders a blank view until they load.
- `TONE.grammar|vocab|kanji|listening` → `{ bg, fg }` module color pairs (icon tiles, rows).
- `shadow(y, radius, opacity)` → cross-platform shadow + elevation.

## Primitives — `src/ui.tsx`

| Component | Purpose |
|---|---|
| `T` | Lexend text. Props: `size`, `w` (400–700), `color`, `center`, `numberOfLines` |
| `JP` | Japanese text (Zen Maru Gothic). Adds `lh` (line-height multiplier, default 1.5) |
| `Label` | Small uppercase section label |
| `Icon` / `MIcon` | Feather / MaterialCommunityIcons |
| `Tap` | `Pressable` with spring scale-down on press (`scaleTo`) |
| `FadeIn` | Fade + slide in on mount; change its `key` to replay |
| `useFlip(face, perspective = 900)` | 3D card flip; returns `[shownFace, transform]`. Pass a larger `perspective` for big cards (flashcards use 2400), keep the transform first in the array, and give the flipping view its own `collapsable={false}` wrapper when it has siblings (iOS otherwise hides its far half behind them mid-turn) |
| `Card` | White rounded box; pressable if `onPress` |
| `Btn` | Full button. `kind`: `primary \| danger \| ok \| dark \| ghost \| light`; optional Feather `icon` |
| `Pill` | Rounded label/button with optional icon |
| `Tile` | Colored rounded-square icon |
| `Bar` | Animated progress bar (`value` 0–1) |
| `SqBtn` | 38px square icon button |
| `Screen` | Full-height screen; pads top safe-area (`top={false}` to draw under the status bar) |
| `Header` | Close/back button · title or custom children · right slot |
| `Seg` | Segmented control with sliding highlight |
| `Sheet` | Bottom sheet that springs up, pinned to parent bottom |
| `Footer` | Bottom action row respecting the home indicator |
| `speak(text, rate=0.9, opts)` / `stopSpeak()` | `expo-speech` in `ja-JP`; always stops current speech first |

Screen skeleton pattern:

```tsx
<Screen>
  <Header onClose={back} title="…" />
  <ScrollView contentContainerStyle={{ paddingHorizontal: 16 }}>…</ScrollView>
  <Footer><Btn label="…" onPress={…} style={{ flex: 1 }} /></Footer>
</Screen>
```
