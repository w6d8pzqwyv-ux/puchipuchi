import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, View, useWindowDimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { grainTickHaptic } from '../haptics';

const TRACE_LIFE = 700; // なで跡が消えるまでの時間(ms)
// 距離ベース振動: 指がこの距離(px)動くごとに1回「目をまたいだ」振動を鳴らす
// → 速くなでれば細かく、ゆっくりなでれば粗く感じる(実物の畳と同じ)
const GRAIN_STEP_ROUGH = 7; // 逆目: 目の間隔ぶんで1回ガリッ
const GRAIN_STEP_SMOOTH = 18; // 順目: たまにサラッ
const HAPTIC_FLOOR_MS = 25; // 振動の最短間隔(詰まり防止)

const tatamiTile = require('../assets/tatami-tile.png');
const showaImages = {
  tv: require('../assets/showa/tv.png'),
  kotatsu: require('../assets/showa/kotatsu.png'),
  cat: require('../assets/showa/cat.png'),
};

// 6畳の回し敷き。部屋を横3×縦4マスとして、畳1枚=2マス
// orientation: h=横長(目も横) v=縦長(目も縦)
const MATS = [
  { x: 0, y: 0, w: 2, h: 1, o: 'h' },
  { x: 2, y: 0, w: 1, h: 2, o: 'v' },
  { x: 0, y: 1, w: 1, h: 2, o: 'v' },
  { x: 1, y: 1, w: 1, h: 2, o: 'v' },
  { x: 2, y: 2, w: 1, h: 2, o: 'v' },
  { x: 0, y: 3, w: 2, h: 1, o: 'h' },
];

const HERI_W = 8; // へりの幅(px)。実寸(約4px相当)より触りやすく誇張

// 畳1枚。へりは長辺のみ(実物と同じ)。縦畳はテクスチャを90度回転
function Mat({ rect, orientation }) {
  // 横長畳の長辺=上下、縦長畳の長辺=左右
  const heriStyle =
    orientation === 'h'
      ? { paddingVertical: HERI_W, paddingHorizontal: 0 }
      : { paddingHorizontal: HERI_W, paddingVertical: 0 };
  // へりを除いた内側の実寸(縦畳は左右にへり=幅だけ HERI_W*2 減る)
  const innerW = orientation === 'h' ? rect.width : rect.width - HERI_W * 2;
  const innerH = orientation === 'h' ? rect.height - HERI_W * 2 : rect.height;
  return (
    <View style={[styles.mat, rect, heriStyle]} pointerEvents="none">
      <View style={styles.matInner}>
        {orientation === 'h' ? (
          <Image source={tatamiTile} style={styles.matTexture} resizeMode="repeat" />
        ) : (
          <Image
            source={tatamiTile}
            style={{
              position: 'absolute',
              width: innerH,
              height: innerW,
              left: (innerW - innerH) / 2,
              top: (innerH - innerW) / 2,
              transform: [{ rotate: '90deg' }],
            }}
            resizeMode="repeat"
          />
        )}
      </View>
    </View>
  );
}

// こたつの上から立ちのぼる湯気(お茶のイメージ)。ゆらゆら上って薄れる
function Steam({ x, y, delay }) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(t, { toValue: 1, duration: 3200, delay, easing: Easing.out(Easing.quad), useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [0, -46] });
  const translateX = t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 6, -4] });
  const opacity = t.interpolate({ inputRange: [0, 0.15, 0.7, 1], outputRange: [0, 0.45, 0.3, 0] });
  const scale = t.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.5] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.steam, { left: x, top: y, opacity, transform: [{ translateX }, { translateY }, { scale }] }]}
    />
  );
}

// 陽だまりに舞うホコリ。ゆっくり漂いながらキラッと明滅
function Dust({ startX, startY, delay, duration }) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(t, { toValue: 1, duration, delay, easing: Easing.linear, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [0, 60] });
  const translateX = t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 14, -6] });
  const opacity = t.interpolate({
    inputRange: [0, 0.2, 0.35, 0.5, 0.65, 0.8, 1],
    outputRange: [0, 0.5, 0.15, 0.55, 0.2, 0.45, 0],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.dust, { left: startX, top: startY, opacity, transform: [{ translateX }, { translateY }] }]}
    />
  );
}

// なでた跡。ふわっと現れてスッと消える楕円
function Trace({ x, y }) {
  const fade = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 0, duration: TRACE_LIFE, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.trace, { left: x - 22, top: y - 14, opacity: fade }]}
    />
  );
}

export default function TatamiScreen() {
  const { width, height } = useWindowDimensions();
  const [traces, setTraces] = useState([]);
  const [areaH, setAreaH] = useState(0); // この画面の実際の高さ(onLayoutで実測)
  const lastHaptic = useRef(0);
  const lastPoint = useRef(null);
  const grainDist = useRef(0); // 前回の振動から指が動いた累計距離(px)
  const wasOnHeri = useRef(false); // 直前にへりの上にいたか(跨ぎ検知用)
  const traceId = useRef(0);
  const catBreath = useRef(new Animated.Value(1)).current; // 猫の呼吸(体がゆっくり膨らむ)

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(catBreath, { toValue: 1.04, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(catBreath, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // 部屋(3:4)を画面いっぱいに収める
  const unit = Math.min((width - 16) / 3, (height - 120) / 4);
  const roomW = unit * 3;
  const roomH = unit * 4;
  const offsetX = (width - roomW) / 2;

  // 小物の配置(部屋の左上を基準にした座標)
  const roomTop = (areaH - roomH) / 2;
  const props = {
    tv: { left: offsetX + unit * 1.05, top: roomTop + unit * 0.15, width: unit * 0.9, height: unit * 0.8 },
    kotatsu: { left: offsetX + unit * 0.25, top: roomTop + unit * 1.25, width: unit * 2.4, height: unit * 1.9 },
    cat: { left: offsetX + unit * 2.0, top: roomTop + unit * 2.45, width: unit * 0.72, height: unit * 0.62 },
  };

  // ミカンの当たり判定(こたつ天板の中央あたり)
  const mikanZone = {
    left: props.kotatsu.left + props.kotatsu.width * 0.40,
    top: props.kotatsu.top + props.kotatsu.height * 0.28,
    width: props.kotatsu.width * 0.22,
    height: props.kotatsu.height * 0.18,
  };

  const inRect = (px, py, r) =>
    px >= r.left && px <= r.left + r.width && py >= r.top && py <= r.top + r.height;
  const isOnMikan = (px, py) => inRect(px, py, mikanZone);
  const isOnCat = (px, py) => inRect(px, py, props.cat);
  const isOnKotatsu = (px, py) => inRect(px, py, props.kotatsu);
  const isOnTv = (px, py) => inRect(px, py, props.tv);

  // 指がどの畳の上か → その畳の目の向き('h'=横目 / 'v'=縦目)を返す
  const matOrientationAt = (px, py) => {
    const rx = px - offsetX;
    const ry = py - (areaH - roomH) / 2;
    for (const m of MATS) {
      const left = m.x * unit;
      const top = m.y * unit;
      if (rx >= left && rx <= left + m.w * unit && ry >= top && ry <= top + m.h * unit) {
        return m.o;
      }
    }
    return 'h';
  };

  // 指の位置が「へり(布)」の上かどうか判定
  const isOnHeri = (px, py) => {
    const rx = px - offsetX;
    const ry = py - (areaH - roomH) / 2; // roomは縦中央寄せ
    for (const m of MATS) {
      const left = m.x * unit;
      const top = m.y * unit;
      const w = m.w * unit;
      const h = m.h * unit;
      if (rx < left || rx > left + w || ry < top || ry > top + h) continue;
      if (m.o === 'h') {
        return ry - top < HERI_W || top + h - ry < HERI_W; // 上下の縁
      }
      return rx - left < HERI_W || left + w - rx < HERI_W; // 左右の縁
    }
    return false;
  };

  const stroke = (e, isStart) => {
    const { locationX, locationY } = e.nativeEvent;
    const now = Date.now();

    // その畳の目の向きを基準に、順目(サラサラ)か逆目(ガリガリ)かを判定
    // 横目の畳: 横なで=順目 / 縦なで=逆目。 縦目の畳: その逆。
    let rough = false;
    let moved = 0; // 今回の指の移動距離(px)
    if (!isStart && lastPoint.current) {
      const dx = Math.abs(locationX - lastPoint.current.x);
      const dy = Math.abs(locationY - lastPoint.current.y);
      moved = Math.hypot(dx, dy);
      if (moved > 0.6) {
        // 目に沿う成分(along)と逆らう成分(across)を畳の向きで決める
        const horizontalGrain = matOrientationAt(locationX, locationY) === 'h';
        const along = horizontalGrain ? dx : dy;
        const across = horizontalGrain ? dy : dx;
        rough = across > along;
      }
    }
    if (isStart) grainDist.current = 0;
    lastPoint.current = { x: locationX, y: locationY };

    // 猫の上：ゆったり深いゴロゴロ(喉鳴らし)。こたつより優先
    if (isOnCat(locationX, locationY)) {
      if (now - lastHaptic.current > 110) {
        lastHaptic.current = now;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      }
      return; // 小物の上ではなで跡を付けない
    }
    // ミカン：皮のつぶつぶ(細かく柔らかい振動)。こたつより優先
    if (isOnMikan(locationX, locationY)) {
      if (now - lastHaptic.current > 55) {
        lastHaptic.current = now;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      }
      return;
    }
    // こたつ布団：ふかふか(軽い振動をゆっくり)
    if (isOnKotatsu(locationX, locationY)) {
      if (now - lastHaptic.current > 160) {
        lastHaptic.current = now;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      return;
    }
    // テレビ：ガラスのツルツル+たまに静電気の「パチッ」
    if (isOnTv(locationX, locationY)) {
      if (Math.random() < 0.03) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
        lastHaptic.current = now;
      }
      return;
    }

    const onHeri = isOnHeri(locationX, locationY);

    // へりを跨いだ瞬間は段差の「コツッ」を1回
    if (!isStart && onHeri !== wasOnHeri.current) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      lastHaptic.current = now;
    }
    wasOnHeri.current = onHeri;

    // 指が動いたぶんだけ距離を貯め、「目1本ぶん」を超えるたびに振動
    if (onHeri) {
      // へりは布なのでツルッと滑らか(振動なし)。距離もリセット
      grainDist.current = 0;
    } else {
      grainDist.current += moved;
      const step = rough ? GRAIN_STEP_ROUGH : GRAIN_STEP_SMOOTH;
      if (grainDist.current >= step && now - lastHaptic.current >= HAPTIC_FLOOR_MS) {
        grainDist.current = 0;
        lastHaptic.current = now;
        grainTickHaptic(rough);
      }
    }

    // なで跡を追加(増えすぎないよう最新20個まで)
    const id = traceId.current++;
    setTraces((prev) => [...prev.slice(-19), { id, x: locationX, y: locationY }]);
    setTimeout(() => {
      setTraces((prev) => prev.filter((t) => t.id !== id));
    }, TRACE_LIFE);
  };

  return (
    <View
      style={styles.container}
      onLayout={(e) => setAreaH(e.nativeEvent.layout.height)}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={(e) => stroke(e, true)}
      onResponderMove={(e) => stroke(e, false)}
      onResponderRelease={() => (lastPoint.current = null)}
    >
      <View style={[styles.room, { width: roomW + 10, height: roomH + 10, marginLeft: offsetX - 5 }]} pointerEvents="none">
        {MATS.map((m, i) => (
          <Mat
            key={i}
            orientation={m.o}
            rect={{
              left: m.x * unit,
              top: m.y * unit,
              width: m.w * unit,
              height: m.h * unit,
            }}
          />
        ))}
      </View>
      <Image source={showaImages.tv} style={[styles.prop, props.tv]} resizeMode="contain" pointerEvents="none" />
      <Image source={showaImages.kotatsu} style={[styles.prop, props.kotatsu]} resizeMode="contain" pointerEvents="none" />
      <Animated.Image
        source={showaImages.cat}
        style={[styles.prop, props.cat, { transform: [{ scale: catBreath }] }]}
        resizeMode="contain"
        pointerEvents="none"
      />
      {/* こたつ天板(ミカンの横あたり)から湯気 */}
      <Steam x={mikanZone.left + mikanZone.width * 1.4} y={mikanZone.top - 6} delay={0} />
      <Steam x={mikanZone.left + mikanZone.width * 1.55} y={mikanZone.top - 2} delay={1400} />
      {/* 陽だまりのホコリ(画面上部にうっすら) */}
      <Dust startX={offsetX + unit * 0.4} startY={roomTop + unit * 0.5} delay={0} duration={9000} />
      <Dust startX={offsetX + unit * 1.7} startY={roomTop + unit * 0.9} delay={2500} duration={11000} />
      <Dust startX={offsetX + unit * 2.5} startY={roomTop + unit * 0.3} delay={5000} duration={10000} />
      {traces.map((t) => (
        <Trace key={t.id} x={t.x} y={t.y} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e3dac4', // 壁・板の間の明るい色
    justifyContent: 'center',
  },
  room: {
    position: 'relative',
    // 敷居(部屋の木枠)
    borderWidth: 5,
    borderColor: '#9a7650',
  },
  mat: {
    position: 'absolute',
    // 畳のへり(縁)。写真のような黒っぽい紺
    backgroundColor: '#23281f',
    padding: 3,
  },
  matInner: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#b6c489',
  },
  matTexture: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
  },
  prop: {
    position: 'absolute',
  },
  steam: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 999,
    backgroundColor: '#f4f0e4',
  },
  dust: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#fdf8e6',
  },
  trace: {
    position: 'absolute',
    width: 44,
    height: 28,
    borderRadius: 999,
    backgroundColor: '#d8e2bc',
  },
});
