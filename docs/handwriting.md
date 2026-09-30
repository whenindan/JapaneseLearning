# Kanji handwriting (`src/strokes.ts`, `src/writing.tsx`)

Duolingo-style stroke-by-stroke kanji writing, drawn with `react-native-svg`, graded on-device with no ML.

## Geometry & grading — `src/strokes.ts` (pure, no React)

All coordinates are in KanjiVG's `BOX = 109` square.

- `sample(d, steps=12)` — flattens an SVG path string into points (supports `M L H V C S Q T Z`, absolute/relative).
- `resample(pts, n)` — `n` evenly spaced points along a polyline.
- `score(user, ref)` — compares two strokes after resampling both to 24 points: `avg` mean point distance, `start`/`end` endpoint distances, `dir` mean cosine of segment directions (catches strokes drawn backwards), `ratio` length ratio.
- `fits(score, refLen, lenient)` — thresholds (avg ≤ 13, endpoints ≤ 19, dir ≥ 0.6, length ratio window that widens for short strokes). `lenient > 1` loosens all of them.
- `judge(user, refs, i, lenient) → 'ok' | 'order' | 'miss' | 'tap'`:
  - `tap` if the stroke is shorter than 2.5 units (ignored).
  - `ok` if it fits stroke `i`, **unless** it fits a later stroke much better (avg < 55%) → `order`.
  - Otherwise `order` if it fits any later stroke, else `miss`.

Tune difficulty via the numbers in `fits()` or the per-mode `LENIENT` map, not in `judge()`.

## `Pad` component — `src/writing.tsx`

```ts
<Pad d={kanji.d} mode="demo|trace|faint|free" size={px} hintAfter={2} lenient? disabled? onDone={misses => …} onLock={drawing => …} />
```

- Touch via the RN responder system on an `Animated.View`. Points are scaled from view px to box units (`k = BOX / size`). Moves are computed from `pageX/Y` deltas relative to the touch-down point because `locationX/Y` are relative to whatever child is under the finger.
- `onResponderGrant` returns `true` and `onResponderTerminationRequest` returns `false` so an enclosing ScrollView (Android) can't steal the stroke; `onLock` lets the parent disable scrolling too.
- Accepted strokes are kept **as the student drew them** (`kept`), not snapped to the template. Rejected strokes flash red, the pad shakes, and a message shows (`MSG`). After `hintAfter` misses on one stroke, the correct stroke is animated as a hint.
- Modes: `demo` animates each stroke in order (`Draw` uses `strokeDashoffset`); `trace` shows a faint glyph plus the next stroke in green with a start dot and direction arrow; `faint` shows only a faint glyph; `free` shows nothing.
- `onDone(totalMisses)` fires 450 ms after the last stroke.

## `Writing` screen

Four stages per kanji (`STAGES`, exported count `WRITE_STAGES = 4`): Xem mẫu (demo) → Tô đậm (trace) → Tô mờ (faint) → Tự viết (free). Finishing a stage calls `passed(stage + 1)`, stored in `Progress.written[char]`. The `Kanji` study screen shows the same four stages as thumbnails via its own `STEPS` array in `screens.tsx` — **keep `STEPS` and `STAGES` in sync** if you change stages.

The `write` exercise type reuses `Pad` in `free` mode with `lenient={1.1}`.
