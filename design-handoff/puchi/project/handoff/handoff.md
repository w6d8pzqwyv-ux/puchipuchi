# Puchi! UIデザイン引き渡し（Claude Code 用）

> 案：**昭和レトロ × 生成り／アースカラー**。アンカーは「たたみ」画面。
> タブバーは **案A（縁側バー）で確定**。出力はRN（Expo v56）へ翻訳する前提。
> ※ビジュアルの正解は各ボードの PNG（キャンバスの「⋯」→ Download PNG）を参照。
> ※コードは**参考実装**。`react-native-svg` は安定APIだが、RNスタイルは Expo v56 で要確認。

---

## 0. 最重要メモ（先に読む）

- **選択アクセントは藍色 `#355C7D`**（＝昭和の藍染め）。これは**ブランド紺 `#185FA5` とは別物**。
  紺は「アプリアイコンのまま」で変更不要。UIの選択状態は `#355C7D` を使う。
- 各画面の地色は**退色トーンへ寄せて統一**（下の対応表で find→replace すればよい）。
- 白い広告枠は廃止し、**生成りの“盆”トレイ**に収めて馴染ませる（§3）。
- フォントは丸ゴシック **Zen Maru Gothic**（UI・本文）＋ **Yuji Syuku**（ロゴ・差し色の和文）。
  RNでは `expo-font` でバンドルして使う。

---

## 1. カラートークン

```js
// theme.js
export const colors = {
  // 生成り / 木 / 墨 ── 共通クローム
  paper:    '#EFE6D2',  paper2:  '#E6D9BD',  paper3: '#F6EFDE',
  wood:     '#9A7650',  woodDark:'#6E523A',
  sumi:     '#3D382E',  sumiSoft:'#837754',
  // アクセント
  ai:       '#355C7D',  aiDeep:  '#243F54',  // 藍（選択状態）
  shu:      '#C75D43',                       // 朱（控えめな暖アクセント）
  matcha:   '#93A86A',  heri:    '#23281F',  // 若草・畳のへり
};
```

## 2. 各画面の地色：現状 → 統一後

`screens/*.js` の `StyleSheet` を以下で置換。

### ぷち `BubbleWrapScreen.js`
| 対象 | 現状 | 統一後 |
|---|---|---|
| container bg | `#dce8f2` | **`#d3ddd9`**（古陶器のブルーグレー） |
| bubble bg | `#f4f9fd` | **`#eef4ef`**（中心ハイライト `#fbfdfb` のradial推奨） |
| bubble border | `#b8cfe0` | **`#b6c5bb`** |
| bubble popped bg / border | `#c3d6e4` / `#a5becf` | **`#c2cfc6`** / **`#aab9af`** |
| ring border | `#8fb8d4` | **`#9fb6ab`** |
| bubble shadow | `#5a7d99` | **`rgba(70,90,80,.35)`** |

### ぷに `PunipuniScreen.js`
| 対象 | 現状 | 統一後 |
|---|---|---|
| container bg | `#fdf0f4` | **`#f1e2db`**（くすみ桜） |
| blob bg | `#f7c8d8` | **`#e6b3bd`** |
| blob border | `#eba8c0` | **`#d295a0`** |
| highlight | `#fde6ee` | **`rgba(253,235,240,.85)`** |

### たたみ `TatamiScreen.js`（アンカー：ほぼ現状維持）
| 対象 | 現状 | 統一後 |
|---|---|---|
| container bg | `#e3dac4` | **`#e3dac4`**（そのまま） |
| 畳 matInner | `#b6c489` | **`#93a86a`**（やや沈めて統一・任意） |
| へり | `#23281f` | **`#23281f`**（そのまま） |
| room border（敷居） | `#8a6f4d` | **`#9a7650`** |
| なで跡 trace | `#e2ecbe` | **`#d8e2bc`** |

### みず `WaterScreen.js`
| 対象 | 現状 | 統一後 |
|---|---|---|
| container bg | `#1d4e6b` | **`#2a4a5f`**（藍染めの深水） |
| ripple border | `#bfe3f2` | **`#cfe0dd`** |

---

## 3. タブバー（案A・縁側バー）＋ 広告トレイ

現状の `App.js` の `tabBar` を差し替える。構造は「アイコン＋ラベルの縦並び」を4等分。

### 寸法・スタイル
- **バー**：bg `#EFE6D2`、上辺 `borderTopWidth: 2.5, borderTopColor: '#9A7650'`、
  `paddingTop: 9`、`paddingBottom: insets.bottom + 12`（セーフエリア）。
- **各タブ**：`flex: 1`、中央寄せ。内側に `padding: 7px 12px 6px`、`borderRadius: 16`、`gap: 4`。
- **アイコン**：サイズ **26**。非選択＝**線（stroke）/ `#837754`**、選択＝**塗り（fill）/ `#355C7D`**。
- **ラベル**：Zen Maru Gothic、`fontSize: 11.5`、`letterSpacing: 0.3`。
  非選択＝`#837754 / weight 500`、選択＝`#355C7D / weight 700`。
- **選択中の下地**：生成りの浅い隆起。
  `backgroundColor: '#F2E9D6'`（webは `#f8f1e0→#ece0c6` のグラデ）、
  `borderWidth: 1, borderColor: 'rgba(53,92,125,0.18)'`、軽い `elevation: 1`。

```jsx
// TabBar.jsx（参考実装：react-native-svg 使用）
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FeelIcon from './FeelIcon';
import { t } from './i18n';

const FEELS = [
  { key: 'puchi', icon: 'puchi' },
  { key: 'puni',  icon: 'puni'  },
  { key: 'tatami',icon: 'tatami'},
  { key: 'mizu',  icon: 'mizu'  },
];

export default function TabBar({ active, onSelect }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.bar, { paddingBottom: insets.bottom + 12 }]}>
      {FEELS.map((f) => {
        const on = f.key === active;
        const color = on ? '#355C7D' : '#837754';
        return (
          <Pressable key={f.key} onPress={() => onSelect(f.key)} style={s.tab}>
            <View style={[s.inner, on && s.innerOn]}>
              <FeelIcon name={f.icon} filled={on} color={color} size={26} />
              <Text style={[s.label, { color, fontWeight: on ? '700' : '500' }]}>
                {t(f.key)}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: 'row', backgroundColor: '#EFE6D2',
         borderTopWidth: 2.5, borderTopColor: '#9A7650', paddingTop: 9 },
  tab: { flex: 1, alignItems: 'center' },
  inner: { alignItems: 'center', gap: 4, paddingHorizontal: 12,
           paddingTop: 7, paddingBottom: 6, borderRadius: 16 },
  innerOn: { backgroundColor: '#F2E9D6', borderWidth: 1,
             borderColor: 'rgba(53,92,125,0.18)' },
  label: { fontFamily: 'ZenMaruGothic_700Bold', fontSize: 11.5, letterSpacing: 0.3 },
});
```

### 広告トレイ（`AdBanner.js` を包む）
白いバナーをそのまま出さず、生成りの“盆”で囲う。`BannerAd` は中の `slot` に入れる。
- 外側 padding `8/14/6`。トレイ：`borderRadius: 14, padding: 6`、bg `#F1E6CC`（webはグラデ `#f4ecda→#e9ddc2`）、
  `borderWidth: 1, borderColor: 'rgba(154,118,80,0.30)'`。
- 内側に**破線**：`inset 3` に `1.5px dashed rgba(154,118,80,0.40)`（RNは `borderStyle:'dashed'` の重ね `View`）。
- **「広告」タグ**：左上に被せる。bg `#9A7650`、文字 `#F6EFDE`、`fontSize 9.5 / weight 700 / letterSpacing 1`、`padding 1.5/8`、`borderRadius 7`、`top:-8, left:14`。
- バナー枠：`backgroundColor:'#FBFAF6', borderRadius: 9`（高さは ANCHORED_ADAPTIVE のまま）。

---

## 4. アイコン（react-native-svg・viewBox 28×28）

`filled` で 線↔塗り を切り替え。`color` は §3 のとおり渡す。

```jsx
// FeelIcon.jsx
import Svg, { Circle, Rect, Line, Path } from 'react-native-svg';

export default function FeelIcon({ name, filled, color = '#000', size = 28 }) {
  const p = { width: size, height: size, viewBox: '0 0 28 28' };
  const st = { stroke: color, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' };
  const F = filled ? color : 'none';
  const wh = 'rgba(255,255,255,0.85)';

  if (name === 'puchi') return (
    <Svg {...p}>
      <Circle cx="9.5" cy="9.5" r="4.6" {...st} fill={F} />
      <Circle cx="19" cy="10.5" r="4.6" {...st} fill={F} />
      <Circle cx="9" cy="19.5" r="4.6" {...st} fill={F} />
      <Circle cx="18.7" cy="19.7" r="4.6" stroke={color} strokeWidth="2"
        fill={filled ? 'rgba(0,0,0,0.18)' : 'none'} strokeDasharray={filled ? '' : '2.4 2.4'} />
      {filled && <Circle cx="8.1" cy="8.1" r="1.2" fill={wh} />}
      {filled && <Circle cx="17.6" cy="9.1" r="1.2" fill={wh} />}
    </Svg>
  );

  if (name === 'puni') return (
    <Svg {...p}>
      <Path {...st} fill={F}
        d="M14 4.4C19.6 4.4 24 8.2 24 13.2C24 19.4 20 23.6 14 23.6C8 23.6 4 19.8 4 14C4 8.6 8.6 4.4 14 4.4Z" />
      <Path d="M9.4 9.2C10.8 7.6 12.6 7.4 13.4 8.4"
        stroke={filled ? wh : color} strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </Svg>
  );

  if (name === 'tatami') return (
    <Svg {...p}>
      <Rect x="3.5" y="6" width="21" height="16" rx="2.4" {...st} fill={F} />
      <Line x1="3.5" y1="10" x2="24.5" y2="10" stroke={filled ? 'rgba(255,255,255,0.55)' : color} strokeWidth="1.6" />
      <Line x1="3.5" y1="18" x2="24.5" y2="18" stroke={filled ? 'rgba(255,255,255,0.55)' : color} strokeWidth="1.6" />
      {[9,14,19].map((x) => (
        <Line key={x} x1={x} y1="12" x2={x} y2="16" stroke={filled ? 'rgba(255,255,255,0.5)' : color} strokeWidth="1.4" />
      ))}
    </Svg>
  );

  if (name === 'mizu') return (
    <Svg {...p}>
      <Path {...st} fill={F}
        d="M14 3.5C14 3.5 21 11 21 15.4C21 19.4 17.9 22.2 14 22.2C10.1 22.2 7 19.4 7 15.4C7 11 14 3.5 14 3.5Z" />
      {filled && <Path d="M11.4 14.4C11.4 12.6 12.4 11.2 13.6 10.6"
        stroke={wh} strokeWidth="2" fill="none" strokeLinecap="round" />}
    </Svg>
  );

  return null;
}
```

### 将来タブ用アイコン（拡張前提：チクチク／ザラザラ／さざ波）
キャンバスの `puchi-icons.jsx` に `chiku` / `zara` / `sazanami` も実装済み。追加時はそのパスを移植。

---

## 5. ロゴ / 起動画面

- **ワードマーク**：「Puchi」＝ Zen Maru Gothic 900 / `#243F54`。
  「!」＝**アイコンの泡**（水色 `#AEDDF2` のradial＋白ハイライト）＋下に点 `#AEDDF2`。
- **起動画面**：生成りのradial地（`#F6EFDE→#EFE6D2→#E6D9BD`）、薄い泡を散らす、
  タグライン「ふれて、ととのう。」（Yuji Syuku / `#837754` / letterSpacing 3）。
- **マスコットは起動画面のみ**：`assets/character/peek.png` を右下から覗かせる。
- **アプリアイコン**：`assets/icon.png` のまま（変更なし）。

---

## 6. 受け渡しチェックリスト
- [ ] §2 の地色を4画面に反映
- [ ] §3 のタブバー（案A）＋広告トレイに差し替え（`#355C7D` を選択色に）
- [ ] §4 の `FeelIcon` を追加
- [ ] Zen Maru Gothic / Yuji Syuku を `expo-font` でバンドル
- [ ] §5 の起動画面・ロゴ
- [ ] 各ボードの PNG を見た目の正解として添付
