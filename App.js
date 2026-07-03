import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AboutModal from './components/AboutModal';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, ZenMaruGothic_500Medium, ZenMaruGothic_700Bold, ZenMaruGothic_900Black } from '@expo-google-fonts/zen-maru-gothic';
import { YujiSyuku_400Regular } from '@expo-google-fonts/yuji-syuku';
import BubbleWrapScreen from './screens/BubbleWrapScreen';
import PunipuniScreen from './screens/PunipuniScreen';
import TatamiScreen from './screens/TatamiScreen';
import WaterScreen from './screens/WaterScreen';
import { t } from './i18n';
import AdBanner from './AdBanner';
import { logEvent } from './analytics';
import TabBar from './components/TabBar';
import Splash from './components/Splash';

// 触感の一覧。screenがnullのものは「準備中」表示になる
const FEELS = [
  { key: 'puchi', screen: BubbleWrapScreen },
  { key: 'puni', screen: PunipuniScreen },
  { key: 'tatami', screen: TatamiScreen },
  { key: 'mizu', screen: WaterScreen },
];

function ComingSoon() {
  return (
    <View style={styles.comingSoon}>
      <Text style={styles.comingSoonText}>{t('comingSoon')}</Text>
    </View>
  );
}

// 中身をSafeAreaProviderの内側に分離(useSafeAreaInsetsを使うため)
function Main() {
  const [feelKey, setFeelKey] = useState('puchi');
  const [showSplash, setShowSplash] = useState(true);
  const [showAbout, setShowAbout] = useState(false);
  const insets = useSafeAreaInsets();
  const feel = FEELS.find((f) => f.key === feelKey);
  const Screen = feel.screen ?? ComingSoon;

  // フォントを読み込む。読み込み完了まで何も描かない
  const [fontsLoaded] = useFonts({
    ZenMaruGothic_500Medium,
    ZenMaruGothic_700Bold,
    ZenMaruGothic_900Black,
    YujiSyuku_400Regular,
  });
  if (!fontsLoaded) return null;

  const select = (key) => {
    setFeelKey(key);
    logEvent('feel_selected', { feel: key });
  };

  return (
    <View style={styles.container}>
      <View style={styles.screenArea}>
        <Screen />
      </View>
      {/* 右上のⓘ: クレジット表記とプライバシーポリシーの入口 */}
      <Pressable
        style={[styles.infoBtn, { top: insets.top + 8 }]}
        hitSlop={10}
        onPress={() => setShowAbout(true)}
      >
        <Text style={styles.infoText}>i</Text>
      </Pressable>
      <AboutModal visible={showAbout} onClose={() => setShowAbout(false)} />
      <AdBanner />
      <TabBar active={feelKey} onSelect={select} />
      {showSplash && <Splash onDone={() => setShowSplash(false)} />}
      <StatusBar style="dark" />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Main />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d3ddd9',
  },
  screenArea: {
    flex: 1,
  },
  infoBtn: {
    position: 'absolute',
    right: 14,
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(53,92,125,0.55)', // 藍の半透明。触感の邪魔をしない
  },
  infoText: {
    fontSize: 15,
    fontFamily: 'ZenMaruGothic_700Bold',
    color: '#f6f1e3',
  },
  comingSoon: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comingSoonText: {
    fontSize: 16,
    fontFamily: 'ZenMaruGothic_500Medium',
    color: '#837754',
  },
});
