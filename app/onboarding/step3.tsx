import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Modal, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Category } from '../../types';

const EMOJI_CHOICES = ['🍽️', '🛍️', '🚗', '🎮', '🏠', '💊', '✈️', '📱'];

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'def1', name: 'Nourriture', emoji: '🍽️', budget: 300 },
  { id: 'def2', name: 'Shopping', emoji: '🛍️', budget: 100 },
  { id: 'def3', name: 'Transport', emoji: '🚗', budget: 150 },
  { id: 'def4', name: 'Loisirs', emoji: '🎮', budget: 80 },
];

interface Props {
  currentStep: number;
  income: number;
  savingsGoal: number;
  onBack: () => void;
  onFinish: (categories: Category[]) => void;
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

export function Step3({ currentStep, income, savingsGoal, onBack, onFinish }: Props) {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [newEmoji, setNewEmoji] = useState('🍽️');
  const [newName, setNewName] = useState('');
  const [newBudget, setNewBudget] = useState('');

  const available = income - savingsGoal;
  const totalBudget = categories.reduce((s, c) => s + c.budget, 0);
  const isOverBudget = totalBudget > available;

  const updateBudget = (id: string, value: string) => {
    setCategories(cats => cats.map(c => c.id === id ? { ...c, budget: parseFloat(value) || 0 } : c));
  };

  const removeCategory = (id: string) => {
    if (categories.length <= 1) return;
    Alert.alert('Supprimer', 'Supprimer cette catégorie ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => setCategories(cats => cats.filter(c => c.id !== id)) },
    ]);
  };

  const addCategory = () => {
    if (!newName.trim()) return;
    const cat: Category = {
      id: Date.now().toString(),
      name: newName.trim(),
      emoji: newEmoji,
      budget: parseFloat(newBudget) || 0,
    };
    setCategories(cats => [...cats, cat]);
    setShowAddSheet(false);
    setNewName('');
    setNewBudget('');
    setNewEmoji('🍽️');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.dotsWrap}>
        <ProgressDots current={currentStep} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Tes catégories de dépenses</Text>
        <Text style={styles.subtitle}>
          Définis un plafond mensuel pour chaque catégorie. Tu pourras en ajouter d'autres plus tard.
        </Text>

        {categories.map(cat => (
          <View key={cat.id} style={styles.catRow}>
            <Text style={styles.catEmoji}>{cat.emoji}</Text>
            <Text style={styles.catName}>{cat.name}</Text>
            <TextInput
              style={styles.catInput}
              value={String(cat.budget)}
              onChangeText={v => updateBudget(cat.id, v)}
              keyboardType="decimal-pad"
              textAlign="right"
            />
            <Text style={styles.catUnit}>€</Text>
            {categories.length > 1 && (
              <TouchableOpacity onPress={() => removeCategory(cat.id)} style={styles.delBtn}>
                <Text style={styles.delText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddSheet(true)}>
          <Text style={styles.addBtnText}>＋ Ajouter une catégorie</Text>
        </TouchableOpacity>

        <View style={[styles.summary, isOverBudget && styles.summaryWarn]}>
          <Text style={styles.summaryText}>
            Total catégories : {totalBudget} € / {available} € disponibles
          </Text>
          {isOverBudget && (
            <Text style={styles.summaryWarnText}>
              Attention, tes catégories dépassent ton budget disponible
            </Text>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.finishBtn} onPress={() => onFinish(categories)} activeOpacity={0.85}>
          <Text style={styles.finishBtnText}>Démarrer l'app →</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Retour</Text>
        </TouchableOpacity>
      </View>

      {/* Add category mini bottom sheet */}
      <Modal visible={showAddSheet} transparent animationType="slide" onRequestClose={() => setShowAddSheet(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TouchableOpacity style={styles.overlay} onPress={() => setShowAddSheet(false)} activeOpacity={1} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Nouvelle catégorie</Text>

            <Text style={styles.sheetLabel}>Emoji</Text>
            <View style={styles.emojiGrid}>
              {EMOJI_CHOICES.map(e => (
                <TouchableOpacity
                  key={e}
                  style={[styles.emojiBtn, newEmoji === e && styles.emojiBtnActive]}
                  onPress={() => setNewEmoji(e)}
                >
                  <Text style={styles.emojiText}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sheetLabel}>Nom</Text>
            <TextInput
              style={styles.sheetInput}
              placeholder="ex : Abonnements"
              placeholderTextColor={Colors.slate400}
              value={newName}
              onChangeText={setNewName}
              autoFocus
            />

            <Text style={styles.sheetLabel}>Plafond mensuel</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.sheetInput, { flex: 1 }]}
                placeholder="0"
                placeholderTextColor={Colors.slate400}
                value={newBudget}
                onChangeText={setNewBudget}
                keyboardType="decimal-pad"
              />
              <View style={styles.suffix}><Text style={styles.suffixText}>€</Text></View>
            </View>

            <TouchableOpacity
              style={[styles.sheetAddBtn, !newName.trim() && styles.sheetAddBtnDisabled]}
              onPress={addCategory}
              disabled={!newName.trim()}
            >
              <Text style={styles.sheetAddBtnText}>Ajouter</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  dotsWrap: { paddingTop: 16, alignItems: 'center' },
  scroll: { flex: 1 },
  content: { padding: 24, gap: 10 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.slate800 },
  subtitle: { fontSize: 14, color: Colors.slate600, lineHeight: 21, marginBottom: 6 },
  catRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.slate50, borderRadius: 9, paddingHorizontal: 12, paddingVertical: 11,
  },
  catEmoji: { fontSize: 20, width: 28 },
  catName: { flex: 1, fontSize: 14, color: Colors.slate800 },
  catInput: { fontSize: 14, fontWeight: '500', color: Colors.indigo, minWidth: 44, textAlign: 'right' },
  catUnit: { fontSize: 14, color: Colors.slate400 },
  delBtn: { padding: 4 },
  delText: { fontSize: 14, color: Colors.slate400 },
  addBtn: {
    borderWidth: 1.5, borderColor: Colors.indigo, borderRadius: 9,
    paddingVertical: 13, alignItems: 'center', backgroundColor: Colors.white,
  },
  addBtnText: { fontSize: 14, fontWeight: '600', color: Colors.indigo },
  summary: { backgroundColor: Colors.slate50, borderRadius: 9, padding: 12, gap: 4 },
  summaryWarn: { backgroundColor: Colors.amberLight },
  summaryText: { fontSize: 13, color: Colors.slate600, fontWeight: '500' },
  summaryWarnText: { fontSize: 11, color: Colors.amber },
  footer: { padding: 24, gap: 10 },
  finishBtn: { backgroundColor: Colors.indigo, borderRadius: 99, paddingVertical: 15, alignItems: 'center' },
  finishBtnText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
  backBtn: { alignItems: 'center', paddingVertical: 8 },
  backBtnText: { fontSize: 14, color: Colors.slate600 },
  overlay: { flex: 1 },
  sheet: {
    backgroundColor: Colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, gap: 10, paddingBottom: 32,
  },
  sheetHandle: { width: 36, height: 4, backgroundColor: Colors.slate200, borderRadius: 99, alignSelf: 'center', marginBottom: 8 },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: Colors.slate800 },
  sheetLabel: { fontSize: 12, fontWeight: '600', color: Colors.slate600, marginTop: 4 },
  emojiGrid: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  emojiBtn: { width: 44, height: 44, borderRadius: 10, backgroundColor: Colors.slate50, alignItems: 'center', justifyContent: 'center' },
  emojiBtnActive: { backgroundColor: Colors.indigoLight, borderWidth: 1.5, borderColor: Colors.indigo },
  emojiText: { fontSize: 22 },
  sheetInput: {
    backgroundColor: Colors.slate50, borderRadius: 9,
    borderWidth: 1, borderColor: Colors.slate200,
    paddingHorizontal: 13, paddingVertical: 12, fontSize: 14, color: Colors.slate800,
  },
  inputRow: { flexDirection: 'row', gap: 8 },
  suffix: { backgroundColor: Colors.slate100, borderRadius: 9, paddingHorizontal: 16, justifyContent: 'center' },
  suffixText: { fontSize: 16, fontWeight: '600', color: Colors.slate600 },
  sheetAddBtn: { backgroundColor: Colors.indigo, borderRadius: 99, paddingVertical: 13, alignItems: 'center', marginTop: 4 },
  sheetAddBtnDisabled: { opacity: 0.4 },
  sheetAddBtnText: { color: Colors.white, fontSize: 15, fontWeight: '600' },
});
