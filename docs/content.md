# Lesson content (`src/data.ts`)

All learning content is hard-coded in `src/data.ts` for **one lesson** (Minna no Nihongo Bài 1, "はじめまして"). The header comment says it is placeholder until the client's slide content arrives. Screens read these arrays directly, so counts/labels update automatically when you add items.

| Export | Type | Used by |
|---|---|---|
| `LESSON` | `{ no, total, title, sub, mark }` | Home carousel, LessonHub header, test title, badges |
| `UPCOMING` | `{ no, title }[]` | Locked cards in Home carousel (display only) |
| `GRAMMAR` | `GrammarPoint[]` — `{ id, tab, pattern, meaning, examples: [jp, vi][], tip }` | `Grammar` screen (`tab` is the short chip label) |
| `VOCAB` | `Word[]` — `{ kana, kanji?, vi, pos, emoji }` | `Vocab` flashcards (emoji is the card picture) |
| `KANJI` | `KanjiItem[]` — `{ ch, han, on, kun, words: [word, reading, vi][], d: string[] }` | `Kanji` screen, `Writing`, `write` exercises |
| `LISTENING` | `{ emoji, caption, audioText, passage[], vi, questions: { q, opts, a }[] }` | `Listening` (plays `passage` sentence by sentence via TTS; `audioText` is currently unused) |
| `EX_GRAMMAR`, `EX_VOCAB`, `EX_KANJI` | `Ex[]` | Exercise sets in LessonHub "Bài tập" tab |
| `EX_TEST` | `Ex[]` | Lesson test — derived by filtering the three sets above |

Field notes:
- `KanjiItem.han` is the Sino-Vietnamese reading (Hán Việt, e.g. `TƯ`). `on`/`kun` use `・` to separate multiple readings; the first `kun` reading is what gets spoken.
- `KanjiItem.d` = one SVG path per stroke, in stroke order, in KanjiVG's 109×109 coordinate box. Copy from KanjiVG (`kanjivg.tagaini.net`, CC BY-SA 3.0 — keep attribution). Only the `M/L/H/V/C/S/Q/T/Z` path commands are supported by `sample()`.
- Audio is always `expo-speech` TTS in `ja-JP`; there are no audio assets. Write Japanese with spaces between phrases the way Minna no Nihongo does — TTS and the `order` exercise both depend on it.

## Exercise items (`Ex` union)

| `t` | Fields | Category | What the learner does |
|---|---|---|---|
| `fill` | `pre, opts, a, post, vi, why` | grammar | Pick the particle/phrase for the blank between `pre` and `post` |
| `error` | `parts, wrong, from, to, vi, why` | grammar | Tap the lettered part (A–D) that is wrong; `parts[wrong]` must contain `from`, fixed to `to` |
| `order` | `words, vi` | grammar | Tap word chips into order; `words` is given **in the correct order** (shuffled at runtime) |
| `match` | `pairs: [jp, vi][]` | vocab | Memory-flip game pairing JP ↔ VI cards |
| `picture` | `emoji, opts, a, vi` | vocab | Pick the word for the emoji |
| `type` | `vi, ok[]` , `why` | vocab | Type the Japanese; any of `ok` accepted (whitespace ignored). `ok[0]` is the canonical answer |
| `kanji` | `k, opts, a, vi` | kanji | Pick the hiragana reading of `k` |
| `write` | `k, vi` | kanji | Write kanji `k` from memory on the pad. **`k` must exist in `KANJI`** (needs its stroke paths) |

Category mapping lives in `CAT` in `src/exercises.tsx`; the Vietnamese type label shown in results is `KIND`. Adding a new `t` requires: extend `Ex`, add to `CAT` + `KIND`, a `grade()` case, a component, the `body` switch in `Runner`, and decide whether it's in `AUTO` (see [exercises.md](exercises.md)).

## Adding a lesson

Currently not supported structurally — everything assumes the single `LESSON`. Multi-lesson support would mean turning `data.ts` into per-lesson objects, keying `Progress` by lesson, and replacing `UPCOMING` with real unlock logic.
