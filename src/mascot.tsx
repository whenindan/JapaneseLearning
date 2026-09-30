import React, { useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import { C, R } from './theme';
import { JP, T } from './ui';

// ——— Cast ———

export type MascotId = 'poko' | 'mame' | 'kon';
/** Same six states for every character, each performed in its own personality */
export type Mood = 'idle' | 'wave' | 'correct' | 'oops' | 'listen' | 'speak';

type Lines = { hi: string; ok: string[]; bad: string[]; pass: string; fail: string };
/** `bg`: the character's backdrop tint; `color`: its name color on light backgrounds */
export const MASCOTS: Record<MascotId, { name: string; kana: string; animal: string; role: string; jpRole: string; bg: string; color: string; desc: string; catch: [string, string]; lines: Lines }> = {
  poko: {
    name: 'Poko', kana: 'ぽこ', animal: 'Tanuki', role: 'Thầy hướng dẫn', jpRole: 'せんせい', bg: '#F1E6D6', color: '#8C6B4F',
    desc: 'Kiên nhẫn, ấm áp, hơi ngố. Biết tuốt nhưng không bao giờ khoe. Giới thiệu bài và giảng ngữ pháp.',
    catch: ['いっしょに がんばろう！', 'Cùng cố gắng nhé!'],
    lines: {
      hi: 'ようこそ！ Hôm nay mình học gì nào?',
      ok: ['Giỏi lắm!', 'Chính xác. Cứ thế nhé!', 'Tuyệt! Bạn tiến bộ nhanh đấy.'],
      bad: ['Không sao, sai là cách để học.', 'Gần đúng rồi. Xem lại giải thích nhé.', 'Từ từ thôi, mình ở đây mà.'],
      pass: 'いっしょに がんばろう！ Bạn làm tốt lắm!',
      fail: 'Mình ôn lại mấy câu sai rồi thử lại nhé.',
    },
  },
  mame: {
    name: 'Mame', kana: 'まめ', animal: 'Chó Shiba', role: 'Bạn học', jpRole: 'なかま', bg: '#F6E9D3', color: '#C08A45',
    desc: 'Học tiếng Nhật cùng bạn. Hay phấn khích, cổ vũ thật to, và cũng sai như bạn nên chẳng có gì phải ngại.',
    catch: ['やった！できた！', 'Yeah! Làm được rồi!'],
    lines: {
      hi: 'こんにちは！ Học cùng mình nha!',
      ok: ['やった！ Đúng rồi!', 'Yeah! Mình cũng chọn cái đó!', 'Đỉnh quá! Câu tiếp đi!'],
      bad: ['Ơ… mình cũng tưởng thế!', 'Hai đứa mình cùng sai rồi, hì hì.', 'Không sao! Lần sau là trúng!'],
      pass: 'やった！できた！ Tụi mình làm được rồi!',
      fail: 'Mình cũng chưa qua đâu. Làm lại nha!',
    },
  },
  kon: {
    name: 'Kon', kana: 'こん', animal: 'Cáo Kitsune', role: 'Đối thủ', jpRole: 'ライバル', bg: '#F5DCCB', color: '#C95A22',
    desc: 'Tự tin, hơi kiêu, nhưng thầm cổ vũ bạn. Luôn thách bạn làm nhanh hơn, đúng hơn.',
    catch: ['ふーん、まあまあだね。', 'Hừm, cũng tạm được.'],
    lines: {
      hi: 'よっ。 Để xem hôm nay bạn làm được gì.',
      ok: ['ふーん。 Không tệ.', 'Được đấy… lần này thôi.', 'Hừm, nhanh hơn mình tưởng.'],
      bad: ['ふふっ。 Thử lại đi.', 'Suýt nữa thì đúng. Suýt thôi.', 'Là mình thì mình xem lại giải thích.'],
      pass: 'ふーん、まあまあだね。 Lần sau mình không thua đâu.',
      fail: 'Mình chờ bạn phục thù đấy.',
    },
  },
};
export const MASCOT_IDS = Object.keys(MASCOTS) as MascotId[];
/** Stable pick from a line list, so re-renders don't change what the character says */
export const line = (xs: string[], n: number) => xs[n % xs.length];

// ——— Speech ———

/** Speech bubble; its tail points toward the speaker on `side` */
export const Bubble = ({ children, side = 'left', bg = C.white, style }: { children: React.ReactNode; side?: 'left' | 'bottom'; bg?: string; style?: StyleProp<ViewStyle> }) => (
  <View style={[{ backgroundColor: bg, borderRadius: R.lg, paddingVertical: 10, paddingHorizontal: 14 }, style]}>
    <View style={[{ position: 'absolute', width: 14, height: 14, borderRadius: 3, backgroundColor: bg, transform: [{ rotate: '45deg' }] }, side === 'left' ? { left: -5, top: 20 } : { bottom: -5, left: 26 }]} />
    {children}
  </View>
);

const JA = '[\\u3000-\\u30ff\\u4e00-\\u9fff\\uff01-\\uff5e]+';
const JP_LEAD = new RegExp(`^(${JA}(?: ${JA})*)\\s*([\\s\\S]*)$`);
/** A character line: a leading Japanese phrase is set in the Japanese font, the rest in Lexend */
export const Say = ({ text, size = 13, color = C.ink }: { text: string; size?: number; color?: string }) => {
  const m = text.match(JP_LEAD);
  return m
    ? <Text>{<JP size={size + 1} lh={1.4} color={color}>{m[1]} </JP>}{!!m[2] && <T size={size} color={color}>{m[2]}</T>}</Text>
    : <T size={size} color={color}>{text}</T>;
};

// ——— Art (viewBox 0 0 200 220, flat fills, no outlines) ———

const INK = '#1E1712', MOUTH = '#8E3A2E', SWEAT = '#8EC5E8', RING = '#2F4A7A', GOLD = '#E6A93A', RED = '#D9472B';
const ln = { fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const star = (x: number, y: number, r: number, fill: string) => {
  const q = r * 0.3;
  return <Path key={`${x},${y}`} d={`M${x} ${y - r} L${x + q} ${y - q} L${x + r} ${y} L${x + q} ${y + q} L${x} ${y + r} L${x - q} ${y + q} L${x - r} ${y} L${x - q} ${y - q} Z`} fill={fill} />;
};

type Part = 'whole' | 'shadow' | 'tail' | 'ears' | 'acc' | 'arm' | 'eyes' | 'mouth' | 'sweat' | 'waves' | 'spark';
type Art = {
  shadow: number; tail: React.ReactNode; body: React.ReactNode; arm: React.ReactNode; ears: React.ReactNode; head: React.ReactNode; eyes: React.ReactNode;
  mouthC: React.ReactNode; mouthO: React.ReactNode; acc?: React.ReactNode; accTop?: boolean; sweat?: React.ReactNode; waves: React.ReactNode; spark: React.ReactNode;
  /** Rotation/scale pivots in viewBox units, matching the design's transform-origins */
  pivot: Record<Part, [number, number]>;
};

const ART: Record<MascotId, Art> = {
  poko: {
    shadow: 54,
    tail: <><Ellipse cx={156} cy={172} rx={16} ry={28} transform="rotate(40 156 172)" fill="#7A5B42" /><Ellipse cx={170} cy={156} rx={9} ry={11} transform="rotate(40 170 156)" fill="#4A3628" /></>,
    body: <>
      <Ellipse cx={76} cy={202} rx={17} ry={8} fill="#5B4433" /><Ellipse cx={124} cy={202} rx={17} ry={8} fill="#5B4433" />
      <Ellipse cx={100} cy={152} rx={56} ry={52} fill="#8C6B4F" /><Ellipse cx={100} cy={162} rx={34} ry={32} fill="#F3E3C8" />
      <Ellipse cx={50} cy={150} rx={10} ry={17} transform="rotate(20 50 150)" fill="#7A5B42" />
    </>,
    arm: <Ellipse cx={150} cy={150} rx={10} ry={17} transform="rotate(-20 150 150)" fill="#7A5B42" />,
    ears: <><Circle cx={62} cy={56} r={16} fill="#5B4433" /><Circle cx={62} cy={58} r={8} fill="#C9A27E" /><Circle cx={138} cy={56} r={16} fill="#5B4433" /><Circle cx={138} cy={58} r={8} fill="#C9A27E" /></>,
    head: <>
      <Ellipse cx={100} cy={96} rx={56} ry={48} fill="#8C6B4F" /><Ellipse cx={100} cy={74} rx={22} ry={13} fill="#A6856A" />
      <Ellipse cx={78} cy={98} rx={21} ry={15} transform="rotate(-15 78 98)" fill="#4A3628" /><Ellipse cx={122} cy={98} rx={21} ry={15} transform="rotate(15 122 98)" fill="#4A3628" />
      <Ellipse cx={100} cy={116} rx={18} ry={12} fill="#F3E3C8" /><Ellipse cx={100} cy={110} rx={6.5} ry={4.5} fill={INK} />
      <Circle cx={63} cy={116} r={7} fill="#E89A8C" opacity={0.6} /><Circle cx={137} cy={116} r={7} fill="#E89A8C" opacity={0.6} />
    </>,
    eyes: <>
      <Circle cx={80} cy={97} r={8} fill="#FBF6EC" /><Circle cx={80} cy={97} r={5.5} fill={INK} /><Circle cx={82} cy={95} r={2} fill="#fff" />
      <Circle cx={120} cy={97} r={8} fill="#FBF6EC" /><Circle cx={120} cy={97} r={5.5} fill={INK} /><Circle cx={122} cy={95} r={2} fill="#fff" />
    </>,
    mouthC: <Path d="M93 119 Q100 125 107 119" stroke={INK} strokeWidth={2.5} {...ln} />,
    mouthO: <Ellipse cx={100} cy={121} rx={5} ry={5} fill={MOUTH} />,
    acc: <><Path d="M100 52 C 84 42, 86 22, 106 16 C 114 30, 112 46, 100 52 Z" fill="#6B9A5B" /><Path d="M100 52 C 102 40, 104 30, 106 20" stroke="#4E7A42" strokeWidth={2.5} {...ln} /></>,
    accTop: true,
    sweat: <Path d="M154 60 C 154 60, 146 72, 146 77 C 146 82, 150 85, 154 85 C 158 85, 162 82, 162 77 C 162 72, 154 60, 154 60 Z" fill={SWEAT} />,
    waves: <><Path d="M30 80 Q20 96 30 112" stroke={RING} strokeWidth={3.5} {...ln} /><Path d="M17 70 Q2 96 17 122" stroke={RING} strokeWidth={3.5} {...ln} /></>,
    spark: <>{star(26, 63, 13, GOLD)}{star(172, 43, 9, RED)}{star(182, 104, 8, GOLD)}</>,
    pivot: { whole: [100, 210], shadow: [100, 211], tail: [136, 194], ears: [100, 72], acc: [100, 52], arm: [150, 134], eyes: [100, 97], mouth: [100, 117], sweat: [154, 72], waves: [30, 96], spark: [100, 80] },
  },
  mame: {
    shadow: 48,
    tail: <Path d="M142 168 C 176 170, 180 128, 158 124 C 144 122, 142 140, 156 140" stroke="#E3B77A" strokeWidth={13} {...ln} />,
    body: <>
      <Ellipse cx={78} cy={202} rx={15} ry={8} fill="#E3B77A" /><Ellipse cx={122} cy={202} rx={15} ry={8} fill="#E3B77A" />
      <Ellipse cx={100} cy={154} rx={50} ry={48} fill="#F0C98A" /><Ellipse cx={100} cy={164} rx={30} ry={30} fill="#FFF8EC" />
      <Ellipse cx={55} cy={152} rx={9} ry={15} transform="rotate(20 55 152)" fill="#E3B77A" />
      <Path d="M64 128 Q100 140 136 128 L100 160 Z" fill={RED} />
    </>,
    arm: <Ellipse cx={145} cy={152} rx={9} ry={15} transform="rotate(-20 145 152)" fill="#E3B77A" />,
    ears: <>
      <Path d="M58 78 L62 34 L94 62 Z" fill="#F0C98A" stroke="#F0C98A" strokeWidth={8} strokeLinejoin="round" /><Path d="M65 66 L67 46 L84 61 Z" fill="#D99A5B" />
      <Path d="M142 78 L138 34 L106 62 Z" fill="#F0C98A" stroke="#F0C98A" strokeWidth={8} strokeLinejoin="round" /><Path d="M135 66 L133 46 L116 61 Z" fill="#D99A5B" />
    </>,
    head: <>
      <Ellipse cx={100} cy={96} rx={54} ry={44} fill="#F0C98A" />
      <Ellipse cx={78} cy={112} rx={24} ry={17} fill="#FFF8EC" /><Ellipse cx={122} cy={112} rx={24} ry={17} fill="#FFF8EC" /><Ellipse cx={100} cy={122} rx={22} ry={12} fill="#FFF8EC" />
      <Circle cx={82} cy={80} r={4} fill="#FFF8EC" /><Circle cx={118} cy={80} r={4} fill="#FFF8EC" />
      <Ellipse cx={100} cy={110} rx={6} ry={4.5} fill={INK} />
      <Circle cx={63} cy={116} r={6.5} fill="#F2A08C" opacity={0.7} /><Circle cx={137} cy={116} r={6.5} fill="#F2A08C" opacity={0.7} />
    </>,
    eyes: <><Circle cx={82} cy={98} r={7} fill={INK} /><Circle cx={84.5} cy={95.5} r={2.5} fill="#fff" /><Circle cx={118} cy={98} r={7} fill={INK} /><Circle cx={120.5} cy={95.5} r={2.5} fill="#fff" /></>,
    mouthC: <Path d="M91 116 Q95.5 122 100 116 Q104.5 122 109 116" stroke={INK} strokeWidth={2.5} {...ln} />,
    mouthO: <Ellipse cx={100} cy={120} rx={6} ry={6} fill={MOUTH} />,
    sweat: <Path d="M156 62 C 156 62, 148 74, 148 79 C 148 84, 152 87, 156 87 C 160 87, 164 84, 164 79 C 164 74, 156 62, 156 62 Z" fill={SWEAT} />,
    waves: <><Path d="M32 82 Q22 98 32 114" stroke={RING} strokeWidth={3.5} {...ln} /><Path d="M19 72 Q4 98 19 124" stroke={RING} strokeWidth={3.5} {...ln} /></>,
    spark: <>{star(24, 67, 13, GOLD)}{star(174, 39, 9, RED)}{star(186, 100, 8, GOLD)}</>,
    pivot: { whole: [100, 210], shadow: [100, 211], tail: [142, 170], ears: [100, 78], acc: [100, 52], arm: [145, 138], eyes: [100, 98], mouth: [100, 116], sweat: [156, 74], waves: [32, 98], spark: [100, 80] },
  },
  kon: {
    shadow: 46,
    tail: <><Path d="M134 178 C 178 186, 198 140, 176 102 C 168 134, 154 150, 130 156 Z" fill="#FFF4E6" /><Path d="M134 178 C 176 184, 192 150, 185 125 C 172 142, 154 150, 130 156 Z" fill="#E46F2E" /></>,
    body: <>
      <Ellipse cx={80} cy={202} rx={14} ry={8} fill="#3A2A24" /><Ellipse cx={120} cy={202} rx={14} ry={8} fill="#3A2A24" />
      <Ellipse cx={100} cy={156} rx={46} ry={46} fill="#E46F2E" /><Ellipse cx={100} cy={166} rx={26} ry={28} fill="#FFF4E6" />
      <Ellipse cx={59} cy={154} rx={9} ry={15} transform="rotate(20 59 154)" fill="#3A2A24" />
    </>,
    arm: <Ellipse cx={141} cy={154} rx={9} ry={15} transform="rotate(-20 141 154)" fill="#3A2A24" />,
    acc: <><Path d="M52 80 C 38 80, 30 88, 24 100" stroke="#FFF4E6" strokeWidth={6} {...ln} /><Path d="M52 80 C 40 86, 36 96, 36 108" stroke="#FFF4E6" strokeWidth={6} {...ln} /></>,
    ears: <>
      <Path d="M60 74 L60 22 L96 56 Z" fill="#E46F2E" stroke="#E46F2E" strokeWidth={8} strokeLinejoin="round" /><Path d="M66 62 L66 36 L85 56 Z" fill="#3A2A24" />
      <Path d="M140 74 L140 22 L104 56 Z" fill="#E46F2E" stroke="#E46F2E" strokeWidth={8} strokeLinejoin="round" /><Path d="M134 62 L134 36 L115 56 Z" fill="#3A2A24" />
    </>,
    head: <>
      <Path d="M46 88 C 46 62, 70 50, 100 50 C 130 50, 154 62, 154 88 C 154 110, 134 124, 100 132 C 66 124, 46 110, 46 88 Z" fill="#E46F2E" />
      <Path d="M60 100 C 76 96, 92 102, 100 114 C 108 102, 124 96, 140 100 C 134 116, 118 128, 100 132 C 82 128, 66 116, 60 100 Z" fill="#FFF4E6" />
      <Path d="M52 72 Q100 58 148 72 L150 81 Q100 67 50 81 Z" fill="#FFF4E6" /><Circle cx={100} cy={68} r={5.5} fill={RED} />
      <Path d="M70 84 L88 89" stroke="#3A2A24" strokeWidth={3.5} {...ln} /><Path d="M130 84 L112 89" stroke="#3A2A24" strokeWidth={3.5} {...ln} />
      <Ellipse cx={100} cy={114} rx={5.5} ry={4} fill={INK} />
    </>,
    eyes: <>
      <Ellipse cx={80} cy={98} rx={6.5} ry={7} fill={INK} /><Ellipse cx={120} cy={98} rx={6.5} ry={7} fill={INK} />
      <Path d="M72 90 L89 90 L89 96 L72 96 Z" fill="#E46F2E" /><Path d="M111 90 L128 90 L128 96 L111 96 Z" fill="#E46F2E" />
      <Circle cx={82.5} cy={100} r={2} fill="#fff" /><Circle cx={122.5} cy={100} r={2} fill="#fff" />
    </>,
    mouthC: <Path d="M95 121 Q103 125 110 117" stroke={INK} strokeWidth={2.5} {...ln} />,
    mouthO: <Ellipse cx={101} cy={123} rx={5} ry={5} fill={MOUTH} />,
    waves: <><Path d="M30 84 Q20 100 30 116" stroke={RING} strokeWidth={3.5} {...ln} /><Path d="M17 74 Q2 100 17 126" stroke={RING} strokeWidth={3.5} {...ln} /></>,
    spark: <>{star(22, 63, 13, GOLD)}{star(176, 39, 9, RED)}</>,
    pivot: { whole: [100, 210], shadow: [100, 211], tail: [130, 186], ears: [100, 74], acc: [52, 80], arm: [141, 140], eyes: [100, 97], mouth: [101, 119], sweat: [150, 72], waves: [30, 100], spark: [100, 80] },
  },
};

// ——— Motion ———

/** One looping keyframe track. Values are in viewBox units/degrees; `at` are keyframe offsets 0–1 like CSS percentages. */
type K = { d: number; at: number[]; x?: number[]; y?: number[]; r?: number[]; s?: number[]; sx?: number[]; sy?: number[]; o?: number[]; pivot?: [number, number] };
type Moves = Partial<Record<Part, K>>;
const H = [0, 0.5, 1];
const k = (d: number, at: number[], p: Omit<K, 'd' | 'at'>): K => ({ d, at, ...p });

const bob = (d: number) => k(d, H, { y: [0, -5, 0], sx: [1, 0.98, 1], sy: [1, 1.02, 1] });
const shBob = (d: number) => k(d, H, { s: [1, 0.9, 1] });
const shHop = (d: number) => k(d, [0, 0.4, 0.55, 1], { s: [1, 0.55, 0.55, 1] });
const wag = (d: number) => k(d, H, { r: [-6, 8, -6] });
const armWave = (d: number) => k(d, H, { r: [-125, -160, -125] });
const sway = k(3200, H, { r: [-2, 2, -2] });
const flutter = k(1400, H, { r: [-6, 8, -6] });
const leafSway = (d: number) => k(d, H, { r: [-5, 7, -5] });
const twinkle = k(900, [0, 0.4, 0.7, 1], { o: [0, 1, 1, 0], s: [0.4, 1.1, 1, 0.4] });
const drip = k(1400, [0, 0.2, 0.8, 1], { o: [0, 1, 1, 0], y: [-4, -0.5, 10, 14] });
const lean = k(1600, H, { r: [-4, -6, -4], y: [0, -2, 0] });
const perk = (d: number) => k(d, H, { sy: [1, 1.14, 1] });
const rings = k(1200, [0, 0.4, 1], { o: [0, 1, 0], s: [0.7, 0.88, 1.15] });
const talk = k(320, H, { sx: [0.8, 1, 0.8], sy: [0.2, 1, 0.2] });
const chatter = (dy: number) => k(640, H, { y: [0, -dy, 0] });

const MOVES: Record<MascotId, Record<Mood, Moves>> = {
  poko: {
    idle: { whole: bob(2600), shadow: shBob(2600), tail: wag(1900), acc: leafSway(2600) },
    wave: { whole: k(2400, H, { r: [0, -4, 0], y: [0, 2, 0] }), arm: armWave(600), tail: wag(800), acc: leafSway(1200) },
    correct: { whole: k(1000, [0, 0.2, 0.45, 0.7, 0.85, 1], { y: [0, 4, -16, 0, 0, 0], sx: [1, 1.05, 0.97, 1.03, 1, 1], sy: [1, 0.95, 1.03, 0.97, 1, 1] }), tail: wag(350), acc: k(250, H, { r: [-18, 18, -18] }), spark: twinkle },
    oops: { whole: k(2000, H, { r: [0, -6, 0] }), acc: k(2000, H, { r: [-28, -34, -28] }), sweat: drip },
    listen: { whole: lean, ears: perk(800), waves: rings, tail: wag(2400) },
    speak: { whole: chatter(1), mouth: talk, tail: wag(1200) },
  },
  mame: {
    idle: { whole: bob(1700), shadow: shBob(1700), tail: wag(900) },
    wave: { whole: bob(560), arm: armWave(280), tail: wag(300) },
    correct: { whole: k(800, [0, 0.25, 0.5, 0.75, 1], { y: [0, -40, -44, 0, 0], sx: [1.08, 0.94, 1, 1.1, 1], sy: [0.92, 1.06, 1, 0.9, 1] }), shadow: shHop(800), tail: wag(350), spark: twinkle },
    oops: { whole: k(1600, [0, 0.2, 0.3, 0.4, 0.5, 0.6, 1], { x: [0, 0, -4, 4, -3, 0, 0], y: [0, 6, 6, 6, 6, 6, 0], sx: [1, 1.06, 1.06, 1.06, 1.06, 1.06, 1], sy: [1, 0.93, 0.93, 0.93, 0.93, 0.93, 1] }), tail: k(1000, [0, 1], { r: [-30, -30] }), sweat: drip },
    listen: { whole: lean, ears: perk(500), waves: rings, tail: wag(2400) },
    speak: { whole: chatter(3), mouth: talk, tail: wag(1200) },
  },
  kon: {
    idle: { whole: sway, tail: wag(3200), acc: flutter },
    wave: { whole: sway, arm: k(1800, [0, 0.2, 0.4, 0.6, 1], { r: [-135, -160, -135, -135, -135] }), tail: wag(800), acc: flutter },
    correct: { whole: k(1100, [0, 0.15, 0.5, 0.85, 1], { y: [0, 4, -38, 0, 0], r: [0, 0, 180, 360, 360], sx: [1, 1.06, 1, 1, 1], sy: [1, 0.94, 1, 1, 1], pivot: [105, 135] }), shadow: shHop(1100), tail: wag(350), acc: flutter, spark: twinkle },
    oops: { whole: k(500, [0, 0.25, 0.5, 0.75, 1], { y: [0, -4, 0, -4, 0], r: [0, -2, 0, 2, 0] }), acc: flutter },
    listen: { whole: lean, ears: perk(800), waves: rings, tail: wag(2400), acc: flutter },
    speak: { whole: chatter(1), mouth: talk, tail: wag(1200), acc: flutter },
  },
};
/** Reduced motion: hops, flips and wobbles become one gentle scale pulse */
const PULSE: Moves = { whole: k(1600, H, { s: [1, 1.04, 1] }) };
/** How long one-shot moods play before settling back (ms); other moods loop */
const ONCE: Partial<Record<Mood, Record<MascotId, number>>> = {
  wave: { poko: 2400, mame: 2240, kon: 3600 },
  correct: { poko: 2000, mame: 1600, kon: 2200 },
  oops: { poko: 2000, mame: 1600, kon: 1500 },
};

const SINE = Easing.inOut(Easing.sin);
/** The native driver ignores `easing` on interpolations, so sine-ease each keyframe segment by sampling it */
function dense(at: number[], vals: number[], steps = 6) {
  const i: number[] = [], o: number[] = [];
  for (let n = 0; n < at.length - 1; n++)
    for (let j = 0; j < steps; j++) { const u = j / steps; i.push(at[n] + (at[n + 1] - at[n]) * u); o.push(vals[n] + (vals[n + 1] - vals[n]) * SINE(u)); }
  i.push(at[at.length - 1]); o.push(vals[vals.length - 1]);
  return [i, o] as const;
}

function useReducedMotion() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setOn).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setOn);
    return () => sub.remove();
  }, []);
  return on;
}

/** Loops a keyframe track on the native driver and returns its animated style */
function useTrack(kf: K | undefined, s: number, opacity = 1) {
  const [t] = useState(() => new Animated.Value(0));
  useEffect(() => {
    t.setValue(0);
    if (!kf) return;
    const a = Animated.loop(Animated.timing(t, { toValue: 1, duration: kf.d, easing: Easing.linear, useNativeDriver: true }));
    a.start();
    return () => a.stop();
  }, [kf]);
  return useMemo(() => {
    if (!kf) return { opacity };
    const f = (v: number[], m = 1) => { const [i, o] = dense(kf.at, v.map(x => x * m)); return t.interpolate({ inputRange: i, outputRange: o }); };
    const tr: any[] = []; // mixed Animated transform entries
    if (kf.x) tr.push({ translateX: f(kf.x, s) });
    if (kf.y) tr.push({ translateY: f(kf.y, s) });
    if (kf.r) { const [i, o] = dense(kf.at, kf.r); tr.push({ rotate: t.interpolate({ inputRange: i, outputRange: o.map(x => `${x}deg`) }) }); }
    if (kf.s) tr.push({ scale: f(kf.s) });
    if (kf.sx) tr.push({ scaleX: f(kf.sx) });
    if (kf.sy) tr.push({ scaleY: f(kf.sy) });
    return { transform: tr, opacity: kf.o ? f(kf.o) : opacity };
  }, [kf, s, opacity]);
}

/** A group that moves around `pivot` (viewBox units). Leaf groups hold one full-size SVG of their art. */
function Layer({ k: kf, pivot, s, children, svg = true }: { k?: K; pivot: [number, number]; s: number; children: React.ReactNode; svg?: boolean }) {
  const style = useTrack(kf, s);
  const [px, py] = kf?.pivot ?? pivot;
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { transformOrigin: [px * s, py * s, 0] }, style]}>
      {svg ? <Svg width={200 * s} height={220 * s} viewBox="0 0 200 220">{children}</Svg> : children}
    </Animated.View>
  );
}

/**
 * Animated guide character. One-shot moods (`wave`, `correct`, `oops`) play once and settle to idle;
 * change `nonce` to replay the same mood. `tap` makes it wave when pressed. `still` keeps only the blink.
 */
export function Mascot({ id, mood = 'idle', size = 96, nonce, tap, still, style }: { id: MascotId; mood?: Mood; size?: number; nonce?: number | string; tap?: boolean; still?: boolean; style?: StyleProp<ViewStyle> }) {
  const a = ART[id], s = size / 200, h = size * 1.1;
  const reduce = useReducedMotion();
  const rest: Mood = ONCE[mood] ? 'idle' : mood;
  // A tap waves until the props change; `run` identifies the current performance so its settle timer can't leak into the next one
  const key = `${mood}|${nonce ?? ''}|${id}`;
  const [tapRun, setTap] = useState<{ key: string; n: number } | null>(null);
  const tapped = tapRun?.key === key;
  const cur: Mood = tapped ? 'wave' : mood;
  const run = `${key}|${tapped ? tapRun.n : 0}`;
  const [settled, setSettled] = useState('');
  useEffect(() => {
    const ms = ONCE[cur]?.[id];
    if (!ms) return;
    const t = setTimeout(() => setSettled(run), ms);
    return () => clearTimeout(t);
  }, [run]);
  const m: Mood = ONCE[cur] && settled === run ? rest : cur;

  // Blink on a random 3–6s timer so characters on screen never blink together
  const [blink] = useState(() => new Animated.Value(0));
  useEffect(() => {
    let alive = true, id: ReturnType<typeof setTimeout>;
    const next = () => { if (alive) id = setTimeout(() => Animated.sequence([
      Animated.timing(blink, { toValue: 1, duration: 70, useNativeDriver: true }),
      Animated.timing(blink, { toValue: 0, duration: 110, useNativeDriver: true }),
    ]).start(next), 3000 + Math.random() * 3000); };
    next();
    return () => { alive = false; clearTimeout(id); };
  }, []);

  const mv: Moves = still ? {} : reduce ? (m === 'idle' ? {} : PULSE) : MOVES[id][m];
  const p = a.pivot;
  const L = (part: Part, art: React.ReactNode) => <Layer k={mv[part]} pivot={p[part]} s={s}>{art}</Layer>;
  const acc = a.acc && L('acc', a.acc);
  const talking = m === 'speak';
  const body = (
    <View style={{ width: size, height: h }}>
      {L('shadow', <Ellipse cx={100} cy={211} rx={a.shadow} ry={7} fill={C.ink} opacity={0.12} />)}
      <Layer k={mv.whole} pivot={p.whole} s={s} svg={false}>
        {L('tail', a.tail)}
        <Layer pivot={p.whole} s={s}>{a.body}</Layer>
        {L('arm', a.arm)}
        {!a.accTop && acc}
        {L('ears', a.ears)}
        <Layer pivot={p.whole} s={s}>{a.head}</Layer>
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { transformOrigin: [p.eyes[0] * s, p.eyes[1] * s, 0], transform: [{ scaleY: blink.interpolate({ inputRange: [0, 1], outputRange: [1, 0.1] }) }] }]}>
          <Svg width={size} height={h} viewBox="0 0 200 220">{a.eyes}</Svg>
        </Animated.View>
        {talking ? L('mouth', a.mouthO) : <Layer pivot={p.mouth} s={s}>{a.mouthC}</Layer>}
        {a.accTop && acc}
        {mv.sweat && a.sweat && L('sweat', a.sweat)}
        {mv.waves && L('waves', a.waves)}
      </Layer>
      {mv.spark && L('spark', a.spark)}
    </View>
  );
  return tap
    ? <Pressable onPress={() => setTap(t => ({ key, n: (t?.key === key ? t.n : 0) + 1 }))} accessibilityRole="button" accessibilityLabel={MASCOTS[id].name} style={style}>{body}</Pressable>
    : <View style={style} accessibilityLabel={MASCOTS[id].name}>{body}</View>;
}
