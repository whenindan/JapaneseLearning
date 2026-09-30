import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Animated, Easing, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Lexend_400Regular, Lexend_500Medium, Lexend_600SemiBold, Lexend_700Bold } from '@expo-google-fonts/lexend';
import { ZenMaruGothic_500Medium, ZenMaruGothic_700Bold } from '@expo-google-fonts/zen-maru-gothic';
import { C } from './src/theme';
import { EX_GRAMMAR, EX_KANJI, EX_TEST, EX_VOCAB, KANJI, LESSON } from './src/data';
import { Runner, Result } from './src/exercises';
import { Grammar, Home, Kanji, LessonHub, Listening, Profile, Progress, ResultScreen, Tab, Vocab } from './src/screens';
import { Writing } from './src/writing';

/** `i`/`stage`: which kanji and writing stage the 'write' screen opens on */
type Route = { s: string; r?: Result; from?: string; tab?: 'learn' | 'ex' | 'test'; i?: number; stage?: number };
/** 'slide' pushes in from the right; 'fade' cross-fades over the previous screen */
type Anim = 'slide' | 'fade';
/** `a` runs 0 → 1 while the screen enters. `leaving` screens are still drawn but no longer part of the stack. */
type Entry = Route & { key: number; a: Animated.Value; anim: Anim; leaving?: boolean; then?: () => void };
const EX = {
  'ex-grammar': ['grammar', 'BT Ngữ pháp', EX_GRAMMAR, C.brand],
  'ex-vocab': ['vocab', 'BT Từ vựng', EX_VOCAB, C.brand],
  'ex-kanji': ['kanji', 'BT Kanji', EX_KANJI, C.ok],
} as const;
const LIGHT_BAR = new Set(['hub', 'result-test', 'result-ex']);

// iOS-like critically damped spring
const SLIDE = { stiffness: 1000, damping: 500, mass: 3, overshootClamping: true, restDisplacementThreshold: 0.01, restSpeedThreshold: 0.01 };
const run = (e: Entry, toValue: number, done?: () => void) =>
  (e.anim === 'slide'
    ? Animated.spring(e.a, { ...SLIDE, toValue, useNativeDriver: true })
    : Animated.timing(e.a, { toValue, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true })
  ).start(() => done?.());

/** One screen in the stack. `above` is the screen stacked on top of it, which drives its parallax and dimming. */
function Layer({ e, above, top, children }: { e: Entry; above?: Entry; top: boolean; children: React.ReactNode }) {
  const { width: w } = useWindowDimensions();
  useEffect(() => { run(e, 1, e.then); }, []);
  const style = useMemo(() => {
    const xs = [];
    if (e.anim === 'slide') xs.push(e.a.interpolate({ inputRange: [0, 1], outputRange: [w, 0] }));
    if (above?.anim === 'slide') xs.push(above.a.interpolate({ inputRange: [0, 1], outputRange: [0, -w * 0.3] }));
    const translateX = xs.length === 2 ? Animated.add(xs[0], xs[1]) : xs[0] ?? 0;
    return e.anim === 'fade'
      ? { opacity: e.a, transform: [{ translateX }, { scale: e.a.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] }) }] }
      : { transform: [{ translateX }] };
  }, [e.a, e.anim, above?.a, above?.anim, w]);
  return (
    <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: C.bg }, style]} pointerEvents={top ? 'auto' : 'none'}
      accessibilityElementsHidden={!top} importantForAccessibility={top ? 'auto' : 'no-hide-descendants'}>
      {children}
      {above?.anim === 'slide' && <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: '#000', opacity: above.a.interpolate({ inputRange: [0, 1], outputRange: [0, 0.12] }) }]} />}
    </Animated.View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({ Lexend_400Regular, Lexend_500Medium, Lexend_600SemiBold, Lexend_700Bold, ZenMaruGothic_500Medium, ZenMaruGothic_700Bold });
  const nextKey = useRef(0);
  const make = (r: Route, anim: Anim, v = 0, then?: () => void): Entry => ({ ...r, key: nextKey.current++, a: new Animated.Value(v), anim, then });
  // The ref is the source of truth so quick successive taps see each other's changes before React re-renders
  const ref = useRef<Entry[]>(null);
  if (!ref.current) ref.current = [make({ s: 'home' }, 'fade', 1)];
  const [stack, setStack] = useState(ref.current);
  const commit = (next: Entry[]) => { ref.current = next; setStack(next); };
  const drop = (keys: number[]) => commit(ref.current!.filter(e => !keys.includes(e.key)));
  const live = () => ref.current!.filter(e => !e.leaving);
  const leave = (keys: number[]) => ref.current!.map(e => (keys.includes(e.key) ? { ...e, leaving: true } : e));

  const push = (r: Route) => commit([...ref.current!, make(r, 'slide')]);
  const pop = () => {
    const l = live();
    if (l.length < 2) return;
    const top = l[l.length - 1];
    commit(leave([top.key]));
    run(top, 0, () => drop([top.key]));
  };
  /** Swap the top screen for `r`, cross-fading */
  const replace = (r: Route) => {
    const old = live().at(-1)!;
    commit([...leave([old.key]), make(r, 'fade', 0, () => drop([old.key]))]);
  };
  /** Make `r` the only screen: slide back to it if it is the root, otherwise cross-fade to it */
  const reset = (r: Route) => {
    const l = live(), top = l[l.length - 1];
    if (l.length === 1 && top.s === r.s) return;
    if (l[0].s === r.s) {
      commit([l[0], { ...top, leaving: true }]);
      run(top, 0, () => drop([top.key]));
      return;
    }
    const e: Entry = make(r, 'fade', 0, () => drop(ref.current!.filter(x => x.key !== e.key).map(x => x.key)));
    commit([...leave(ref.current!.map(x => x.key)), e]);
  };

  const [p, setP] = useState<Progress>({ grammar: 0, vocab: 0, kanji: 0, listening: false, exercises: {}, best: 0, stars: 0, written: {} });
  const cur = stack.filter(e => !e.leaving).at(-1) ?? stack[stack.length - 1];
  const up = (f: Partial<Progress>) => setP(o => ({ ...o, ...f }));
  const more = (k: 'grammar' | 'vocab' | 'kanji') => (n: number) => setP(o => ({ ...o, [k]: Math.max(o[k], n) }));
  const addStars = (r: Result) => setP(o => ({ ...o, stars: o.stars + r.correct }));
  const tab = (t: Tab) => {
    if (t === 'home' || t === 'profile') reset({ s: t });
    else if (t === 'lesson') push({ s: 'hub' });
    else if (t === 'tests') push({ s: 'hub', tab: 'ex' });
    else push({ s: 'vocab' });
  };

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: C.bg }} />;

  const render = (cur: Entry): React.ReactNode => {
    let view: React.ReactNode;
    if (cur.s === 'home') view = <Home p={p} open={() => push({ s: 'hub' })} go={s => push({ s })} tab={tab} />;
    else if (cur.s === 'profile') view = <Profile p={p} tab={tab} />;
    else if (cur.s === 'hub') view = <LessonHub p={p} initial={cur.tab} back={pop} go={s => push({ s })} startTest={() => push({ s: 'test' })} />;
    else if (cur.s === 'grammar') view = <Grammar back={pop} seen={more('grammar')} />;
    else if (cur.s === 'vocab') view = <Vocab back={pop} seen={more('vocab')} />;
    else if (cur.s === 'kanji') view = <Kanji back={pop} seen={more('kanji')} written={p.written} write={(i, stage) => push({ s: 'write', i, stage })} />;
    else if (cur.s === 'write') {
      const k = KANJI[cur.i!];
      view = <Writing k={k} start={cur.stage} back={pop} passed={n => setP(o => ({ ...o, written: { ...o.written, [k.ch]: Math.max(o.written[k.ch] ?? 0, n) } }))} />;
    }
    else if (cur.s === 'listening') view = <Listening back={pop} done={() => up({ listening: true })} />;
    else if (cur.s === 'test') view = (
      <Runner title={`Kiểm tra Bài ${LESSON.no}`} items={EX_TEST} examMinutes={10} onBack={pop}
        onFinish={r => { addStars(r); setP(o => ({ ...o, best: Math.max(o.best, Math.round((r.correct / r.total) * 100)) })); replace({ s: 'result-test', r }); }} />
    );
    else if (cur.s === 'result-test') view = <ResultScreen r={cur.r!} kind="test" back={() => (Math.round((cur.r!.correct / cur.r!.total) * 100) >= 80 ? reset({ s: 'home' }) : pop())} retry={() => replace({ s: 'test' })} />;
    else if (cur.s in EX) {
      const [k, title, items, accent] = EX[cur.s as keyof typeof EX];
      view = (
        <Runner title={title} items={[...items]} accent={accent} onBack={pop} finishLabel="Xem kết quả"
          onFinish={r => { addStars(r); if (r.correct / r.total >= 0.6) setP(o => ({ ...o, exercises: { ...o.exercises, [k]: true } })); replace({ s: 'result-ex', r, from: cur.s }); }} />
      );
    } else if (cur.s === 'result-ex') view = <ResultScreen r={cur.r!} kind="ex" back={pop} retry={() => replace({ s: cur.from! })} />;
    return view;
  };

  return (
    <SafeAreaProvider>
      <StatusBar animated style={LIGHT_BAR.has(cur.s) ? 'light' : 'dark'} />
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        {stack.map((e, i) => <Layer key={e.key} e={e} above={stack[i + 1]} top={e === cur}>{render(e)}</Layer>)}
      </View>
    </SafeAreaProvider>
  );
}
