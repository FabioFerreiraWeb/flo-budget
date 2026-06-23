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

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function formatDateChip(d: Date): string {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = Math.round((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return 'Hier';
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
}

export default function AddExpenseModal() {
  const { data, addExpense } = useApp();
  const router = useRouter();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const pastDates: Date[] = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    return d;
  });

  const categories = data.currentMonthConfig?.categories ?? [];
  const isValid = description.trim() !== '' && parseFloat(amount) > 0 && selectedCategoryId !== null;

  const handleSave = () => {
    if (!isValid) {
      Alert.alert('Champs manquants', 'Remplis tous les champs avant de continuer.');
      return;
    }
    addExpense({
      description: description.trim(),
      amount: parseFloat(amount),
      categoryId: selectedCategoryId!,
      date: selectedDate.toISOString(),
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Nouvelle dépense</Text>
            <Text style={styles.subtitle}>Que viens-tu de dépenser ?</Text>
          </View>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex : Restaurant entre potes"
            placeholderTextColor={Colors.slate400}
            value={description}
            onChangeText={setDescription}
            autoFocus
          />

          <Text style={styles.label}>Montant</Text>
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

          <Text style={styles.label}>Catégorie</Text>
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

          <Text style={styles.label}>Date</Text>
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
                      {formatDateChip(d)}
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
            <Text style={styles.saveBtnText}>Enregistrer la dépense</Text>
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
