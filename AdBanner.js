import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// 広告SDK。Expo Goには入っていないので、無い環境では広告なしで動く
let ads = null;
try {
  ads = require('react-native-google-mobile-ads');
} catch (e) {
  ads = null;
}

// 本番の広告ユニットID(バナー)。開発中はテスト広告を表示する
const BANNER_ID = __DEV__ ? ads?.TestIds?.BANNER : 'ca-app-pub-8238604859036288/9393690157';

export default function AdBanner() {
  const [ready, setReady] = useState(false);

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

  if (!ads || !ready) return null;

  const { BannerAd, BannerAdSize } = ads;
  // 白いバナーをそのまま出さず、生成りの“盆”トレイで囲んで馴染ませる
  return (
    <View style={s.outer}>
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
    </View>
  );
}

const s = StyleSheet.create({
  outer: { paddingTop: 8, paddingHorizontal: 14, paddingBottom: 6, backgroundColor: '#EFE6D2' },
  tray: {
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
