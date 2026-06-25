import { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/Colors';
import { useApp } from '../../context/AppContext';
import { ProgressBar } from '../../components/ProgressBar';
import { useLanguage } from '../../context/LanguageContext';

export default function AllocateGoalModal() {
  const { t } = useLanguage();
  const { data, allocateToGoal } = useApp();
  const router = useRouter();
  const { goalId } = useLocalSearchParams<{ goalId: string }>();

  const goal = data.savingsGoals.find(g => g.id === goalId);
  const [amount, setAmount] = useState('');

  if (!goal) return null;

  const parsed = parseFloat(amount) || 0;
  const previewAllocated = goal.allocatedAmount + parsed;
  const previewPct = goal.targetAmount > 0 ? (previewAllocated / goal.targetAmount) * 100 : 0;
  const overMax = parsed > 0 && parsed > data.freeSavings;
  const isValid = parsed > 0 && parsed <= data.freeSavings;

  const handleAllocate = () => {
    if (!isValid) return;
    allocateToGoal(goal.id, parsed);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <Text style={styles.title}>{t.goalModal.allocateTitle} "{goal.name}" {goal.emoji}</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.cagnotteCard}>
            <Text style={styles.cagnotteLabel}>{t.goalModal.availablePool}</Text>
            <Text style={styles.cagnotteAmount}>{data.freeSavings.toFixed(2)} €</Text>
          </View>

          <Text style={styles.label}>{t.goalModal.amountToAllocate}</Text>
          <View style={styles.amountRow}>
            <TextInput
              style={[styles.input, styles.amountInput, overMax && styles.inputError]}
              placeholder="0"
              placeholderTextColor={Colors.slate400}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              autoFocus
            />
            <View style={styles.euroTag}><Text style={styles.euroText}>€</Text></View>
          </View>

          <Text style={styles.disponible}>{t.goalModal.available} : {data.freeSavings.toFixed(2)} €</Text>

          {overMax && (
            <Text style={styles.error}>
              {t.errors.allocationExceedsPool.replace('{amount}', data.freeSavings.toFixed(2))}
            </Text>
          )}

          {parsed > 0 && !overMax && (
            <View style={styles.previewCard}>
              <Text style={styles.previewLabel}>{t.goalModal.preview}</Text>
              <View style={styles.previewAmounts}>
                <Text style={styles.previewValue}>{previewAllocated.toFixed(0)} €</Text>
                <Text style={styles.previewSep}>/</Text>
                <Text style={styles.previewTarget}>{goal.targetAmount.toFixed(0)} €</Text>
              </View>
              <ProgressBar percentage={previewPct} height={6} color={Colors.amber} />
            </View>
          )}

          <Text style={styles.note}>{t.goalModal.allocateNote}</Text>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveBtn, !isValid && styles.saveBtnDisabled]}
            onPress={handleAllocate}
            disabled={!isValid}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>{t.goalModal.allocateBtn}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  handle: { width: 36, height: 4, backgroundColor: Colors.slate200, borderRadius: 99, alignSelf: 'center', marginTop: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.slate100 },
  title: { fontSize: 15, fontWeight: '600', color: Colors.slate800, flex: 1, marginRight: 8 },
  closeBtn: { padding: 6 },
  closeText: { fontSize: 16, color: Colors.slate400 },
  content: { flex: 1, padding: 16, gap: 8 },
  cagnotteCard: { backgroundColor: Colors.amberLight, borderRadius: 13, padding: 13, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cagnotteLabel: { fontSize: 13, color: Colors.amber, fontWeight: '500' },
  cagnotteAmount: { fontSize: 16, fontWeight: '700', color: Colors.amber },
  label: { fontSize: 12, fontWeight: '600', color: Colors.slate600 },
  amountRow: { flexDirection: 'row', gap: 8 },
  amountInput: { flex: 1 },
  input: { backgroundColor: Colors.slate50, borderRadius: 9, borderWidth: 1, borderColor: Colors.slate200, paddingHorizontal: 13, paddingVertical: 12, fontSize: 14, color: Colors.slate800 },
  inputError: { borderColor: Colors.red },
  euroTag: { backgroundColor: Colors.slate100, borderRadius: 9, paddingHorizontal: 14, justifyContent: 'center' },
  euroText: { fontSize: 16, fontWeight: '600', color: Colors.slate600 },
  disponible: { fontSize: 11, color: Colors.slate400 },
  error: { fontSize: 11, color: Colors.red },
  previewCard: { backgroundColor: Colors.slate50, borderRadius: 13, padding: 13, gap: 8 },
  previewLabel: { fontSize: 11, color: Colors.slate400, fontWeight: '500' },
  previewAmounts: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  previewValue: { fontSize: 18, fontWeight: '700', color: Colors.slate800 },
  previewSep: { fontSize: 14, color: Colors.slate400 },
  previewTarget: { fontSize: 14, color: Colors.slate600 },
  note: { fontSize: 11, color: Colors.slate400, textAlign: 'center', marginTop: 4 },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: Colors.slate100 },
  saveBtn: { backgroundColor: Colors.amber, borderRadius: 99, paddingVertical: 15, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { color: Colors.white, fontSize: 15, fontWeight: '600' },
});
