import * as Haptics from 'expo-haptics';

// Core Haptics(振動の波形デザイン)。開発ビルドでのみ動く。
// Expo Goなど未対応環境では従来の2段振動に自動で切り替わる(フォールバック)
let popPlayer = null;
let grainSmoothPlayer = null;
let grainRoughPlayer = null;
try {
  const { Player } = require('expo-ahap');
  // 畳・順目: イ草の目を1本またいだ「サラ」という微かな手応え
  grainSmoothPlayer = new Player({
    Pattern: [
      {
        Event: {
          Time: 0.0,
          EventType: 'HapticTransient',
          EventParameters: [
            { ParameterID: 'HapticIntensity', ParameterValue: 0.3 },
            { ParameterID: 'HapticSharpness', ParameterValue: 0.35 },
          ],
        },
      },
    ],
  });
  // 畳・逆目: 目に引っかかる「ガリッ」という鋭い手応え
  grainRoughPlayer = new Player({
    Pattern: [
      {
        Event: {
          Time: 0.0,
          EventType: 'HapticTransient',
          EventParameters: [
            { ParameterID: 'HapticIntensity', ParameterValue: 0.85 },
            { ParameterID: 'HapticSharpness', ParameterValue: 1.0 },
          ],
        },
      },
    ],
  });
  popPlayer = new Player({
    Pattern: [
      // 1. 膜が弾ける鋭い「パチッ」
      {
        Event: {
          Time: 0.0,
          EventType: 'HapticTransient',
          EventParameters: [
            { ParameterID: 'HapticIntensity', ParameterValue: 1.0 },
            { ParameterID: 'HapticSharpness', ParameterValue: 0.9 },
          ],
        },
      },
      // 2. 直後の空気が抜ける「ふしゅっ」(鈍く弱く減衰)
      {
        Event: {
          Time: 0.015,
          EventType: 'HapticContinuous',
          EventDuration: 0.08,
          EventParameters: [
            { ParameterID: 'HapticIntensity', ParameterValue: 0.45 },
            { ParameterID: 'HapticSharpness', ParameterValue: 0.2 },
          ],
        },
      },
    ],
  });
} catch (e) {
  popPlayer = null;
  grainSmoothPlayer = null;
  grainRoughPlayer = null;
}

// 畳の目を1本またいだときの振動。rough=true で逆目(ガリッ)、false で順目(サラ)
export function grainTickHaptic(rough) {
  const player = rough ? grainRoughPlayer : grainSmoothPlayer;
  if (player) {
    try {
      player.start();
      return;
    } catch (e) {
      // 失敗したらフォールバックへ
    }
  }
  if (rough) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
  } else {
    Haptics.selectionAsync();
  }
}

// プチを潰したときの振動
export function popHaptic() {
  if (popPlayer) {
    try {
      popPlayer.start();
      return;
    } catch (e) {
      // 失敗したらフォールバックへ
    }
  }
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft), 40);
}
