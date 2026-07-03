import { Pressable, Text, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FeelIcon from './FeelIcon';
import { t } from '../i18n';

const FEELS = [
  { key: 'puchi', icon: 'puchi' },
  { key: 'puni', icon: 'puni' },
  { key: 'tatami', icon: 'tatami' },
  { key: 'mizu', icon: 'mizu' },
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
  bar: {
    flexDirection: 'row',
    backgroundColor: '#EFE6D2',
    borderTopWidth: 2.5,
    borderTopColor: '#9A7650',
    paddingTop: 9,
  },
  tab: { flex: 1, alignItems: 'center' },
  inner: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingTop: 7,
    paddingBottom: 6,
    borderRadius: 16,
  },
  innerOn: {
    backgroundColor: '#F2E9D6',
    borderWidth: 1,
    borderColor: 'rgba(53,92,125,0.18)',
  },
  label: {
    fontFamily: 'ZenMaruGothic_700Bold',
    fontSize: 11.5,
    letterSpacing: 0.3,
  },
});
