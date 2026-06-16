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

const EMOJI_OPTIONS = ['🏠', '🚗', '✈️', '🛡️', '🎓', '📱', '🎸', '💍'];

export default function AddGoalModal() {
  const { data, addSavingsGoal } = useApp();
  const router = useRouter();

  const [emoji, setEmoji] = useState(EMOJI_OPTIONS[0]);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [initial, setInitial] = useState('');

  const isValid = name.trim() !== '' && parseFloat(target) > 0;
  const maxInitial = data.freeSavings;

  const handleCreate = () => {
    const initialAmount = parseFloat(initial) || 0;
    if (initialAmount > maxInitial) {
      Alert.alert('Montant insuffisant', `Ta cagnotte disponible est de ${maxInitial.toFixed(0)} €`);
      return;
    }
    addSavingsGoal({ emoji, name: name.trim(), targetAmount: parseFloat(target) }, initialAmount);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <Text style={styles.title}>Nouvel objectif</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Icône</Text>
          <View style={styles.emojiRow}>
            {EMOJI_OPTIONS.map(e => (
              <TouchableOpacity
                key={e}
                style={[styles.emojiBtn, emoji === e && styles.emojiBtnSelected]}
                onPress={() => setEmoji(e)}
              >
                <Text style={styles.emojiText}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Nom</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex : Voiture"
            placeholderTextColor={Colors.slate400}
            value={name}
            onChangeText={setName}
            autoFocus
          />

          <Text style={styles.label}>Montant cible</Text>
          <View style={styles.amountRow}>
            <TextInput
              style={[styles.input, styles.amountInput]}
              placeholder="0"
              placeholderTextColor={Colors.slate400}
              value={target}
              onChangeText={setTarget}
              keyboardType="decimal-pad"
            />
            <View style={styles.euroTag}><Text style={styles.euroText}>€</Text></View>
          </View>

          <Text style={styles.label}>Affectation initiale (optionnel)</Text>
          <View style={styles.amountRow}>
            <TextInput
              style={[styles.input, styles.amountInput]}
              placeholder="0"
              placeholderTextColor={Colors.slate400}
              value={initial}
              onChangeText={setInitial}
              keyboardType="decimal-pad"
            />
            <View style={styles.euroTag}><Text style={styles.euroText}>€</Text></View>
          </View>
          <Text style={styles.hint}>Cagnotte disponible : {maxInitial.toFixed(0)} €</Text>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveBtn, !isValid && styles.saveBtnDisabled]}
            onPress={handleCreate}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>Créer l'objectif</Text>
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
  title: { fontSize: 17, fontWeight: '600', color: Colors.slate800 },
  closeBtn: { padding: 6 },
  closeText: { fontSize: 16, color: Colors.slate400 },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 6 },
  label: { fontSize: 12, fontWeight: '600', color: Colors.slate600, marginBottom: 4, marginTop: 8 },
  emojiRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  emojiBtn: { width: 44, height: 44, borderRadius: 9, backgroundColor: Colors.slate100, alignItems: 'center', justifyContent: 'center' },
  emojiBtnSelected: { backgroundColor: Colors.indigoLight, borderWidth: 2, borderColor: Colors.indigo },
  emojiText: { fontSize: 20 },
  input: { backgroundColor: Colors.slate50, borderRadius: 9, borderWidth: 1, borderColor: Colors.slate200, paddingHorizontal: 13, paddingVertical: 12, fontSize: 14, color: Colors.slate800 },
  amountRow: { flexDirection: 'row', gap: 8 },
  amountInput: { flex: 1 },
  euroTag: { backgroundColor: Colors.slate100, borderRadius: 9, paddingHorizontal: 14, justifyContent: 'center' },
  euroText: { fontSize: 16, fontWeight: '600', color: Colors.slate600 },
  hint: { fontSize: 11, color: Colors.slate400, marginTop: 4 },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: Colors.slate100 },
  saveBtn: { backgroundColor: Colors.indigo, borderRadius: 99, paddingVertical: 15, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: Colors.white, fontSize: 15, fontWeight: '600' },
});
