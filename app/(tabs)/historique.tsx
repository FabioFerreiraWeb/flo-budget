import {
  View, Text, ScrollView, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { useApp } from '../../context/AppContext';
import { MonthCard } from '../../components/MonthCard';
import { useLanguage } from '../../context/LanguageContext';

export default function HistoriqueScreen() {
  const { t } = useLanguage();
  const { data } = useApp();
  const sorted = [...data.monthSummaries].sort((a, b) => b.monthKey.localeCompare(a.monthKey));

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{t.history.title}</Text>
          <Text style={styles.headerSub}>{t.history.subtitle}</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {sorted.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📅</Text>
            <Text style={styles.emptyText}>{t.history.emptyText}</Text>
          </View>
        ) : (
          sorted.map(summary => (
            <MonthCard key={summary.monthKey} summary={summary} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.slate50 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.slate200,
  },
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.slate800 },
  headerSub: { fontSize: 11, color: Colors.slate400, marginTop: 1 },
  scroll: { flex: 1 },
  content: { padding: 11, gap: 9 },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyEmoji: { fontSize: 36 },
  emptyText: { fontSize: 14, color: Colors.slate400, textAlign: 'center', maxWidth: 240 },
});
