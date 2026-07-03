import { useEffect, useRef, useState } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { createAudioPlayer } from 'expo-audio';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { t } from '../i18n';
import { popHaptic } from '../haptics';
import { logEvent } from '../analytics';

const CAUGHT_KEY = 'caughtCount'; // 捕獲数の保存キー

const popSound = require('../assets/pop.wav');

// 連打で音が重なれるように再生機を5台用意して順番に使う
const players = Array.from({ length: 5 }, () => createAudioPlayer(popSound));
let playerIndex = 0;
function playPop() {
  const player = players[playerIndex];
  playerIndex = (playerIndex + 1) % players.length;
  player.seekTo(0);
  player.play();
}

const COLS = 5;
const ROWS = 8;

const CHAR_CHANCE = 0.12; // 新しいシートでキャラが隠れている確率（捕獲要素があるので低め）
const charImages = {
  peek: require('../assets/character/peek.png'),
  surprised: require('../assets/character/surprised.png'),
  run: require('../assets/character/run.png'),
};

// プチの裏に隠れるキャラ。覗き→潰されたら驚いて逃げる→逃走中にタップで捕獲
function HiddenChar({ index, phase, direction, bubbleSize, screenWidth, onCatch }) {
  const runX = useRef(new Animated.Value(0)).current;
  const col = index % COLS;
  const row = Math.floor(index / COLS);
  const x = 20 + col * bubbleSize;
  const y = row * bubbleSize;
  const size = bubbleSize * 1.1;

  useEffect(() => {
    if (phase === 'running') {
      // ランダムな方向の画面端まで走って消える
      Animated.timing(runX, {
        toValue: direction === 'right' ? screenWidth : -screenWidth,
        duration: 1100,
        useNativeDriver: true,
      }).start();
    } else if (phase === 'caught') {
      runX.stopAnimation(); // 捕まった場所で止まる
    } else {
      runX.setValue(0);
    }
  }, [phase]);

  if (!phase) return null;

  // 隠れ中：アホ毛の先っぽだけ見える小窓で切り抜く
  if (phase === 'hiding') {
    return (
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: x,
          top: y - size * 0.06,
          width: size,
          height: size * 0.2,
          overflow: 'hidden',
          zIndex: -1,
        }}
      >
        <Image
          source={charImages.peek}
          style={{ width: size, height: size, resizeMode: 'contain' }}
        />
      </View>
    );
  }

  const img = phase === 'running' ? charImages.run : charImages.surprised;
  // 元画像は左向きに走っているので、右に逃げるときは左右反転する
  const flip = phase === 'running' && direction === 'right' ? [{ scaleX: -1 }] : [];

  return (
    <Animated.View
      pointerEvents={phase === 'running' ? 'auto' : 'none'}
      style={{
        position: 'absolute',
        left: x,
        top: y - size * 0.2,
        zIndex: 10,
        transform: [{ translateX: runX }],
      }}
    >
      {phase === 'caught' && (
        <Text style={styles.caughtText}>{t('caught')}</Text>
      )}
      <Pressable onPressIn={phase === 'running' ? onCatch : undefined}>
        <Image
          source={img}
          style={{ width: size, height: size, resizeMode: 'contain', transform: flip }}
        />
      </Pressable>
    </Animated.View>
  );
}

// すべて「未潰し(false)」の状態で新しいシートを作る
function newSheet() {
  return Array(COLS * ROWS).fill(false);
}

// プチ1個分。潰すと「破裂の輪が広がり、ぺしゃっとしぼむ」（見た目だけ。タッチはシート側で検知）
function Bubble({ size, isPopped }) {
  const scale = useRef(new Animated.Value(1)).current;
  const ring = useRef(new Animated.Value(0)).current; // 0=非表示 → 1=広がりきり

  useEffect(() => {
    if (isPopped) {
      ring.setValue(0.01);
      Animated.parallel([
        // 本体：勢いよく縮んでぺしゃっと着地
        Animated.sequence([
          Animated.timing(scale, { toValue: 0.45, duration: 60, useNativeDriver: true }),
          Animated.spring(scale, { toValue: 0.8, friction: 3, tension: 160, useNativeDriver: true }),
        ]),
        // 破裂の輪：一気に広がりながら消える
        Animated.timing(ring, { toValue: 1, duration: 260, useNativeDriver: true }),
      ]).start();
    } else {
      scale.setValue(1); // 新しいシートに替わったら元の大きさに戻す
      ring.setValue(0);
    }
  }, [isPopped]);

  const ringScale = ring.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.7] });
  const ringOpacity = ring.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.8, 0] });

  return (
    <View pointerEvents="none" style={{ width: size, height: size, margin: 4 }}>
      <Animated.View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            opacity: ringOpacity,
            transform: [{ scale: ringScale }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.bubble,
          { width: size, height: size, transform: [{ scale }, { scaleY: isPopped ? 0.85 : 1 }] },
          isPopped && styles.bubblePopped,
        ]}
      />
    </View>
  );
}

export default function BubbleWrapScreen() {
  const [popped, setPopped] = useState(newSheet);
  const poppedRef = useRef(popped);
  poppedRef.current = popped;
  const { width } = useWindowDimensions();
  const bubbleSize = (width - 40) / COLS;

  // キャラのかくれんぼ。index=どのプチの裏か、phase=hiding/surprised/running
  const [charIndex, setCharIndex] = useState(() =>
    Math.random() < CHAR_CHANCE ? Math.floor(Math.random() * COLS * ROWS) : null
  );
  const [charPhase, setCharPhase] = useState(charIndex != null ? 'hiding' : null);
  const [charDir, setCharDir] = useState('right');
  const [caughtCount, setCaughtCount] = useState(0);
  const escapeTimer = useRef(null);

  // 保存済みの捕獲数を読み込む
  useEffect(() => {
    AsyncStorage.getItem(CAUGHT_KEY).then((v) => {
      if (v != null) setCaughtCount(Number(v));
    });
  }, []);

  const placeChar = () => {
    if (Math.random() < CHAR_CHANCE) {
      setCharIndex(Math.floor(Math.random() * COLS * ROWS));
      setCharPhase('hiding');
      setCharDir(Math.random() < 0.5 ? 'left' : 'right');
    } else {
      setCharIndex(null);
      setCharPhase(null);
    }
  };

  // 逃走中のキャラをタップで捕獲
  const catchChar = () => {
    clearTimeout(escapeTimer.current); // 逃げ切り処理をキャンセル
    setCharPhase('caught');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const next = caughtCount + 1;
    setCaughtCount(next);
    AsyncStorage.setItem(CAUGHT_KEY, String(next));
    logEvent('char_caught', { total: next });
    setTimeout(() => setCharPhase(null), 1200);
  };

  const pop = (index) => {
    if (index < 0 || index >= COLS * ROWS) return;
    if (poppedRef.current[index]) return; // すでに潰れていたら何もしない
    playPop();
    // 音の再生開始には少し時間がかかるので、振動を30ms遅らせて音と同期させる
    setTimeout(() => popHaptic(), 30);
    const next = [...poppedRef.current];
    next[index] = true;
    poppedRef.current = next;
    setPopped(next);
    // キャラの隠れているプチを潰したら「びっくり→逃げる」
    if (index === charIndex && charPhase === 'hiding') {
      setCharPhase('surprised');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => setCharPhase('running'), 700);
      escapeTimer.current = setTimeout(() => setCharPhase(null), 1900); // 逃げ切り
    }
    // 全部潰れたら少し待って新しいシートに交換
    if (next.every(Boolean)) {
      setTimeout(() => {
        const fresh = newSheet();
        poppedRef.current = fresh;
        setPopped(fresh);
        placeChar(); // 新しいシートでまた隠れるかも
      }, 600);
    }
  };

  // 指の座標(シート左上が基準)から「どのプチの上か」を計算して潰す
  const popAt = (x, y) => {
    const col = Math.floor((x - 20) / bubbleSize);
    const row = Math.floor(y / bubbleSize);
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return;
    pop(row * COLS + col);
  };

  return (
    <View style={styles.container}>
      <View
        style={styles.sheet}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={(e) => popAt(e.nativeEvent.locationX, e.nativeEvent.locationY)}
        onResponderMove={(e) => popAt(e.nativeEvent.locationX, e.nativeEvent.locationY)}
      >
        {charIndex != null && (
          <HiddenChar
            index={charIndex}
            phase={charPhase}
            direction={charDir}
            bubbleSize={bubbleSize}
            screenWidth={width}
            onCatch={catchChar}
          />
        )}
        {popped.map((isPopped, i) => (
          <Bubble key={i} size={bubbleSize - 8} isPopped={isPopped} />
        ))}
      </View>
      {caughtCount > 0 && (
        <View style={styles.caughtBadge} pointerEvents="none">
          <Image source={charImages.peek} style={styles.caughtBadgeIcon} />
          <Text style={styles.caughtBadgeText}>×{caughtCount}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d3ddd9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    width: '100%',
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 3,
    borderColor: '#9fb6ab',
  },
  bubble: {
    borderRadius: 999,
    backgroundColor: '#eef4ef',
    borderWidth: 1,
    borderColor: '#b6c5bb',
    // ぷっくり見せるための影
    shadowColor: 'rgba(70,90,80,0.35)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  bubblePopped: {
    backgroundColor: '#c2cfc6',
    borderColor: '#aab9af',
    shadowOpacity: 0,
    elevation: 0,
  },
  caughtText: {
    position: 'absolute',
    top: -22,
    alignSelf: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: '#d2691e',
    zIndex: 11,
  },
  caughtBadge: {
    position: 'absolute',
    top: 56,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffffcc',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  caughtBadgeIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  caughtBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#185fa5',
    marginLeft: 4,
  },
});
