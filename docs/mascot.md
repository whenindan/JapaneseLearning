# Guide characters (`src/mascot.tsx`)

Three animated characters from the "Meet the crew" design sheet guide the learner, Duolingo-style. The user picks one in **Profile → Người đồng hành**; the choice lives in `App` state (`guide`, default `'poko'`, in-memory only).

| id | Character | Role | Personality |
|---|---|---|---|
| `poko` | Tanuki, leaf on head | Thầy hướng dẫn (せんせい) | Patient, warm, a little goofy |
| `mame` | Shiba inu, red bandana | Bạn học (なかま) | Overexcited, gets things wrong too |
| `kon` | Kitsune, hachimaki headband | Đối thủ (ライバル) | Confident, a little smug, secretly rooting for you |

`MASCOTS[id]` holds name/kana/role/description/catchphrase, the backdrop tint `bg`, and `lines` (`hi`, `ok[]`, `bad[]`, `pass`, `fail`) — Vietnamese copy, optionally starting with a Japanese phrase. Use `line(xs, n)` to pick a line stably (by question index), and `<Say text>` to render one (a leading Japanese phrase gets the Japanese font).

## `<Mascot>`

```tsx
<Mascot id={guide} mood="correct" size={64} nonce={n} tap still style={…} />
```

- `mood`: `idle | wave | correct | oops | listen | speak`. `wave`, `correct`, `oops` play once (per-character length in `ONCE`) then settle to idle; `listen`/`speak` loop.
- `nonce`: change it to replay the same one-shot mood. `tap`: press to wave. `still`: only blink (used for the avatar `Face`).
- Height is `size * 1.1` (viewBox `0 0 200 220`).
- Reduce Motion (OS setting) swaps every non-idle mood for one gentle scale pulse.

### How the animation works

The art is split into layers (shadow, tail, body, arm, ears, head, eyes, mouth, accessory, fx), each a full-size `Svg` inside its own `Animated.View` with a `transformOrigin` pivot, so every movement runs on the native driver. Motion is data: `MOVES[id][mood]` maps a part to a keyframe track `K` (duration, CSS-style `at` offsets, `x/y/r/s/sx/sy/o` values in viewBox units/degrees), transcribed from the design's CSS keyframes. The native driver ignores interpolation `easing`, so `dense()` pre-samples each keyframe segment with sine easing. Blinks run on a random 3–6 s timer so characters never blink in sync.

## Where it appears

- **Home**: waving guide + speech bubble with the character's greeting and the suggested next step (`nextStep(p)` in screens.tsx); tapping the bubble opens that step. The header avatar is the guide's face.
- **Profile**: avatar + character picker.
- **Grammar**: the per-point tip is spoken by the guide.
- **Listening**: guide in the hero talks (`speak`) while TTS plays, reacts to each question answer.
- **Runner (practice mode)**: the feedback sheet shows the guide reacting (`correct`/`oops`) with a personality line; `type` questions show it in the footer. Not shown in the timed test.
- **ResultScreen**: guide + `pass`/`fail` line.
