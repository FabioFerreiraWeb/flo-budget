import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconCreditCard, IconCoin, IconChartBar } from '@tabler/icons-react-native';
import { Colors } from '../../constants/Colors';
import { useLanguage } from '../../context/LanguageContext';

interface Props {
  currentStep: number;
  onNext: () => void;
}

function ProgressDots({ current }: { current: number }) {
  return (
    <View style={dotStyles.row}>
      {[1, 2, 3].map(i => (
        <View
          key={i}
          style={[dotStyles.dot, { width: i === current ? 20 : 8, backgroundColor: i === current ? Colors.indigo : Colors.slate200 }]}
        />
      ))}
    </View>
  );
}

const dotStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { height: 6, borderRadius: 99 },
});

export function Step1({ currentStep, onNext }: Props) {
  const { t } = useLanguage();
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.dotsWrap}>
        <ProgressDots current={currentStep} />
      </View>

      <View style={styles.center}>
        <Text style={styles.illustration}>💰</Text>
        <Text style={styles.title}>{t.onboarding.step1Title}</Text>
        <Text style={styles.subtitle}>{t.onboarding.step1Sub}</Text>

        <View style={styles.features}>
          <View style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <IconCreditCard size={20} color={Colors.indigo} />
            </View>
            <Text style={styles.featureText}>{t.onboarding.step1Point1}</Text>
          </View>
          <View style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <IconCoin size={20} color={Colors.green} />
            </View>
            <Text style={styles.featureText}>{t.onboarding.step1Point2}</Text>
          </View>
          <View style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <IconChartBar size={20} color={Colors.amber} />
            </View>
            <Text style={styles.featureText}>{t.onboarding.step1Point3}</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextBtn} onPress={onNext} activeOpacity={0.85}>
          <Text style={styles.nextBtnText}>{t.onboarding.step1Btn}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  dotsWrap: { paddingTop: 16, alignItems: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 16 },
  illustration: { fontSize: 72 },
  title: { fontSize: 26, fontWeight: '700', color: Colors.slate800, textAlign: 'center' },
  subtitle: { fontSize: 15, color: Colors.slate600, textAlign: 'center', lineHeight: 22 },
  features: { gap: 12, width: '100%', marginTop: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  featureIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.slate50, alignItems: 'center', justifyContent: 'center',
  },
  featureText: { fontSize: 14, color: Colors.slate700, flex: 1 },
  footer: { padding: 24 },
  nextBtn: { backgroundColor: Colors.indigo, borderRadius: 99, paddingVertical: 15, alignItems: 'center' },
  nextBtnText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
});
