import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View, useWindowDimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { logEvent } from '../analytics';

const RIPPLE_LIFE = 1400; // 波紋が消えるまでの時間(ms)
const MOVE_RIPPLE_GAP = 70; // なで中に波紋を生む間隔(ms)

// 波紋1つ。輪が広がりながら薄れて消える
function Ripple({ x, y, big }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: big ? RIPPLE_LIFE : RIPPLE_LIFE * 0.6,
      useNativeDriver: true,
    }).start();
  }, []);

  const maxScale = big ? 5 : 2.5;
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, maxScale] });
  const opacity = anim.interpolate({ inputRange: [0, 0.1, 1], outputRange: [0, 0.7, 0] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.ripple, { left: x - 30, top: y - 30, opacity, transform: [{ scale }] }]}
    />
  );
}

// ゆっくり漂って流れ落ちる花びら
function Petal({ width, height, delay, duration, startX, size }) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(t, { toValue: 1, duration, delay, easing: Easing.linear, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [-40, height + 40] });
  const translateX = t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 36, 0] });
  const rotate = t.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '320deg'] });
  const opacity = t.interpolate({ inputRange: [0, 0.1, 0.85, 1], outputRange: [0, 0.85, 0.85, 0] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.petal,
        { left: startX, width: size, height: size * 0.78, opacity, transform: [{ translateX }, { translateY }, { rotate }] },
      ]}
    />
  );
}

export default function WaterScreen() {
  const { width, height } = useWindowDimensions();
  const [ripples, setRipples] = useState([]);
  const rippleId = useRef(0);
  const lastRipple = useRef(0);
  const lastHaptic = useRef(0);

  // 魚の影：たまに横切る。タップで捕まえる隠し要素
  const fishX = useRef(new Animated.Value(0)).current;
  const fishPos = useRef({ x: -999, y: 0, dir: 1, active: false });
  const [fishVisible, setFishVisible] = useState(false);
  const [fishY, setFishY] = useState(0);
  const [fishDir, setFishDir] = useState(1);

  useEffect(() => {
    const id = fishX.addListener(({ value }) => {
      fishPos.current.x = value;
    });
    return () => fishX.removeListener(id);
  }, []);

  // 魚を一定間隔でランダムに泳がせる
  useEffect(() => {
    let timer;
    const swim = () => {
      const dir = Math.random() < 0.5 ? 1 : -1;
      const y = height * (0.25 + Math.random() * 0.5);
      const from = dir === 1 ? -60 : width + 60;
      const to = dir === 1 ? width + 60 : -60;
      setFishY(y);
      setFishDir(dir);
      fishPos.current = { x: from, y, dir, active: true };
      setFishVisible(true);
      fishX.setValue(from);
      Animated.timing(fishX, { toValue: to, duration: 4200, easing: Easing.inOut(Easing.quad), useNativeDriver: true })
        .start(({ finished }) => {
          if (finished) {
            fishPos.current.active = false;
            setFishVisible(false);
          }
        });
      timer = setTimeout(swim, 6000 + Math.random() * 6000); // 6〜12秒ごと
    };
    timer = setTimeout(swim, 3000);
    return () => clearTimeout(timer);
  }, [width, height]);

  const addRipple = (x, y, big) => {
    const id = rippleId.current++;
    setRipples((prev) => [...prev.slice(-24), { id, x, y, big }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), RIPPLE_LIFE);
  };

  const tryCatchFish = (x, y) => {
    const f = fishPos.current;
    if (!f.active) return false;
    if (Math.hypot(x - f.x, y - f.y) < 60) {
      // 捕獲！驚いてダッシュで逃げる
      f.active = false;
      setFishVisible(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      logEvent('fish_caught');
      addRipple(x, y, true);
      return true;
    }
    return false;
  };

  // タップ：魚がいれば捕獲判定、なければ ぽちゃん
  const touchStart = (e) => {
    const { locationX, locationY } = e.nativeEvent;
    if (tryCatchFish(locationX, locationY)) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft), 80);
    addRipple(locationX, locationY, true);
  };

  // なで：水の抵抗(ごく軽い振動をまばらに+小さい波紋を点々と)
  const touchMove = (e) => {
    const { locationX, locationY } = e.nativeEvent;
    const now = Date.now();
    tryCatchFish(locationX, locationY);
    if (now - lastRipple.current > MOVE_RIPPLE_GAP) {
      lastRipple.current = now;
      addRipple(locationX, locationY, false);
    }
    if (now - lastHaptic.current > 80) {
      lastHaptic.current = now;
      Haptics.selectionAsync();
    }
  };

  // 花びらを数枚ばらまく
  const petals = [
    { startX: width * 0.12, size: 16, delay: 0, duration: 11000 },
    { startX: width * 0.4, size: 13, delay: 3000, duration: 13000 },
    { startX: width * 0.66, size: 18, delay: 1500, duration: 10000 },
    { startX: width * 0.85, size: 12, delay: 5000, duration: 14000 },
  ];

  return (
    <View
      style={styles.container}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={touchStart}
      onResponderMove={touchMove}
    >
      {fishVisible && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.fish,
            { top: fishY, transform: [{ translateX: fishX }, { scaleX: fishDir }] },
          ]}
        >
          <View style={styles.fishBody} />
          <View style={styles.fishTail} />
        </Animated.View>
      )}
      {petals.map((p, i) => (
        <Petal key={i} width={width} height={height} {...p} />
      ))}
      {ripples.map((r) => (
        <Ripple key={r.id} x={r.x} y={r.y} big={r.big} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2a4a5f',
    overflow: 'hidden',
  },
  ripple: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#cfe0dd',
  },
  petal: {
    position: 'absolute',
    top: 0,
    borderTopLeftRadius: 999,
    borderBottomRightRadius: 999,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 4,
    backgroundColor: 'rgba(237,205,213,0.55)',
  },
  fish: {
    position: 'absolute',
    left: 0,
    width: 54,
    height: 26,
    alignItems: 'center',
    flexDirection: 'row',
  },
  fishBody: {
    width: 38,
    height: 22,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  fishTail: {
    width: 0,
    height: 0,
    marginLeft: -4,
    borderTopWidth: 9,
    borderBottomWidth: 9,
    borderRightWidth: 14,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: 'rgba(0,0,0,0.22)',
  },
});
