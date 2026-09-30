import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, LayoutAnimation, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, R, TONE, shadow } from './theme';
import { Bar, Btn, Card, FadeIn, Footer, Header, Icon, JP, Label, MIcon, Pill, Screen, Seg, T, Tap, Tile, speak, stopSpeak, useFlip } from './ui';
import { GRAMMAR, KANJI, LESSON, LISTENING, UPCOMING, VOCAB } from './data';
import { CAT_NAME, type Cat, type Result } from './exercises';
import { WRITE_STAGES } from './writing';
import { Bubble, MASCOTS, MASCOT_IDS, Mascot, Say, type MascotId, type Mood } from './mascot';

/** `written`: writing-practice stages passed per kanji */
export type Progress = { grammar: number; vocab: number; kanji: number; listening: boolean; exercises: Record<string, boolean>; best: number; stars: number; written: Record<string, number> };
export type Tab = 'home' | 'lesson' | 'quick' | 'tests' | 'profile';

const exDone = (p: Progress) => Object.values(p.exercises).filter(Boolean).length;
export const pct = (p: Progress) => (p.grammar / GRAMMAR.length + p.vocab / VOCAB.length + p.kanji / KANJI.length + Number(p.listening) + exDone(p) / 3) / 5;
const partsLeft = (p: Progress) => [p.grammar < GRAMMAR.length, p.vocab < VOCAB.length, p.kanji < KANJI.length, !p.listening].filter(Boolean).length + (3 - exDone(p));
const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
/** The guide's suggestion for what to do next, in lesson order */
const nextStep = (p: Progress): { s: string; t: string } => {
  if (p.grammar < GRAMMAR.length) return { s: 'grammar', t: `Tiếp theo: Ngữ pháp · còn ${GRAMMAR.length - p.grammar} điểm` };
  if (p.vocab < VOCAB.length) return { s: 'vocab', t: `Tiếp theo: Từ vựng · còn ${VOCAB.length - p.vocab} thẻ` };
  if (p.kanji < KANJI.length) return { s: 'kanji', t: `Tiếp theo: Kanji · còn ${KANJI.length - p.kanji} chữ` };
  if (!p.listening) return { s: 'listening', t: 'Tiếp theo: Nghe & đọc hiểu' };
  const e = (['grammar', 'vocab', 'kanji'] as const).find(k => !p.exercises[k]);
  if (e) return { s: `ex-${e}`, t: `Tiếp theo: Bài tập ${CAT_NAME[e]}` };
  if (p.best < 80) return { s: 'test', t: `Tiếp theo: Kiểm tra Bài ${LESSON.no} · cần ≥ 80 điểm` };
  return { s: 'hub', t: `Bạn đã qua Bài ${LESSON.no}! Ôn lại bất cứ lúc nào.` };
};
/** Round avatar showing the guide's face */
const Face = ({ g, size }: { g: MascotId; size: number }) => (
  <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: MASCOTS[g].bg, overflow: 'hidden' }}>
    <Mascot id={g} size={size * 1.45} still style={{ position: 'absolute', left: -size * 0.225, top: -size * 0.02 }} />
  </View>
);
const greeting = () => { const h = new Date().getHours(); return h < 11 ? 'Chào buổi sáng' : h < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'; };

// ——— Tab bar ———

export function TabBar({ active, go }: { active: Tab; go: (t: Tab) => void }) {
  const ins = useSafeAreaInsets();
  const Item = ({ t, icon }: { t: Tab; icon: React.ComponentProps<typeof Icon>['name'] }) => (
    <Pressable onPress={() => go(t)} hitSlop={6} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%' }}><Icon name={icon} size={22} color={active === t ? C.white : C.faint} /></Pressable>
  );
  return (
    <View style={[{ position: 'absolute', left: 16, right: 16, bottom: Math.max(18, ins.bottom), height: 64, backgroundColor: C.ink, borderRadius: 24, flexDirection: 'row', alignItems: 'center' }, shadow(8, 24, 0.18)]}>
      <Item t="home" icon="home" />
      <Item t="lesson" icon="book-open" />
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Tap onPress={() => go('quick')} scaleTo={0.9} style={[{ width: 52, height: 52, borderRadius: 18, backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center', marginTop: -26 }, shadow(8, 20, 0.3)]}>
          <Icon name="zap" size={24} color={C.ink} />
        </Tap>
      </View>
      <Item t="tests" icon="clipboard" />
      <Item t="profile" icon="user" />
    </View>
  );
}

// ——— Home ———

const CARD_W = 250;
export function Home({ p, guide: g, open, go, tab }: { p: Progress; guide: MascotId; open: () => void; go: (s: string) => void; tab: (t: Tab) => void }) {
  const v = pct(p);
  const next = nextStep(p);
  const [slide, setSlide] = useState(0);
  const mods = [
    { s: 'grammar', icon: 'film', t: 'Ngữ pháp', sub: `${GRAMMAR.length} điểm · có ví dụ`, tone: TONE.grammar, done: p.grammar >= GRAMMAR.length },
    { s: 'vocab', icon: 'layers', t: 'Từ vựng', sub: p.vocab < VOCAB.length ? `Ôn ${VOCAB.length - p.vocab} thẻ hôm nay` : 'Đã học hết thẻ', tone: TONE.vocab, done: p.vocab >= VOCAB.length },
    { s: 'kanji', icon: 'pen-tool', t: 'Kanji', sub: `${KANJI.length} chữ · tập viết`, tone: TONE.kanji, done: p.kanji >= KANJI.length },
    { s: 'listening', icon: 'headphones', t: 'Nghe · Đọc', sub: 'Giọng đọc + câu hỏi', tone: TONE.listening, done: p.listening },
  ] as const;
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View><T size={13} color={C.mute}>{greeting()}</T><T size={22} w={600}>Hôm nay học gì?</T></View>
          <Pressable onPress={() => tab('profile')} accessibilityLabel="Hồ sơ"><Face g={g} size={42} /></Pressable>
        </View>
        <View style={{ marginTop: 14, marginHorizontal: 20, flexDirection: 'row', gap: 8 }}>
          <Pill label="N5" bg={C.ink} color={C.white} />
          <Pill label="N4" color={C.mute} />
          <View style={{ flex: 1 }} />
          <Pill label={String(p.stars)} w={600} color={C.goldDark} icon={<MIcon name="star" size={16} color={C.gold} />} />
        </View>

        <View style={{ marginTop: 14, marginHorizontal: 20, flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
          <Mascot id={g} size={84} mood="wave" tap />
          <Tap onPress={() => go(next.s)} style={{ flex: 1, marginTop: 4 }}>
            <Bubble>
              <Say text={MASCOTS[g].lines.hi} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                <T size={12} w={600} color={C.brand} style={{ flex: 1 }}>{next.t}</T>
                <Icon name="arrow-right" size={14} color={C.brand} />
              </View>
            </Bubble>
          </Tap>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={CARD_W + 12} decelerationRate="fast"
          onScroll={e => {
            const n = Math.round(e.nativeEvent.contentOffset.x / (CARD_W + 12));
            if (n !== slide) { LayoutAnimation.configureNext(LayoutAnimation.create(180, 'easeInEaseOut', 'opacity')); setSlide(n); }
          }} scrollEventThrottle={32}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }} style={{ marginTop: 16 }}>
          <Tap onPress={open} style={{ width: CARD_W, backgroundColor: C.brand, borderRadius: R.xl, padding: 18, overflow: 'hidden' }}>
            <JP size={130} lh={1} color={C.white} style={{ position: 'absolute', right: -10, top: -14, opacity: 0.12 }}>{LESSON.mark}</JP>
            <T size={12} w={500} color="rgba(255,255,255,0.8)">BÀI {LESSON.no} / {LESSON.total} · {v > 0 ? 'ĐANG HỌC' : 'BẮT ĐẦU'}</T>
            <JP size={22} color={C.white} style={{ marginTop: 6 }}>{LESSON.title}</JP>
            <T size={13} color="rgba(255,255,255,0.85)">{LESSON.sub}</T>
            <View style={{ marginTop: 18 }}><Bar value={v} color={C.gold} track="rgba(255,255,255,0.25)" h={8} /></View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
              <T size={13} w={500} color={C.white}>{Math.round(v * 100)}% · {partsLeft(p)} phần còn lại</T>
              <View style={{ backgroundColor: C.white, borderRadius: R.pill, paddingVertical: 8, paddingHorizontal: 14 }}><T size={13} w={600} color={C.brand}>{v > 0 ? 'Học tiếp' : 'Bắt đầu'}</T></View>
            </View>
          </Tap>
          {UPCOMING.map(u => (
            <View key={u.no} style={{ width: CARD_W, backgroundColor: C.white, borderRadius: R.xl, padding: 18, opacity: 0.7 }}>
              <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}><Icon name="lock" size={13} color={C.mute} /><T size={12} w={500} color={C.mute}>BÀI {u.no}</T></View>
              <JP size={22} style={{ marginTop: 6 }}>{u.title}</JP>
              <T size={12} color={C.faint} style={{ marginTop: 20 }}>Qua kiểm tra Bài {u.no - 1} để mở</T>
            </View>
          ))}
        </ScrollView>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: 10 }}>
          {[0, ...UPCOMING].map((_, i) => <View key={i} style={{ width: i === slide ? 18 : 6, height: 6, borderRadius: 3, backgroundColor: i === slide ? C.brand : C.line }} />)}
        </View>

        <View style={{ marginTop: 14, marginHorizontal: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {mods.map((m, i) => (
            <FadeIn key={m.s} delay={80 + i * 60} style={{ flexBasis: '47%', flexGrow: 1 }}>
            <Card onPress={() => go(m.s)} style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Tile icon={m.icon} bg={m.tone.bg} fg={m.tone.fg} size={38} />
                {m.done && <Icon name="check-circle" size={16} color={C.ok} />}
              </View>
              <T size={14} w={600} style={{ marginTop: 10 }}>{m.t}</T>
              <T size={12} color={C.mute}>{m.sub}</T>
            </Card>
            </FadeIn>
          ))}
        </View>
      </ScrollView>
      <TabBar active="home" go={tab} />
    </Screen>
  );
}

// ——— Profile ———

export function Profile({ p, guide: g, setGuide, tab }: { p: Progress; guide: MascotId; setGuide: (g: MascotId) => void; tab: (t: Tab) => void }) {
  const badges = [
    { icon: 'film', t: 'Ngữ pháp', ok: p.grammar >= GRAMMAR.length },
    { icon: 'layers', t: 'Từ vựng', ok: p.vocab >= VOCAB.length },
    { icon: 'pen-tool', t: 'Kanji', ok: p.kanji >= KANJI.length },
    { icon: 'headphones', t: 'Nghe hiểu', ok: p.listening },
    { icon: 'target', t: 'Chăm chỉ', ok: exDone(p) === 3 },
    { icon: 'award', t: `Qua Bài ${LESSON.no}`, ok: p.best >= 80 },
  ] as const;
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        <View style={{ alignItems: 'center', paddingVertical: 12 }}>
          <Face g={g} size={84} />
          <T size={20} w={600} style={{ marginTop: 10 }}>Học viên N5</T>
          <T size={13} color={C.mute}>Minna no Nihongo · Bài {LESSON.no}</T>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          {[[String(p.stars), 'Sao'], [`${Math.round(pct(p) * 100)}%`, `Bài ${LESSON.no}`], [p.best ? String(p.best) : '—', 'Điểm KT']].map(([v, l]) => (
            <Card key={l} style={{ flex: 1, alignItems: 'center' }}><T size={20} w={700}>{v}</T><T size={12} color={C.mute}>{l}</T></Card>
          ))}
        </View>
        <T size={15} w={600} style={{ marginTop: 22 }}>Người đồng hành</T>
        <T size={12} color={C.mute} style={{ marginBottom: 10 }}>Chọn nhân vật hướng dẫn bạn trong lúc học</T>
        <View style={{ gap: 10 }}>
          {MASCOT_IDS.map(id => {
            const M = MASCOTS[id], on = id === g;
            return (
              <Card key={id} onPress={() => setGuide(id)} style={{ flexDirection: 'row', gap: 12, alignItems: 'center', borderWidth: 2, borderColor: on ? C.brand : C.white }}>
                <View style={{ width: 84, height: 96, borderRadius: R.md, backgroundColor: M.bg, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 2 }}>
                  <Mascot id={id} size={76} mood={on ? 'wave' : 'idle'} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <T size={16} w={700}>{M.name}</T><JP size={13} lh={1.3} color={M.color}>{M.kana}</JP>
                    <View style={{ flex: 1 }} />
                    <Icon name={on ? 'check-circle' : 'circle'} size={18} color={on ? C.brand : C.line} />
                  </View>
                  <T size={12} w={500} color={C.mute}>{M.animal} · {M.role}</T>
                  <T size={12} style={{ marginTop: 4 }}>{M.desc}</T>
                  <JP size={13} w={500} color={M.color} style={{ marginTop: 4 }}>{M.catch[0]}</JP>
                </View>
              </Card>
            );
          })}
        </View>
        <T size={15} w={600} style={{ marginTop: 22, marginBottom: 10 }}>Huy hiệu</T>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {badges.map((b, i) => (
            <FadeIn key={b.t} delay={i * 50} style={{ flexBasis: '30%', flexGrow: 1 }}>
            <Card style={{ flex: 1, alignItems: 'center', paddingVertical: 16 }}>
              <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: b.ok ? C.gold : C.soft, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: b.ok ? '-6deg' : '0deg' }] }}>
                <Icon name={b.ok ? b.icon : 'lock'} size={22} color={b.ok ? C.ink : C.faint} />
              </View>
              <T size={12} w={500} color={b.ok ? C.ink : C.faint} style={{ marginTop: 8 }} center>{b.t}</T>
            </Card>
            </FadeIn>
          ))}
        </View>
      </ScrollView>
      <TabBar active="profile" go={tab} />
    </Screen>
  );
}

// ——— Lesson hub ———

type HubTab = 'learn' | 'ex' | 'test';
const Badge = ({ n, of }: { n: number; of: number }) =>
  n >= of ? <Pill label={`${n}/${of}`} bg={C.okSoft} color={C.ok} w={600} size={12} style={{ paddingVertical: 4, paddingHorizontal: 10 }} />
    : n > 0 ? <Pill label={`${n}/${of}`} bg={C.goldSoft} color={C.goldDark} w={600} size={12} style={{ paddingVertical: 4, paddingHorizontal: 10 }} />
      : <T size={12} color={C.faint}>{n}/{of}</T>;

const Row = ({ icon, tone, t, s, right, current, onPress }: { icon: React.ComponentProps<typeof Icon>['name']; tone: { bg: string; fg: string }; t: string; s: string; right?: React.ReactNode; current?: boolean; onPress: () => void }) => (
  <Card onPress={onPress} style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 2, borderColor: current ? C.brand : C.white }]}>
    <Tile icon={icon} bg={tone.bg} fg={tone.fg} />
    <View style={{ flex: 1 }}><T size={15} w={600}>{t}</T><T size={12} color={C.mute}>{s}</T></View>
    {current ? <Icon name="play-circle" size={26} color={C.brand} /> : right}
  </Card>
);

const Note = ({ children }: { children: React.ReactNode }) => (
  <View style={{ backgroundColor: C.ink, borderRadius: R.lg, padding: 14, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
    <MIcon name="trophy-variant" size={22} color={C.gold} />
    <T size={13} color={C.white} style={{ flex: 1, lineHeight: 18 }}>{children}</T>
  </View>
);

export function LessonHub({ p, back, go, startTest, initial = 'learn' }: { p: Progress; back: () => void; go: (s: string) => void; startTest: () => void; initial?: HubTab }) {
  const [tab, setTab] = useState<HubTab>(initial);
  const ins = useSafeAreaInsets();
  const learn = [
    { s: 'grammar', icon: 'film', tone: TONE.grammar, t: 'Ngữ pháp', sub: `${GRAMMAR.length} điểm · ví dụ có phát âm`, n: p.grammar, of: GRAMMAR.length },
    { s: 'vocab', icon: 'layers', tone: TONE.vocab, t: 'Từ vựng', sub: `${VOCAB.length} thẻ · có phát âm`, n: p.vocab, of: VOCAB.length },
    { s: 'kanji', icon: 'pen-tool', tone: TONE.kanji, t: `Kanji · ${KANJI.length} chữ`, sub: 'Âm On/Kun · tập viết', n: p.kanji, of: KANJI.length },
    { s: 'listening', icon: 'headphones', tone: TONE.listening, t: 'Nghe & đọc hiểu', sub: `1 bài · ${LISTENING.questions.length} câu hỏi`, n: Number(p.listening), of: 1 },
  ] as const;
  const exs = [
    { s: 'ex-grammar', k: 'grammar', icon: 'film', tone: TONE.grammar, t: 'BT Ngữ pháp', sub: 'Điền từ · Tìm chỗ sai · Sắp xếp' },
    { s: 'ex-vocab', k: 'vocab', icon: 'layers', tone: TONE.vocab, t: 'BT Từ vựng', sub: 'Nối thẻ · Tranh → từ · Gõ tiếng Nhật' },
    { s: 'ex-kanji', k: 'kanji', icon: 'pen-tool', tone: TONE.kanji, t: 'BT Kanji', sub: 'Kanji → Hiragana · Viết chữ' },
  ] as const;
  const curLearn = learn.findIndex(l => l.n < l.of);
  const curEx = exs.findIndex(e => !p.exercises[e.k]);

  return (
    <Screen top={false}>
      <View style={{ backgroundColor: C.brand, paddingTop: ins.top, paddingBottom: 40 }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Pressable onPress={back} hitSlop={10}><Icon name="arrow-left" size={22} color={C.white} /></Pressable>
          <Pill label={`${Math.round(pct(p) * 100)}%`} bg="rgba(255,255,255,0.2)" color={C.white} w={600} size={12} style={{ paddingVertical: 4 }} />
        </View>
        <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
          <T size={12} w={500} color="rgba(255,255,255,0.8)">BÀI {LESSON.no}</T>
          <JP size={26} color={C.white}>{LESSON.title}</JP>
          <T size={13} color="rgba(255,255,255,0.85)">{LESSON.sub}</T>
        </View>
      </View>
      <Seg value={tab} onChange={setTab} activeBg={C.brandSoft} activeColor={C.brand}
        items={[{ k: 'learn', label: 'Học' }, { k: 'ex', label: 'Bài tập' }, { k: 'test', label: 'Kiểm tra' }]}
        style={[{ marginTop: -26, marginHorizontal: 16, borderRadius: R.lg, padding: 6 }, shadow()]} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: Math.max(24, ins.bottom + 12) }}>
        <FadeIn key={tab} dy={8} style={{ gap: 10 }}>
        {tab === 'learn' && learn.map((l, i) => <Row key={l.s} icon={l.icon} tone={l.tone} t={l.t} s={l.sub} current={i === curLearn} right={<Badge n={l.n} of={l.of} />} onPress={() => go(l.s)} />)}
        {tab === 'ex' && exs.map((e, i) => (
          <Row key={e.s} icon={e.icon} tone={e.tone} t={e.t} s={e.sub} current={i === curEx} onPress={() => go(e.s)}
            right={p.exercises[e.k] ? <Pill label="Đạt" bg={C.okSoft} color={C.ok} w={600} size={12} style={{ paddingVertical: 4, paddingHorizontal: 10 }} /> : <Icon name="chevron-right" color={C.faint} />} />
        ))}
        {tab === 'test' && (
          <Card style={{ alignItems: 'center', padding: 22, borderRadius: R.xl }}>
            <Tile icon="unlock" bg={C.okSoft} fg={C.ok} size={56} />
            <T size={18} w={600} style={{ marginTop: 12 }}>Kiểm tra Bài {LESSON.no}</T>
            <T size={13} color={C.mute} center style={{ marginTop: 4 }}>{CAT_NAME.grammar} · {CAT_NAME.vocab} · {CAT_NAME.kanji} · 10 phút</T>
            {!!p.best && <Pill label={`Điểm cao nhất: ${p.best}`} bg={p.best >= 80 ? C.okSoft : C.goldSoft} color={p.best >= 80 ? C.ok : C.goldDark} w={600} size={12} style={{ marginTop: 10 }} />}
            <Btn label="Bắt đầu kiểm tra" onPress={startTest} style={{ marginTop: 16, alignSelf: 'stretch' }} />
          </Card>
        )}
        </FadeIn>
        <Note>Đạt ≥ 80 điểm để sang Bài {LESSON.no + 1}.</Note>
      </ScrollView>
    </Screen>
  );
}

// ——— Grammar ———

export function Grammar({ guide, back, seen }: { guide: MascotId; back: () => void; seen: (n: number) => void }) {
  const [i, setI] = useState(0);
  const g = GRAMMAR[i];
  const scroll = useRef<ScrollView>(null);
  useEffect(() => { seen(i + 1); scroll.current?.scrollTo({ y: 0, animated: true }); }, [i]);
  useEffect(() => () => { stopSpeak(); }, []);
  return (
    <Screen>
      <Header onClose={back} icon="arrow-left" title="Ngữ pháp" right={<T size={13} w={600} color={C.mute}>{i + 1}/{GRAMMAR.length}</T>} />
      <ScrollView ref={scroll} contentContainerStyle={{ paddingBottom: 16 }}>
        <Pressable onPress={() => speak(g.examples.map(e => e[0]).join(' '), 0.85)} style={{ marginTop: 6, marginHorizontal: 16, height: 180, borderRadius: 24, backgroundColor: C.brandSoft, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <JP size={150} lh={1.1} color={C.brand} style={{ position: 'absolute', right: 8, top: -6, opacity: 0.1 }}>{g.tab[0]}</JP>
          <View style={[{ width: 58, height: 58, borderRadius: 29, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center' }, shadow(8, 20, 0.2)]}><Icon name="play" size={24} color={C.brand} /></View>
          <Label color={C.mute} style={{ position: 'absolute', left: 14, top: 12 }}>NGHE VÍ DỤ</Label>
          <View style={{ position: 'absolute', right: 12, bottom: 12, backgroundColor: 'rgba(40,30,20,0.7)', borderRadius: 8, paddingVertical: 3, paddingHorizontal: 8 }}><T size={11} w={500} color={C.white}>{g.examples.length} câu</T></View>
        </Pressable>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 6 }} style={{ marginTop: 16, flexGrow: 0 }}>
          {GRAMMAR.map((x, n) => <Pill key={x.id} label={`${x.id} ${x.tab}`} size={12} bg={n === i ? C.brand : C.white} color={n === i ? C.white : C.mute} onPress={() => setI(n)} />)}
        </ScrollView>
        <FadeIn key={i}>
        <Card style={{ marginTop: 14, marginHorizontal: 16, borderRadius: 22, padding: 16 }}>
          <JP size={20}>{g.pattern}</JP>
          <T size={13} color={C.mute} style={{ marginTop: 4, lineHeight: 21 }}>{g.meaning}</T>
          <View style={{ marginTop: 12, gap: 8 }}>
            {g.examples.map(([jp, vi]) => (
              <Pressable key={jp} onPress={() => speak(jp)} style={({ pressed }) => [{ backgroundColor: C.bg, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 12, flexDirection: 'row', gap: 10, alignItems: 'center' }, pressed && { opacity: 0.7 }]}>
                <Icon name="volume-2" size={18} color={C.brand} />
                <View style={{ flex: 1 }}><JP size={15} w={500}>{jp}</JP><T size={12} color={C.mute}>{vi}</T></View>
              </Pressable>
            ))}
          </View>
        </Card>
        <View style={{ marginTop: 12, marginHorizontal: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
          <Mascot id={guide} size={60} mood="wave" tap />
          <Bubble bg={C.goldSoft} style={{ flex: 1 }}>
            <Label color={C.goldInk}>{MASCOTS[guide].name.toUpperCase()} MẸO</Label>
            <T size={13} color={C.goldInk}>{g.tip}</T>
          </Bubble>
        </View>
        </FadeIn>
      </ScrollView>
      <Footer>
        {i > 0 && <Btn kind="ghost" label="Trước" onPress={() => setI(i - 1)} style={{ flex: 1 }} />}
        <Btn label={i + 1 < GRAMMAR.length ? 'Điểm tiếp theo' : 'Hoàn thành'} onPress={() => (i + 1 < GRAMMAR.length ? setI(i + 1) : back())} style={{ flex: 2 }} />
      </Footer>
    </Screen>
  );
}

// ——— Vocab flashcards ———

/** Deals in from the deck on mount and flips in 3D when tapped */
function FlashCard({ w, fav, onFav }: { w: (typeof VOCAB)[number]; fav: boolean; onFav: () => void }) {
  const [flip, setFlip] = useState(false);
  const [face, turn] = useFlip(flip);
  const [enter] = useState(() => new Animated.Value(0));
  useEffect(() => { Animated.spring(enter, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 6 }).start(); }, []);
  const deal = [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [28, 0] }) }, { scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) }];
  return (
    <Animated.View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 24, opacity: enter, transform: [...deal, ...turn] }}>
      <Pressable onPress={() => { setFlip(!flip); if (!flip) speak(w.kana); }} style={[{ flex: 1, backgroundColor: C.white, borderRadius: 28, padding: 22 }, shadow(12, 30, 0.1)]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Pill label={w.pos} bg={C.goldSoft} color={C.goldDark} size={12} style={{ paddingVertical: 4, paddingHorizontal: 10 }} />
          <Pressable hitSlop={10} onPress={onFav}><MIcon name={fav ? 'star' : 'star-outline'} size={22} color={C.gold} /></Pressable>
        </View>
        <View style={{ height: 130, borderRadius: 18, backgroundColor: C.brandSoft, marginTop: 14, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 72 }}>{w.emoji}</Text></View>
        {face ? (
          <View style={{ marginTop: 16, alignItems: 'center' }}>
            <JP size={38} lh={1.3} center>{w.kana}</JP>
            {!!w.kanji && <JP size={15} w={500} color={C.mute}>{w.kanji}</JP>}
            <T size={20} w={600} color={C.brand} center style={{ marginTop: 8 }}>{w.vi}</T>
          </View>
        ) : (
          <View style={{ marginTop: 28, alignItems: 'center', gap: 8 }}>
            <Icon name="refresh-cw" size={20} color={C.faint} />
            <T size={14} color={C.faint}>Chạm để lật thẻ</T>
          </View>
        )}
        <View style={{ flex: 1 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10 }}>
          <Pill label="Phát âm" bg={C.brand} color={C.white} icon={<Icon name="volume-2" size={16} color={C.white} />} onPress={() => speak(w.kana)} style={{ paddingVertical: 10, paddingHorizontal: 16 }} />
          <Pill label="Chậm" bg={C.bg} icon={<MIcon name="snail" size={16} />} onPress={() => speak(w.kana, 0.4)} style={{ paddingVertical: 10, paddingHorizontal: 16 }} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function Vocab({ back, seen }: { back: () => void; seen: (n: number) => void }) {
  const [i, setI] = useState(0);
  const [fav, setFav] = useState<Record<number, boolean>>({});
  const rate = () => {
    seen(i + 1);
    if (i + 1 >= VOCAB.length) return back();
    setI(i + 1);
  };
  const RATE = [['Quên', C.brandSoft2, C.brandDark], ['Hơi nhớ', C.goldSoft, C.goldDark], ['Nhớ rồi', C.okSoft, C.ok]] as const;
  return (
    <Screen>
      <Header onClose={back} title={`${i + 1} / ${VOCAB.length}`} right={i > 0 ? <Pressable hitSlop={8} onPress={() => setI(i - 1)} style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center' }}><Icon name="rotate-ccw" size={18} /></Pressable> : undefined} />
      <View style={{ flex: 1, marginTop: 14, marginHorizontal: 20 }}>
        <View style={{ position: 'absolute', left: 20, right: 20, top: 24, bottom: 4, backgroundColor: C.line2, borderRadius: 28 }} />
        <View style={{ position: 'absolute', left: 10, right: 10, top: 12, bottom: 14, backgroundColor: C.brandSoft, borderRadius: 28 }} />
        <FlashCard key={i} w={VOCAB[i]} fav={!!fav[i]} onFav={() => setFav({ ...fav, [i]: !fav[i] })} />
      </View>
      <Footer style={{ paddingHorizontal: 20, paddingTop: 6, gap: 8 }}>
        {RATE.map(([l, bg, fg]) => (
          <Tap key={l} onPress={rate} style={{ flex: 1, backgroundColor: bg, borderRadius: 16, paddingVertical: 14, alignItems: 'center' }}><T size={13} w={600} color={fg}>{l}</T></Tap>
        ))}
      </Footer>
    </Screen>
  );
}

// ——— Kanji ———

const STEPS = [['mẫu', 1], ['tô đậm', 0.35], ['tô mờ', 0.12], ['tự viết', 0]] as const;
export function Kanji({ back, seen, written, write }: { back: () => void; seen: (n: number) => void; written: Record<string, number>; write: (i: number, stage: number) => void }) {
  const [i, setI] = useState(0);
  const k = KANJI[i];
  useEffect(() => seen(i + 1), [i]);
  const read = k.kun.split('・')[0];
  const w = written[k.ch] ?? 0;
  return (
    <Screen>
      <Header onClose={back} title={`Kanji · ${i + 1}/${KANJI.length}`} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}>
        <FadeIn key={i}>
        <Card style={{ marginTop: 12, borderRadius: 28, padding: 18, flexDirection: 'row', gap: 14, alignItems: 'center' }}>
          <Pressable onPress={() => speak(read)} style={{ width: 130, height: 130, borderRadius: 20, backgroundColor: C.okSoft, alignItems: 'center', justifyContent: 'center' }}><JP size={92} lh={1.15}>{k.ch}</JP></Pressable>
          <View style={{ flex: 1 }}>
            <T size={22} w={700}>{k.han}</T>
            <T size={13} color={C.mute}>{k.d.length} nét · N5</T>
            {[['ON', k.on, C.brandSoft, C.brand], ['KUN', k.kun, C.goldSoft, C.goldDark]].map(([l, v, bg, fg]) => (
              <Pressable key={l} onPress={() => speak(v.split('・')[0])} style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ backgroundColor: bg, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1 }}><T size={11} w={500} color={fg}>{l}</T></View>
                <JP size={14} w={500} style={{ flex: 1 }}>{v}</JP>
              </Pressable>
            ))}
          </View>
        </Card>
        <Card style={{ marginTop: 12, borderRadius: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <T size={14} w={600}>Tập viết · {k.d.length} nét</T>
            <Pill label={w >= WRITE_STAGES ? 'Luyện lại' : w ? 'Viết tiếp' : 'Luyện viết'} bg={C.ok} color={C.white} size={12} icon={<Icon name="edit-3" size={12} color={C.white} />}
              onPress={() => write(i, w >= WRITE_STAGES ? 0 : w)} style={{ paddingVertical: 6 }} />
          </View>
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
            {STEPS.map(([l, o], s) => {
              const cur = s === w;
              return (
                <Tap key={l} onPress={() => write(i, s)} style={{ flex: 1, aspectRatio: 1, borderRadius: 12, backgroundColor: cur ? C.okSoft : C.bg, borderWidth: 2, borderColor: cur ? C.ok : C.bg, alignItems: 'center', justifyContent: 'center' }}>
                  <JP size={40} lh={1.2} style={{ opacity: o }}>{k.ch}</JP>
                  <T size={9} color={cur || s < w ? C.ok : C.mute} style={{ position: 'absolute', left: 5, bottom: 3 }}>{l}</T>
                  {s < w && <View style={{ position: 'absolute', right: 4, top: 4 }}><Icon name="check-circle" size={13} color={C.ok} /></View>}
                </Tap>
              );
            })}
          </View>
        </Card>
        <View style={{ marginTop: 12, gap: 8 }}>
          {k.words.map(([w, r, vi]) => (
            <Card key={w} onPress={() => speak(r)} style={{ borderRadius: 16, paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text><JP size={18}>{w} </JP><JP size={13} w={500} color={C.mute}>{r}</JP></Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><T size={13} color={C.mute}>{vi}</T><Icon name="volume-2" size={16} color={C.brand} /></View>
            </Card>
          ))}
        </View>
        </FadeIn>
      </ScrollView>
      <Footer>
        <Btn kind="ghost" label="Trước" disabled={i === 0} onPress={() => setI(i - 1)} style={{ flex: 1 }} />
        <Btn kind="ok" label={i + 1 < KANJI.length ? 'Chữ tiếp' : 'Xong'} onPress={() => (i + 1 < KANJI.length ? setI(i + 1) : back())} style={{ flex: 1 }} />
      </Footer>
    </Screen>
  );
}

// ——— Listening ———

const SPEEDS = [1, 0.75, 0.5];
export function Listening({ guide: g, back, done }: { guide: MascotId; back: () => void; done: () => void }) {
  const L = LISTENING;
  const [tab, setTab] = useState<'read' | 'q'>('read');
  const [vi, setVi] = useState(false);
  const [ans, setAns] = useState<Record<number, number>>({});
  const [cur, setCur] = useState(-1);
  const [pos, setPos] = useState(0);
  const [speed, setSpeed] = useState(0);
  const token = useRef(0);
  const [react, setReact] = useState<{ m: Mood; n: number } | null>(null);
  const all = Object.keys(ans).length === L.questions.length;
  const score = L.questions.filter((q, i) => ans[i] === q.a).length;

  const stop = () => { token.current++; stopSpeak(); setCur(-1); };
  const play = (from: number) => {
    const t = ++token.current;
    setReact(null);
    const step = (i: number) => {
      if (t !== token.current) return;
      if (i >= L.passage.length) { setCur(-1); setPos(L.passage.length); return; }
      setCur(i); setPos(i);
      speak(L.passage[i], 0.85 * SPEEDS[speed], { onDone: () => step(i + 1), onError: () => { if (t === token.current) setCur(-1); } });
    };
    step(from);
  };
  useEffect(() => stop, []);
  const playing = cur >= 0;

  return (
    <Screen>
      <Header onClose={() => { stop(); back(); }} icon="arrow-left" title="Nghe & đọc hiểu" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}>
        <View style={{ marginTop: 6, backgroundColor: C.white, borderRadius: R.xl, overflow: 'hidden' }}>
          <View style={{ height: 150, backgroundColor: C.brandSoft2, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 72 }}>{L.emoji}</Text>
            <Label color={C.brandDark} style={{ position: 'absolute', left: 12, bottom: 10 }}>{L.caption.toUpperCase()}</Label>
            <Mascot id={g} size={72} mood={playing ? 'speak' : react?.m ?? 'idle'} nonce={react?.n} tap style={{ position: 'absolute', right: 10, bottom: 4 }} />
          </View>
          <View style={{ paddingVertical: 12, paddingHorizontal: 14, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <Pressable onPress={() => (playing ? stop() : play(pos >= L.passage.length ? 0 : pos))} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: C.brandDark, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={playing ? 'pause' : 'play'} size={18} color={C.white} />
            </Pressable>
            <View style={{ flex: 1 }}>
              <Bar value={(playing ? cur + 1 : pos) / L.passage.length} color={C.brandDark} track={C.brandSoft2} h={6} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                <T size={11} color={C.mute}>Câu {Math.min(L.passage.length, (playing ? cur : pos) + (playing ? 1 : 0))}</T><T size={11} color={C.mute}>{L.passage.length} câu</T>
              </View>
            </View>
            <Pressable onPress={() => setSpeed((speed + 1) % SPEEDS.length)} style={{ backgroundColor: C.bg, borderRadius: 8, paddingVertical: 4, paddingHorizontal: 8 }}><T size={12} w={600}>{SPEEDS[speed].toFixed(SPEEDS[speed] === 0.75 ? 2 : 1)}x</T></Pressable>
          </View>
        </View>
        <Seg value={tab} onChange={setTab} items={[{ k: 'read', label: 'Bài đọc' }, { k: 'q', label: `Câu hỏi (${L.questions.length})` }]} style={{ marginTop: 12 }} />
        <FadeIn key={tab} dy={8}>
        {tab === 'read' ? (
          <Card style={{ marginTop: 12, borderRadius: 22, padding: 16 }}>
            <JP size={16} w={500} lh={1.9}>
              {L.passage.map((s, i) => <Text key={i} onPress={() => play(i)} style={{ backgroundColor: i === cur ? C.goldSoft : 'transparent' }}>{s} </Text>)}
            </JP>
            {vi && <T size={13} color={C.mute} style={{ marginTop: 8, lineHeight: 20 }}>{L.vi}</T>}
            <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon name="globe" size={14} color={C.faint} />
              <T size={12} color={C.faint} style={{ flex: 1 }}>Chạm câu để nghe</T>
              <Pressable hitSlop={8} onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.create(220, 'easeInEaseOut', 'opacity')); setVi(!vi); }}><T size={12} w={600} color={C.brand}>{vi ? 'Ẩn nghĩa' : 'Hiện nghĩa'}</T></Pressable>
            </View>
          </Card>
        ) : (
          <View style={{ marginTop: 12, gap: 10 }}>
            {L.questions.map((q, qi) => (
              <Card key={qi} style={{ borderRadius: 22 }}>
                <JP size={15}>{`Q${qi + 1}. ${q.q}`}</JP>
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
                  {q.opts.map((o, oi) => {
                    const a = ans[qi];
                    const [bg, fg] = a === undefined ? [C.bg, C.ink] : oi === q.a ? [C.ok, C.white] : a === oi ? [C.brandSoft2, C.brandDark] : [C.bg, C.faint];
                    return <Pressable key={o} onPress={() => { if (a !== undefined) return; setAns({ ...ans, [qi]: oi }); setReact({ m: oi === q.a ? 'correct' : 'oops', n: qi }); }} style={{ flex: 1, backgroundColor: bg, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 4 }}><JP size={13} color={fg} center lh={1.3}>{o}</JP></Pressable>;
                  })}
                </View>
              </Card>
            ))}
            {all && <FadeIn><T size={13} w={600} color={score === L.questions.length ? C.ok : C.goldDark} center>Đúng {score}/{L.questions.length} câu</T></FadeIn>}
          </View>
        )}
        </FadeIn>
      </ScrollView>
      <Footer>
        {tab === 'read'
          ? <Btn label="Làm câu hỏi" onPress={() => setTab('q')} style={{ flex: 1 }} />
          : <Btn label="Hoàn thành" disabled={!all} onPress={() => { stop(); done(); back(); }} style={{ flex: 1 }} />}
      </Footer>
    </Screen>
  );
}

// ——— Result ———

const CAT_SHORT: Record<Cat, string> = { grammar: 'NP', vocab: 'TV', kanji: 'Kanji' };
export function ResultScreen({ r, guide: g, kind, back, retry }: { r: Result; guide: MascotId; kind: 'ex' | 'test'; back: () => void; retry: () => void }) {
  const ins = useSafeAreaInsets();
  const score = Math.round((r.correct / r.total) * 100);
  const pass = kind === 'test' ? score >= 80 : score >= 60;
  const cats = Object.entries(r.cats) as [Cat, { c: number; t: number }][];
  const [pop] = useState(() => new Animated.Value(0));
  const [count] = useState(() => new Animated.Value(0));
  const [shownScore, setShownScore] = useState(0);
  useEffect(() => {
    Animated.spring(pop, { toValue: 1, delay: 180, useNativeDriver: true, speed: 9, bounciness: 12 }).start();
    const id = count.addListener(({ value }) => setShownScore(Math.round(value)));
    Animated.timing(count, { toValue: score, duration: 900, delay: 200, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    return () => count.removeListener(id);
  }, []);
  return (
    <Screen bg={C.brand}>
      <View style={{ paddingTop: 16, paddingBottom: 22, alignItems: 'center' }}>
        <Animated.View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20,
          opacity: pop.interpolate({ inputRange: [0, 0.3], outputRange: [0, 1], extrapolate: 'clamp' }), transform: [{ scale: pop }] }}>
          <Mascot id={g} size={96} mood={pass ? 'correct' : 'oops'} tap />
          <Bubble style={{ flex: 1 }}><Say text={pass ? MASCOTS[g].lines.pass : MASCOTS[g].lines.fail} /></Bubble>
        </Animated.View>
        <Text style={{ marginTop: 12 }}><T size={44} w={700} color={C.white}>{shownScore}</T><T size={18} w={700} color="rgba(255,255,255,0.7)">/100</T></Text>
        <T size={15} w={500} color={C.white}>
          {kind === 'test' ? (pass ? `Qua Bài ${LESSON.no}` : 'Chưa qua · cần ≥ 80') : pass ? 'Tuyệt vời!' : 'Cố lên nhé!'} · {r.correct}/{r.total} câu · {mmss(r.secs)}
        </T>
        {r.correct > 0 && <FadeIn delay={700}><Pill label={`+${r.correct}`} w={600} bg="rgba(255,255,255,0.2)" color={C.white} icon={<MIcon name="star" size={15} color={C.gold} />} style={{ marginTop: 10, paddingVertical: 5 }} /></FadeIn>}
      </View>
      <View style={{ flex: 1, backgroundColor: C.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 16, paddingBottom: Math.max(20, ins.bottom + 8) }}>
        {cats.length > 1 && (
          <View style={{ flexDirection: 'row', gap: 6, marginBottom: 10 }}>
            {cats.map(([k, v]) => {
              const weak = v.c / v.t < 0.8;
              return (
                <View key={k} style={{ flex: 1, backgroundColor: weak ? C.brandSoft2 : C.white, borderRadius: 14, paddingVertical: 8, alignItems: 'center' }}>
                  <T size={11} color={weak ? C.brandDark : C.mute}>{CAT_SHORT[k]}</T>
                  <T size={15} w={600} color={weak ? C.brandDark : C.ink}>{v.c}/{v.t}</T>
                </View>
              );
            })}
          </View>
        )}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 10 }}>
          {r.wrong.length === 0 && (
            <FadeIn delay={300}><Card style={{ alignItems: 'center', padding: 20 }}><Icon name="thumbs-up" size={26} color={C.ok} /><T size={15} w={600} style={{ marginTop: 8 }}>Không sai câu nào!</T></Card></FadeIn>
          )}
          {r.wrong.map((w, i) => (
            <FadeIn key={w.n} delay={300 + Math.min(i, 8) * 60}>
            <Card style={{ borderRadius: 18, paddingVertical: 12 }}>
              <Label color={C.brandDark}>CÂU {w.n} · {w.kind}</Label>
              <JP size={15} style={{ marginTop: 2 }}>{w.a ? `${w.q} → ${w.a}` : w.q}</JP>
              {!!w.your && w.your !== w.a && <T size={12} color={C.mute}>Bạn trả lời: <Text style={{ color: C.brandDark }}>{w.your}</Text></T>}
              {!!w.why && <T size={12} color={C.mute}>{w.why}</T>}
            </Card>
            </FadeIn>
          ))}
        </ScrollView>
        <View style={{ gap: 10, marginTop: 12 }}>
          {pass ? (
            <Btn kind="dark" icon={kind === 'test' ? 'unlock' : 'check'} iconColor={C.gold} label={kind === 'test' ? 'Về trang chủ' : 'Quay lại bài học'} onPress={back} />
          ) : (
            <>
              <Btn label="Làm lại" icon="rotate-ccw" onPress={retry} />
              <Btn kind="ghost" label="Quay lại" onPress={back} />
            </>
          )}
        </View>
      </View>
    </Screen>
  );
}
