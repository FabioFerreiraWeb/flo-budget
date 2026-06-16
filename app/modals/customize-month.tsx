import { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/Colors';
import { useApp } from '../../context/AppContext';
import { Category, MonthConfig } from '../../types';

function getCurrentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Alimentation', emoji: '🍽️', budget: 400 },
  { id: '2', name: 'Transport', emoji: '🚗', budget: 150 },
  { id: '3', name: 'Loisirs', emoji: '🎬', budget: 200 },
  { id: '4', name: 'Santé', emoji: '💊', budget: 100 },
];

export default function CustomizeMonthModal() {
  const { data, setMonthConfig, startNewMonth } = useApp();
  const router = useRouter();

  const isFirstLaunch = !data.currentMonthConfig;
  const monthKey = getCurrentMonthKey();
  const monthLabel = getMonthLabel(monthKey);

  const prevConfig = data.currentMonthConfig;
  const prevSummary = data.monthSummaries[data.monthSummaries.length - 1];

  const [income, setIncome] = useState(String(prevConfig?.income ?? ''));
  const [savingsGoal, setSavingsGoal] = useState(String(prevConfig?.savingsGoal ?? ''));
  const [categories, setCategories] = useState<Category[]>(
    prevConfig?.categories ?? DEFAULT_CATEGORIES
  );

  const incomeNum = parseFloat(income);
  const savingsNum = parseFloat(savingsGoal);
  const incomeError = income !== '' && incomeNum <= 0
    ? 'Le revenu doit être supérieur à 0 €'
    : null;
  const savingsError = income !== '' && savingsGoal !== '' && savingsNum >= incomeNum
    ? "L'objectif d'épargne doit être inférieur au revenu mensuel."
    : null;
  const canSubmit = income !== '' && savingsGoal !== '' && !incomeError && !savingsError;

  const updateCategory = (id: string, field: keyof Category, value: string | number) => {
    setCategories(cats => cats.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const addCategory = () => {
    const newCat: Category = {
      id: Date.now().toString(),
      name: 'Nouvelle catégorie',
      emoji: '📦',
      budget: 100,
    };
    setCategories(cats => [...cats, newCat]);
  };

  const removeCategory = (id: string) => {
    if (categories.length <= 1) return;
    Alert.alert('Supprimer', 'Supprimer cette catégorie ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => setCategories(cats => cats.filter(c => c.id !== id)) },
    ]);
  };

  const handleStart = () => {
    if (!canSubmit) return;
    const config: MonthConfig = {
      monthKey,
      income: incomeNum,
      savingsGoal: savingsNum,
      categories,
    };
    if (isFirstLaunch) {
      setMonthConfig(config);
    } else {
      startNewMonth('customize', config);
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Personnaliser {monthLabel}</Text>
            <Text style={styles.sub}>Modifie ce qui a changé</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Revenu mensuel</Text>
          <View style={styles.amountRow}>
            <TextInput
              style={[styles.input, styles.amountInput, incomeError ? styles.inputErr : null]}
              placeholder="2000"
              placeholderTextColor={Colors.slate400}
              value={income}
              onChangeText={setIncome}
              keyboardType="decimal-pad"
            />
            <View style={styles.euroTag}><Text style={styles.euroText}>€</Text></View>
          </View>
          {incomeError && <Text style={styles.error}>{incomeError}</Text>}

          <Text style={styles.label}>Objectif épargne</Text>
          <View style={styles.amountRow}>
            <TextInput
              style={[styles.input, styles.amountInput, savingsError ? styles.inputErr : null]}
              placeholder="300"
              placeholderTextColor={Colors.slate400}
              value={savingsGoal}
              onChangeText={setSavingsGoal}
              keyboardType="decimal-pad"
            />
            <View style={styles.euroTag}><Text style={styles.euroText}>€</Text></View>
          </View>
          {savingsError && <Text style={styles.error}>{savingsError}</Text>}

          <View style={styles.catsHeader}>
            <Text style={styles.sectionLabel}>CATÉGORIES</Text>
            <TouchableOpacity onPress={addCategory} style={styles.addCatBtn}>
              <Text style={styles.addCatText}>+ Ajouter</Text>
            </TouchableOpacity>
          </View>

          {categories.map(cat => {
            const wasOverBudget = prevSummary?.categories.find(c => c.id === cat.id);
            const prevCatExpenses = data.expenses.filter(e => e.categoryId === cat.id && e.monthKey === prevSummary?.monthKey);
            const prevSpent = prevCatExpenses.reduce((s, e) => s + e.amount, 0);
            const isOver = wasOverBudget && prevSpent > wasOverBudget.budget;

            return (
              <View key={cat.id} style={[styles.catRow, isOver && styles.catRowWarn]}>
                <TextInput
                  style={styles.catEmoji}
                  value={cat.emoji}
                  onChangeText={v => updateCategory(cat.id, 'emoji', v)}
                />
                <TextInput
                  style={[styles.input, styles.catName]}
                  value={cat.name}
                  onChangeText={v => updateCategory(cat.id, 'name', v)}
                />
                <TextInput
                  style={[styles.input, styles.catBudget]}
                  value={String(cat.budget)}
                  onChangeText={v => updateCategory(cat.id, 'budget', parseFloat(v) || 0)}
                  keyboardType="decimal-pad"
                />
                <Text style={styles.catEuro}>€</Text>
                <TouchableOpacity onPress={() => removeCategory(cat.id)} style={styles.delBtn}>
                  <Text style={styles.delText}>✕</Text>
                </TouchableOpacity>
                {isOver && (
                  <Text style={styles.warnText}>⚠ Dépassée le mois dernier</Text>
                )}
              </View>
            );
          })}

          <View style={{ height: 20 }} />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveBtn, !canSubmit && styles.saveBtnDisabled]}
            onPress={handleStart}
            disabled={!canSubmit}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>Démarrer {monthLabel} →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.slate50 },
  header: { paddingHorizontal: 16, paddingVertical: 14, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.slate200 },
  title: { fontSize: 17, fontWeight: '600', color: Colors.slate800 },
  sub: { fontSize: 11, color: Colors.slate400, marginTop: 2 },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 8 },
  label: { fontSize: 12, fontWeight: '600', color: Colors.slate600, marginTop: 4 },
  input: { backgroundColor: Colors.white, borderRadius: 9, borderWidth: 1, borderColor: Colors.slate200, paddingHorizontal: 13, paddingVertical: 12, fontSize: 14, color: Colors.slate800 },
  inputErr: { borderColor: Colors.red },
  error: { fontSize: 11, color: Colors.red, marginTop: -4 },
  amountRow: { flexDirection: 'row', gap: 8 },
  amountInput: { flex: 1 },
  euroTag: { backgroundColor: Colors.slate100, borderRadius: 9, paddingHorizontal: 14, justifyContent: 'center' },
  euroText: { fontSize: 16, fontWeight: '600', color: Colors.slate600 },
  catsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  sectionLabel: { fontSize: 10, fontWeight: '600', color: Colors.slate400, letterSpacing: 0.8 },
  addCatBtn: { backgroundColor: Colors.indigoLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99 },
  addCatText: { fontSize: 12, fontWeight: '600', color: Colors.indigo },
  catRow: { backgroundColor: Colors.white, borderRadius: 9, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  catRowWarn: { borderWidth: 1, borderColor: Colors.amber },
  catEmoji: { fontSize: 18, width: 36, textAlign: 'center' },
  catName: { flex: 1, minWidth: 80, paddingVertical: 8 },
  catBudget: { width: 70, paddingVertical: 8, textAlign: 'right' },
  catEuro: { fontSize: 14, color: Colors.slate600 },
  delBtn: { padding: 4 },
  delText: { fontSize: 14, color: Colors.slate400 },
  warnText: { width: '100%', fontSize: 11, color: Colors.amber, marginTop: 2 },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: Colors.slate200, backgroundColor: Colors.white },
  saveBtn: { backgroundColor: Colors.indigo, borderRadius: 99, paddingVertical: 15, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { color: Colors.white, fontSize: 15, fontWeight: '600' },
});
