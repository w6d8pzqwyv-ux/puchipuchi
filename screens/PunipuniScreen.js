import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, View, useWindowDimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { logEvent } from '../analytics';

const BLOB_RATIO = 0.7; // 画面幅に対する塊の大きさ
const FOLLOW = 0.35; // 指にどれだけ付いていくか(1で完全追従)
const BURST_CHANCE = 0.01; // 押すたびに破裂が当たる確率(約1/100)

const peekImage = require('../assets/character/peek.png');

// 背景をふわふわ漂う小さなぷに(触れない飾り)
function MiniBlob({ width, height, delay, duration, startX, size }) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(t, { toValue: 1, duration, delay, easing: Easing.linear, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // 下からゆっくり浮かび上がり、左右にゆらゆら
  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [height + 40, -60] });
  const translateX = t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 24, 0] });
  const opacity = t.interpolate({ inputRange: [0, 0.1, 0.85, 1], outputRange: [0, 0.5, 0.5, 0] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.miniBlob,
        { left: startX, width: size, height: size, opacity, transform: [{ translateX }, { translateY }] },
      ]}
    />
  );
}

// 画面端からたまに覗くマスコット(15〜35秒ごと、3秒見せて引っ込む)
function MascotPeek({ width }) {
  const slide = useRef(new Animated.Value(0)).current; // 0=隠れ 1=覗き
  const [side, setSide] = useState('right');

  useEffect(() => {
    let timer;
    let alive = true;
    const schedule = () => {
      timer = setTimeout(() => {
        if (!alive) return;
        setSide(Math.random() < 0.5 ? 'left' : 'right');
        Animated.sequence([
          Animated.timing(slide, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.delay(3000),
          Animated.timing(slide, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start(() => alive && schedule());
      }, 15000 + Math.random() * 20000);
    };
    schedule();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, []);

  const size = width * 0.26;
  const hidden = side === 'right' ? size : -size;
  const translateX = slide.interpolate({ inputRange: [0, 1], outputRange: [hidden, 0] });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        bottom: '14%',
        [side]: -size * 0.45,
        width: size,
        height: size,
        transform: [{ translateX }, { scaleX: side === 'left' ? -1 : 1 }],
      }}
    >
      <Image source={peekImage} style={{ width: size, height: size, resizeMode: 'contain' }} />
    </Animated.View>
  );
}

export default function PunipuniScreen() {
  const { width, height } = useWindowDimensions();
  const blobSize = width * BLOB_RATIO;

  // 漂う小ぷにの配置(位置・大きさ・速さをばらけさせる)
  const minis = useRef(
    Array.from({ length: 6 }, (_, i) => ({
      startX: (width / 6) * i + 10,
      size: 14 + (i % 3) * 10,
      duration: 14000 + i * 2600,
      delay: i * 1800,
    }))
  ).current;

  // 指の移動量(押した点からのズレ)。これを元に伸び方を計算する
  const drag = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  // 長押し中の脈動(1を中心にむにむに)
  const pulse = useRef(new Animated.Value(1)).current;
  // 破裂用。1=通常、破裂で膨張しながら消える
  const burstScale = useRef(new Animated.Value(1)).current;
  const burstOpacity = useRef(new Animated.Value(1)).current;
  const [bursting, setBursting] = useState(false);

  const startPoint = useRef({ x: 0, y: 0 });
  const hapticTimer = useRef(null);
  const burstTimer = useRef(null);
  const pressing = useRef(false);

  const burst = () => {
    pressing.current = false;
    clearInterval(hapticTimer.current);
    setBursting(true);
    logEvent('blob_burst');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); // ドドッと強い振動
    Animated.parallel([
      Animated.timing(burstScale, { toValue: 1.9, duration: 140, useNativeDriver: true }),
      Animated.timing(burstOpacity, { toValue: 0, duration: 140, useNativeDriver: true }),
    ]).start(() => {
      drag.setValue({ x: 0, y: 0 });
      // 1秒後にちっちゃい状態からぷるんと再生成
      setTimeout(() => {
        burstScale.setValue(0.2);
        burstOpacity.setValue(1);
        Animated.spring(burstScale, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }).start();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
        setBursting(false);
      }, 1000);
    });
  };

  const startTouch = (e) => {
    if (bursting) return;
    pressing.current = true;
    startPoint.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    hapticTimer.current = setInterval(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    }, 90);
    // 押している間は呼吸するように脈動
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.05, duration: 350, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.97, duration: 350, useNativeDriver: true }),
      ])
    ).start();
    // 当たりを引いていたら0.7秒の長押しで破裂
    if (Math.random() < BURST_CHANCE) {
      burstTimer.current = setTimeout(() => {
        if (pressing.current) burst();
      }, 700);
    }
  };

  const moveTouch = (e) => {
    if (bursting) return;
    drag.setValue({
      x: e.nativeEvent.pageX - startPoint.current.x,
      y: e.nativeEvent.pageY - startPoint.current.y,
    });
  };

  const endTouch = () => {
    pressing.current = false;
    clearInterval(hapticTimer.current);
    clearTimeout(burstTimer.current);
    if (bursting) return;
    pulse.stopAnimation();
    Animated.spring(pulse, { toValue: 1, friction: 4, useNativeDriver: true }).start();
    // ぷるんぷるん揺れながら元の位置・形に戻る
    Animated.spring(drag, {
      toValue: { x: 0, y: 0 },
      friction: 3,
      tension: 120,
      useNativeDriver: true,
    }).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // 引っ張り量 → 本体の移動(少しだけ付いていく)
  const translateX = Animated.multiply(drag.x, FOLLOW);
  const translateY = Animated.multiply(drag.y, FOLLOW);
  // 引っ張り量 → 伸び。横に引けば横に、縦に引けば縦に伸びる
  const stretchX = drag.x.interpolate({
    inputRange: [-250, 0, 250],
    outputRange: [1.5, 1, 1.5],
    extrapolate: 'clamp',
  });
  const stretchY = drag.y.interpolate({
    inputRange: [-250, 0, 250],
    outputRange: [1.5, 1, 1.5],
    extrapolate: 'clamp',
  });
  // 伸び × 脈動 × 破裂 を全部掛け合わせて最終的な大きさに
  const scaleX = Animated.multiply(Animated.multiply(stretchX, pulse), burstScale);
  const scaleY = Animated.multiply(Animated.multiply(stretchY, pulse), burstScale);

  return (
    <View style={styles.container}>
      {minis.map((m, i) => (
        <MiniBlob key={i} width={width} height={height} {...m} />
      ))}
      <MascotPeek width={width} />
      <View
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={startTouch}
        onResponderMove={moveTouch}
        onResponderRelease={endTouch}
        onResponderTerminate={endTouch}
      >
        <Animated.View
          style={[
            styles.blob,
            {
              width: blobSize,
              height: blobSize,
              opacity: burstOpacity,
              transform: [{ translateX }, { translateY }, { scaleX }, { scaleY }],
            },
          ]}
        >
          <View style={[styles.highlight, { width: blobSize * 0.28, height: blobSize * 0.16 }]} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1e2db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blob: {
    borderRadius: 999,
    backgroundColor: '#e6b3bd',
    borderWidth: 2,
    borderColor: '#d295a0',
    alignItems: 'flex-start',
  },
  miniBlob: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: '#e6b3bd',
  },
  highlight: {
    marginTop: '12%',
    marginLeft: '18%',
    borderRadius: 999,
    backgroundColor: 'rgba(253,235,240,0.85)',
    transform: [{ rotate: '-25deg' }],
  },
});
