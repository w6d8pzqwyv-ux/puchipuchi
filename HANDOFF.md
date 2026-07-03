# 引き継ぎ書 — Puchi!

## 現在地
- アプリ名: **Puchi!**（触覚あそびアプリ。指で触ると振動＋音＋アニメが返る癒し系）
- 技術: React Native + Expo SDK 54（※Expo GoがSDK54までのため54に固定。元は56で作成）
- bundleId: `com.hanabi822.puchipuchi` / EAS projectId は app.json 内
- 公開状態: **未公開**（開発ビルドで実機確認中の段階）
- 直近の変更: Claude Designの引き継ぎに沿ってUI刷新（配色統一・タブバー・広告トレイ・フォント・起動画面）＋みず/たたみの作り込み

## このセッションでやったこと（事実）
- 4つの触感を実装:
  - **ぷち** `screens/BubbleWrapScreen.js`: プチプチ潰し。なでで連続破裂、破裂輪＋しぼみアニメ、効果音(pop.wav・OtoLogic素材)、Core Haptics版の「パチッ」(`haptics.js`)。隠しキャラ(マスコット)がプチ裏にアホ毛だけ出して隠れ→潰すと驚いて左右ランダムに逃走→逃走中タップで捕獲。捕獲数はAsyncStorageに保存し右上にバッジ表示
  - **ぷに** `screens/PunipuniScreen.js`: 塊を引っ張ると方向に伸びる、長押しで脈動、約1/100で破裂→再生成
  - **たたみ** `screens/TatamiScreen.js`: 6畳の回し敷き。畳ごとに目の向きを判定して順目=サラサラ/逆目=ガリガリ。へり=ツルッ＋跨ぎでコツッ。昭和の小物(TV=静電気パチッ/こたつ=ふかふか/みかん=つぶつぶ/猫=ゴロゴロ)
  - **みず** `screens/WaterScreen.js`: タップで波紋＋とぷん振動。桜の花びらが漂う。魚の影が6〜12秒ごとに横切り、タップ/なでで捕獲(fish_caught計測)
- 多言語 `i18n.js`: 13言語（日英中韓ヒンディー・インドネシア・ポルトガル・スペイン・ロシア・仏伊蘭独）
- マスコット画像 `assets/character/`(peek/surprised/run) = ユーザーがChatGPTで生成→こちらで3分割＆透過処理。Claudeの擬人化キャラ（オレンジ髪・白パーカー・アホ毛）。**オリジナル扱い（ずんだもん等ではない）**
- 昭和小物 `assets/showa/`(tv/kotatsu/cat) も同様に生成→分割
- アプリアイコン `assets/icon.png`: 濃紺#185FA5にプチの「!」。sharpで生成済み
- 広告(AdMob): `AdBanner.js`。バナーを生成りの「盆」トレイで囲む。開発中はテスト広告、本番のみ実ID。ATT(トラッキング許可)実装済み
- Firebase Analytics: `analytics.js`。feel_selected/char_caught/blob_burst/fish_caught を計測
- **Claude Designの引き継ぎ実装**（`design-handoff/`にzip展開済み。handoff.mdが実装指示書）:
  - 全画面を生成り/アースカラーに配色統一（§2）
  - タブバー刷新 `components/TabBar.js` + アイコン `components/FeelIcon.js`（選択色は藍#355C7D）
  - 広告トレイ化、フォント Zen Maru Gothic/Yuji Syuku を expo-font でバンドル
  - 起動画面 `components/Splash.js`（生成り地＋泡＋ロゴ＋「ふれて、ととのう。」＋右下マスコット）

## 未完了・次にやること（優先度順）
1. **他画面の賑やかさ強化**: みずは花びら＋魚を追加済み。**ぷに（漂うぷに＋マスコット覗き）・たたみ（猫の呼吸・湯気・ホコリのきらめき）が未着手**
2. **UI刷新の実機確認**: TabBar/Splash/フォント/広告トレイは新ネイティブ部品(react-native-svg等)を含むため**要EAS再ビルド**。ビルド後に見た目確認が必要
3. **リリース準備**: OtoLogicクレジット表記（設定画面 or 説明文に「効果音：OtoLogic」必須）、プライバシーポリシー、App Store提出物（release-kitスキル活用可）
4. 出現率など最終調整（キャラ12%・破裂1/100・魚6〜12秒）

## つまずきと教訓（事実）
- Expo GoがSDK54までしか対応せず、SDK56で作ったプロジェクトを54へダウングレードした。以後は54基準
- 効果音の頭に0.11秒の無音があり再生が遅れて感じた→ffmpegで無音カット＋WAV化で解決。音は即再生・振動を遅らせて同期させる方式
- SVGで可愛いキャラは描けない→画像生成AI（ChatGPT）に依頼し、こちらで分割・透過するのが正解
- Firebase iOSビルドで "non-modular header" エラー→ app.json の expo-build-properties に `forceStaticLinking: ["RNFBApp","RNFBAnalytics"]` を追加して解決
- 開発ビルドで "No development servers found" はエラーではない→ `npx expo start --dev-client` でサーバー起動が必要

## 触ってはいけないもの・注意点
- `assets/icon.png` はアイコン確定済み（変更不要）
- 広告の本番IDは `AdBanner.js` にあり、**自分で本物の広告をタップしない**（規約違反）。開発中は必ずテスト広告
- 機密情報: GoogleService-Info.plist はプロジェクト直下に配置済み（Gitに上げない想定）
- キャラ出現率 `CHAR_CHANCE` は本番0.12。テストで一時的に上げたら戻すこと
- 新ネイティブ部品を足したら必ずEAS再ビルド（JSだけの変更はリロードで反映）

## 更新日
2026-07-04
