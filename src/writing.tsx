import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, type GestureResponderEvent, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Line, Path, Polygon } from 'react-native-svg';
import { C, R } from './theme';
import { Bar, Btn, Card, FadeIn, Footer, Header, Icon, JP, Pill, Screen, T, speak } from './ui';
import { BOX, judge, length, sample, type Pt, type Verdict } from './strokes';
import type { KanjiItem } from './data';

/** demo: watch the stroke order · trace: follow the highlighted next stroke · faint: follow a faint outline · free: from memory */
export type Mode = 'demo' | 'trace' | 'faint' | 'free';
const GUIDE: Record<Mode, number> = { demo: 0, trace: 0.35, faint: 0.12, free: 0 };
const LENIENT: Record<Mode, number> = { demo: 1, trace: 1.3, faint: 1.15, free: 1 };
const W = 5; // pen width in box units
const MSG: Record<Exclude<Verdict, 'ok' | 'tap'> | 'hint', string> = { miss: 'Chưa đúng — viết lại nét này', order: 'Sai thứ tự nét', hint: 'Xem gợi ý rồi viết lại' };

const AnimatedPath = Animated.createAnimatedComponent(Path);
const pen = { fill: 'none', strokeWidth: W, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const poly = (p: Pt[]) => (p.length ? 'M' + p.map(q => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join('L') : '');

/** Draws `d` the way a pen would, start to end */
function Draw({ d, len, color, opacity = 1, delay = 0, onEnd }: { d: string; len: number; color: string; opacity?: number; delay?: number; onEnd?: () => void }) {
  const L = len + W;
  const [a] = useState(() => new Animated.Value(L));
  useEffect(() => {
    const run = Animated.timing(a, { toValue: 0, duration: 250 + len * 9, delay, easing: Easing.inOut(Easing.quad), useNativeDriver: false });
    run.start(({ finished }) => finished && onEnd?.());
    return () => run.stop();
  }, []);
  return <AnimatedPath d={d} stroke={color} opacity={opacity} {...pen} strokeDasharray={[L, L]} strokeDashoffset={a} />;
}

/** Arrowhead just past the end of a stroke, pointing the way it is written */
function arrow(p: Pt[]) {
  const e = p[p.length - 1];
  let b = p[0];
  for (let i = p.length - 2; i >= 0; i--) if (Math.hypot(e[0] - p[i][0], e[1] - p[i][1]) >= 4) { b = p[i]; break; }
  const l = Math.hypot(e[0] - b[0], e[1] - b[1]) || 1, ux = (e[0] - b[0]) / l, uy = (e[1] - b[1]) / l;
  const at = (f: number, s: number) => `${e[0] + ux * f - uy * s},${e[1] + uy * f + ux * s}`;
  return [at(7.5, 0), at(2.5, 3), at(2.5, -3)].join(' ');
}

type PadProps = { d: string[]; mode: Mode; size: number; hintAfter?: number; lenient?: number; disabled?: boolean; onDone?: (misses: number) => void; onLock?: (drawing: boolean) => void };

/**
 * Handwriting pad. Each finished stroke is graded against the next expected stroke: a match stays on the pad as the
 * student wrote it, a miss flashes red and shakes, and after `hintAfter` misses on one stroke the pad draws it as a hint.
 */
export function Pad({ d, mode, size, hintAfter = 2, lenient, disabled, onDone, onLock }: PadProps) {
  const refs = useMemo(() => d.map(x => sample(x)), [d]);
  const n = d.length;
  const [done, setDone] = useState(0);
  const [shown, setShown] = useState(0); // demo: strokes fully animated
  const [ink, setInk] = useState<Pt[]>([]);
  const [kept, setKept] = useState<Pt[][]>([]); // the student's accepted strokes, as drawn
  const [bad, setBad] = useState<Pt[]>([]);
  const [miss, setMiss] = useState(0); // on the current stroke
  const [total, setTotal] = useState(0);
  const [msg, setMsg] = useState<keyof typeof MSG | null>(null);
  const [fade] = useState(() => new Animated.Value(0));
  const [shake] = useState(() => new Animated.Value(0));
  const complete = (mode === 'demo' ? shown : done) >= n;
  const k = BOX / size;

  useEffect(() => {
    if (!complete) return;
    const t = setTimeout(() => onDone?.(total), 450);
    return () => clearTimeout(t);
  }, [complete]);

  const pts = useRef<Pt[]>([]);
  // Where the finger went down, in view and page coordinates. Moves are measured from here with pageX/Y,
  // because locationX/Y are relative to whichever child is under the finger.
  const org = useRef({ x: 0, y: 0, px: 0, py: 0 });
  const idle = complete || disabled || mode === 'demo';
  const start = (e: GestureResponderEvent) => {
    const { locationX: x, locationY: y, pageX: px, pageY: py } = e.nativeEvent;
    if (idle) return;
    onLock?.(true);
    org.current = { x, y, px, py };
    pts.current = [[x * k, y * k]];
  };
  const move = (e: GestureResponderEvent) => {
    if (idle || !pts.current.length) return;
    const o = org.current, last = pts.current[pts.current.length - 1];
    const p: Pt = [(o.x + e.nativeEvent.pageX - o.px) * k, (o.y + e.nativeEvent.pageY - o.py) * k];
    if (Math.hypot(p[0] - last[0], p[1] - last[1]) < 0.8) return;
    pts.current.push(p);
    setInk([...pts.current]);
  };
  const end = () => {
    onLock?.(false);
    const p = pts.current;
    pts.current = [];
    setInk([]);
    if (idle || !p.length) return;
    const v = judge(p, refs, done, lenient ?? LENIENT[mode]);
    if (v === 'tap') return;
    if (v === 'ok') { setKept([...kept, p]); setDone(done + 1); setMiss(0); setMsg(null); return; }
    setBad(p);
    fade.setValue(1);
    Animated.timing(fade, { toValue: 0, duration: 500, delay: 250, useNativeDriver: true }).start();
    Animated.sequence([8, -7, 5, -3, 0].map(x => Animated.timing(shake, { toValue: x, duration: 55, useNativeDriver: true }))).start();
    setMiss(miss + 1);
    setTotal(total + 1);
    setMsg(miss + 1 >= hintAfter ? 'hint' : v);
  };
  const lens = useMemo(() => refs.map(length), [refs]);
  const svg = { width: size, height: size, viewBox: `0 0 ${BOX} ${BOX}` };
  const cur = Math.min(mode === 'demo' ? shown : done, n - 1);
  return (
    <View>
      <Animated.View
        onStartShouldSetResponder={() => true} onMoveShouldSetResponder={() => true} onResponderTerminationRequest={() => false}
        // Returning true keeps an enclosing native ScrollView (Android) from stealing the stroke
        onResponderGrant={e => { start(e); return true; }} onResponderMove={move} onResponderRelease={end} onResponderTerminate={end}
        style={{ width: size, height: size, borderRadius: R.lg, backgroundColor: C.bg, transform: [{ translateX: shake }] }}>
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Svg {...svg}>
            <Line x1={BOX / 2} y1={4} x2={BOX / 2} y2={BOX - 4} stroke={C.line} strokeWidth={0.5} strokeDasharray="2.5 2.5" />
            <Line x1={4} y1={BOX / 2} x2={BOX - 4} y2={BOX / 2} stroke={C.line} strokeWidth={0.5} strokeDasharray="2.5 2.5" />
            {GUIDE[mode] > 0 && d.map((x, i) => <Path key={i} d={x} stroke={C.ink} opacity={GUIDE[mode]} {...pen} />)}
            {mode === 'trace' && !complete && (
              <>
                {miss < hintAfter && <Path d={d[done]} stroke={C.ok} opacity={0.45} {...pen} />}
                <Circle cx={refs[done][0][0]} cy={refs[done][0][1]} r={3.6} fill={C.ok} />
                <Polygon points={arrow(refs[done])} fill={C.ok} />
              </>
            )}
            {!complete && miss >= hintAfter && mode !== 'demo' && <Draw key={`${done}-${miss}`} d={d[done]} len={lens[done]} color={C.brand} opacity={0.55} />}
            {mode === 'demo'
              ? d.slice(0, shown + 1).map((x, i) => (i < shown
                ? <Path key={i} d={x} stroke={complete ? C.ok : C.ink} {...pen} />
                : <Draw key={i} d={x} len={lens[i]} color={C.brand} delay={i ? 180 : 400} onEnd={() => setShown(i + 1)} />))
              : kept.map((p, i) => <Path key={i} d={poly(p)} stroke={complete ? C.ok : C.ink} {...pen} />)}
            {ink.length > 1 && <Path d={poly(ink)} stroke={C.ink} {...pen} />}
          </Svg>
        </View>
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: fade }]}>
          <Svg {...svg}>{bad.length > 1 && <Path d={poly(bad)} stroke={C.brandDark} {...pen} />}</Svg>
        </Animated.View>
      </Animated.View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, minHeight: 18 }}>
        <T size={12} w={500} color={C.mute}>{complete ? `${n} nét` : `Nét ${cur + 1}/${n}`}</T>
        {complete && mode !== 'demo'
          ? <FadeIn dy={4}><T size={12} w={600} color={C.ok}>{total ? `Hoàn thành · sai ${total} lần` : 'Hoàn hảo · không sai nét nào'}</T></FadeIn>
          : msg && <FadeIn key={total} dy={4}><T size={12} w={600} color={C.brandDark}>{MSG[msg]}</T></FadeIn>}
      </View>
    </View>
  );
}

// ——— Practice screen ———

const STAGES: { mode: Mode; t: string; tip: string }[] = [
  { mode: 'demo', t: 'Xem mẫu', tip: 'Xem thứ tự và hướng viết từng nét' },
  { mode: 'trace', t: 'Tô đậm', tip: 'Tô theo nét xanh, bắt đầu từ chấm tròn' },
  { mode: 'faint', t: 'Tô mờ', tip: 'Tô theo nét mờ, đúng thứ tự' },
  { mode: 'free', t: 'Tự viết', tip: 'Tự viết lại chữ theo trí nhớ' },
];
export const WRITE_STAGES = STAGES.length;

/** Four stages per kanji, Duolingo-style: watch, trace, trace faintly, then write from memory */
export function Writing({ k, start = 0, back, passed }: { k: KanjiItem; start?: number; back: () => void; passed: (stages: number) => void }) {
  const [st, setSt] = useState(start);
  const [run, setRun] = useState(0);
  const [res, setRes] = useState<number | null>(null);
  const { width, height } = useWindowDimensions();
  const size = Math.max(200, Math.min(width - 68, height - 380, 360));
  const s = STAGES[st];
  const last = st === STAGES.length - 1;
  const read = k.kun.split('・')[0];
  const goto = (i: number) => { setSt(i); setRes(null); setRun(r => r + 1); };
  const finish = (m: number) => {
    setRes(m);
    passed(st + 1);
    if (s.mode !== 'demo') speak(read);
  };
  return (
    <Screen>
      <Header onClose={back} right={<T size={13} w={600}>{st + 1}/{STAGES.length}</T>}>
        <Bar value={(st + (res === null ? 0 : 1)) / STAGES.length} color={C.ok} />
      </Header>
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 10 }}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {STAGES.map((x, i) => (
            <Pill key={x.t} label={x.t} size={12} onPress={() => goto(i)} bg={i === st ? C.ok : i < st ? C.okSoft : C.white} color={i === st ? C.white : i < st ? C.ok : C.mute}
              style={{ flex: 1, justifyContent: 'center', paddingVertical: 6, paddingHorizontal: 4 }} />
          ))}
        </View>
        <FadeIn key={st} dy={6}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16 }}>
            <Pressable onPress={() => speak(read)} style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: C.okSoft, alignItems: 'center', justifyContent: 'center' }}>
              <JP size={34} lh={1.2}>{k.ch}</JP>
            </Pressable>
            <View style={{ flex: 1 }}>
              <T size={18} w={600}>{s.t} · {k.han}</T>
              <T size={13} color={C.mute}>{s.tip}</T>
            </View>
          </View>
        </FadeIn>
        <Card style={{ marginTop: 14, borderRadius: 28, alignItems: 'center' }}>
          <Pad key={`${st}-${run}`} d={k.d} mode={s.mode} size={size} onDone={finish} />
        </Card>
      </View>
      <Footer>
        <Pressable onPress={() => { setRes(null); setRun(r => r + 1); }} style={{ width: 54, backgroundColor: C.white, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={s.mode === 'demo' ? 'play' : 'rotate-ccw'} size={20} />
        </Pressable>
        {res === null
          ? s.mode === 'demo'
            ? <Btn kind="ghost" label="Bỏ qua" onPress={() => { passed(st + 1); goto(st + 1); }} style={{ flex: 1 }} />
            : <Btn kind="ok" label="Viết hết các nét" disabled onPress={() => {}} style={{ flex: 1 }} />
          : <Btn kind="ok" label={last ? 'Hoàn thành' : 'Tiếp tục'} onPress={() => (last ? back() : goto(st + 1))} style={{ flex: 1 }} />}
      </Footer>
    </Screen>
  );
}
