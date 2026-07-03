// app.json を読み込み、Firebase設定ファイルの場所だけ環境に応じて切り替える
// ・EASビルド上: シークレット GOOGLE_SERVICES_PLIST(ファイルパスが入る)
// ・手元: プロジェクト直下の GoogleService-Info.plist
const appJson = require('./app.json');

module.exports = () => ({
  ...appJson.expo,
  ios: {
    ...appJson.expo.ios,
    googleServicesFile: process.env.GOOGLE_SERVICES_PLIST ?? './GoogleService-Info.plist',
  },
});
