import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// 広告SDK。Expo Goには入っていないので、無い環境では広告なしで動く
let ads = null;
try {
  ads = require('react-native-google-mobile-ads');
} catch (e) {
  ads = null;
}

// 本番の広告ユニットID(バナー)。開発中はテスト広告を表示する
const BANNER_ID = __DEV__ ? ads?.TestIds?.BANNER : 'ca-app-pub-8238604859036288/9393690157';

// onInfo: ⓘ(このアプリについて)を押したときに呼ばれる
export default function AdBanner({ onInfo }) {
  const [ready, setReady] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!ads) return;
    (async () => {
      // iOSのトラッキング許可ダイアログ(ATT)を先に出してからSDKを起動する
      try {
        const { requestTrackingPermissionsAsync } = require('expo-tracking-transparency');
        await requestTrackingPermissionsAsync();
      } catch (e) {
        // 許可ダイアログが出せない環境でも広告自体は出せる
      }
      await ads.default().initialize();
      setReady(true);
    })();
  }, []);

  const showAd = ads && ready;
  const { BannerAd, BannerAdSize } = ads || {};

  // 帯(ⓘ入り)は常に表示。広告はSDK準備ができたときだけ。
  // home indicatorぶんの余白は最下部のこのビューで確保する
  return (
    <View style={[s.outer, { paddingBottom: insets.bottom + 6 }]}>
      {/* 右端にⓘ。広告に重ねない(AdMob規約)ため広告の上の帯に置く */}
      <View style={s.header}>
        <Pressable onPress={onInfo} hitSlop={12} style={s.infoBtn}>
          <Text style={s.infoText}>i</Text>
        </Pressable>
      </View>
      {showAd && (
        // 白いバナーをそのまま出さず、生成りの“盆”トレイで囲んで馴染ませる
        <View style={s.tray}>
          <View style={s.dashed} />
          <Text style={s.tag}>広告</Text>
          <View style={s.slot}>
            <BannerAd
              unitId={BANNER_ID}
              size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
              requestOptions={{ requestNonPersonalizedAdsOnly: true }}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  outer: { paddingTop: 4, paddingHorizontal: 6, backgroundColor: '#EFE6D2' },
  header: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 4, paddingBottom: 2 },
  infoBtn: {
    width: 26,
    height: 26,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(154,118,80,0.22)', // 帯に馴染む茶の半透明
  },
  infoText: { fontSize: 14, fontFamily: 'ZenMaruGothic_700Bold', color: '#6b5836' },
  tray: {
    marginTop: 4,
    marginHorizontal: 8,
    borderRadius: 14,
    padding: 6,
    backgroundColor: '#F1E6CC',
    borderWidth: 1,
    borderColor: 'rgba(154,118,80,0.30)',
  },
  dashed: {
    position: 'absolute',
    top: 3, left: 3, right: 3, bottom: 3,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: 'rgba(154,118,80,0.40)',
    borderStyle: 'dashed',
  },
  tag: {
    position: 'absolute',
    top: -8, left: 14,
    backgroundColor: '#9A7650',
    color: '#F6EFDE',
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 1,
    paddingVertical: 1.5,
    paddingHorizontal: 8,
    borderRadius: 7,
    overflow: 'hidden',
  },
  slot: { backgroundColor: '#FBFAF6', borderRadius: 9, alignItems: 'center', overflow: 'hidden' },
});
