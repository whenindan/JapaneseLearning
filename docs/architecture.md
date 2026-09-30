# Architecture

A Japanese-learning app for Vietnamese speakers (JLPT N5, Minna no Nihongo Lesson 1). All UI copy is **Vietnamese**; learning content is Japanese. Single-lesson prototype: no backend, no persistence, no tests.

## File map

| File | Lines | What's in it |
|---|---|---|
| `index.ts` | 8 | `registerRootComponent(App)` |
| `App.tsx` | ~150 | Font loading, the custom navigation stack, global `Progress` state, route → screen switch |
| `src/data.ts` | ~110 | All lesson content + the `Ex` exercise union. See [content.md](content.md) |
| `src/screens.tsx` | ~580 | Every non-exercise screen: `Home`, `Profile`, `LessonHub`, `Grammar`, `Vocab`, `Kanji`, `Listening`, `ResultScreen`, `TabBar`; `Progress` type and `pct()` |
| `src/exercises.tsx` | ~450 | `Runner` (quiz engine), `grade()`, one component per exercise type. See [exercises.md](exercises.md) |
| `src/writing.tsx` | ~220 | `Pad` (handwriting canvas) and `Writing` (4-stage practice screen). See [handwriting.md](handwriting.md) |
| `src/strokes.ts` | ~90 | Pure stroke geometry + grading (SVG path sampling, `judge()`) |
| `src/mascot.tsx` | ~370 | Guide characters (Poko/Mame/Kon): `Mascot`, `Bubble`, `Say`, `MASCOTS` data. See [mascot.md](mascot.md) |
| `src/ui.tsx` | ~170 | Shared primitives (`T`, `JP`, `Btn`, `Card`, `Sheet`, `Tap`, `FadeIn`, `speak`…). See [ui.md](ui.md) |
| `src/theme.ts` | ~20 | Color/radius/font tokens `C`, `R`, `F`, `J`, `TONE`, `shadow()` |

Stack: Expo SDK 57, React 19, RN 0.86, `react-native-svg`, `expo-speech` (TTS for all audio — there are no audio files), `@expo/vector-icons` (Feather + MaterialCommunityIcons), Google Fonts Lexend (UI) + Zen Maru Gothic (Japanese). npm (`package-lock.json`).

## Navigation — custom, not Expo Router

`App.tsx` implements its own stack. There is no `expo-router` / `react-navigation`.

- A route is `{ s: string, ...params }` (`Route` type). `s` is an untyped screen id.
- `stack` holds `Entry`s (route + `Animated.Value` + anim kind). `ref.current` is the source of truth so rapid taps see each other's updates; `setStack` just re-renders.
- Operations: `push(r)` (slide in from right, iOS-like spring with parallax/dim on the screen below), `pop()`, `replace(r)` (cross-fade top), `reset(r)` (make `r` the only screen). Leaving screens are flagged `leaving` and removed when their animation ends.
- Every stacked screen stays mounted (it's drawn under the top one); only the top gets touches/accessibility.
- `render(entry)` is a big `if/else` mapping `s` → screen element, wiring callbacks (`back={pop}`, `go={s => push({ s })}` …).

### Screen ids

| `s` | Screen | Params |
|---|---|---|
| `home` | `Home` (root) | |
| `profile` | `Profile` | |
| `hub` | `LessonHub` | `tab?: 'learn' \| 'ex' \| 'test'` |
| `grammar` / `vocab` / `kanji` / `listening` | Study screens | |
| `write` | `Writing` | `i` (index into `KANJI`), `stage` (0–3) |
| `ex-grammar` / `ex-vocab` / `ex-kanji` | `Runner` over `EX_GRAMMAR` / `EX_VOCAB` / `EX_KANJI` (table `EX` in App.tsx) | |
| `test` | `Runner` in exam mode over `EX_TEST`, 10 min | |
| `result-ex` / `result-test` | `ResultScreen` | `r: Result`, `from` (exercise id for retry) |

Tab bar (`TabBar` in screens.tsx, shown on Home/Profile): `home`/`profile` → `reset`; `lesson` → push `hub`; `tests` → push `hub` with `tab: 'ex'`; `quick` (center ⚡) → push `vocab`.

**Adding a screen:** export a component from `src/screens.tsx` (or a new file under `src/`), add a branch in `render()` in `App.tsx`, navigate with `push({ s: 'id' })`. If its top area is dark/brand-colored, add the id to `LIGHT_BAR` so the status bar text is light.

## State

All state is in-memory in `App` (`useState<Progress>`); it resets on app restart. The chosen guide character is a separate `useState<MascotId>` (`guide`, default `'poko'`), passed as a `guide` prop to `Home`, `Profile` (+ `setGuide`), `Grammar`, `Listening`, `Runner` and `ResultScreen`.

```ts
type Progress = {
  grammar: number; vocab: number; kanji: number; // highest item index+1 seen in each study screen
  listening: boolean;                            // listening module completed
  exercises: Record<'grammar'|'vocab'|'kanji', boolean>; // exercise set passed (≥60%)
  best: number;                                  // best test score, 0–100
  stars: number;                                 // +1 per correct answer, any runner
  written: Record<string, number>;               // kanji char → writing stages passed (0–4)
};
```

- `pct(p)` (screens.tsx): lesson completion = mean of 5 equal parts (grammar, vocab, kanji, listening, exercises/3). `written` is not counted.
- Test pass = score ≥ 80 (unlocks "next lesson" badge; next lessons in `UPCOMING` are display-only/locked). Exercise-set pass = ≥ 60%.
- Screens receive state as props and report back via callbacks (`seen(n)`, `done()`, `passed(n)`, `onFinish(r)`). No context, no store library.

## Conventions

- Very terse naming (`p`, `r`, `ex`, `k`, `C`, `T`, `JP`), dense one-line JSX, inline styles (no `StyleSheet.create` except `absoluteFill`). Match this.
- Colors only via `C.*` tokens (the character art in `mascot.tsx` keeps its own palette); text only via `T` (Latin/Vietnamese) or `JP` (Japanese) so fonts are right.
- Animations use RN `Animated` with `useNativeDriver: true` where possible (no Reanimated).
- Comments are sparse JSDoc one-liners explaining *why*.
- Portrait only, light mode only (`app.json`).
