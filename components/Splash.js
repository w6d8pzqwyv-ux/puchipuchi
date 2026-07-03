import { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect, Circle } from 'react-native-svg';

const mascot = require('../assets/character/peek.png');

// 起動画面。生成りのradial地＋薄い泡＋ロゴ＋タグライン＋マスコット
export default function Splash({ onDone }) {
  const { width, height } = useWindowDimensions();
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(fade, { toValue: 0, duration: 450, useNativeDriver: true }).start(
        ({ finished }) => finished && onDone()
      );
    }, 1700);
    return () => clearTimeout(timer);
  }, []);

  // 薄く散らす泡
  const bubbles = [
    { x: 0.16, y: 0.2, r: 26 },
    { x: 0.82, y: 0.26, r: 20 },
    { x: 0.24, y: 0.74, r: 18 },
    { x: 0.7, y: 0.8, r: 30 },
  ];

  return (
    <Animated.View style={[styles.fill, { opacity: fade }]}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="bg" cx="50%" cy="42%" r="75%">
            <Stop offset="0%" stopColor="#F6EFDE" />
            <Stop offset="60%" stopColor="#EFE6D2" />
            <Stop offset="100%" stopColor="#E6D9BD" />
          </RadialGradient>
        </Defs>
        <Rect width={width} height={height} fill="url(#bg)" />
        {bubbles.map((b, i) => (
          <Circle key={i} cx={width * b.x} cy={height * b.y} r={b.r}
            fill="#ffffff" opacity={0.35} stroke="#cdb98f" strokeWidth={1} strokeOpacity={0.25} />
        ))}
      </Svg>

      {/* ロゴ：Puchi + 泡の「!」 */}
      <View style={styles.center}>
        <View style={styles.logoRow}>
          <Text style={styles.wordmark}>Puchi</Text>
          <View style={styles.bang}>
            <View style={styles.bangBubble}>
              <View style={styles.bangHighlight} />
            </View>
            <View style={styles.bangDot} />
          </View>
        </View>
        <Text style={styles.tagline}>ふれて、ととのう。</Text>
      </View>

      {/* マスコットは右下から覗く */}
      <Image source={mascot} style={styles.mascot} resizeMode="contain" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject, zIndex: 100 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logoRow: { flexDirection: 'row', alignItems: 'flex-end' },
  wordmark: {
    fontFamily: 'ZenMaruGothic_900Black',
    fontSize: 56,
    color: '#243F54',
    letterSpacing: 1,
  },
  bang: { alignItems: 'center', marginLeft: 6, marginBottom: 8 },
  bangBubble: {
    width: 24, height: 24, borderRadius: 999,
    backgroundColor: '#AEDDF2',
  },
  bangHighlight: {
    width: 8, height: 5, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.9)',
    marginTop: 5, marginLeft: 5,
    transform: [{ rotate: '-25deg' }],
  },
  bangDot: {
    width: 11, height: 11, borderRadius: 999,
    backgroundColor: '#AEDDF2',
    marginTop: 6,
  },
  tagline: {
    fontFamily: 'YujiSyuku_400Regular',
    fontSize: 17,
    color: '#837754',
    letterSpacing: 3,
    marginTop: 22,
  },
  mascot: {
    position: 'absolute',
    right: -10,
    bottom: -6,
    width: 150,
    height: 150,
  },
});
