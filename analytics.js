// Firebase Analytics(利用状況の計測)。国・利用回数などは自動で集計される。
// Expo GoなどSDKが無い環境では何もしない
let analytics = null;
try {
  analytics = require('@react-native-firebase/analytics').default;
} catch (e) {
  analytics = null;
}

// イベントを記録する。例: logEvent('feel_selected', { feel: 'puchi' })
export async function logEvent(name, params) {
  if (!analytics) return;
  try {
    await analytics().logEvent(name, params);
  } catch (e) {
    // 計測の失敗はアプリの動作に影響させない
  }
}
