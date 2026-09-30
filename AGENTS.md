This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Project overview

A Japanese-learning app for Vietnamese speakers (JLPT N5, Minna no Nihongo Lesson 1): grammar, flashcards, kanji with stroke-graded handwriting, listening via TTS, exercise sets and a timed lesson test. UI copy is Vietnamese. Single lesson, all content hard-coded, progress in memory only (no backend, no persistence, no tests).

```
App.tsx            custom navigation stack + global Progress state + route→screen switch
src/data.ts        all lesson content and the Ex exercise union
src/screens.tsx    Home, Profile, LessonHub, Grammar, Vocab, Kanji, Listening, ResultScreen, TabBar
src/exercises.tsx  Runner quiz engine + grade() + per-type exercise components
src/writing.tsx    handwriting Pad + 4-stage Writing screen
src/strokes.ts     pure stroke geometry/grading
src/ui.tsx         shared UI primitives + speak()
src/theme.ts       color/radius/font tokens
```

## Docs — read the one relevant to your task instead of whole source files

- [docs/architecture.md](docs/architecture.md) — file map, navigation stack & screen ids, `Progress` state, code conventions. **Start here.**
- [docs/content.md](docs/content.md) — `data.ts` schemas, exercise item types, adding content.
- [docs/exercises.md](docs/exercises.md) — `Runner`, practice vs exam mode, grading rules, `Result`.
- [docs/handwriting.md](docs/handwriting.md) — stroke sampling/judging algorithm and the `Pad` component.
- [docs/ui.md](docs/ui.md) — theme tokens and UI primitives to reuse.

Keep these docs updated when you change the things they describe.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

This project uses npm (`package-lock.json`).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- This app does **not** use Expo Router or React Navigation. Navigation is a hand-rolled animated stack in `App.tsx` (`push` / `pop` / `replace` / `reset`, screens keyed by a string id). Add screens there — see [docs/architecture.md](docs/architecture.md#navigation--custom-not-expo-router).
- Migrating to Expo Router (`src/app/`, https://docs.expo.dev/router/introduction.md) would be a deliberate, separate change — don't introduce it incidentally.

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
