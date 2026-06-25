import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/Colors';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function formatDateChip(d: Date, locale: string, today: string, yesterday: string): string {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = Math.round((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return today;
  if (diff === 1) return yesterday;
  return d.toLocaleDateString(locale, { weekday: 'short', day: 'numeric' });
}

export default function EditExpenseModal() {
  const { t, locale } = useLanguage();
  const { data, updateExpense } = useApp();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const expense = data.expenses.find(e => e.id === id);

  const [description, setDescription] = useState(expense?.description ?? '');
  const [amount, setAmount] = useState(expense ? String(expense.amount) : '');
  const [selectedCategoryId, setSelectedCategoryId] = useState(expense?.categoryId ?? '');
  const [selectedDate, setSelectedDate] = useState(() => expense ? new Date(expense.date) : new Date());

  useEffect(() => {
    if (!expense) router.back();
  }, []);

  const categories = data.currentMonthConfig?.categories ?? [];
  const isValid = description.trim() !== '' && parseFloat(amount) > 0 && selectedCategoryId !== '';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const pastDates: Date[] = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    return d;
  });
  if (expense) {
    const origDate = new Date(expense.date);
    origDate.setHours(0, 0, 0, 0);
    if (!pastDates.some(d => isSameDay(d, origDate))) {
      pastDates.push(origDate);
    }
  }

  const handleSave = () => {
    if (!isValid || !expense) return;
    updateExpense({
      ...expense,
      description: description.trim(),
      amount: parseFloat(amount),
      categoryId: selectedCategoryId,
      date: selectedDate.toISOString(),
    });
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    router.back();
  };

  if (!expense) return null;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{t.addExpense.editTitle}</Text>
            <Text style={styles.subtitle}>{t.addExpense.editSubtitle}</Text>
          </View>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>{t.addExpense.description}</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex : Restaurant entre potes"
            placeholderTextColor={Colors.slate400}
            value={description}
            onChangeText={setDescription}
          />

          <Text style={styles.label}>{t.addExpense.amount}</Text>
          <View style={styles.amountRow}>
            <TextInput
              style={[styles.input, styles.amountInput]}
              placeholder="0.00"
              placeholderTextColor={Colors.slate400}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
            <View style={styles.euroTag}>
              <Text style={styles.euroText}>€</Text>
            </View>
          </View>

          <Text style={styles.label}>{t.addExpense.category}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsScroll}>
            <View style={styles.pills}>
              {categories.map(cat => {
                const selected = selectedCategoryId === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.pill, selected && styles.pillSelected]}
                    onPress={() => setSelectedCategoryId(cat.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.pillEmoji}>{cat.emoji}</Text>
                    <Text style={[styles.pillText, selected && styles.pillTextSelected]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <Text style={styles.label}>{t.addExpense.date}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
            <View style={styles.datePills}>
              {pastDates.map((d, i) => {
                const isSelected = isSameDay(d, selectedDate);
                return (
                  <TouchableOpacity
                    key={i}
                    style={[styles.datePill, isSelected && styles.datePillSelected]}
                    onPress={() => setSelectedDate(d)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.datePillText, isSelected && styles.datePillTextSelected]}>
                      {formatDateChip(d, locale, t.addExpense.today, t.addExpense.yesterday)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveBtn, !isValid && styles.saveBtnDisabled]}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>{t.addExpense.editSave}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.slate200,
    borderRadius: 99,
    alignSelf: 'center',
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.slate100,
  },
  title: { fontSize: 17, fontWeight: '600', color: Colors.slate800 },
  subtitle: { fontSize: 12, color: Colors.slate400, marginTop: 2 },
  closeBtn: { padding: 6 },
  closeText: { fontSize: 16, color: Colors.slate400 },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 6 },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.slate600,
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    backgroundColor: Colors.slate50,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: Colors.slate200,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.slate800,
  },
  amountRow: { flexDirection: 'row', gap: 8 },
  amountInput: { flex: 1 },
  euroTag: {
    backgroundColor: Colors.slate100,
    borderRadius: 9,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  euroText: { fontSize: 16, fontWeight: '600', color: Colors.slate600 },
  pillsScroll: { marginHorizontal: -16 },
  pills: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 4 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.slate100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 99,
  },
  pillSelected: { backgroundColor: Colors.indigo },
  pillEmoji: { fontSize: 14 },
  pillText: { fontSize: 13, fontWeight: '500', color: Colors.slate600 },
  pillTextSelected: { color: Colors.white },
  dateScroll: { marginHorizontal: -16 },
  datePills: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 4 },
  datePill: {
    backgroundColor: Colors.slate100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 99,
  },
  datePillSelected: { backgroundColor: Colors.indigo },
  datePillText: { fontSize: 13, fontWeight: '500', color: Colors.slate600 },
  datePillTextSelected: { color: Colors.white },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.slate100,
  },
  saveBtn: {
    backgroundColor: Colors.indigo,
    borderRadius: 99,
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: Colors.white, fontSize: 15, fontWeight: '600' },
});
