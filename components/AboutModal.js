import { Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { t } from '../i18n';

// プライバシーポリシーの公開URL(GitHub Pages等に置いたら差し替える)
const PRIVACY_URL = 'https://hanabi822.github.io/puchipuchi/privacy.html';

// 「このアプリについて」モーダル。クレジット表記とプライバシーポリシーへの入口
export default function AboutModal({ visible, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.title}>Puchi!</Text>
          {/* OtoLogic素材の利用条件で必須のクレジット表記 */}
          <Text style={styles.line}>{t('credit')}: OtoLogic (CC BY 4.0)</Text>
          <Pressable onPress={() => Linking.openURL(PRIVACY_URL)}>
            <Text style={styles.link}>{t('privacy')}</Text>
          </Pressable>
          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>{t('close')}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(40,40,31,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '78%',
    backgroundColor: '#f6f1e3', // 生成り
    borderRadius: 18,
    paddingVertical: 26,
    paddingHorizontal: 22,
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontFamily: 'ZenMaruGothic_900Black',
    color: '#355C7D',
  },
  line: {
    fontSize: 13,
    fontFamily: 'ZenMaruGothic_500Medium',
    color: '#5c5443',
  },
  link: {
    fontSize: 13,
    fontFamily: 'ZenMaruGothic_700Bold',
    color: '#355C7D',
    textDecorationLine: 'underline',
  },
  closeBtn: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 28,
    borderRadius: 999,
    backgroundColor: '#355C7D',
  },
  closeText: {
    fontSize: 14,
    fontFamily: 'ZenMaruGothic_700Bold',
    color: '#f6f1e3',
  },
});
