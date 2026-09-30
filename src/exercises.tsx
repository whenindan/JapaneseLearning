import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, LayoutAnimation, Pressable, ScrollView, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { C, J, R } from './theme';
import { Bar, Btn, Card, FadeIn, Footer, Header, Icon, JP, Label, MIcon, Pill, Screen, Sheet, SqBtn, T, Tap, speak, useFlip } from './ui';
import { KANJI, type Ex } from './data';
import { Pad } from './writing';

export type Cat = 'grammar' | 'vocab' | 'kanji';
export const CAT: Record<Ex['t'], Cat> = { fill: 'grammar', error: 'grammar', order: 'grammar', match: 'vocab', picture: 'vocab', type: 'vocab', kanji: 'kanji', write: 'kanji' };
export const CAT_NAME: Record<Cat, string> = { grammar: 'Ngữ pháp', vocab: 'Từ vựng', kanji: 'Kanji' };
const KIND: Record<Ex['t'], string> = { fill: 'ĐIỀN TỪ', error: 'TÌM CHỖ SAI', order: 'SẮP XẾP', match: 'NỐI THẺ', picture: 'TRANH → TỪ', type: 'GÕ TỪ', kanji: 'KANJI → HIRAGANA', write: 'VIẾT KANJI' };

export type Wrong = { n: number; kind: string; q: string; a: string; why: string; your?: string };
export type Result = { correct: number; total: number; wrong: Wrong[]; cats: Partial<Record<Cat, { c: number; t: number }>>; secs: number };

type Raw = string | number | number[] | undefined;
type Verdict = { ok: boolean; title: string; sub: string; q: string; a: string; why: string; replay?: string; your?: string; fix?: { pre: string; from: string; to: string; post: string } };

const SALT = String(Math.random());
const hash = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; };
/** Shuffle that is stable for the same input within a session, so revisiting a question keeps its layout */
const mix = <X,>(a: X[], seed: string) => a.map((x, i) => [hash(SALT + seed + i), x] as const).sort((p, q) => p[0] - q[0]).map(p => p[1]);
const norm = (s: string) => s.replace(/\s+/g, '');
const LETTERS = 'ABCD';
const kanjiOf = (ex: Extract<Ex, { t: 'write' }>) => KANJI.find(k => k.ch === ex.k)!;

function grade(ex: Ex, raw: Raw): Verdict {
  const none = raw === undefined || (Array.isArray(raw) && raw.length === 0) || raw === '';
  switch (ex.t) {
    case 'fill': {
      const ok = raw === ex.a, full = ex.pre + ex.a + ex.post;
      return { ok, title: ok ? 'Chính xác!' : none ? 'Chưa trả lời' : 'Chưa đúng', sub: ex.why, q: `${ex.pre}（　）${ex.post}`, a: ex.a, why: ex.why, replay: full, your: raw as string };
    }
    case 'picture':
    case 'kanji': {
      const ok = raw === ex.a;
      const q = ex.t === 'kanji' ? ex.k : ex.vi;
      return { ok, title: ok ? 'Chính xác!' : none ? 'Chưa trả lời' : 'Sai rồi', sub: ok ? `${ex.a} = ${ex.vi}` : `Đáp án đúng: ${ex.a} = ${ex.vi}`, q, a: ex.a, why: ex.vi, replay: ex.a, your: raw as string };
    }
    case 'error': {
      const ok = raw === ex.wrong;
      const part = ex.parts[ex.wrong], at = part.indexOf(ex.from);
      const fix = { pre: ex.parts.slice(0, ex.wrong).join('') + part.slice(0, at), from: ex.from, to: ex.to, post: part.slice(at + ex.from.length) + ex.parts.slice(ex.wrong + 1).join('') + '。' };
      return { ok, title: ok ? 'Chính xác!' : `Chưa đúng — đáp án ${LETTERS[ex.wrong]}`, sub: ex.vi, q: ex.parts.join(''), a: `${ex.from} → ${ex.to}`, why: ex.why, fix };
    }
    case 'order': {
      const p = (raw as number[] | undefined) ?? [];
      const ok = p.length === ex.words.length && p.every((x, i) => x === i);
      const a = ex.words.join(' ');
      return { ok, title: ok ? 'Chính xác!' : 'Chưa đúng', sub: ok ? ex.vi : `Đáp án: ${a}`, q: ex.vi, a, why: ex.vi, replay: ex.words.join(''), your: p.map(i => ex.words[i]).join(' ') };
    }
    case 'type': {
      const v = (raw as string | undefined) ?? '';
      const ok = ex.ok.map(norm).includes(norm(v));
      return { ok, title: ok ? 'Đúng · +10 điểm' : none ? 'Chưa trả lời' : 'Chưa đúng', sub: ex.why, q: ex.vi, a: ex.ok[0], why: ex.why, replay: ex.ok[0], your: v };
    }
    case 'match': {
      const miss = (raw as number | undefined) ?? 99;
      return { ok: miss <= 2, title: miss === 0 ? 'Hoàn hảo!' : 'Ghép xong!', sub: miss === 0 ? 'Không lật sai lần nào' : `${miss} lần lật sai`, q: 'Nối thẻ', a: '', why: '' };
    }
    case 'write': {
      const k = kanjiOf(ex), n = k.d.length, miss = raw as number | undefined;
      // Like Duolingo, finishing always completes the character; it only counts as correct with few rejected strokes
      const ok = miss !== undefined && miss <= Math.max(2, Math.round(n * 0.4));
      return { ok, title: none ? 'Chưa trả lời' : miss === 0 ? 'Hoàn hảo!' : ok ? 'Chính xác!' : 'Cần luyện thêm', sub: none ? `${k.han} · ${n} nét` : `${k.ch} · ${k.han} = ${ex.vi} · sai ${miss} lần`,
        q: `${k.ch} (${k.han})`, a: '', why: none ? `${n} nét` : `Sai ${miss} lần · ${n} nét`, replay: k.kun.split('・')[0] };
    }
  }
}

// ——— Options ———

type St = 'ok' | 'bad' | 'sel' | null;
const tone = (s: St, solid?: boolean) =>
  s === 'ok' ? (solid ? [C.ok, C.ok, C.white] : [C.okSoft, C.ok, C.ok]) : s === 'bad' ? [C.brandSoft2, C.brandDark, C.brandDark] : s === 'sel' ? [C.brand, C.brand, C.white] : [C.white, 'transparent', C.ink];

const Opt = ({ label, state, onPress, size = 22, solid, style, right, latin, left }: { label: string; state: St; onPress: () => void; size?: number; solid?: boolean; style?: object; right?: React.ReactNode; latin?: boolean; left?: boolean }) => {
  const [bg, bd, fg] = tone(state, solid);
  return (
    <Tap onPress={onPress} style={[{ backgroundColor: bg, borderColor: bd, borderWidth: 2, borderRadius: 18, paddingVertical: 14, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }, style]}>
      {latin ? <T size={size} w={600} color={fg}>{label}</T> : <JP size={size} color={fg} lh={1.3} center={!left} style={left ? { flex: 1 } : undefined}>{label}</JP>}
      {right}
    </Tap>
  );
};

type P<E> = { ex: E; value: Raw; set: (r: Raw) => void; reveal: boolean; lock: (on: boolean) => void };
const stateOf = (o: string, value: Raw, a: string, reveal: boolean): St => (value === undefined ? null : reveal ? (o === a ? 'ok' : o === value ? 'bad' : null) : o === value ? 'sel' : null);

function Choice({ ex, value, set, reveal }: P<Extract<Ex, { t: 'fill' | 'picture' | 'kanji' }>>) {
  const opts = useMemo(() => mix(ex.opts, ex.a + ex.opts.join()), [ex]);
  const pick = (o: string) => !reveal && set(o);
  if (ex.t === 'kanji') return (
    <View style={{ gap: 16 }}>
      <View style={{ backgroundColor: C.okSoft, borderRadius: 30, height: 240, alignItems: 'center', justifyContent: 'center' }}>
        <Label color={C.ok}>CHỌN CÁCH ĐỌC</Label>
        <JP size={ex.k.length > 1 ? 84 : 110} lh={1.25}>{ex.k}</JP>
      </View>
      <View style={{ gap: 10 }}>
        {opts.map(o => {
          const s = stateOf(o, value, ex.a, reveal);
          const [, , fg] = tone(s);
          return <Opt key={o} left label={o} size={18} state={s === 'sel' ? null : s} onPress={() => pick(o)}
            style={[{ justifyContent: 'flex-start', paddingHorizontal: 16 }, s === 'sel' && { borderColor: C.ok }]}
            right={s && <Icon name={s === 'ok' ? 'check-circle' : s === 'bad' ? 'x-circle' : 'disc'} color={s === 'sel' ? C.ok : fg} size={20} />} />;
        })}
      </View>
    </View>
  );
  const blank = value === undefined ? null : stateOf(value as string, value, ex.a, reveal);
  const [bbg, , bfg] = blank ? tone(blank === 'sel' ? null : blank) : [C.soft, '', C.faint];
  return (
    <View style={{ gap: 14 }}>
      {ex.t === 'fill' ? (
        <Card style={{ borderRadius: R.xl, padding: 20 }}>
          <Label color={C.brand}>NGỮ PHÁP · ĐIỀN TỪ</Label>
          <JP size={22} lh={1.8} style={{ marginTop: 8 }}>
            {ex.pre}<Text style={{ backgroundColor: blank === 'sel' ? C.brandSoft : bbg, color: blank === 'sel' ? C.brand : bfg }}>{` ${(value as string) ?? '　　'} `}</Text>{ex.post}
          </JP>
          <T size={13} color={C.mute}>{ex.vi}</T>
        </Card>
      ) : (
        <View style={{ height: 190, borderRadius: R.xl, backgroundColor: C.brandSoft, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 96 }}>{ex.emoji}</Text>
          <Label color={C.brand} style={{ position: 'absolute', left: 14, bottom: 10 }}>TỪ VỰNG · TRANH → TỪ</Label>
        </View>
      )}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {opts.map(o => <Opt key={o} label={o} size={ex.t === 'fill' ? (o.length > 3 ? 17 : 22) : 17} solid={ex.t === 'fill'} state={stateOf(o, value, ex.a, reveal)} onPress={() => pick(o)} style={{ flexBasis: '47%', flexGrow: 1 }} />)}
      </View>
    </View>
  );
}

function ErrorFind({ ex, value, set, reveal }: P<Extract<Ex, { t: 'error' }>>) {
  return (
    <View style={{ gap: 14 }}>
      <Card style={{ borderRadius: R.xl, padding: 20 }}>
        <Label color={C.brand}>NGỮ PHÁP · CHỌN PHẦN SAI</Label>
        <JP size={20} lh={2.2} style={{ marginTop: 4 }}>
          {ex.parts.map((p, i) => {
            const bad = reveal && i === ex.wrong;
            return <Text key={i}><Text style={{ textDecorationLine: 'underline', color: bad ? C.brandDark : C.ink }}>{p}</Text><Text style={{ fontFamily: 'Lexend_600SemiBold', fontSize: 11, color: bad ? C.brandDark : C.brand }}>{LETTERS[i]}</Text>{i < ex.parts.length - 1 ? '  ' : '。'}</Text>;
          })}
        </JP>
        <T size={13} color={C.mute}>{ex.vi}</T>
      </Card>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {ex.parts.map((_, i) => {
          const s: St = value === undefined ? null : reveal ? (i === ex.wrong ? 'ok' : i === value ? 'bad' : null) : i === value ? 'sel' : null;
          return <Opt key={i} latin label={LETTERS[i]} size={18} state={s} onPress={() => !reveal && set(i)} style={{ flex: 1 }} />;
        })}
      </View>
    </View>
  );
}

function Order({ ex, value, set, reveal }: P<Extract<Ex, { t: 'order' }>>) {
  const bank = useMemo(() => {
    const b = mix(ex.words.map((w, i) => ({ w, i })), ex.words.join());
    return b.every((x, n) => x.i === n) ? b.reverse() : b;
  }, [ex]);
  const picked = (value as number[] | undefined) ?? [];
  const put = (v: number[]) => { LayoutAnimation.configureNext(LayoutAnimation.create(220, 'easeInEaseOut', 'opacity')); set(v); };
  const ok = reveal && grade(ex, picked).ok;
  const chip = reveal ? (ok ? C.ok : C.brandDark) : C.brand;
  return (
    <View style={{ gap: 16 }}>
      <Card style={{ borderRadius: R.xl, padding: 20 }}>
        <Label color={C.brand}>NGỮ PHÁP · SẮP XẾP</Label>
        <T size={16} w={500} style={{ marginTop: 6 }}>{ex.vi}</T>
        <View style={{ marginTop: 14, minHeight: 96, backgroundColor: C.bg, borderRadius: 18, padding: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignContent: 'flex-start', borderWidth: 2, borderStyle: 'dashed', borderColor: C.line }}>
          {picked.map(i => (
            <Pressable key={i} onPress={() => !reveal && put(picked.filter(p => p !== i))} style={{ backgroundColor: chip, borderRadius: 12, paddingVertical: 6, paddingHorizontal: 12 }}>
              <JP size={16} color={C.white}>{ex.words[i]}</JP>
            </Pressable>
          ))}
        </View>
      </Card>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
        {bank.map(b => {
          const used = picked.includes(b.i);
          return (
            <Pressable key={b.i} disabled={used || reveal} onPress={() => put([...picked, b.i])}
              style={{ backgroundColor: used ? C.line2 : C.white, borderRadius: 14, paddingVertical: 8, paddingHorizontal: 14, borderBottomWidth: 4, borderBottomColor: used ? C.line2 : C.line }}>
              <JP size={17} color={used ? 'transparent' : C.ink}>{b.w}</JP>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function TypeIn({ ex, value, set, reveal }: P<Extract<Ex, { t: 'type' }>>) {
  const v = (value as string | undefined) ?? '';
  const g = reveal ? grade(ex, v) : null;
  return (
    <View style={{ gap: 12 }}>
      <Card style={{ borderRadius: R.xl, padding: 20 }}>
        <Label color={C.brand}>TỪ VỰNG · VIỆT → NHẬT</Label>
        <T size={26} w={600} style={{ marginTop: 6 }}>{ex.vi}</T>
        <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 2, paddingHorizontal: 14, backgroundColor: g ? (g.ok ? C.okSoft : C.brandSoft2) : C.bg, borderColor: g ? (g.ok ? C.ok : C.brandDark) : C.bg }}>
          <TextInput value={v} onChangeText={set} editable={!reveal} autoCorrect={false} autoCapitalize="none" placeholder="Gõ tiếng Nhật…" placeholderTextColor={C.faint}
            style={{ flex: 1, fontFamily: J[700], fontSize: 22, color: C.ink, paddingVertical: 14 }} />
          {g && <Icon name={g.ok ? 'check-circle' : 'x-circle'} size={22} color={g.ok ? C.ok : C.brandDark} />}
        </View>
      </Card>
      {g && (
        <FadeIn><Card style={{ borderRadius: 22, padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <T size={15} w={600} color={g.ok ? C.ok : C.brandDark}>{g.title}</T>
            <Pill label="Nghe" bg={C.bg} color={C.mute} size={11} icon={<Icon name="volume-2" size={12} color={C.brand} />} onPress={() => speak(ex.ok[0])} style={{ paddingVertical: 4, paddingHorizontal: 8 }} />
          </View>
          <Label style={{ marginTop: 12 }}>CÁC ĐÁP ÁN ĐƯỢC CHẤP NHẬN</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
            {ex.ok.map((o, i) => <View key={o} style={{ backgroundColor: i === 0 ? C.ok : C.bg, borderRadius: 10, paddingVertical: 3, paddingHorizontal: 10 }}><JP size={15} color={i === 0 ? C.white : C.ink}>{o}</JP></View>)}
          </View>
          {!g.ok && !!v && <T size={13} color={C.mute} style={{ marginTop: 10 }}>Bạn gõ: <Text style={{ fontFamily: J[700], color: C.brandDark }}>{v}</Text></T>}
        </Card></FadeIn>
      )}
    </View>
  );
}

function Write({ ex, set, reveal, lock }: P<Extract<Ex, { t: 'write' }>>) {
  const k = kanjiOf(ex);
  const { width } = useWindowDimensions();
  return (
    <View style={{ gap: 14 }}>
      <Card style={{ borderRadius: R.xl, padding: 20 }}>
        <Label color={C.ok}>KANJI · VIẾT CHỮ</Label>
        <T size={24} w={600} style={{ marginTop: 6 }}>{k.han} · {ex.vi}</T>
        <Text><T size={13} color={C.mute}>Âm đọc </T><JP size={14} w={500} color={C.mute}>{k.kun} · {k.on}</JP><T size={13} color={C.mute}> · {k.d.length} nét</T></Text>
      </Card>
      <Card style={{ borderRadius: R.xl, alignItems: 'center' }}>
        <Pad d={k.d} mode="free" lenient={1.1} size={Math.min(width - 60, 360)} disabled={reveal} onDone={set} onLock={lock} />
      </Card>
    </View>
  );
}

const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

function Match({ ex, set, reveal }: P<Extract<Ex, { t: 'match' }>>) {
  const cards = useMemo(() => mix(ex.pairs.flatMap(([jp, vi], p) => [{ p, jp: true, t: jp }, { p, jp: false, t: vi }]), ex.pairs.join()), [ex]);
  const [open, setOpen] = useState<number[]>([]);
  const [got, setGot] = useState<number[]>([]);
  const [miss, setMiss] = useState(0);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (reveal) return;
    const id = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [reveal]);
  const tap = (i: number) => {
    const c = cards[i];
    if (reveal || got.includes(c.p) || open.includes(i) || open.length === 2) return;
    if (c.jp) speak(c.t);
    const o = [...open, i];
    setOpen(o);
    if (o.length < 2) return;
    const [a, b] = o.map(k => cards[k]);
    if (a.p === b.p) {
      const g = [...got, a.p];
      setGot(g); setOpen([]); setMsg({ ok: true, t: `Ghép đúng! ${ex.pairs[a.p][0]} = ${ex.pairs[a.p][1]}` });
      if (g.length === ex.pairs.length) set(miss);
    } else {
      setMiss(m => m + 1); setMsg({ ok: false, t: 'Chưa khớp — thử cặp khác' });
      setTimeout(() => setOpen([]), 700);
    }
  };
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <View><T size={20} w={600}>Nối từ với nghĩa</T><T size={13} color={C.mute}>{got.length}/{ex.pairs.length} cặp · lật thẻ tìm cặp</T></View>
        <Pill label={mmss(secs)} w={600} icon={<Icon name="clock" size={15} color={C.brand} />} />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
        {cards.map((c, i) => <MatchCard key={i} c={c} done={got.includes(c.p)} up={open.includes(i)} onPress={() => tap(i)} />)}
      </View>
      {msg && <FadeIn key={msg.t + got.length + miss} dy={6}><View style={{ marginTop: 16, backgroundColor: msg.ok ? C.okSoft : C.brandSoft2, borderRadius: 16, padding: 12 }}><T size={14} w={600} center color={msg.ok ? C.ok : C.brandDark}>{msg.t}</T></View></FadeIn>}
    </View>
  );
}

function MatchCard({ c, done, up, onPress }: { c: { jp: boolean; t: string }; done: boolean; up: boolean; onPress: () => void }) {
  const [face, flip] = useFlip(done || up);
  return (
    <Tap onPress={onPress} scaleTo={0.94} style={{ flexBasis: '30%', flexGrow: 1, maxWidth: '32%', aspectRatio: 3 / 4 }}>
      <Animated.View style={{ flex: 1, borderRadius: 18, borderWidth: 2, padding: 6, gap: 6, alignItems: 'center', justifyContent: 'center', transform: flip,
        backgroundColor: face ? (done ? C.okSoft : C.white) : C.brand, borderColor: face && up ? C.brand : 'transparent', opacity: done ? 0.5 : 1 }}>
        {face ? (c.jp ? <><JP size={15} center color={done ? C.ok : C.ink}>{c.t}</JP>{up && <Icon name="volume-2" size={14} color={C.brand} />}</> : <T size={13} w={600} center color={done ? C.ok : C.ink}>{c.t}</T>)
          : <MIcon name="star-four-points" size={22} color="rgba(255,255,255,0.4)" />}
      </Animated.View>
    </Tap>
  );
}

// ——— Feedback sheet ———

function Feedback({ ex, v, action, onAction }: { ex: Ex; v: Verdict; action: string; onAction: () => void }) {
  const fg = v.ok ? C.ok : C.brandDark;
  const sayWord = ex.t === 'picture' || ex.t === 'kanji' || ex.t === 'write';
  return (
    <Sheet>
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: v.ok ? C.okSoft : C.brandSoft2, alignItems: 'center', justifyContent: 'center' }}><Icon name={v.ok ? 'check' : 'x'} size={20} color={fg} /></View>
        <View style={{ flex: 1 }}><T size={17} w={600} color={fg}>{v.title}</T>{!!v.sub && <T size={12} color={C.mute}>{v.sub}</T>}</View>
        {sayWord && v.replay ? <SqBtn icon="volume-2" bg={C.bg} color={C.brand} onPress={() => speak(v.replay!)} /> : v.ok ? <MIcon name="star" size={22} color={C.gold} /> : null}
      </View>
      {!sayWord && v.replay && (
        <Pressable onPress={() => speak(v.replay!)} style={{ marginTop: 12, backgroundColor: C.bg, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 12, flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <Icon name="volume-2" size={18} color={C.brand} />
          <Text style={{ flex: 1 }}><T size={13} w={500} color={C.mute}>Nghe lại: </T><JP size={14} w={500}>{v.replay}</JP></Text>
        </Pressable>
      )}
      {v.fix && (
        <View style={{ marginTop: 12, backgroundColor: C.bg, borderRadius: 14, padding: 12 }}>
          <Label>SỬA LẠI</Label>
          <JP size={16} style={{ marginTop: 2 }}>{v.fix.pre}<Text style={{ color: C.brandDark, textDecorationLine: 'line-through' }}>{v.fix.from}</Text><Text style={{ color: C.ok }}>{v.fix.to}</Text>{v.fix.post}</JP>
          <T size={12} color={C.mute} style={{ marginTop: 2 }}>{v.why}</T>
        </View>
      )}
      <Btn label={!v.ok && ex.t === 'error' ? 'Đã hiểu' : action} kind={v.ok ? 'primary' : 'danger'} onPress={onAction} style={{ marginTop: 12 }} />
    </Sheet>
  );
}

// ——— Runner ———

const AUTO = new Set<Ex['t']>(['fill', 'picture', 'kanji', 'error', 'match', 'write']);

type RunnerProps = { title: string; items: Ex[]; onBack: () => void; onFinish: (r: Result) => void; finishLabel?: string; accent?: string; examMinutes?: number };

export function Runner({ title, items, onBack, onFinish, finishLabel = 'Hoàn thành', accent = C.brand, examMinutes }: RunnerProps) {
  const exam = !!examMinutes;
  const [n, setN] = useState(0);
  const [raws, setRaws] = useState<Raw[]>(() => items.map(() => undefined));
  const [shown, setShown] = useState<boolean[]>(() => items.map(() => false));
  const [flags, setFlags] = useState<boolean[]>(() => items.map(() => false));
  const [left, setLeft] = useState((examMinutes ?? 0) * 60);
  const start = useRef(Date.now());
  const scroll = useRef<ScrollView>(null);
  const ex = items[n];
  const reveal = shown[n];
  const [dir, setDir] = useState(1);
  const [lock, setLock] = useState(false);
  const go = (i: number) => { setDir(i >= n ? 1 : -1); setN(i); };

  const finish = (rs = raws) => {
    const r: Result = { correct: 0, total: items.length, wrong: [], cats: {}, secs: Math.round((Date.now() - start.current) / 1000) };
    items.forEach((e, i) => {
      const v = grade(e, rs[i]);
      const c = (r.cats[CAT[e.t]] ??= { c: 0, t: 0 });
      c.t++;
      if (v.ok) { r.correct++; c.c++; } else r.wrong.push({ n: i + 1, kind: KIND[e.t], q: v.q, a: v.a, why: v.why, your: v.your });
    });
    onFinish(r);
  };
  const finishRef = useRef(finish);
  finishRef.current = finish;

  useEffect(() => {
    if (!exam) return;
    const id = setInterval(() => setLeft(s => { if (s <= 1) { clearInterval(id); setTimeout(() => finishRef.current(), 0); return 0; } return s - 1; }), 1000);
    return () => clearInterval(id);
  }, [exam]);

  useEffect(() => { scroll.current?.scrollTo({ y: 0, animated: false }); }, [n]);

  const commit = (i = n, raw = raws[i]) => {
    setShown(s => s.map((x, k) => (k === i ? true : x)));
    const v = grade(items[i], raw);
    if (v.replay && items[i].t !== 'picture' && items[i].t !== 'kanji') speak(v.replay);
  };
  const set = (raw: Raw) => {
    setRaws(rs => rs.map((x, k) => (k === n ? raw : x)));
    if (!exam && AUTO.has(ex.t) && raw !== undefined) commit(n, raw);
  };
  const next = () => (n + 1 < items.length ? go(n + 1) : finish());
  const last = n + 1 === items.length;
  const verdict = reveal ? grade(ex, raws[n]) : null;

  const props = { ex: ex as any, value: raws[n], set, reveal, lock: setLock };
  const body = ex.t === 'fill' || ex.t === 'picture' || ex.t === 'kanji' ? <Choice key={n} {...props} /> : ex.t === 'order' ? <Order key={n} {...props} /> : ex.t === 'error' ? <ErrorFind key={n} {...props} /> : ex.t === 'type' ? <TypeIn key={n} {...props} /> : ex.t === 'write' ? <Write key={n} {...props} /> : <Match key={n} {...props} />;

  const answered = raws.filter(r => r !== undefined && r !== '' && !(Array.isArray(r) && r.length === 0)).length;
  const counts = items.reduce<Partial<Record<Cat, number>>>((a, e) => ({ ...a, [CAT[e.t]]: (a[CAT[e.t]] ?? 0) + 1 }), {});
  const canCheck = ex.t === 'order' ? ((raws[n] as number[] | undefined)?.length ?? 0) === ex.words.length : ex.t === 'type' ? !!(raws[n] as string | undefined)?.trim() : false;
  const needsSheet = exam || (reveal && ex.t !== 'type');

  return (
    <Screen>
      {exam ? (
        <Header onClose={onBack} right={<Pill label={mmss(left)} bg={C.ink} color={C.gold} w={600} size={14} icon={<Icon name="clock" size={15} color={C.gold} />} />}>
          <T size={15} w={600} numberOfLines={1}>{title}</T>
        </Header>
      ) : (
        <Header onClose={onBack} right={<T size={13} w={600}>{n + 1}/{items.length}</T>}>
          <Bar value={(n + (reveal ? 1 : 0)) / items.length} color={accent} />
        </Header>
      )}
      <ScrollView ref={scroll} scrollEnabled={!lock} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: needsSheet ? (exam ? 330 : 280) : 24 }}>
        {exam && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Pill label={CAT_NAME[CAT[ex.t]]} bg={C.brandSoft} color={C.brand} size={12} style={{ paddingVertical: 4, paddingHorizontal: 10 }} />
            <View style={{ flex: 1 }} />
            <Pressable hitSlop={10} onPress={() => setFlags(f => f.map((x, k) => (k === n ? !x : x)))}><Icon name="flag" size={18} color={flags[n] ? C.goldDark : C.faint} /></Pressable>
            <T size={13} w={600}>{n + 1}/{items.length}</T>
          </View>
        )}
        <FadeIn key={n} dx={dir * 32} dy={0}>{body}</FadeIn>
      </ScrollView>

      {!exam && !reveal && (ex.t === 'order' || ex.t === 'type') && (
        <Footer>
          {ex.t === 'order' && <Pressable onPress={() => set([])} style={{ width: 54, backgroundColor: C.white, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}><Icon name="rotate-ccw" size={20} /></Pressable>}
          <Btn label="Kiểm tra" disabled={!canCheck} onPress={() => commit()} style={{ flex: 1 }} />
        </Footer>
      )}
      {!exam && reveal && ex.t === 'type' && <Footer><Btn label={last ? finishLabel : 'Tiếp tục'} onPress={next} style={{ flex: 1 }} /></Footer>}
      {!exam && verdict && ex.t !== 'type' && <Feedback ex={ex} v={verdict} action={last ? finishLabel : 'Tiếp tục'} onAction={next} />}

      {exam && (
        <Sheet>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <T size={14} w={600}>Danh sách câu</T>
            <T size={12} color={C.mute}>{answered} đã làm · {flags.filter(Boolean).length} đánh dấu</T>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {items.map((_, i) => {
              const cur = i === n, done = raws[i] !== undefined && raws[i] !== '' && !(Array.isArray(raws[i]) && (raws[i] as number[]).length === 0);
              const [bg, fg] = cur ? [C.white, C.brand] : flags[i] ? [C.goldSoft, C.goldDark] : done ? [C.brand, C.white] : [C.bg, C.ink];
              return (
                <Pressable key={i} onPress={() => go(i)} style={{ width: '14.9%', paddingVertical: 7, borderRadius: 10, backgroundColor: bg, borderWidth: 2, borderColor: cur ? C.brand : bg, alignItems: 'center' }}>
                  <T size={13} w={600} color={fg}>{i + 1}</T>
                </Pressable>
              );
            })}
          </View>
          <T size={12} color={C.mute} style={{ marginTop: 10 }}>{(Object.keys(counts) as Cat[]).map(k => `${CAT_NAME[k]} ${counts[k]}`).join('  ·  ')}</T>
          {last
            ? <Btn label={answered < items.length ? `Nộp bài · còn ${items.length - answered} câu trống` : 'Nộp bài'} onPress={() => finish()} style={{ marginTop: 12 }} />
            : <Btn label="Câu tiếp" onPress={next} style={{ marginTop: 12 }} />}
        </Sheet>
      )}
    </Screen>
  );
}
