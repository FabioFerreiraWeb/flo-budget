import { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, Pressable,
  ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { IconUpload, IconDownload, IconTrash, IconLanguage } from '@tabler/icons-react-native';
import { Colors } from '../constants/Colors';
import { useApp } from '../context/AppContext';
import { useLanguage, type Language } from '../context/LanguageContext';
import { AppData, Category } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storage';

const EMOJI_CHOICES = ['🍽️', '🛍️', '🚗', '🎮', '🏠', '💊', '✈️', '📱', '📦', '🐾', '💼', '🎓', '⚽', '🎵', '🌿', '💡'];

const LANGUAGE_OPTIONS: { code: Language; label: string; flag: string }[] = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
];

export default function SettingsScreen() {
  const { data, setMonthConfig, deleteCategoryAndReassign, loadData, resetData } = useApp();
  const { t, language, setLanguage, locale } = useLanguage();
  const router = useRouter();
  const config = data.currentMonthConfig;

  const [income, setIncome] = useState(String(config?.income ?? ''));
  const [savingsGoal, setSavingsGoal] = useState(String(config?.savingsGoal ?? ''));
  const [categories, setCategories] = useState<Category[]>(config?.categories ?? []);
  const [exporting, setExporting] = useState(false);
  const [emojiPickerCat, setEmojiPickerCat] = useState<string | null>(null);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  const incomeNum = parseFloat(income);
  const savingsNum = parseFloat(savingsGoal);
  const incomeError = income !== '' && incomeNum <= 0 ? t.errors.incomeRequired : null;
  const savingsError = income !== '' && savingsGoal !== '' && savingsNum >= incomeNum
    ? t.errors.savingsExceedsIncome
    : null;
  const canSave = !incomeError && !savingsError && income !== '' && savingsGoal !== '';

  const handleSave = () => {
    if (!config || !canSave) return;
    setMonthConfig({ ...config, income: incomeNum, savingsGoal: savingsNum, categories });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const exportPayload = { version: '1.0', app: 'Flo', exportedAt: new Date().toISOString(), data };
      const json = JSON.stringify(exportPayload, null, 2);
      const date = new Date().toISOString().split('T')[0];
      const filename = `flo-export-${date}.json`;

      if (Platform.OS === 'web') {
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        const isAvailable = await Sharing.isAvailableAsync();
        if (!isAvailable) {
          Alert.alert('', t.settings.export);
          return;
        }
        const file = new File(Paths.cache, filename);
        file.write(json);
        await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: t.settings.export });
      }
    } catch (e: any) {
      console.error('Export error:', e);
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
      if (result.canceled) return;

      let raw: string;
      if (Platform.OS === 'web') {
        const response = await fetch(result.assets[0].uri);
        raw = await response.text();
      } else {
        raw = await new File(result.assets[0].uri).text();
      }
      const parsed = JSON.parse(raw);

      if (!parsed.version || !parsed.data) {
        if (Platform.OS === 'web') {
          window.alert(t.errors.invalidFile);
        } else {
          Alert.alert('', t.errors.invalidFile);
        }
        return;
      }

      const importedData = parsed.data as AppData;
      if (typeof importedData.currentMonthConfig === 'undefined' || !Array.isArray(importedData.expenses)) {
        if (Platform.OS === 'web') {
          window.alert(t.errors.invalidFile);
        } else {
          Alert.alert('', t.errors.invalidFile);
        }
        return;
      }

      const exportDate = parsed.exportedAt
        ? new Date(parsed.exportedAt).toLocaleDateString(locale)
        : '?';

      if (Platform.OS === 'web') {
        if (window.confirm(`${t.errors.importConfirm}\n\n${t.errors.importMsg} (${exportDate})`)) {
          loadData(importedData);
          router.replace('/(tabs)');
        }
        return;
      }

      Alert.alert(
        t.errors.importConfirm,
        `${t.errors.importMsg} (${exportDate})`,
        [
          { text: t.settings.cancel, style: 'cancel' },
          {
            text: t.errors.restore,
            style: 'destructive',
            onPress: () => {
              loadData(importedData);
              router.replace('/(tabs)');
            },
          },
        ]
      );
    } catch {
      if (Platform.OS === 'web') {
        window.alert(t.errors.invalidFile);
      } else {
        Alert.alert('', t.errors.invalidFile);
      }
    }
  };

  const handleReset = () => {
    if (Platform.OS === 'web') {
      if (!window.confirm(`${t.settings.resetConfirm}\n\n${t.settings.resetMsg}`)) return;
      if (!window.confirm(`${t.settings.resetConfirm2}\n\n${t.settings.resetMsg2}`)) return;
      AsyncStorage.removeItem(STORAGE_KEYS.APP_DATA).then(() => {
        resetData();
        router.replace('/onboarding');
      });
      return;
    }
    Alert.alert(
      t.settings.resetConfirm,
      t.settings.resetMsg,
      [
        { text: t.settings.cancel, style: 'cancel' },
        {
          text: t.settings.reset,
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              t.settings.resetConfirm2,
              t.settings.resetMsg2,
              [
                { text: t.settings.cancel, style: 'cancel' },
                {
                  text: t.settings.resetFinal,
                  style: 'destructive',
                  onPress: async () => {
                    await AsyncStorage.removeItem(STORAGE_KEYS.APP_DATA);
                    resetData();
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                    router.replace('/onboarding');
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const updateCategoryBudget = (id: string, value: string) => {
    setCategories(cats => cats.map(c => c.id === id ? { ...c, budget: parseFloat(value) || 0 } : c));
  };

  const updateCategoryName = (id: string, value: string) => {
    setCategories(cats => cats.map(c => c.id === id ? { ...c, name: value } : c));
  };

  const updateCategoryEmoji = (id: string, emoji: string) => {
    setCategories(cats => cats.map(c => c.id === id ? { ...c, emoji } : c));
    setEmojiPickerCat(null);
  };

  const addCategory = () => {
    setCategories(cats => [...cats, { id: Date.now().toString(), name: t.onboarding.step3NewCategory, emoji: '📦', budget: 100 }]);
  };

  const removeCategory = (id: string) => {
    if (categories.length <= 1) {
      if (Platform.OS === 'web') {
        window.alert(t.settings.lastCategory);
      } else {
        Alert.alert('', t.settings.lastCategory);
      }
      return;
    }

    const currentMonthKey = config?.monthKey ?? '';
    const affectedExpenses = data.expenses.filter(e => e.categoryId === id && e.monthKey === currentMonthKey);

    const doDelete = (withReassign: boolean) => {
      const hasAutre = categories.some(c => c.id === 'autre');
      let newCats = categories.filter(c => c.id !== id);
      if (withReassign && !hasAutre) {
        newCats = [...newCats, { id: 'autre', name: 'Autre', emoji: '📦', budget: 0 }];
      }
      if (withReassign) {
        deleteCategoryAndReassign(id, newCats);
      }
      setCategories(newCats);
    };

    if (Platform.OS === 'web') {
      let confirmed: boolean;
      if (affectedExpenses.length > 0) {
        const total = affectedExpenses.reduce((s, e) => s + e.amount, 0);
        confirmed = window.confirm(
          t.settings.deleteCategoryUsed
            .replace('{count}', String(affectedExpenses.length))
            .replace('{amount}', total.toFixed(2))
        );
      } else {
        confirmed = window.confirm(t.settings.deleteCategoryConfirm);
      }
      if (confirmed) doDelete(affectedExpenses.length > 0);
      return;
    }

    if (affectedExpenses.length > 0) {
      const total = affectedExpenses.reduce((s, e) => s + e.amount, 0);
      Alert.alert(
        t.settings.deleteCategoryConfirm,
        t.settings.deleteCategoryUsed
          .replace('{count}', String(affectedExpenses.length))
          .replace('{amount}', total.toFixed(2)),
        [
          { text: t.settings.cancel, style: 'cancel' },
          { text: t.settings.reset, style: 'destructive', onPress: () => doDelete(true) },
        ]
      );
    } else {
      Alert.alert(
        t.settings.deleteCategoryConfirm,
        '',
        [
          { text: t.settings.cancel, style: 'cancel' },
          { text: t.settings.reset, style: 'destructive', onPress: () => doDelete(false) },
        ]
      );
    }
  };

  const currentLangOption = LANGUAGE_OPTIONS.find(o => o.code === language);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{t.settings.title}</Text>
            <Text style={styles.headerSub}>Configuration</Text>
          </View>
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
            disabled={!canSave}
          >
            <Text style={styles.saveBtnText}>{t.settings.save}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

          {/* Finances */}
          <Text style={styles.sectionLabel}>{t.settings.finances.toUpperCase()}</Text>
          <View style={styles.card}>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>{t.settings.monthlyIncome}</Text>
              <View style={styles.fieldInput}>
                <TextInput
                  style={[styles.fieldValue, incomeError ? { color: Colors.red } : null]}
                  value={income}
                  onChangeText={setIncome}
                  keyboardType="decimal-pad"
                  placeholder="2000"
                  placeholderTextColor={Colors.slate400}
                  textAlign="right"
                />
                <Text style={styles.fieldUnit}>€</Text>
              </View>
            </View>
            {incomeError && <Text style={styles.inlineError}>{incomeError}</Text>}
            <View style={styles.sep} />
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>{t.settings.savingsGoal}</Text>
              <View style={styles.fieldInput}>
                <TextInput
                  style={[styles.fieldValue, savingsError ? { color: Colors.red } : null]}
                  value={savingsGoal}
                  onChangeText={setSavingsGoal}
                  keyboardType="decimal-pad"
                  placeholder="300"
                  placeholderTextColor={Colors.slate400}
                  textAlign="right"
                />
                <Text style={styles.fieldUnit}>€</Text>
              </View>
            </View>
            {savingsError && <Text style={styles.inlineError}>{savingsError}</Text>}
            <View style={styles.sep} />
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>{t.settings.currency}</Text>
              <Text style={styles.fieldFixed}>€ EUR</Text>
            </View>
          </View>

          {/* Categories */}
          <Text style={styles.sectionLabel}>{t.settings.categories.toUpperCase()}</Text>
          <View style={styles.card}>
            {categories.map((cat, index) => (
              <View key={cat.id}>
                {index > 0 && <View style={styles.sep} />}
                <View style={styles.catRow}>
                  <TouchableOpacity onPress={() => setEmojiPickerCat(cat.id)} style={styles.catEmojiBtn}>
                    <Text style={styles.catEmoji}>{cat.emoji}</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={styles.catNameInput}
                    value={cat.name}
                    onChangeText={v => updateCategoryName(cat.id, v)}
                    placeholder={t.goalModal.name}
                    placeholderTextColor={Colors.slate400}
                  />
                  <TextInput
                    style={styles.catBudgetInput}
                    value={String(cat.budget)}
                    onChangeText={v => updateCategoryBudget(cat.id, v)}
                    keyboardType="decimal-pad"
                    textAlign="right"
                  />
                  <Text style={styles.catUnit}>€</Text>
                  {categories.length > 1 && (
                    <Pressable onPress={() => removeCategory(cat.id)} style={styles.catDelBtn} hitSlop={8}>
                      <Text style={styles.catDelText}>✕</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.addCatBtn} onPress={addCategory}>
            <Text style={styles.addCatText}>{t.settings.addCategory}</Text>
          </TouchableOpacity>

          {/* Emoji picker modal */}
          <Modal visible={emojiPickerCat !== null} transparent animationType="fade" onRequestClose={() => setEmojiPickerCat(null)}>
            <TouchableOpacity style={styles.emojiOverlay} onPress={() => setEmojiPickerCat(null)} activeOpacity={1}>
              <View style={styles.emojiSheet}>
                <Text style={styles.emojiSheetTitle}>{t.goalModal.icon}</Text>
                <View style={styles.emojiGrid}>
                  {EMOJI_CHOICES.map(e => (
                    <TouchableOpacity
                      key={e}
                      style={[
                        styles.emojiBtn,
                        emojiPickerCat && categories.find(c => c.id === emojiPickerCat)?.emoji === e && styles.emojiBtnActive,
                      ]}
                      onPress={() => emojiPickerCat && updateCategoryEmoji(emojiPickerCat, e)}
                    >
                      <Text style={styles.emojiText}>{e}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Language */}
          <Text style={styles.sectionLabel}>{t.settings.language.toUpperCase()}</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.dataRow} onPress={() => setShowLanguagePicker(true)} activeOpacity={0.7}>
              <View style={styles.dataIconWrap}>
                <IconLanguage size={18} color={Colors.indigo} />
              </View>
              <View style={styles.dataTextWrap}>
                <Text style={styles.dataLabel}>{t.settings.language}</Text>
                <Text style={styles.dataSub}>{t.settings.languageSub}</Text>
              </View>
              <Text style={styles.langFlag}>{currentLangOption?.flag} {currentLangOption?.label}</Text>
              <Text style={styles.dataArrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Language picker modal */}
          <Modal visible={showLanguagePicker} transparent animationType="slide" onRequestClose={() => setShowLanguagePicker(false)}>
            <TouchableOpacity style={styles.emojiOverlay} onPress={() => setShowLanguagePicker(false)} activeOpacity={1}>
              <View style={styles.langSheet}>
                <Text style={styles.langSheetTitle}>{t.languagePicker.title}</Text>
                <Text style={styles.langSheetSub}>{t.languagePicker.subtitle}</Text>
                <View style={styles.langOptions}>
                  {LANGUAGE_OPTIONS.map(opt => (
                    <TouchableOpacity
                      key={opt.code}
                      style={[styles.langOption, language === opt.code && styles.langOptionActive]}
                      onPress={() => { setLanguage(opt.code); setShowLanguagePicker(false); }}
                    >
                      <Text style={styles.langOptionFlag}>{opt.flag}</Text>
                      <Text style={[styles.langOptionLabel, language === opt.code && styles.langOptionLabelActive]}>
                        {opt.label}
                      </Text>
                      {language === opt.code && <Text style={styles.langCheck}>✓</Text>}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Data */}
          <Text style={styles.sectionLabel}>{t.settings.data.toUpperCase()}</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.dataRow} onPress={handleExport} disabled={exporting} activeOpacity={0.7}>
              <View style={styles.dataIconWrap}>
                {exporting
                  ? <ActivityIndicator size="small" color={Colors.indigo} />
                  : <IconUpload size={18} color={Colors.indigo} />
                }
              </View>
              <View style={styles.dataTextWrap}>
                <Text style={styles.dataLabel}>{t.settings.export}</Text>
                <Text style={styles.dataSub}>{t.settings.exportSub}</Text>
              </View>
              <Text style={styles.dataArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.sep} />
            <TouchableOpacity style={styles.dataRow} onPress={handleImport} activeOpacity={0.7}>
              <View style={[styles.dataIconWrap, { backgroundColor: Colors.greenLight }]}>
                <IconDownload size={18} color={Colors.green} />
              </View>
              <View style={styles.dataTextWrap}>
                <Text style={styles.dataLabel}>{t.settings.import}</Text>
                <Text style={styles.dataSub}>{t.settings.importSub}</Text>
              </View>
              <Text style={styles.dataArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.sep} />
            <TouchableOpacity style={styles.dataRow} onPress={handleReset} activeOpacity={0.7}>
              <View style={[styles.dataIconWrap, { backgroundColor: Colors.redLight }]}>
                <IconTrash size={18} color={Colors.red} />
              </View>
              <View style={styles.dataTextWrap}>
                <Text style={[styles.dataLabel, { color: Colors.red }]}>{t.settings.reset}</Text>
                <Text style={styles.dataSub}>{t.settings.resetSub}</Text>
              </View>
              <Text style={[styles.dataArrow, { color: Colors.red }]}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.slate50 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.slate200,
  },
  title: { fontSize: 17, fontWeight: '600', color: Colors.slate800 },
  headerSub: { fontSize: 11, color: Colors.slate400, marginTop: 1 },
  saveBtn: { backgroundColor: Colors.indigo, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 99 },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { color: Colors.white, fontSize: 13, fontWeight: '600' },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 9 },
  sectionLabel: { fontSize: 10, fontWeight: '600', color: Colors.slate400, letterSpacing: 0.8, marginTop: 4 },
  card: { backgroundColor: Colors.white, borderRadius: 13, overflow: 'hidden' },
  sep: { height: 1, backgroundColor: Colors.slate100, marginHorizontal: 13 },
  fieldRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 13, paddingVertical: 14 },
  fieldLabel: { fontSize: 14, color: Colors.slate800 },
  fieldInput: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  fieldValue: { fontSize: 14, fontWeight: '500', color: Colors.indigo, minWidth: 50 },
  fieldUnit: { fontSize: 14, color: Colors.slate400 },
  fieldFixed: { fontSize: 14, color: Colors.slate400 },
  inlineError: { fontSize: 11, color: Colors.red, paddingHorizontal: 13, paddingBottom: 8, marginTop: -6 },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 13,
    gap: 10,
  },
  catEmojiBtn: { padding: 2 },
  catEmoji: { fontSize: 20, width: 28, textAlign: 'center' },
  catNameInput: { flex: 1, fontSize: 14, color: Colors.slate800 },
  catBudgetInput: { fontSize: 14, fontWeight: '500', color: Colors.indigo, minWidth: 40 },
  catUnit: { fontSize: 14, color: Colors.slate400 },
  catDelBtn: { padding: 8 },
  catDelText: { fontSize: 13, color: Colors.slate400 },
  emojiOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiSheet: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    width: 280,
    gap: 12,
  },
  emojiSheetTitle: { fontSize: 15, fontWeight: '600', color: Colors.slate800, textAlign: 'center' },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  emojiBtn: { width: 44, height: 44, borderRadius: 10, backgroundColor: Colors.slate50, alignItems: 'center', justifyContent: 'center' },
  emojiBtnActive: { backgroundColor: Colors.indigoLight, borderWidth: 1.5, borderColor: Colors.indigo },
  emojiText: { fontSize: 22 },
  addCatBtn: {
    borderWidth: 1.5,
    borderColor: Colors.indigo,
    borderRadius: 13,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  addCatText: { fontSize: 14, fontWeight: '600', color: Colors.indigo },
  dataRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13, paddingVertical: 11, gap: 12 },
  dataIconWrap: { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.indigoLight, alignItems: 'center', justifyContent: 'center' },
  dataTextWrap: { flex: 1 },
  dataLabel: { fontSize: 14, color: Colors.slate800 },
  dataSub: { fontSize: 11, color: Colors.slate400, marginTop: 1 },
  dataArrow: { fontSize: 20, color: Colors.slate400, lineHeight: 22 },
  langFlag: { fontSize: 13, color: Colors.slate600 },
  langSheet: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    width: 300,
    gap: 16,
  },
  langSheetTitle: { fontSize: 17, fontWeight: '700', color: Colors.slate800, textAlign: 'center' },
  langSheetSub: { fontSize: 13, color: Colors.slate400, textAlign: 'center', marginTop: -8 },
  langOptions: { gap: 8 },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.slate50,
    gap: 12,
  },
  langOptionActive: {
    backgroundColor: Colors.indigoLight,
    borderWidth: 1.5,
    borderColor: Colors.indigo,
  },
  langOptionFlag: { fontSize: 22 },
  langOptionLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: Colors.slate700 },
  langOptionLabelActive: { color: Colors.indigo, fontWeight: '600' },
  langCheck: { fontSize: 16, color: Colors.indigo, fontWeight: '700' },
});
