import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';

interface Props {
  currentStep: number;
  income: string;
  setIncome: (v: string) => void;
  savingsGoal: string;
  setSavingsGoal: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
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

export function Step2({ currentStep, income, setIncome, savingsGoal, setSavingsGoal, onNext, onBack }: Props) {
  const incomeNum = parseFloat(income) || 0;
  const savingsNum = parseFloat(savingsGoal) || 0;
  const remaining = incomeNum - savingsNum;

  const incomeError = income !== '' && incomeNum <= 0
    ? 'Le revenu doit être supérieur à 0 €'
    : null;
  const savingsError = income !== '' && savingsGoal !== '' && savingsNum >= incomeNum
    ? "L'objectif d'épargne doit être inférieur au revenu mensuel."
    : null;
  const canContinue = income !== '' && savingsGoal !== '' && !incomeError && !savingsError;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.dotsWrap}>
          <ProgressDots current={currentStep} />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Tes finances de base</Text>
          <Text style={styles.subtitle}>
            Ces informations peuvent être modifiées à tout moment dans les Réglages.
          </Text>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>Revenu mensuel net</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, incomeError ? styles.inputErr : null]}
                placeholder="ex: 1 800"
                placeholderTextColor={Colors.slate400}
                value={income}
                onChangeText={setIncome}
                keyboardType="decimal-pad"
                autoFocus
              />
              <View style={styles.suffix}><Text style={styles.suffixText}>€</Text></View>
            </View>
            {incomeError && <Text style={styles.error}>{incomeError}</Text>}
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>Objectif d'épargne mensuel</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, savingsError ? styles.inputErr : null]}
                placeholder="ex: 200"
                placeholderTextColor={Colors.slate400}
                value={savingsGoal}
                onChangeText={setSavingsGoal}
                keyboardType="decimal-pad"
              />
              <View style={styles.suffix}><Text style={styles.suffixText}>€</Text></View>
            </View>
            {savingsError && <Text style={styles.error}>{savingsError}</Text>}

            {income !== '' && savingsGoal !== '' && !savingsError && (
              <Text style={[styles.remaining, { color: remaining >= 0 ? Colors.green : Colors.red }]}>
                Il te restera {remaining.toFixed(0)} € pour tes dépenses
              </Text>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.nextBtn, !canContinue && styles.nextBtnDisabled]}
            onPress={onNext}
            disabled={!canContinue}
            activeOpacity={0.85}
          >
            <Text style={styles.nextBtnText}>Continuer →</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  dotsWrap: { paddingTop: 16, alignItems: 'center' },
  scroll: { flex: 1 },
  content: { padding: 24, gap: 20 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.slate800 },
  subtitle: { fontSize: 14, color: Colors.slate600, lineHeight: 21 },
  fieldBlock: { gap: 8 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.slate600 },
  inputRow: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1, backgroundColor: Colors.slate50, borderRadius: 9,
    borderWidth: 1, borderColor: Colors.slate200,
    paddingHorizontal: 14, paddingVertical: 14, fontSize: 16, color: Colors.slate800,
  },
  inputErr: { borderColor: Colors.red },
  suffix: { backgroundColor: Colors.slate100, borderRadius: 9, paddingHorizontal: 16, justifyContent: 'center' },
  suffixText: { fontSize: 16, fontWeight: '600', color: Colors.slate600 },
  error: { fontSize: 11, color: Colors.red },
  remaining: { fontSize: 13, fontWeight: '500' },
  footer: { padding: 24, gap: 10 },
  nextBtn: { backgroundColor: Colors.indigo, borderRadius: 99, paddingVertical: 15, alignItems: 'center' },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
  backBtn: { alignItems: 'center', paddingVertical: 8 },
  backBtnText: { fontSize: 14, color: Colors.slate600 },
});
