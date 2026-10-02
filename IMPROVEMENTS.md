# Improvement backlog

An audit of the app as of `455c131` (2026-09-30): bugs, code issues, design problems, and features we could add. Nothing here has been implemented yet.

Priority tags: **P0**: fix before anyone outside the team uses it · **P1**: needed for a real release · **P2**: worth doing · **P3**: nice to have / exploratory.

---

## 1. Bugs & correctness issues

| # | Pri | Where | Issue |
|---|-----|-------|-------|
| 1.1 | P0 | `App.tsx:96` | **Progress is lost on every reload.** All state lives in `useState`. Killing the app, an OTA update, or a crash wipes everything. |
| 1.2 | P0 | `App.tsx:70`, `exercises.tsx:445` | **Double taps aren't guarded.** Two quick taps on a card push the same screen twice. Two quick taps on "Nộp bài" / "Hoàn thành" call `onFinish` twice, so `addStars` runs twice and `replace` stacks two result screens. |
| 1.3 | P0 | — | **The Android hardware back button / predictive back isn't handled.** No `BackHandler`, so pressing back on any screen exits the app. iOS has no edge-swipe-back either. |
| 1.4 | P1 | `App.tsx:100` | **You can farm stars.** Every retry adds `r.correct` again, so redoing an exercise you've already mastered keeps adding stars. |
| 1.5 | P1 | `exercises.tsx:367` | **The exam timer drifts.** It decrements with `setInterval` once a second. On iOS, JS timers pause while the app is backgrounded, so a student can background the app to stop the clock. Compute the remaining time from a start `Date.now()` instead. |
| 1.6 | P1 | `screens.tsx:245`, `:358` | **Progress counts "viewed", not "learned".** Grammar and Kanji call `seen(i+1)` on mount. Tapping the last grammar pill marks all 5 points done, and the Kanji module counts as complete without writing anything. |
| 1.7 | P1 | `screens.tsx:329-334` | **The flashcard rating buttons all do the same thing.** "Quên / Hơi nhớ / Nhớ rồi" just advance the card. You can also rate a card you never flipped. "Quên" still counts the card as learned. |
| 1.8 | P1 | `screens.tsx:50` | Home says "Ôn N thẻ hôm nay", but there's no daily review queue behind it. The copy is fake. |
| 1.9 | P1 | `screens.tsx:328` | Favorite (★) on a flashcard is local component state keyed by index. It's lost when you leave the screen and isn't used anywhere. |
| 1.10 | P1 | `exercises.tsx:55` | The "type" exercise shows "Đúng · +10 điểm", but the actual reward is +1 star. The points system is inconsistent. |
| 1.11 | P1 | `exercises.tsx:58-59` | The match exercise can fail (`miss > 2`) while the title still says "Ghép xong!". The sheet turns red with a celebratory title. |
| 1.12 | P1 | `exercises.tsx:64` | Write grading is too lenient: `miss <= max(2, …)` means 人 (2 strokes) passes with 2 wrong strokes, a 100% error rate. |
| 1.13 | P1 | `writing.tsx:175`, `:211` | A writing stage is "passed" however many mistakes you make, and the demo stage passes on "Bỏ qua". |
| 1.14 | P1 | `screens.tsx:503` | Listening is marked complete once all questions are answered, even if all are wrong. Answers lock on the first tap with no retry. |
| 1.15 | P1 | `exercises.tsx:204` + no `KeyboardAvoidingView` anywhere | The keyboard likely covers the "Kiểm tra" footer (practice) and the input under the absolute `Sheet` (exam) on iOS. |
| 1.16 | P1 | `exercises.tsx:337` | Closing a Runner mid-exercise or mid-exam (✕) asks for no confirmation. All answers are discarded silently. |
| 1.17 | P1 | `ui.tsx:8` | TTS never checks whether a `ja-JP` voice is installed (`Speech.getAvailableVoicesAsync`). On many Android devices without Japanese TTS, audio fails silently. That's the core of the listening module. |
| 1.18 | P2 | `data.ts:23` | The 🫵 emoji (Unicode 14) renders as tofu (□) on older Android. The same applies to any newer emoji used as a "picture". |
| 1.19 | P2 | `App.tsx:101-106` | **Tab behavior is inconsistent.** Home/Profile *reset*, while Lesson/Tests/Quick *push*. Tapping "lesson" from Profile pushes the hub on top of Profile. The ⚡ "quick" button just opens flashcards. "Tests" opens the *Bài tập* tab, not *Kiểm tra*. |
| 1.20 | P2 | `screens.tsx:89`, `:233` | "Qua kiểm tra Bài 1 để mở" / "Đạt ≥ 80 để sang Bài 2", but passing unlocks nothing (lesson 2 doesn't exist). The pass button even shows an `unlock` icon. |
| 1.21 | P2 | `data.ts:106-110` | **The test is a subset of the practice exercises.** Same questions, same order. Students can memorize the answers. |
| 1.22 | P2 | `exercises.tsx:271` | `setTimeout` in `Match` isn't cleared on unmount (state update after unmount). |
| 1.23 | P2 | `exercises.tsx:333` | Choice / error-find items auto-submit on the first tap. A mis-tap is final, with no "Kiểm tra" confirm step. This may be intended, but it's harsh for beginners on small screens. |
| 1.24 | P3 | `App.tsx:108` | While fonts load, the app renders a blank view instead of holding the splash screen. The result is a flash of the empty cream background. |

## 2. Code quality & architecture

**Lint is failing on `main`** (`npx expo lint`: 6 errors, 11 warnings), even though AGENTS.md requires it to pass:
- `screens.tsx:24`: `Item` component is defined inside `TabBar`'s render (`react-hooks/static-components`, 4 errors). It remounts every render.
- `exercises.tsx:344`: `Date.now()` called during render (`useRef(Date.now())`).
- `exercises.tsx:363`: `finishRef.current = finish` written during render.
- 11 `exhaustive-deps` warnings (`ui.tsx`, `writing.tsx`, `screens.tsx`). Most are intentional mount-only effects and should be written so they don't trip the rule.

**Structure**
- `screens.tsx` is a 580-line file holding 9 screens. Split it into one file per screen (`src/screens/Home.tsx`, …).
- `App.tsx` mixes the navigator, the global state, and a string-based route switch. Consider:
  - a typed route union (`{ s: 'write'; i: number; stage: number } | …`) instead of one `Route` with all-optional fields and `cur.i!` / `cur.r!` non-null assertions;
  - progress in a `useReducer` + Context (or a small store like Zustand), with persistence (see §4);
  - memoizing screens in lower stack layers. Every progress change currently re-renders every layer in the stack.
- `exercises.tsx:386`: `ex: ex as any` throws away type safety for every exercise component. `Raw` is a loose union cast with `as string` / `as number[]` everywhere. A per-type answer map (`Answer<'order'> = number[]`) would catch bugs at compile time.
- `grade()` is pure but not exported, so it can't be tested.

**Duplication / magic numbers**
- `mmss` is defined twice (`exercises.tsx:243`, `screens.tsx:17`).
- `k.kun.split('・')[0]` is repeated 4× (it belongs on the data model: `reading`).
- The "is this answer empty" check is repeated 3× (`exercises.tsx:28`, `:389`, `:434`).
- Pass thresholds `80` / `0.6` / `60` are hard-coded in 6 places (`App.tsx:127,132`, `screens.tsx:126,228,515`, etc.). They should be one `PASS = { test: 0.8, ex: 0.6 }` constant.
- The score-percent formula is repeated in `App.tsx` ×2 and `ResultScreen`.

**Style**
- Everything is inline style objects with very long one-liners (300+ chars). They're hard to diff and review, and new objects are created each render. Consider `StyleSheet.create` or at least extracting repeated styles.
- The theme has radius tokens (`R`), but most radii are hard-coded (14, 18, 22, 24, 28, 30). The same goes for font sizes (9–44, ad hoc). Add a type scale.
- Very terse names (`T`, `JP`, `C`, `R`, `p`, `up`, `more`, `mix`, `Raw`, `St`) raise onboarding cost for other developers.
- `Opt`'s `style?: object` should be `StyleProp<ViewStyle>`.

**Performance**
- The handwriting `Pad` calls `setInk` on every pointer move, re-rendering the whole SVG through the JS-thread responder system. On low-end Android this can drop points and lag. Consider `react-native-gesture-handler` + `react-native-reanimated` (or `@shopify/react-native-skia`) so drawing runs on the UI thread.
- `Draw` and `Bar` animate with `useNativeDriver: false` (JS thread).

**Testing & CI**
- There are no tests. `strokes.ts` and `grade()` are pure functions and ideal first targets (`jest-expo`). Stroke-judging regressions would otherwise go unnoticed.
- The GitHub workflows only run Claude review. Add a CI job running `tsc --noEmit` + `expo lint` (+ tests) on PRs.
- There's no error boundary: a render crash leaves a white screen. There's also no crash reporting (e.g. Sentry via `@sentry/react-native`).

## 3. Design & UX

**Color & feedback**
- **The brand color doubles as the error color.** Wrong answers use `brandSoft2`/`brandDark`, and the `danger` button is `brandDark`. So *selected* (brand), *wrong* (brandDark) and *primary action* (brand) are all near-identical coral, which blurs "you picked this" vs "this is wrong". Consider a distinct error red, or make selection use a neutral/ink outline.
- `TONE.grammar` and `TONE.listening` are almost the same coral (`brandSoft/brand` vs `brandSoft2/brandDark`), so the two modules are hard to tell apart on Home and in the Hub.
- **Contrast:** `C.faint` (#a39888) on white/cream is ≈2.6:1, below WCAG AA. It's used for real content (hints, locked labels, tab icons). White text on `brand` (#e0603f) ≈3.3:1 and on `ok` (#3aa55d) ≈3:1 also fail AA for 15px button labels.
- Right/wrong is often shown by color alone (listening options, match cards). Add ✓/✗ icons for color-blind users.

**Navigation & layout**
- Tab bar icons have no labels, and the ⚡ center button's purpose is unclear. Either give ⚡ a clear job (e.g. "Ôn nhanh": daily SRS review) or remove it.
- The tab bar exists only on Home and Profile. The Hub (reached from a tab) has none, so the app feels half tab-based, half stack-based. Pick one model.
- The close icon is inconsistent: Vocab/Kanji use ✕, Grammar/Listening use ←, and the Hub uses ← on a colored header.
- The "N4" pill on Home is not tappable and has no meaning yet.
- The avatar "あ" and "Học viên N5" are static placeholders. There's no name, avatar, or level.
- The Grammar module uses a `film` icon and a big ▶ "video" hero, but it's TTS of the examples. That suggests video content that doesn't exist.
- `supportsTablet: true`, but the layouts are phone-only (fixed `CARD_W = 250`, full-width cards). iPad will look stretched. Add a max content width or a tablet layout.
- Fixed `lineHeight = size × 1.4` in `T`/`JP` will clip text when users enable large system font sizes (Dynamic Type / Android font scale). Test with accessibility sizes, or cap `maxFontSizeMultiplier`.
- `T size={9}` for the kanji stage labels (`screens.tsx:391`) is too small to read.

**Visual polish**
- The emoji "illustrations" (flashcards, picture questions, listening hero) look different on every OS/version and clash with the otherwise polished UI. Commission a small illustration set, or use a consistent icon style.
- Two icon families are mixed (Feather + MaterialCommunityIcons) with different stroke styles.
- There are no haptics. `expo-haptics` on correct/wrong/stroke-accepted would add a lot of feel for little code.
- There are no sound effects for correct/wrong. Only TTS plays, sometimes automatically. There's no mute toggle.
- The result screen could celebrate more (confetti / Lottie on pass, streak increment animation).
- There's no dark mode (`userInterfaceStyle: "light"`).

**Accessibility**
- Icon-only buttons (`SqBtn`, tab items, flag, speed toggle, play/pause, favorite) have no `accessibilityLabel` / `accessibilityRole`. Screen readers announce nothing useful.
- Japanese text has no `accessibilityLanguage="ja"`, so VoiceOver reads it with a Vietnamese voice.

## 4. Platform, build & release

- **Persistence:** store progress locally with `expo-sqlite` (its `kv-store` is a drop-in for AsyncStorage) and hydrate on launch. This is P0 and the prerequisite for SRS, streaks, and everything else in §5.
- **App identity:** `app.json` still has `name: "app"`, `slug: "app"`, no `ios.bundleIdentifier` / `android.package`, default Expo icons/splash, and the adaptive icon background is the template blue `#E6F4FE`.
- **There's no `eas.json`**, so there are no build profiles (development / preview / production), no `eas update` channel, and no versioning strategy.
- **Fonts:** the `expo-font` plugin is listed without a `fonts` array. Embedding Lexend + Zen Maru Gothic at build time removes the async `useFonts` wait and the blank flash (1.24). Also hold the splash with `expo-splash-screen` until state is hydrated.
- **Store requirements:** a privacy policy URL, a data-safety form, age rating, screenshots, Vietnamese store listing.
- **`LICENSE` is Expo's template MIT file (© 650 Industries).** Replace it with the client's actual license, or remove it for a proprietary app.

## 5. Content & legal

- **KanjiVG attribution (CC BY-SA 3.0):** stroke data needs visible attribution in the app (an "About / Credits" screen), and share-alike applies to the derived stroke data. Currently the only credit is a code comment.
- **Minna no Nihongo is copyrighted (3A Corporation).** The lesson structure, characters (Mike Miller, Santos, IMC) and example sentences mirror the textbook. Confirm the client has rights or a license before a commercial release, or write original content.
- **Only 1 of 50 lessons exists**, and the content is hard-coded TypeScript. Build a content pipeline:
  - one JSON file per lesson (grammar, vocab, kanji, listening, exercises), validated with a schema (zod) at build time. For example, a `write` exercise referencing a kanji not in `KANJI` currently crashes (`kanjiOf(...)!`);
  - optionally host content remotely (Supabase / CDN) so teachers can add lessons without an app release;
  - load KanjiVG paths from a data file rather than inline strings.
- Much more content per lesson: MNN lesson 1 has ~30+ vocab words (we have 15), plus country/occupation lists, numbers/ages (〜さい), names (〜さん/〜ちゃん/〜くん), and どなた/なんさい.
- Proofread the Vietnamese copy with a native teacher (e.g. "rất hân hạnh được gặp" and mixed "học sinh, sinh viên").
- Centralize UI strings (currently inline in JSX) for proofreading and any future English UI.

## 6. Feature ideas

### Core learning (P1)
- **Hiragana & katakana module** before Lesson 1: charts, audio, recognition drills, and writing practice reusing `Pad` (KanjiVG includes kana). Lesson 1 currently assumes the student can already read kana.
- **Spaced repetition** (FSRS or SM-2) for vocab + kanji: wire up the Quên / Hơi nhớ / Nhớ rồi buttons, add a daily review queue, and give the ⚡ button the "Ôn nhanh" job.
- **Mistake notebook:** every wrong answer goes into a review deck, and the result screen gets "Làm lại các câu sai" (retry only the wrong ones).
- **Furigana & romaji toggles:** per-user settings for beginners, and furigana over kanji in sentences.
- **Real native-speaker audio** instead of (or alongside) TTS, especially for listening. TTS pitch accent and naturalness are poor.
- **Randomized tests:** a question pool per lesson, shuffled order, and items not identical to the practice sets.

### Engagement (P1–P2)
- Daily streak, daily goal (XP/minutes), streak freeze.
- Local reminders via `expo-notifications` ("Đến giờ học rồi!"), at a user-chosen time.
- Lesson unlocking and a learning path / map across lessons.
- Achievements beyond the current 6 badges (streaks, perfect tests, kanji written count).
- Weekly progress summary on Profile (charts: accuracy per category, time spent).
- Home-screen widget / lock-screen "word of the day" (needs a config plugin + native target).

### New exercise types (P2)
- **Listen → choose** (hear audio, pick the word/sentence).
- **Dictation** (hear, then type or arrange kana).
- **Speaking / shadowing:** record with `expo-audio` and play back against the model. Optional pronunciation scoring via speech recognition.
- **VI → JP sentence building** with word chips (an extension of `order`).
- **Particle drills** (は / も / の / か) in rapid-fire format.
- **Reading comprehension** with longer passages.
- **Kanji handwriting recognition** as an answer input (write instead of choosing).
- **Conversation / role-play** dialogues (choose the right reply).

### Content & reference (P2)
- Searchable dictionary of all learned words/kanji, with favorites as a custom deck.
- Grammar cheat-sheet per lesson; conjugation tables as lessons progress.
- Kanji details: radicals, mnemonics, replay the stroke-order animation on the detail screen, compound words.
- JLPT N5 mock exam in the real JLPT format; an N4 track (the pill already hints at it).
- Placement test / onboarding to skip known material.

### Settings & account (P2)
- Settings screen: TTS speed, auto-play audio on/off, sound effects, haptics, furigana/romaji, reminder time, reset progress, credits/licenses, feedback link.
- Optional account + cloud sync (e.g. Supabase auth) so progress survives a new phone.
- Profile: name, avatar, target level, study goal.

### Business / platform (P3, check with the client)
- A teacher/class mode if NKDV runs classes: assign lessons, see student progress, homework deadlines.
- An admin CMS for lesson content.
- Premium lessons via in-app purchase/subscription.
- Analytics (lesson completion, drop-off per exercise) to guide content work.
- English UI localization to reach non-Vietnamese learners.

---

## Suggested order

1. **Stabilize:** fix lint (§2), add persistence (1.1), Android back (1.3), double-tap guards (1.2), exit confirmation (1.16), keyboard avoidance (1.15), error boundary.
2. **Make progress honest:** 1.4–1.14, pass thresholds as constants, typed routes/answers, unit tests for `strokes.ts` and `grade()`, CI.
3. **Release readiness:** app identity, EAS profiles, splash/fonts, attribution + license + content rights, accessibility labels, contrast fixes.
4. **Learning depth:** kana module, SRS + daily review, mistake notebook, more lesson-1 content, content pipeline for lessons 2+.
5. **Engagement & polish:** streaks, reminders, haptics/sfx, illustrations, dark mode, settings, new exercise types.
