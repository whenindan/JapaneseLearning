# Exercise engine (`src/exercises.tsx`)

`Runner` plays a list of `Ex` items (see [content.md](content.md)) and calls `onFinish(result)`. It is used for the three practice sets and the timed lesson test.

## Props

```ts
Runner({ title, items, onBack, onFinish, finishLabel?, accent?, examMinutes? })
```

- **Practice mode** (no `examMinutes`): progress bar header; each answer is revealed with a feedback `Sheet` (correct/wrong, explanation, TTS replay button) before moving on.
- **Exam mode** (`examMinutes` set, used by the `test` route with 10): countdown pill, no feedback, free navigation via a question grid in a bottom sheet, flag questions, "Nộp bài" to submit. Timer hitting 0 auto-submits.

## Answer flow

- Each question's raw answer (`Raw` = `string | number | number[] | undefined`) is stored in `raws[n]`:
  - `fill`/`picture`/`kanji` → chosen option string; `error` → part index; `order` → array of word indices; `type` → typed string; `match` → miss count; `write` → rejected-stroke count.
- `set(raw)` stores it. In practice mode, types in `AUTO` (`fill, picture, kanji, error, match, write`) reveal immediately on answer; `order` and `type` need the "Kiểm tra" button.
- `commit()` marks the question revealed and speaks the answer (`Verdict.replay`) via TTS.
- `grade(ex, raw) → Verdict` is the single source of truth for correctness and feedback text. It is pure and is re-run at finish time for every item.

Special pass rules in `grade()`:
- `match`: correct if ≤ 2 wrong flips.
- `write`: correct if rejected strokes ≤ `max(2, round(strokes × 0.4))`. The pad always completes the character (Duolingo-style).
- `type`: whitespace is stripped before comparing to `ok[]`.

## Result

```ts
type Result = { correct, total, wrong: Wrong[], cats: { grammar?|vocab?|kanji?: { c, t } }, secs };
```

`App.tsx` then: adds `correct` to stars; for exercise sets, marks `exercises[cat] = true` if ≥ 60%; for the test, updates `best` (0–100). `ResultScreen` shows the animated score, per-category breakdown (red if < 80%), and every wrong answer; pass threshold is 80 for tests, 60 for exercise sets.

## Implementation notes

- `mix(arr, seed)` is a shuffle that's stable within a session (hash of a per-launch `SALT` + seed), so going back to a question keeps option order. `Order` also guarantees the bank never starts already in the correct order.
- Each question body is keyed by index (`key={n}`) so local state (e.g. `Match` cards) resets per question.
- `lock` (from `Write` → `Pad.onLock`) disables the `ScrollView` while a finger is drawing.
- Bottom padding of the scroll content changes when a sheet is visible (`needsSheet`) so content isn't hidden.
