import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconAdjustments } from '@tabler/icons-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/Colors';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';

function getNextMonthLabel(locale: string): string {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return next.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
}

function getPrevMonthLabel(lastMonth: string, locale: string): string {
  const [year, month] = lastMonth.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString(locale, { month: 'long' });
}

export default function NewMonthModal() {
  const { t, locale } = useLanguage();
  const { data, startNewMonth } = useApp();
  const router = useRouter();

  const nextLabel = getNextMonthLabel(locale);
  const nextLabelCapital = nextLabel.charAt(0).toUpperCase() + nextLabel.slice(1);
  const prevLabel = data.lastOpenedMonth ? getPrevMonthLabel(data.lastOpenedMonth, locale) : 'avant';

  const handleCarry = () => {
    startNewMonth('carry');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Big faded background title */}
      <View style={styles.bgTitle} pointerEvents="none">
        <Text style={styles.bgTitleText}>{nextLabelCapital}</Text>
      </View>

      {/* Bottom sheet panel */}
      <View style={styles.sheet}>
        <View style={styles.handle} />

        <Text style={styles.title}>{t.monthReset.newMonthTitle}</Text>
        <Text style={styles.sub}>{nextLabelCapital} — {t.monthReset.newMonthSub}</Text>

        <TouchableOpacity style={styles.primaryBtn} onPress={handleCarry} activeOpacity={0.85}>
          <Text style={styles.primaryBtnTitle}>⚡ {t.monthReset.carry}</Text>
          <Text style={styles.primaryBtnSub}>
            {t.monthReset.carrySub.replace('{prevLabel}', prevLabel)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.replace('/modals/customize-month')}
          activeOpacity={0.85}
        >
          <View style={styles.secondaryIcon}>
            <IconAdjustments size={16} color={Colors.indigo} />
          </View>
          <View style={styles.secondaryBtnText}>
            <Text style={styles.secondaryBtnTitle}>{t.monthReset.customize}</Text>
            <Text style={styles.secondaryBtnSub}>{t.monthReset.customizeSub}</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.note}>{t.monthReset.settingsNote}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.slate50, justifyContent: 'flex-end' },
  bgTitle: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bgTitleText: {
    fontSize: 52,
    fontWeight: '700',
    color: Colors.slate200,
    textTransform: 'capitalize',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.slate200,
    borderRadius: 99,
    alignSelf: 'center',
    marginBottom: 6,
  },
  title: { fontSize: 20, fontWeight: '700', color: Colors.slate800, textAlign: 'center' },
  sub: { fontSize: 13, color: Colors.slate600, textAlign: 'center', marginTop: -6 },
  primaryBtn: {
    backgroundColor: Colors.indigo,
    borderRadius: 13,
    padding: 16,
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  primaryBtnTitle: { fontSize: 16, fontWeight: '700', color: Colors.white },
  primaryBtnSub: { fontSize: 12, color: Colors.indigoMid },
  secondaryBtn: {
    backgroundColor: Colors.white,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: Colors.slate200,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  secondaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.indigoLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: { flex: 1 },
  secondaryBtnTitle: { fontSize: 14, fontWeight: '600', color: Colors.slate800 },
  secondaryBtnSub: { fontSize: 12, color: Colors.slate400, marginTop: 2 },
  note: { fontSize: 12, color: Colors.slate400, textAlign: 'center' },
});
