import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, PressableProps, StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { C, F, J, R, shadow } from './theme';

export const speak = (text: string, rate = 0.9, opts: Speech.SpeechOptions = {}) => {
  Speech.stop();
  Speech.speak(text, { language: 'ja-JP', rate, ...opts });
};
export const stopSpeak = () => Speech.stop();

type FeatherName = keyof typeof Feather.glyphMap;
export const Icon = ({ name, size = 20, color = C.ink }: { name: FeatherName; size?: number; color?: string }) => <Feather name={name} size={size} color={color} />;
export const MIcon = ({ name, size = 20, color = C.ink }: { name: keyof typeof MaterialCommunityIcons.glyphMap; size?: number; color?: string }) => <MaterialCommunityIcons name={name} size={size} color={color} />;

type TP = { children?: React.ReactNode; size?: number; color?: string; style?: StyleProp<TextStyle>; numberOfLines?: number; center?: boolean };
/** Lexend text */
export const T = ({ children, size = 14, w = 400, color = C.ink, style, numberOfLines, center }: TP & { w?: keyof typeof F }) => (
  <Text numberOfLines={numberOfLines} style={[{ fontFamily: F[w], fontSize: size, color, lineHeight: Math.round(size * 1.4) }, center && { textAlign: 'center' }, style]}>{children}</Text>
);
/** Japanese text (Zen Maru Gothic) */
export const JP = ({ children, size = 20, w = 700, color = C.ink, style, numberOfLines, center, lh = 1.5 }: TP & { w?: keyof typeof J; lh?: number }) => (
  <Text numberOfLines={numberOfLines} style={[{ fontFamily: J[w], fontSize: size, color, lineHeight: Math.round(size * lh) }, center && { textAlign: 'center' }, style]}>{children}</Text>
);
/** Small uppercase section label, e.g. "NGỮ PHÁP · ĐIỀN TỪ" */
export const Label = ({ children, color = C.mute, style }: { children: React.ReactNode; color?: string; style?: StyleProp<TextStyle> }) => <T size={11} w={500} color={color} style={[{ letterSpacing: 0.3 }, style]}>{children}</T>;

// ——— Motion ———

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Pressable that springs down while held and bounces back on release */
export const Tap = ({ style, scaleTo = 0.97, onPressIn, onPressOut, children, ...rest }: Omit<PressableProps, 'style' | 'children'> & { style?: StyleProp<ViewStyle>; scaleTo?: number; children?: React.ReactNode }) => {
  const [s] = useState(() => new Animated.Value(1));
  const to = (v: number) => Animated.spring(s, { toValue: v, useNativeDriver: true, speed: 40, bounciness: v === 1 ? 8 : 0 }).start();
  return (
    <AnimatedPressable {...rest} onPressIn={e => { to(scaleTo); onPressIn?.(e); }} onPressOut={e => { to(1); onPressOut?.(e); }} style={[style, { transform: [{ scale: s }] }]}>
      {children}
    </AnimatedPressable>
  );
};

/** Fades and slides its children in on mount. Give it a `key` to replay when content changes. */
export const FadeIn = ({ children, delay = 0, dx = 0, dy = 10, style }: { children: React.ReactNode; delay?: number; dx?: number; dy?: number; style?: StyleProp<ViewStyle> }) => {
  const [a] = useState(() => new Animated.Value(0));
  const [from] = useState({ dx, dy });
  useEffect(() => { Animated.timing(a, { toValue: 1, duration: 300, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(); }, []);
  const tx = a.interpolate({ inputRange: [0, 1], outputRange: [from.dx, 0] });
  const ty = a.interpolate({ inputRange: [0, 1], outputRange: [from.dy, 0] });
  return <Animated.View style={[style, { opacity: a, transform: [{ translateX: tx }, { translateY: ty }] }]}>{children}</Animated.View>;
};

/** Card-flip: returns the face to draw and a rotateY transform. The face swaps while the card is edge-on. */
export function useFlip(face: boolean) {
  const [shown, setShown] = useState(face);
  const [v] = useState(() => new Animated.Value(1));
  const want = useRef(face);
  useEffect(() => {
    want.current = face;
    if (face === shown) return;
    Animated.timing(v, { toValue: 0, duration: 120, easing: Easing.in(Easing.quad), useNativeDriver: true }).start(() => {
      setShown(want.current);
      Animated.timing(v, { toValue: 1, duration: 160, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
    });
  }, [face]);
  return [shown, [{ perspective: 900 }, { rotateY: v.interpolate({ inputRange: [0, 1], outputRange: ['90deg', '0deg'] }) }]] as const;
}

export const Card = ({ children, style, onPress }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void }) => {
  const s = [{ backgroundColor: C.white, borderRadius: R.lg, padding: 14 }, style];
  return onPress ? <Tap onPress={onPress} style={s}>{children}</Tap> : <View style={s}>{children}</View>;
};

const BTN = {
  primary: [C.brand, C.white], danger: [C.brandDark, C.white], ok: [C.ok, C.white], dark: [C.ink, C.white], ghost: [C.white, C.ink], light: [C.bg, C.ink],
} as const;
export const Btn = ({ label, onPress, kind = 'primary', disabled, style, icon, iconColor }: { label: string; onPress: () => void; kind?: keyof typeof BTN; disabled?: boolean; style?: StyleProp<ViewStyle>; icon?: FeatherName; iconColor?: string }) => {
  const [bg, fg] = BTN[kind];
  return (
    <Tap disabled={disabled} onPress={onPress} style={[{ backgroundColor: bg, borderRadius: 18, paddingVertical: 15, paddingHorizontal: 16, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' }, disabled && { opacity: 0.4 }, style]}>
      {icon && <Icon name={icon} size={17} color={iconColor ?? fg} />}
      <T size={15} w={600} color={fg}>{label}</T>
    </Tap>
  );
};

/** Rounded pill label/button */
export const Pill = ({ label, bg = C.white, color = C.ink, icon, onPress, style, size = 13, w = 500 }: { label?: string; bg?: string; color?: string; icon?: React.ReactNode; onPress?: () => void; style?: StyleProp<ViewStyle>; size?: number; w?: keyof typeof F }) => {
  const s = [{ backgroundColor: bg, borderRadius: R.pill, paddingHorizontal: 12, paddingVertical: 7, flexDirection: 'row' as const, alignItems: 'center' as const, gap: 5 }, style];
  const inner = <>{icon}{label !== undefined && <T size={size} w={w} color={color}>{label}</T>}</>;
  return onPress ? <Tap onPress={onPress} style={s}>{inner}</Tap> : <View style={s}>{inner}</View>;
};

/** Colored rounded-square icon tile */
export const Tile = ({ icon, bg, fg, size = 44 }: { icon: FeatherName; bg: string; fg: string; size?: number }) => (
  <View style={{ width: size, height: size, borderRadius: size * 0.32, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}><Icon name={icon} size={size * 0.45} color={fg} /></View>
);

export const Bar = ({ value, color = C.brand, track = C.white, h = 10 }: { value: number; color?: string; track?: string; h?: number }) => {
  const v = Math.min(1, Math.max(0, value));
  const [a] = useState(() => new Animated.Value(v));
  useEffect(() => { Animated.timing(a, { toValue: v, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start(); }, [v]);
  return (
    <View style={{ height: h, backgroundColor: track, borderRadius: h / 2, overflow: 'hidden' }}>
      <Animated.View style={{ height: '100%', width: a.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }), backgroundColor: color, borderRadius: h / 2 }} />
    </View>
  );
};

export const SqBtn = ({ icon, onPress, bg = C.white, color = C.ink }: { icon: FeatherName; onPress?: () => void; bg?: string; color?: string }) => (
  <Tap onPress={onPress} hitSlop={8} scaleTo={0.9} style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}><Icon name={icon} size={18} color={color} /></Tap>
);

/** Full-height screen that paints the status-bar area with `bg` */
export const Screen = ({ children, bg = C.bg, top = true }: { children: React.ReactNode; bg?: string; top?: boolean }) => {
  const ins = useSafeAreaInsets();
  return <View style={{ flex: 1, backgroundColor: bg, paddingTop: top ? ins.top : 0 }}>{children}</View>;
};

/** Close button · middle content · right slot */
export const Header = ({ onClose, icon = 'x', title, children, right }: { onClose?: () => void; icon?: FeatherName; title?: string; children?: React.ReactNode; right?: React.ReactNode }) => (
  <View style={{ paddingHorizontal: 20, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
    {onClose ? <SqBtn icon={icon} onPress={onClose} /> : <View style={{ width: 38 }} />}
    <View style={{ flex: 1, alignItems: children ? 'stretch' : 'center' }}>{children ?? (!!title && <T size={14} w={600} numberOfLines={1}>{title}</T>)}</View>
    <View style={{ minWidth: 38, alignItems: 'flex-end' }}>{right}</View>
  </View>
);

/** Segmented control with a highlight that slides to the active item */
export function Seg<K extends string>({ items, value, onChange, style, activeBg = C.bg, activeColor = C.ink }: { items: { k: K; label: string; icon?: FeatherName }[]; value: K; onChange: (k: K) => void; style?: StyleProp<ViewStyle>; activeBg?: string; activeColor?: string }) {
  const [w, setW] = useState(0);
  const idx = Math.max(0, items.findIndex(it => it.k === value));
  const [x] = useState(() => new Animated.Value(idx));
  useEffect(() => { Animated.spring(x, { toValue: idx, useNativeDriver: true, speed: 18, bounciness: 5 }).start(); }, [idx]);
  const itemW = w / items.length;
  return (
    <View style={[{ backgroundColor: C.white, borderRadius: R.md, padding: 4 }, style]}>
      <View onLayout={e => setW(e.nativeEvent.layout.width)} style={{ flexDirection: 'row' }}>
        {w > 0 && <Animated.View pointerEvents="none" style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: itemW, borderRadius: 12, backgroundColor: activeBg, transform: [{ translateX: x.interpolate({ inputRange: [0, 1], outputRange: [0, itemW] }) }] }} />}
        {items.map(it => {
          const on = it.k === value;
          return (
            <Pressable key={it.k} onPress={() => onChange(it.k)} style={{ flex: 1, borderRadius: 12, paddingVertical: 9, flexDirection: 'row', gap: 4, alignItems: 'center', justifyContent: 'center' }}>
              {it.icon && <Icon name={it.icon} size={12} color={on ? activeColor : C.mute} />}
              <T size={13} w={500} color={on ? activeColor : C.mute}>{it.label}</T>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/** White bottom sheet with drag handle, pinned to the bottom of its parent */
export const Sheet = ({ children }: { children: React.ReactNode }) => {
  const ins = useSafeAreaInsets();
  const [y] = useState(() => new Animated.Value(1));
  useEffect(() => { Animated.spring(y, { toValue: 0, useNativeDriver: true, speed: 16, bounciness: 4 }).start(); }, []);
  return (
    <Animated.View style={[{ transform: [{ translateY: y.interpolate({ inputRange: [0, 1], outputRange: [0, 420] }) }] }, { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: C.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 10, paddingBottom: Math.max(20, ins.bottom + 8) }, shadow(-10, 30, 0.12)]}>
      <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: C.line, alignSelf: 'center', marginBottom: 12 }} />
      {children}
    </Animated.View>
  );
};

/** Bottom action area (not a sheet) respecting the home indicator */
export const Footer = ({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) => {
  const ins = useSafeAreaInsets();
  return <View style={[{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: Math.max(20, ins.bottom + 8), flexDirection: 'row', gap: 10 }, style]}>{children}</View>;
};
